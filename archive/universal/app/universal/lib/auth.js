import crypto from 'node:crypto';
export function safeEqual(a,b){return typeof a==='string'&&typeof b==='string'&&a.length===b.length&&crypto.timingSafeEqual(Buffer.from(a),Buffer.from(b));}
export function sign(value){if(!process.env.UNIVERSAL_SESSION_SECRET)throw Error('Session configuration missing');return crypto.createHmac('sha256',process.env.UNIVERSAL_SESSION_SECRET).update(value).digest('base64url');}
export function makeSession(){const exp=String(Date.now()+7*86400000);return `${exp}.${sign(exp)}`;}
export function authorized(req){const t=req.cookies.get('kidder_universal')?.value||'', [exp,sig]=t.split('.');return Number(exp)>Date.now()&&Number(exp)<Date.now()+8*86400000&&safeEqual(sig,sign(exp));}
export function sameOrigin(req){const o=req.headers.get('origin');return !!o&&o===new URL(req.url).origin;}
