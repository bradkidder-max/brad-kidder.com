import webpush from 'web-push';
import {readRecord,updateRecord,initialState} from './store';
import {TRIP_DATE,dateInPark} from './planner.mjs';
export function configurePush(){webpush.setVapidDetails('https://bradkidder.com/universal',process.env.VAPID_PUBLIC_KEY,process.env.VAPID_PRIVATE_KEY);}
export function validSubscription(s){try{const u=new URL(s.endpoint);return u.protocol==='https:'&&!u.port&&!u.username&&!u.password&&(u.hostname==='web.push.apple.com'||u.hostname.endsWith('.push.apple.com')||u.hostname==='fcm.googleapis.com'||u.hostname==='updates.push.services.mozilla.com')&&typeof s.keys?.p256dh==='string'&&s.keys.p256dh.length<200&&typeof s.keys?.auth==='string'&&s.keys.auth.length<100;}catch{return false;}}
export async function sendOne(subscription,payload){configurePush();return webpush.sendNotification(subscription,JSON.stringify(payload),{TTL:300,urgency:'high',timeout:10000});}
export async function notifyDue(now=Date.now()){
 if(dateInPark(now)!==TRIP_DATE)return {sent:0,reason:'Outside trip date'};
 const {data:state}=await readRecord('family',initialState());const {data:subs}=await readRecord('subscriptions',{items:{}});let sent=0;
 if(!state.returnTime)return {sent};
 const ret=state.returnTime, due=new Date(ret.at).getTime();
 for(const [offset,label] of [[15,'Your return is in 15 minutes'],[0,'Your return time is here']]){
  const start=due-offset*60000;if(now<start||now>start+10*60000)continue;
  // Re-read before sending so a cancelled or changed return does not produce an old reminder.
  const current=(await readRecord('family',initialState())).data.returnTime;if(current?.token!==ret.token)continue;
  for(const [id,subscription] of Object.entries(subs.items)){
   let claimed=false;const key=`${ret.token}-${offset}-${id}`;
   await updateRecord('notifications',{sent:{}},d=>{claimed=false;if(d.sent[key]?.status==='sent'||(d.sent[key]&&now-d.sent[key].at<120000))return false;d.sent[key]={at:now,status:'claimed'};claimed=true;});
   if(!claimed)continue;
   try{await sendOne(subscription,{title:label,body:`${ret.name}. Check your confirmed time in Universal’s app and head back together.`,tag:key,url:'/universal'});sent++;await updateRecord('notifications',{sent:{}},d=>{d.sent[key]={at:now,status:'sent'};});}
   catch(e){await updateRecord('notifications',{sent:{}},d=>{delete d.sent[key];});if([404,410].includes(e.statusCode))await updateRecord('subscriptions',{items:{}},d=>{delete d.items[id];});}
  }
 }
 return {sent};
}
