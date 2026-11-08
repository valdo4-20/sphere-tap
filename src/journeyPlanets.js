import {renderIslandSvg} from './islandSvg.js';
import {assetAt,assetForScheduledDate,NORMAL_ASSETS} from './planetPack/planetAssets.mjs';
export const biomes=NORMAL_ASSETS.slice(0,10).map(a=>({name:a.theme.name,kind:a.biome,palette:[a.theme.top,a.theme.earth,a.theme.rock]}));
export function planetFor(level,scheduledDate){const a=scheduledDate?assetForScheduledDate(level,scheduledDate):assetAt(level);return {...a,level,kind:a.biome,palette:[a.theme.top,a.theme.earth,a.theme.rock]};}
export function planetIsVisible(n,done,playable){return n<=done||(n===done+1&&playable)}
export function planetSVG(level,{scheduledDate,instanceId,animated=true}={}){return renderIslandSvg(planetFor(level,scheduledDate),{instanceId:instanceId||`level-${level}`,animated});}
