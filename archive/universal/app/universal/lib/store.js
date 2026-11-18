import {get,put} from '@vercel/blob';
export const initialState=()=>({version:0,park:'ioa',anchor:null,completed:{},skipped:{},favorites:{},visited:{},returnTime:null,waiting:null,waitHistory:[]});
export async function readRecord(path,empty={}){
 const b=await get(`universal/${path}.json`,{access:'private',useCache:false});
 if(!b)return {data:structuredClone(empty),etag:null};
 return {data:await new Response(b.stream).json(),etag:b.blob.etag};
}
export async function updateRecord(path,empty,mutate){
 for(let i=0;i<7;i++){
  const {data,etag}=await readRecord(path,empty);const result=mutate(data);
  if(result===false)return data;
  try{await put(`universal/${path}.json`,JSON.stringify(data),{access:'private',addRandomSuffix:false,contentType:'application/json',cacheControlMaxAge:0,...(etag?{ifMatch:etag}:{allowOverwrite:false})});return data;}
  catch(e){if(!/precondition|already exists|modified/i.test(e.message)&&!['BlobPreconditionFailedError','BlobAlreadyExistsError'].includes(e.name))throw e;if(i===6)throw new Error('The family plan is busy. Try again.');await new Promise(r=>setTimeout(r,100+i*100));}
 }
}
