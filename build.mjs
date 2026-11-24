import fs from 'node:fs';
import path from 'node:path';
const walk=(d)=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?(e.name==='server'||e.name==='.openai'?[]:walk(path.join(d,e.name))):[path.join(d,e.name)]);
const assets=Object.fromEntries(walk('dist').map(p=>['/'+p.slice(5),fs.readFileSync(p).toString('base64')]));
fs.mkdirSync('dist/server',{recursive:true});fs.mkdirSync('dist/.openai',{recursive:true});
const source=fs.readFileSync('worker/index.mjs','utf8').replace(/import .*?;\n/g,'');
const feeds=fs.readFileSync('worker/feeds.mjs','utf8').replace(/\bexport /g,'');
fs.writeFileSync('dist/server/index.js',feeds+'\nconst assets='+JSON.stringify(assets)+';\n'+source);
if(fs.existsSync('.openai/hosting.json')) fs.copyFileSync('.openai/hosting.json','dist/.openai/hosting.json');
