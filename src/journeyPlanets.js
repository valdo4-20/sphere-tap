import {assetAt,assetForScheduledDate,renderPlanetSvg,NORMAL_ASSETS} from './planetPack/planetAssets.mjs';
export const biomes=NORMAL_ASSETS.slice(0,10).map(a=>({name:a.theme.name,kind:a.biome,palette:[a.theme.top,a.theme.earth,a.theme.rock]}));
export function planetFor(level,scheduledDate){const a=scheduledDate?assetForScheduledDate(level,scheduledDate):assetAt(level);return {...a,level,kind:a.biome,palette:[a.theme.top,a.theme.earth,a.theme.rock]};}
export function planetIsVisible(n,done,playable){return n<=done||(n===done+1&&playable)}
export function planetSVG(level,{scheduledDate,instanceId,animated=true}={}){
 const a=planetFor(level,scheduledDate),id=String(instanceId||`level-${level}`).replace(/[^a-zA-Z0-9_-]/g,'-');
 let svg=renderPlanetSvg(a,{instanceId:id,animated});
 const streams=[...svg.matchAll(/<path d="M([\d.-]+) ([\d.-]+)v16"[^>]*class="water-line"\/>/g)],bottom=Math.max(...streams.map(m=>Number(m[2])+16));let index=0;
 svg=svg.replace(/<path d="M([\d.-]+) ([\d.-]+)v16"[^>]*class="water-line"\/>/g,(path,x,y)=>{
  const clip=`waterfall-${id}-${index++}`,splash=Number(y)+16>=bottom-.1?`<circle class="waterfall-splash" cx="${x}" cy="${Number(y)+16}" r="1.5" fill="#e6fff9"/>`:'';
  return `<defs><clipPath id="${clip}"><rect x="${Number(x)-2}" y="${y}" width="4" height="16"/></clipPath></defs><g clip-path="url(#${clip})">${path.replace('class="water-line"','class="water-line waterfall-stream"')}</g>${splash}`;
 });
 return svg;
}
