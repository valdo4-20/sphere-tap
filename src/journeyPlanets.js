import {renderIslandSvg} from './islandSvg.js';
import {assetAt,assetForScheduledDate,NORMAL_ASSETS} from './planetPack/planetAssets.mjs';
export const biomes=NORMAL_ASSETS.slice(0,10).map(a=>({name:a.theme.name,kind:a.biome,palette:[a.theme.top,a.theme.earth,a.theme.rock]}));
export function planetFor(level,scheduledDate){const a=scheduledDate?assetForScheduledDate(level,scheduledDate):assetAt(level);return {...a,level,kind:a.biome,palette:[a.theme.top,a.theme.earth,a.theme.rock]};}
export function planetIsVisible(n,done,playable){return n<=done||(n===done+1&&playable)}
export function planetSVG(level,{scheduledDate,instanceId,animated=true}={}){return renderIslandSvg(planetFor(level,scheduledDate),{instanceId:instanceId||`level-${level}`,animated});}

const SAGA_SHAPES={
 forest:{name:'Raiz Ancestral',boss:'Guardião da Mata',form:'branch',glow:'#83d7a2'},
 snow:{name:'Coroa Boreal',boss:'Titã Glacial',form:'spiral',glow:'#8ddcf5'},
 water:{name:'Abismo Fluente',boss:'Leviatã das Marés',form:'wave',glow:'#65d8e8'},
 desert:{name:'Dunas do Eclipse',boss:'Colosso das Dunas',form:'zigzag',glow:'#f0c27b'},
 lava:{name:'Forja Vulcânica',boss:'Soberano Ígneo',form:'fork',glow:'#ff956d'},
 crystal:{name:'Catedral Prismática',boss:'Oráculo de Cristal',form:'constellation',glow:'#c5a5ff'},
 mist:{name:'Véu Nebuloso',boss:'Espectro do Véu',form:'spiral',glow:'#a7c8d9'},
 swamp:{name:'Pântano Esmeralda',boss:'Devorador do Brejo',form:'wave',glow:'#83c59a'},
 moon:{name:'Cratera Silenciosa',boss:'Arauto Lunar',form:'constellation',glow:'#a8b7d9'},
 fungal:{name:'Reino Micelial',boss:'Monarca dos Esporos',form:'fork',glow:'#d99be8'},
 golden:{name:'Trono Solar',boss:'Sentinela Solar',form:'branch',glow:'#f2d27b'},
 mushroom:{name:'Jardim Micélio',boss:'Rei Micélio',form:'wave',glow:'#e4a4d0'},
 default:{name:'Caminho Estelar',boss:'Guardião do Mundo',form:'constellation',glow:'#9ebcff'}
};
const SAGA_COORDS={
 branch:[[0,0],[-1.1,1],[1.05,2.1],[-.9,3.15],[.9,4.2],[0,5.2],[-1.2,6.2],[1,7.25],[0,8.3]],
 spiral:[[0,0],[1,1],[-.3,2],[ -1.25,3],[0,4],[1.25,5],[.3,6],[-.8,7],[0,8]],
 wave:[[0,0],[1.1,1],[-1,2],[-1.2,3],[1,4],[1.2,5],[-1,6],[-.9,7],[0,8]],
 zigzag:[[0,0],[1.25,1],[-1.25,2],[1.25,3],[-1.25,4],[1.25,5],[-1.25,6],[1.25,7],[0,8]],
 fork:[[0,0],[-1,1],[1,2],[-1,3],[1,4],[-1,5],[1,6],[-1,7],[0,8]],
 constellation:[[0,0],[-1.2,1],[.7,2],[-.6,3],[1.2,4],[-1,5],[.5,6],[-.8,7],[0,8]]
};
export function sagaMapFor(level,scheduledDate){
 const planet=planetFor(level,scheduledDate),theme=SAGA_SHAPES[planet.biome]||SAGA_SHAPES.default;
 const coords=SAGA_COORDS[theme.form]||SAGA_COORDS.constellation;
 const nodes=coords.map(([x,y],index)=>({id:index+1,x:x+(planet.seed%7-3)*.035,y,z:Math.sin(index*.9+(planet.seed%13))*.24,kind:index===8?'guardian':index%3===0?'trial':'level'}));
 return {...theme,planetName:planet.name,seed:planet.seed,nodes,connections:nodes.slice(1).map((node,index)=>[nodes[index].id,node.id])};
}

export function sagaLevelState(node,completed,current,playable){
 if(node<=completed)return 'complete';
 if(node===current&&playable)return 'current';
 return 'locked';
}
