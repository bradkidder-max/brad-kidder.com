import {walkingRoute} from './routing.mjs';
export const TRIP_DATE='2026-09-10';
export const PARKS={ioa:{id:'267615cc-8943-4c2a-ae2c-5da728ca591f',name:'Islands of Adventure',short:'Islands',entrance:{latitude:28.4718,longitude:-81.4685}},usf:{id:'eb3f4560-2383-4a36-9152-6b3e5ed6bc57',name:'Universal Studios Florida',short:'Studios',entrance:{latitude:28.4742,longitude:-81.4687}}};
export function dateInPark(now=Date.now()){return new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(now));}
export function hourInPark(now=Date.now()){return Number(new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',hour:'numeric',hourCycle:'h23'}).format(new Date(now)));}
export function clockTime(iso){return iso?new Date(iso).toLocaleTimeString('en-US',{timeZone:'America/New_York',hour:'numeric',minute:'2-digit'}):'—';}
export function meters(a,b){if(!a||!b)return null;const r=Math.PI/180,p1=a.latitude*r,p2=b.latitude*r,d=(b.latitude-a.latitude)*r,l=(b.longitude-a.longitude)*r;return 6371000*2*Math.atan2(Math.sqrt(Math.sin(d/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin(l/2)**2),Math.sqrt(1-(Math.sin(d/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin(l/2)**2)));}
export function walkMinutes(a,b){return walkingRoute(a,b)?.minutes??null;}
export function fresh(live,now=Date.now()){return !!live?.lastUpdated && now-new Date(live.lastUpdated).getTime()<20*60000;}
export function operating(schedule,park,now=Date.now()){return schedule?.[park]?.find(s=>s.date===dateInPark(now)&&s.type==='OPERATING');}
export function nextShow(live,now){return live?.showtimes?.filter(s=>new Date(s.startTime)>now+5*60000).sort((a,b)=>new Date(a.startTime)-new Date(b.startTime))[0];}
export function recommend(catalog,data,state,position,now=Date.now()){
 if(state.waiting)return [];
 const preview=dateInPark(now)!==TRIP_DATE, liveMap=data?.rides||{}, hour=preview?9:hourInPark(now), park=state.park||'ioa', anchor=position||state.anchor||PARKS[park].entrance;
 const ret=state.returnTime, returnRide=catalog.find(r=>r.id===ret?.rideId), returnMins=ret?(new Date(ret.at)-now)/60000:null;
 let items=catalog.filter(r=>r.park===park && !state.completed?.[r.id] && !(state.skipped?.[r.id]>now));
 return items.map(r=>{
  const live=liveMap[r.id], current=fresh(live,now), walk=walkMinutes(anchor,r.location)||5;
  const leisure=['explore','food'].includes(r.kind), show=r.kind==='show', wait=current&&live?.status==='OPERATING'&&Number.isFinite(live?.wait)?live.wait:null;
  const hours=operating(data?.schedule,park,now), early=data?.schedule?.[park]?.find(s=>s.date===dateInPark(now)&&s.type==='EXTRA_HOURS'&&now>=new Date(s.openingTime)&&now<new Date(s.closingTime));const earlyEligible=park==='ioa'&&(/Hagrid|Forbidden Journey|VelociCoaster|Hippogriff|Ollivanders/.test(r.name));const closedByHours=hours&&((now<new Date(hours.openingTime)&&!(early&&earlyEligible))||now>=new Date(hours.closingTime));
  const unavailable=!leisure&&(!current||live?.status!=='OPERATING'), next=show?nextShow(live,now):null;
  let action='standby',score=r.priority, reasons=[],outing=null;
  if(r.potter){score+=15;reasons.push('A family Harry Potter priority');}
  if(state.favorites?.[r.id]){score+=25;reasons.push('On your must-do list');}
  score-=walk*(preview?.5:1.8);
  if(leisure){action='explore';score-=12; if(r.kind==='food'){score+=hour>=11&&hour<=14?20:-35;}else if(ret)score+=18;}
  else if(show){action='show'; if(next){score-=Math.min(25,(new Date(next.startTime)-now)/60000/2);reasons.push(`Next show ${clockTime(next.startTime)}`);}else if(wait===null)score-=25;}
  else if(wait!==null){if(wait<=15){score+=27;reasons.push(`Only ${wait} minutes in standby`);}else{score-=Math.min(22,wait*.3);if(wait>30){action='return';reasons.push('Request a return in Universal’s app');}else reasons.push(`${wait}-minute standby; your choice`);}}
  if(r.queueType==='indoor'){score+=12;reasons.push('Mostly indoor waiting');}
  if(r.queueNote.startsWith('A must-see')){score+=6;reasons.push('The queue is part of the experience');}
  if(r.wet){score-=r.wet===2?25:5; if(hour<11||hour>=17){score-=30;reasons.push('Better earlier in the warm afternoon');}else reasons.push(r.wet===2?'Expect to be soaked':'Splash warning; allow drying time');}
  if(ret){
   if(r.id===ret.rideId){score=-1000;}
   else if(action==='return'){score=-1000;}
   else if(returnRide){const back=walkMinutes(r.location,returnRide.location)||10;const queueAllowance=leisure?0:(wait??25);const showDelay=show&&next?Math.max(0,(new Date(next.startTime)-now)/60000-walk):0;const total=walk+Math.max(queueAllowance,showDelay)+r.duration+back+12;outing={walk,queue:Math.round(Math.max(queueAllowance,showDelay)),experience:r.duration,back,buffer:12,total:Math.ceil(total)};if(returnMins<total){score=-1000;reasons.push('May not fit before your return');}else{score+=Math.max(0,18-back);reasons.push('Fits before your return, with a buffer');}}
  }
  if(r.kind==='train'){score-=50;if(ret)score=-1000;const target=park==='ioa'?'usf':'ioa';const targetHours=operating(data?.schedule,target,now);if(targetHours&&now+30*60000>=new Date(targetHours.closingTime))score=-1000;else if(park==='ioa'&&hour>=12&&hour<16&&!state.visited?.usf){score+=110;reasons.unshift('Protect your Studios time before its earlier closing');}}
  if(ret&&r.kind==='train')score=-1000;
  if(!preview&&hours&&now+(walk+(wait??30)+r.duration+10)*60000>new Date(hours.closingTime))score=-1000;
  if(!preview&&(unavailable||closedByHours))score=-1000;
  return {...r,live,wait,walk,score,action,reasons:reasons.slice(0,3),outing,unavailable:unavailable||closedByHours,nextShow:next};
 }).filter(r=>preview||r.score>-900).sort((a,b)=>b.score-a.score);
}

// A directed plan sits above ride rankings: decide whether to book, fill a gap,
// return, or simply use a short standby line. A hypothetical return is never saved.
export function directedPlan(catalog,data,state,position,now=Date.now()){
 const park=state.park||'ioa',anchor=position||state.anchor||PARKS[park].entrance;
 if(state.waiting)return {type:'waiting',ride:catalog.find(r=>r.id===state.waiting.rideId)};
 if(dateInPark(now)!==TRIP_DATE)return {type:'preview'};
 const choices=recommend(catalog,data,state,position,now);
 if(state.returnTime){
  const target=catalog.find(r=>r.id===state.returnTime.rideId);const remaining=Math.ceil((Date.parse(state.returnTime.at)-now)/60000);
  const back=walkMinutes(anchor,target?.location)||10;
  if(remaining<=back+15||target?.park!==park)return {type:'headBack',target,remaining,walk:back};
  return {type:'fillGap',target,remaining,next:choices[0]||null};
 }
 const hours=operating(data?.schedule,park,now),studiosHours=operating(data?.schedule,'usf',now);
 // Preserve at least three hours in Studios when it is still unvisited.
 const hopDeadline=park==='ioa'&&!state.visited?.usf&&studiosHours&&now<Date.parse(studiosHours.closingTime)?Date.parse(studiosHours.closingTime)-180*60000:Infinity;
 if(now>=hopDeadline&&now<Date.parse(studiosHours?.closingTime||''))return {type:'hop',target:catalog.find(r=>r.park==='ioa'&&r.kind==='train'),close:studiosHours.closingTime};
 const candidates=choices.filter(r=>r.action==='return'&&r.kind!=='train'&&r.priority>=75&&!r.unavailable&&r.wait>=35&&(!r.wet||(hourInPark(now)>=11&&hourInPark(now)<17))).filter(r=>{
  const end=now+(Math.max(r.wait,r.walk)+r.duration+15)*60000;
  return (!hours||end<Date.parse(hours.closingTime))&&end<hopDeadline;
 }).sort((a,b)=>(b.priority+(b.potter?20:0)+(state.favorites?.[b.id]?30:0)+Math.min(b.wait,90)*.2-b.walk)-(a.priority+(a.potter?20:0)+(state.favorites?.[a.id]?30:0)+Math.min(a.wait,90)*.2-a.walk));
 const target=candidates[0];if(!target)return {type:'standby',next:choices.find(r=>r.action!=='return')||null};
 const estimate=new Date(now+target.wait*60000).toISOString();
 const hypothetical={...state,returnTime:{rideId:target.id,at:estimate}};
 const between=recommend(catalog,data,hypothetical,position,now).find(r=>r.action!=='return'&&r.kind!=='train')||null;
 return {type:'book',target,between,estimatedReturn:estimate};
}
