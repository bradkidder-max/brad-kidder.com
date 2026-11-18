require(process.cwd()+'/node_modules/@next/env').loadEnvConfig(process.cwd());
const {chromium}=require(process.cwd()+'/node_modules/@playwright/test');const assert=require('assert');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});const base=process.env.KIDDER_TEST_URL||'http://localhost:3108';const a=await browser.newContext({viewport:{width:393,height:852},deviceScaleFactor:2}),b=await browser.newContext({viewport:{width:393,height:852}});const p=await a.newPage(),q=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
try{
 const no=await a.request.get(base+'/universal/api/bootstrap');assert.equal(no.status(),401);
 for(const page of [p,q]){await page.goto(base+'/universal');await page.getByLabel('Family PIN').fill(process.env.UNIVERSAL_PIN);await page.getByRole('button',{name:'Let’s go',exact:true}).click();await page.getByRole('heading',{name:/Tomorrow/}).waitFor({timeout:30000});}
 const req=async(action,body,ctx=a)=>{const r=await ctx.request.post(base+'/universal/api/'+action,{headers:{Origin:base},data:body});return {status:r.status(),data:await r.json()};};
 let boot=await (await a.request.get(base+'/universal/api/bootstrap')).json();const ride=boot.catalog[0],second=boot.catalog[1];
 const badOrigin=await a.request.post(base+'/universal/api/state',{headers:{Origin:'https://example.com'},data:{op:'park',park:'usf'}});assert.equal(badOrigin.status(),403);
 const starts=await req('state',{op:'startWait',id:ride.id,postedWait:15});assert.equal(starts.status,200);let shared=await (await b.request.get(base+'/universal/api/state')).json();assert.equal(shared.waiting.rideId,ride.id);
 const occupied=await req('state',{op:'startWait',id:second.id},b);assert.equal(occupied.status,409);
 await req('state',{op:'endWait',waitToken:shared.waiting.token,boarded:false});
 const ret=await req('state',{op:'return',id:ride.id,at:'2026-09-10T14:00:00-04:00',previousToken:null});assert.equal(ret.status,200);
 const conflict=await req('state',{op:'return',id:second.id,at:'2026-09-10T14:15:00-04:00',previousToken:null},b);assert.equal(conflict.status,409);
 shared=await (await b.request.get(base+'/universal/api/state')).json();assert.equal(shared.returnTime.rideId,ride.id);
 await req('state',{op:'clearReturn',previousToken:shared.returnTime.token});
 const parallel=await Promise.all([req('state',{op:'favorite',id:ride.id,value:true}),req('state',{op:'favorite',id:second.id,value:true},b)]);assert(parallel.every(x=>x.status===200));shared=await (await a.request.get(base+'/universal/api/state')).json();assert(shared.favorites[ride.id]&&shared.favorites[second.id]);
 await req('state',{op:'favorite',id:ride.id,value:false});await req('state',{op:'favorite',id:second.id,value:false});
 const ssrf=await req('subscribe',{subscription:{endpoint:'https://127.0.0.1/admin',keys:{p256dh:'test',auth:'test'}}});assert.equal(ssrf.status,400);
 const cron=await a.request.get(base+'/universal/api/notify');assert.equal(cron.status(),401);
 await p.reload();await p.getByRole('heading',{name:/Tomorrow/}).waitFor();await p.waitForTimeout(1600);
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await p.screenshot({path:'/tmp/kidder-home-final.png',fullPage:true});
 await p.getByRole('button',{name:'Let’s do this',exact:true}).click();await p.getByRole('dialog').waitFor();await p.screenshot({path:'/tmp/kidder-detail.png'});await p.getByRole('button',{name:'Show me where'}).click();await p.locator('.leaflet-container').waitFor();await p.waitForTimeout(1200);await p.screenshot({path:'/tmp/kidder-map.png',fullPage:true});assert((await p.locator('.leaflet-overlay-pane path').count())>10);
 await p.getByRole('button',{name:'Our day',exact:true}).click();await p.getByRole('button',{name:'Enable / test notifications'}).waitFor();await p.screenshot({path:'/tmp/kidder-family.png',fullPage:true});
 const reg=await p.evaluate(async()=>{await navigator.serviceWorker.register('/universal/sw.js',{scope:'/universal'});const r=await Promise.race([navigator.serviceWorker.ready,new Promise(r=>setTimeout(()=>r(null),6000))]);return r?.scope;});assert(reg?.endsWith('/universal'));
 const live=await (await a.request.get(base+'/universal/api/live')).json();assert(Object.keys(live.rides).length>25);assert(boot.catalog.some(r=>live.rides[r.id]?.source==='Queue-Times'));
 console.log(JSON.stringify({passed:'Auth, origin validation, cross-phone state, concurrent writes, return conflicts, wait timer conflict, push endpoint validation, cron protection, mobile layout, ride dialog, map, service worker scope, live waits',errors,rides:Object.keys(live.rides).length,sw:reg}));assert.deepEqual(errors,[]);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
