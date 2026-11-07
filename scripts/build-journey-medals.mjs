import fs from 'node:fs';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Compass,Sparkles} from 'lucide-react';
import {achievementCatalog} from '../src/achievements.js';
const dir=new URL('../public/achievements/',import.meta.url),manifest=JSON.parse(fs.readFileSync(new URL('manifest.json',dir),'utf8'));
for(const a of achievementCatalog.filter(a=>a.group.startsWith('Jornada'))){
 const template=manifest.find(v=>v.rarity===a.rarity&&!v.id.startsWith('journey-'));
 let svg=fs.readFileSync(new URL(template.coin,dir),'utf8');
 const Icon=a.motif==='Compass'?Compass:Sparkles;
 const icon=renderToStaticMarkup(React.createElement(Icon)).replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'');
 svg=svg.replace(/<title>[\s\S]*?<\/title>/,'<title>'+a.title+'</title>').replace(/aria-label="[^"]*"/,'aria-label="'+a.title+'"');
 svg=svg.replace(/<svg x="48"[^>]*>[\s\S]*?<\/svg>/g,v=>v.match(/^<svg[^>]*>/)[0]+'<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+icon+'</g></svg>');
 svg=svg.replace(/<text x="64" y="95"[\s\S]*?<\/text>/g,'');
 fs.writeFileSync(new URL(a.id+'.svg',dir),svg);
 if(!manifest.some(v=>v.id===a.id))manifest.push({id:a.id,title:a.title,rarity:a.rarity,coin:a.id+'.svg'});
}
fs.writeFileSync(new URL('manifest.json',dir),JSON.stringify(manifest,null,2));
