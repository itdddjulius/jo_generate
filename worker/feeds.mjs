const host={GitHub:'github.com',GitLab:'gitlab.com',Bitbucket:'bitbucket.org',SourceForge:'sourceforge.net'};
const bounded=async (url,fetcher,cap=3000000)=>{
 const r=await fetcher(url,{redirect:'error',signal:AbortSignal.timeout(18000),headers:{accept:'*/*','user-agent':'JOGENERATEqa2/2.0'}});
 if(!r.ok) throw Error('HTTP '+r.status);
 if(+r.headers.get('content-length')>cap)throw Error('Response exceeds size limit');
 if(!r.body)throw Error('Empty response');
 const reader=r.body.getReader();let size=0;const parts=[];
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>cap)throw Error('Response exceeds size limit');parts.push(value)}}
 finally{await reader.cancel().catch(()=>{});}
 const data=new Uint8Array(size);let i=0;for(const b of parts){data.set(b,i);i+=b.length}return data;
};
const clean=s=>String(s??'').replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
export function valid(platform,url){
 try{const u=new URL(url);return u.protocol==='https:'&&u.hostname===host[platform]&&!u.username&&!u.password&&!u.port&&u.pathname.split('/').filter(Boolean).length>=2}catch{return false}
}
export function sfLinks(html){
 return [...new Set([...html.matchAll(/(?:href|content)=["'](?:https:\/\/sourceforge\.net)?\/projects\/([a-z\d][a-z\d_-]*)\/?(?:["'?#])/gi)].map(m=>m[1]))];
}
export async function feed(platform,fetcher=fetch){
 const get=async u=>new TextDecoder().decode(await bounded(u,fetcher));
 const json=async u=>JSON.parse(await get(u));
 let raw,scope,limited='';
 if(platform==='GitHub'){
  const since=new Date(Date.now()-30*864e5).toISOString().slice(0,10);
  const q=encodeURIComponent('created:>='+since+' fork:true sort:created-desc');
  const v=await json('https://api.github.com/search/repositories?q='+q+'&per_page=60');
  raw=v.items.map(x=>[x.full_name,x.html_url,x.description,x.created_at,x.fork?'fork':'',x.language,x.size]);
  scope='GitHub Search index · creation order, last 30 days';if(v.incomplete_results)limited='GitHub returned incomplete search results.';
 }else if(platform==='GitLab'){
  const v=await json('https://gitlab.com/api/v4/projects?visibility=public&order_by=created_at&sort=desc&per_page=60');
  raw=v.map(x=>[x.path_with_namespace,x.web_url,x.description,x.created_at,x.forked_from_project?'fork':/scan[-_ ]?(copy|temp)/i.test(x.path_with_namespace)?'possible scan copy':'',null,null]);
  scope='GitLab public projects · creation order';
 }else if(platform==='Bitbucket'){
  const v=await json('https://api.bitbucket.org/2.0/repositories/atlassian?sort=-created_on&pagelen=60');
  raw=v.values.map(x=>[x.full_name,x.links.html.href,x.description,x.created_on,x.parent?'fork':'',x.language,x.size]);
  scope='Atlassian public workspace · creation order; not a global Bitbucket feed';
 }else if(platform==='SourceForge'){
  const results=await Promise.allSettled([1,2,3,4].map(p=>get('https://sourceforge.net/directory/?sort=update&page='+p)));
  const names=[...new Set(results.flatMap(x=>x.status==='fulfilled'?sfLinks(x.value):[]))].slice(0,60);
  raw=names.map(n=>[n,'https://sourceforge.net/projects/'+n+'/',null,null,'unknown',null,null]);
  scope='SourceForge directory · last updated, not creation order';
  if(results.some(x=>x.status==='rejected'))limited='Some directory pages were unavailable.';
 }else throw Error('Unknown platform');
 const seen=new Set();
 const records=raw.filter(x=>valid(platform,x[1])&&!seen.has(x[1])&&seen.add(x[1])).slice(0,60).map((x,i)=>({id:platform+'-'+(i+1),platform,feed:i+1,name:clean(x[0]).slice(0,150),url:x[1],description:clean(x[2]).slice(0,220),date:x[3],kind:x[4]||'unknown',language:x[5],size:x[6]}));
 if(records.length<10)throw Error((limited?limited+' ':'')+'Only '+records.length+' usable candidates. Import a current candidate list or retry.');
 return {platform,scope,limitation:limited||(records.length<60?'Only '+records.length+' of 60 candidates returned.':''),records,retrievedAt:new Date().toISOString()};
}
