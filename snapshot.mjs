import fs from 'node:fs/promises';
import {feed} from './worker/feeds.mjs';
const hosts=['GitHub','GitLab','Bitbucket','SourceForge'];
const groups=await Promise.all(hosts.map(p=>feed(p)));
const snapshot={version:1,groups:Object.fromEntries(groups.map(g=>[g.platform,g]))};
await fs.writeFile('dist/feed-snapshot.json',JSON.stringify(snapshot,null,2)+'\n');
console.log(groups.map(g=>g.platform+': '+g.records.length).join(' · '));
