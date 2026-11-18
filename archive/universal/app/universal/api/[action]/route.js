import {NextResponse} from 'next/server';
import crypto from 'node:crypto';
import {authorized,makeSession,safeEqual,sameOrigin,sign} from '../../lib/auth';
import {readRecord,updateRecord,initialState} from '../../lib/store';
import {getLive} from '../../lib/live';
import {sendOne,validSubscription,notifyDue} from '../../lib/push';
import catalog from '../../lib/catalog.json';
import {TRIP_DATE} from '../../lib/planner.mjs';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=60;
const json=(d,status=200)=>NextResponse.json(d,{status,headers:{'Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow'}});
const profile={people:[['Brad',40],['Sarah',38],['Lucy',16],['Michael',14],['Gordon',12],['August',9]],hotel:'Dockside Inn and Suites',hotelAddress:'7125 Universal Boulevard, Orlando, FL 32819',date:TRIP_DATE};
async function handle(req,ctx){
 const {action}=await ctx.params;
 if(action==='notify'&&req.method==='GET'){
  if(!process.env.CRON_SECRET||!safeEqual(req.headers.get('authorization'),`Bearer ${process.env.CRON_SECRET}`))return json({error:'Unauthorized'},401);
  return json(await notifyDue());
 }
 if(req.method==='POST'&&!sameOrigin(req))return json({error:'Please open the app directly and try again.'},403);
 let body={};if(req.method==='POST'){const raw=await req.text();if(raw.length>10000)return json({error:'Request too large'},413);try{body=JSON.parse(raw);}catch{return json({error:'Invalid request'},400);}}
 if(action==='login'&&req.method==='POST'){
  const ip=req.headers.get('x-forwarded-for')?.split(',')[0]||'local';const key='login-'+sign(ip).slice(0,24);let allowed=false;
  await updateRecord(key,{count:0,start:0},d=>{if(Date.now()-d.start>15*60000){d.count=0;d.start=Date.now();}allowed=d.count<8;d.count++;});
  if(!allowed)return json({error:'Too many attempts. Try again in 15 minutes.'},429);
  if(!safeEqual(String(body.pin||''),process.env.UNIVERSAL_PIN))return json({error:'That PIN didn’t match. Try again.'},401);
  await updateRecord(key,{count:0,start:0},d=>{d.count=0;});
  const res=json({ok:true});res.cookies.set('kidder_universal',makeSession(),{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/universal',maxAge:604800});return res;
 }
 if(!authorized(req))return json({error:'Unlock with your family PIN.'},401);
 if(action==='bootstrap'&&req.method==='GET')return json({profile,catalog,state:(await readRecord('family',initialState())).data,vapidPublicKey:process.env.VAPID_PUBLIC_KEY});
 if(action==='live'&&req.method==='GET')return json(await getLive());
 if(action==='state'&&req.method==='GET')return json((await readRecord('family',initialState())).data);
 if(action==='state'&&req.method==='POST'){
  const allowed=['complete','skip','favorite','park','return','clearReturn','anchor','startWait','endWait'];if(!allowed.includes(body.op))return json({error:'Unknown change'},400);
  const ride=catalog.find(x=>x.id===body.id);if(['complete','skip','favorite','return','startWait'].includes(body.op)&&!ride)return json({error:'Unknown attraction'},400);
  if(body.op==='park'&&!['ioa','usf'].includes(body.park))return json({error:'Invalid park'},400);
  if(body.op==='return'&&(!/^2026-09-10T\d{2}:\d{2}:00-04:00$/.test(body.at||'')||!Number.isFinite(Date.parse(body.at))||Date.parse(body.at)<=Date.now()||Date.parse(body.at)>Date.parse('2026-09-10T22:00:00-04:00')))return json({error:'Choose a future September 10 return time, exactly as shown in Universal’s app.'},400);
  if(body.op==='anchor'&&body.id&&!ride)return json({error:'Unknown location'},400);
  let conflict=false;
  const state=await updateRecord('family',initialState(),d=>{
   if(['return','clearReturn'].includes(body.op)&&(body.previousToken||null)!==(d.returnTime?.token||null)){conflict=true;return false;}
   switch(body.op){
    case 'startWait': if(d.waiting){conflict=true;return false;}d.waiting={rideId:ride.id,name:ride.name,startedAt:new Date().toISOString(),postedWait:Number.isFinite(body.postedWait)?Math.max(0,Math.min(300,body.postedWait)):null,token:crypto.randomUUID()};break;
    case 'endWait': if(d.waiting){if(body.waitToken!==d.waiting.token){conflict=true;return false;}d.waitHistory=[...(d.waitHistory||[]),{...d.waiting,endedAt:new Date().toISOString(),boarded:!!body.boarded}].slice(-60);if(body.boarded){d.completed[d.waiting.rideId]=Date.now();const w=catalog.find(r=>r.id===d.waiting.rideId);d.visited[w.park]=true;d.anchor=w.location;if(d.returnTime?.rideId===w.id)d.returnTime=null;}d.waiting=null;}break;
    case 'complete':if(body.value===false)delete d.completed[ride.id];else {d.completed[ride.id]=Date.now();d.visited[ride.park]=true;d.anchor=ride.location;if(d.returnTime?.rideId===ride.id)d.returnTime=null;}break;
    case 'skip':if(body.value===false)delete d.skipped[ride.id];else d.skipped[ride.id]=Date.now()+90*60000;break;
    case 'favorite':d.favorites[ride.id]=!!body.value;break;
    case 'park':d.park=body.park;d.anchor=null;d.visited[body.park]=true;break;
    case 'anchor':d.anchor=ride?.location||null;if(ride)d.park=ride.park;break;
    case 'return':d.returnTime={rideId:ride.id,name:ride.name,at:body.at,token:crypto.randomUUID()};break;
    case 'clearReturn':d.returnTime=null;break;
   }d.version++;d.updatedAt=new Date().toISOString();
  });if(conflict)return json({error:'Someone changed the return time. The latest plan is loading; review it and try again.'},409);return json(state);
 }
 if(action==='subscribe'&&req.method==='POST'){
  if(!validSubscription(body.subscription))return json({error:'Invalid notification subscription'},400);
  const id=crypto.createHash('sha256').update(body.subscription.endpoint).digest('hex').slice(0,24);
  if(body.remove){await updateRecord('subscriptions',{items:{}},d=>{delete d.items[id];});return json({ok:true});}
  await updateRecord('subscriptions',{items:{}},d=>{if(Object.keys(d.items).length>=12&&!d.items[id])throw Error('Family device limit reached');d.items[id]=body.subscription;});
  try{await sendOne(body.subscription,{title:'Kidder’s Universal Day',body:'Notifications are connected. We’ll remind you 15 minutes before your return and when it’s time.',tag:'setup',url:'/universal'});}catch{return json({error:'Saved, but the test notification failed. Try enabling again.'},502);}
  return json({ok:true});
 }
 if(action==='logout'&&req.method==='POST'){const res=json({ok:true});res.cookies.set('kidder_universal','',{path:'/universal',maxAge:0});return res;}
 return json({error:'Not found'},404);
}
async function safeHandle(req,ctx){try{return await handle(req,ctx);}catch(e){console.error('Universal request failed:',e.name,e.message?.replace(/https?:\/\/\S+/g,'[URL]'));return json({error:'Connection trouble. Your saved plan is safe; please try again.'},503);}}
export const GET=safeHandle;export const POST=safeHandle;
