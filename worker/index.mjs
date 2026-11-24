import {feed} from './feeds.mjs';
import {assets} from './assets.mjs';
const mime={html:'text/html; charset=utf-8',js:'text/javascript; charset=utf-8',md:'text/markdown; charset=utf-8',pdf:'application/pdf',json:'application/json; charset=utf-8'};
export default {async fetch(req){
 const u=new URL(req.url);
 if(req.method!=='GET'&&req.method!=='HEAD')return new Response('Method not allowed',{status:405});
 if(u.pathname==='/api/feed'){
  try{return Response.json(await feed(u.searchParams.get('platform')),{headers:{'cache-control':'private, max-age=180'}})}
  catch(e){return Response.json({error:e.message},{status:502})}
 }
 const key=u.pathname==='/'?'/index.html':u.pathname, data=assets[key];
 if(typeof data!=='string'||!Object.hasOwn(assets,key))return new Response('Not found',{status:404});
 return new Response(req.method==='HEAD'?null:Uint8Array.from(atob(data),c=>c.charCodeAt(0)),{headers:{'content-type':mime[key.split('.').pop()]||'application/octet-stream','x-content-type-options':'nosniff','referrer-policy':'no-referrer','content-security-policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://api.groq.com; frame-src https: http: blob: data:; img-src 'self' data:; object-src 'none'; base-uri 'none'; form-action 'none'"}});
}};
