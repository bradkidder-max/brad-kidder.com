import graph from './paths.js';
const rad=Math.PI/180;
function distance(a,b){const p=(a[0]+b[0])*rad/2;return Math.hypot((a[0]-b[0])*111195,(a[1]-b[1])*111195*Math.cos(p));}
const adjacency=graph.nodes.map(()=>[]);
for(const [a,b] of graph.edges){const d=distance(graph.nodes[a],graph.nodes[b]);adjacency[a].push([b,d]);adjacency[b].push([a,d]);}
const components=new Int32Array(graph.nodes.length).fill(-1),sizes=[];
for(let i=0;i<graph.nodes.length;i++){if(components[i]!==-1)continue;const id=sizes.length,stack=[i];components[i]=id;let count=0;while(stack.length){const u=stack.pop();count++;for(const [v]of adjacency[u])if(components[v]===-1){components[v]=id;stack.push(v);}}sizes.push(count);}
const cache=new Map();
function snapCandidates(p){return graph.nodes.map((n,i)=>({i,d:distance(n,p)})).sort((a,b)=>a.d-b.d).slice(0,40);}
function dijkstra(start){if(cache.has(start))return cache.get(start);const dist=new Float64Array(graph.nodes.length).fill(Infinity),prev=new Int32Array(graph.nodes.length).fill(-1),heap=[];
 function push(v){heap.push(v);let i=heap.length-1;while(i>0){let p=(i-1)>>1;if(heap[p][0]<=v[0])break;heap[i]=heap[p];i=p;}heap[i]=v;}
 function pop(){const top=heap[0],last=heap.pop();if(heap.length){let i=0;while(true){let c=i*2+1;if(c>=heap.length)break;if(c+1<heap.length&&heap[c+1][0]<heap[c][0])c++;if(heap[c][0]>=last[0])break;heap[i]=heap[c];i=c;}heap[i]=last;}return top;}
 dist[start]=0;push([0,start]);while(heap.length){const [d,u]=pop();if(d>dist[u])continue;for(const [v,w]of adjacency[u]){if(d+w<dist[v]){dist[v]=d+w;prev[v]=u;push([dist[v],v]);}}}
 const out={dist,prev};if(cache.size>100)cache.clear();cache.set(start,out);return out;
}
export function walkingRoute(a,b){if(!a||!b)return null;const start=[a.latitude,a.longitude],end=[b.latitude,b.longitude],direct=distance(start,end);if(direct<20)return {minutes:2,meters:Math.round(direct),points:[],estimated:true};if(direct>3500)return {minutes:Math.ceil(direct*1.6/65),meters:Math.round(direct*1.6),points:[],estimated:true};
 const sa=snapCandidates(start),sb=snapCandidates(end);let pair=null;
 for(const x of sa)for(const y of sb){if(x.d>180||y.d>180||components[x.i]!==components[y.i])continue;const penalty=x.d+y.d;if(!pair||penalty<pair.penalty)pair={x,y,penalty};}
 if(!pair)return {minutes:Math.max(2,Math.ceil(direct*1.6/65)),meters:Math.round(direct*1.6),points:[],estimated:true};
 const {dist,prev}=dijkstra(pair.x.i);let length=dist[pair.y.i]+pair.penalty;if(!Number.isFinite(length)||length>Math.max(500,direct*4))return {minutes:Math.max(2,Math.ceil(direct*1.6/65)),meters:Math.round(direct*1.6),points:[],estimated:true};
 const points=[];let node=pair.y.i;while(node!==-1){points.push(graph.nodes[node]);if(node===pair.x.i)break;node=prev[node];}points.reverse();
 return {minutes:Math.max(2,Math.ceil(length/60)+2),meters:Math.round(length),points,estimated:false,entranceOffset:Math.round(pair.y.d)};
}
