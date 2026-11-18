import catalog from './catalog.json';
export const DEMO_NOW=Date.parse('2026-09-10T11:00:00-04:00');
export const demoCatalog=catalog;
export function demoState(scenario='plan'){
 const hagrid=catalog.find(r=>r.name.startsWith('Hagrid')),forbidden=catalog.find(r=>r.name.includes('Forbidden Journey'));
 return {version:0,park:'ioa',anchor:hagrid.location,completed:{},skipped:{},favorites:{[hagrid.id]:true},visited:{ioa:true},waiting:scenario==='queue'?{rideId:forbidden.id,name:forbidden.name,startedAt:new Date(DEMO_NOW-7*60000).toISOString(),postedWait:15,token:'demo-wait'}:null,waitHistory:[],returnTime:scenario==='return'?{rideId:hagrid.id,name:hagrid.name,at:new Date(DEMO_NOW+55*60000).toISOString(),token:'demo-return'}:null};
}
export const demoLive={rides:Object.fromEntries(catalog.map(r=>[r.id,{status:'OPERATING',wait:r.name.startsWith('Hagrid')?60:r.name.includes('VelociCoaster')?45:r.name.includes('Gringotts')?50:r.name.includes('Forbidden Journey')?10:r.name.includes('Hulk')?20:r.kind==='show'?null:r.kind==='train'?15:10,lastUpdated:new Date(DEMO_NOW).toISOString(),source:'Simulated demo',showtimes:r.kind==='show'?[{startTime:'2026-09-10T11:15:00-04:00',endTime:'2026-09-10T11:40:00-04:00'}]:[]}])),schedule:{ioa:[{date:'2026-09-10',type:'OPERATING',openingTime:'2026-09-10T09:00:00-04:00',closingTime:'2026-09-10T20:00:00-04:00'}],usf:[{date:'2026-09-10',type:'OPERATING',openingTime:'2026-09-10T09:00:00-04:00',closingTime:'2026-09-10T17:00:00-04:00'}]},errors:[],fetchedAt:new Date(DEMO_NOW).toISOString(),source:'Simulated demo'};
