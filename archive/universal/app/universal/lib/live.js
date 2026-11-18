import catalog from './catalog.json';
import {PARKS,TRIP_DATE} from './planner.mjs';
const base='https://api.themeparks.wiki/v1/entity/';
async function fetchJSON(path,seconds){const r=await fetch(base+path,{next:{revalidate:seconds},signal:AbortSignal.timeout(12000)});if(!r.ok)throw Error('Live feed unavailable');return r.json();}
export async function getLive(){
 const rides={},schedule={},errors=[];
 await Promise.all(Object.entries(PARKS).map(async([park,p])=>{
  const [l,s]=await Promise.allSettled([fetchJSON(p.id+'/live',60),fetchJSON(p.id+'/schedule',1800)]);
  if(l.status==='fulfilled')for(const r of l.value.liveData||[])rides[r.id]={status:r.status,wait:r.queue?.STANDBY?.waitTime??null,lastUpdated:r.lastUpdated,showtimes:r.showtimes||[]};else errors.push(`${p.short} wait feed unavailable`);
  if(s.status==='fulfilled')schedule[park]=(s.value.schedule||[]).filter(x=>x.date===TRIP_DATE);else errors.push(`${p.short} hours unavailable`);
 }));
 await Promise.all(Object.entries({ioa:64,usf:65}).map(async([park,id])=>{try{const res=await fetch(`https://queue-times.com/parks/${id}/queue_times.json`,{next:{revalidate:60},signal:AbortSignal.timeout(12000)});if(!res.ok)throw Error();const q=await res.json();for(const r of [...(q.rides||[]),...(q.lands||[]).flatMap(l=>l.rides)]){const match=catalog.find(c=>c.park===park&&c.queueId===r.id);if(match)rides[match.id]={...(rides[match.id]||{}),status:r.is_open?'OPERATING':'CLOSED',wait:r.is_open?r.wait_time:null,lastUpdated:r.last_updated,source:'Queue-Times'};}}catch{errors.push(`${PARKS[park].short} primary waits unavailable; using secondary readings where available`);}}));
 return {rides,schedule,errors,fetchedAt:new Date().toISOString(),source:'Queue-Times + ThemeParks.wiki'};
}
