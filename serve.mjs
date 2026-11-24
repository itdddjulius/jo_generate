import http from 'node:http';
import {execFileSync} from 'node:child_process';
execFileSync(process.execPath,['build.mjs']);
const {default:app}=await import('./dist/server/index.js');
const port=Number(process.env.PORT||4173);
http.createServer(async(req,res)=>{
 try{
 const r=await app.fetch(new Request('http://127.0.0.1:'+port+req.url,{method:req.method}));
 res.writeHead(r.status,Object.fromEntries(r.headers));res.end(Buffer.from(await r.arrayBuffer()));
 }catch{res.writeHead(500);res.end('Local server error');}
}).listen(port,'0.0.0.0',()=>console.log('JOGENERATEqa2: http://localhost:'+port));
