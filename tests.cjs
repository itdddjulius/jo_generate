const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),os=require('node:os');
const {execFileSync}=require('node:child_process');
const map=new Map(), dummy={addEventListener(){},querySelector(){return null}};
const ctx=vm.createContext({URL,TextEncoder,document:dummy,Uint8Array,localStorage:{getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v)},fetch:null,AbortSignal,location:{hostname:"localhost"}});
const engine=fs.readFileSync('dist/engine.js','utf8'),ui=fs.readFileSync('dist/studio.js','utf8').split('\nrender();\n')[0];
vm.runInContext(engine+ui+'\nrender=()=>{};',ctx);
const run=s=>vm.runInContext(s,ctx);
const model='openai/gpt-oss-120b', hosts=['github.com','gitlab.com','bitbucket.org','sourceforge.net'];
function groups(){return ['GitHub','GitLab','Bitbucket','SourceForge'].map((p,k)=>({platform:p,scope:'Fixture scope',retrievedAt:'2026-11-13T12:00:00Z',records:Array.from({length:12},(_,i)=>({name:p+i,url:'https://'+hosts[k]+'/'+(k===3?'projects':'sample')+'/r'+i,description:'Sample'}))}));}
function reply(o){return Response.json({choices:[{message:{content:JSON.stringify(o)}}]});}
test('key and model gate; catalogue has at least ten options',()=>{
 assert.equal(run('open()'),false);
 assert.throws(()=>run('must()'),/unlock/);
 assert.ok(run('catalogue([]).length')>=10);
 assert.equal(run("safe('GitHub','https://github.com.evil.invalid/a/b')"),false);
 assert.equal(run("safe('GitHub','https://github.com/a/b')"),true);
});
test('fixture flow ranks 40, preserves previous snapshot on error, and generates a runnable ZIP',async()=>{
 const gs=groups();let corrupt=false,calls=0;
 ctx.fetch=async(url,options)=>{
  if(url.startsWith('/api/feed')){assert.equal(options.headers,undefined);return Response.json(gs.find(g=>g.platform===url.split('=')[1]));}
  assert.equal(url,'https://api.groq.com/openai/v1/chat/completions');
  assert.equal(options.headers.Authorization,'Bearer TEST-ONLY');
  const req=JSON.parse(options.body);assert.equal(req.model,model);const m=req.messages;
  if(m[0].content.startsWith('JOGENERATE')){
   calls++;const g=JSON.parse(m[1].content);
   const picks=g.records.slice(0,10).map(r=>({id:r.id,summary:'Sample overview',example:'Sample use'}));
   if(corrupt)picks[1].id=picks[0].id;
   return reply({picks});
  }
  return reply({mode:'checklist',title:'Sample <test>',intro:'Plan your review.',items:[1,2,3,4,5].map(n=>({title:'Check '+n,body:'Inspect documentation.'}))});
 };
 run(`key='TEST-ONLY';model='${model}';verified=true`);
 await run('refresh()');
 assert.equal(calls,4);assert.equal(run('snapshot.records.length'),40);
 assert.deepEqual(JSON.parse(run('JSON.stringify(snapshot.groups.map(g=>g.count))')),[12,12,12,12]);
 corrupt=true;const old=map.get('jog2.snapshot');
 await assert.rejects(run('refresh()'),/duplicate/);
 assert.equal(map.get('jog2.snapshot'),old);
 run('selectRecord(records()[0]);edits[selected]={notes:"Saved QA notes"}');
 await run('generate()');
 const pr=run('project');
 assert.match(pr.html,/Sample &lt;test&gt;/);
 assert.match(pr.html,/type="checkbox"/);
 assert.match(pr.name,/^JO_\d{8}_\d{6}$/);
 const bytes=await run('pack(project,n=>new Uint8Array(0))');
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'joqa2-'));
 try{
  const out=path.join(dir,pr.name+'.zip');fs.writeFileSync(out,Buffer.from(bytes));
  execFileSync('unzip',['-tq',out]);
  const read=n=>execFileSync('unzip',['-p',out,pr.name+'/'+n],{encoding:'utf8'});
  assert.equal(read('dist/index.html'),pr.html);
  assert.match(read('SHORTLIST-EDITED.json'),/Saved QA notes/);
  assert.doesNotMatch(read('SHORTLIST-EDITED.json'),/TEST-ONLY/);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('four public feed adapters normalize provider responses and expose scope',async()=>{
 const {feed}=await import('./worker/feeds.mjs');
 const gs=groups();
 const response=[
  {items:gs[0].records.map(r=>({full_name:r.name,html_url:r.url}))},
  gs[1].records.map(r=>({path_with_namespace:r.name,web_url:r.url})),
  {values:gs[2].records.map(r=>({full_name:r.name,links:{html:{href:r.url}}}))},
  gs[3].records.map(r=>'<a href="'+r.url+'">x</a>').join('')
 ];
 for(let i=0;i<gs.length;i++){
  const got=await feed(gs[i].platform,async()=>new Response(i===3?response[i]:JSON.stringify(response[i])));
  assert.equal(got.records.length,12);assert.match(got.limitation,/12 of 60/);assert.ok(got.scope);
 }
 await assert.rejects(feed('SourceForge',async()=>new Response('',{status:403})),/Only 0/);
 await assert.rejects(feed('Example',async()=>assert.fail('unknown platform must not fetch')),/Unknown platform/);
});

test('static hosting needs no /api/feed route and Groq still ranks all four groups',async()=>{
 ctx.location.hostname='studio.example';
 const bundled=JSON.parse(fs.readFileSync('dist/feed-snapshot.json','utf8'));
 let reads=0, sent=[];
 ctx.fetch=async(url,options)=>{
  if(url==='./feed-snapshot.json'){reads++;return Response.json(bundled);}
  assert.ok(!url.startsWith('/api/'),'static deployment must not depend on the missing route');
  if(!url.startsWith('https://api.groq.com/'))return new Response('',{status:404});
  const req=JSON.parse(options.body);
  const group=JSON.parse(req.messages[1].content);
  sent.push(group);
  return reply({picks:group.records.slice(0,10).map(r=>({id:r.id,summary:'Review the project',example:'Read the original documentation'}))});
 };
 await run('refresh()');
 assert.equal(reads,1);
 assert.equal(sent.length,4);
 assert.ok(sent.every(g=>g.origin==='bundled'&&g.records.length===60&&g.retrievedAt===bundled.groups[g.platform].retrievedAt));
 assert.equal(run('snapshot.records.length'),40);
 ctx.location.hostname='localhost';
});
