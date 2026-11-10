import {renderIslandSvg} from './islandSvg.js';
import {assetAt,assetForScheduledDate,NORMAL_ASSETS} from './planetPack/planetAssets.mjs';
export const biomes=NORMAL_ASSETS.slice(0,10).map(a=>({name:a.theme.name,kind:a.biome,palette:[a.theme.top,a.theme.earth,a.theme.rock]}));
export function planetFor(level,scheduledDate){const a=scheduledDate?assetForScheduledDate(level,scheduledDate):assetAt(level);return {...a,level,kind:a.biome,palette:[a.theme.top,a.theme.earth,a.theme.rock]};}
export function planetIsVisible(n,done,playable){return n<=done||(n===done+1&&playable)}
export function planetSVG(level,{scheduledDate,instanceId,animated=true}={}){return renderIslandSvg(planetFor(level,scheduledDate),{instanceId:instanceId||`level-${level}`,animated});}


const SAGA_SHAPES={
 forest:{name:'Trilha do Alfa',boss:'Lobo Ancestral',creature:'wolf',glow:'#83d7a2'},
 snow:{name:'Coroa Boreal',boss:'Urso das Geadas',creature:'bear',glow:'#8ddcf5'},
 water:{name:'Abismo Fluente',boss:'Leviatã das Marés',creature:'serpent',glow:'#65d8e8'},
 desert:{name:'Dunas do Eclipse',boss:'Escorpião-Rei',creature:'scorpion',glow:'#f0c27b'},
 lava:{name:'Forja Vulcânica',boss:'Dragão de Magma',creature:'dragon',glow:'#ff956d'},
 crystal:{name:'Catedral Prismática',boss:'Oráculo Alienígena',creature:'alien',glow:'#c5a5ff'},
 mist:{name:'Véu Nebuloso',boss:'Coruja Espectral',creature:'owl',glow:'#a7c8d9'},
 swamp:{name:'Pântano Esmeralda',boss:'Sapo Colossal',creature:'frog',glow:'#83c59a'},
 moon:{name:'Cratera Silenciosa',boss:'Arauto Extraterrestre',creature:'alien',glow:'#a8b7d9'},
 fungal:{name:'Reino Micelial',boss:'Monarca dos Esporos',creature:'mushroom',glow:'#d99be8'},
 golden:{name:'Trono Solar',boss:'Sentinela Solar',creature:'golem',glow:'#f2d27b'},
 ruins:{name:'Templo Esquecido',boss:'Colosso de Pedra',creature:'golem',glow:'#c8bd91'},
 default:{name:'Caminho Estelar',boss:'Guardião do Mundo',creature:'alien',glow:'#9ebcff'}
};
const SAGA_OUTLINES={
 wolf:[[-.15,-1],[-.55,-.8],[-.9,-1.1],[-.92,-.55],[-1.2,-.2],[-1.15,.35],[-.8,.62],[-.55,.48],[-.35,.82],[0,.72],[.35,.82],[.55,.48],[.8,.62],[1.15,.35],[1.2,-.2],[.92,-.55],[.9,-1.1],[.55,-.8],[.15,-1]],
 bear:[[-.25,-1],[-.75,-.85],[-1.05,-.45],[-1.15,.1],[-.95,.72],[-.65,1],[-.25,.82],[0,.9],[.25,.82],[.65,1],[.95,.72],[1.15,.1],[1.05,-.45],[.75,-.85],[.25,-1]],
 serpent:[[-1.1,-.9],[-.45,-1.05],[.3,-.75],[.95,-.35],[.8,.05],[.15,.25],[-.55,.55],[-.9,.9],[-.25,1.05],[.45,.8],[1.1,.95],[.85,.45],[.2,.15],[-.45,-.1],[-.8,-.55]],
 scorpion:[[-.1,-1.1],[-.5,-.75],[-.9,-.55],[-1.2,-.1],[-.8,.12],[-.55,-.2],[-.35,.3],[-.6,.85],[-.2,.65],[0,.35],[.2,.65],[.6,.85],[.35,.3],[.55,-.2],[.8,.12],[1.2,-.1],[.9,-.55],[.5,-.75],[.1,-.9]],
 dragon:[[-.1,-1.1],[-.45,-.65],[-1.25,-1],[-.95,-.2],[-1.25,.45],[-.55,.25],[-.3,.75],[0,1],[.3,.75],[.55,.25],[1.25,.45],[.95,-.2],[1.25,-1],[.45,-.65],[.1,-1.1]],
 alien:[[-.35,-1.05],[-.8,-.75],[-1,-.15],[-.8,.5],[-.45,.82],[-.2,1.1],[0,.82],[.2,1.1],[.45,.82],[.8,.5],[1,.0],[.8,-.65],[.35,-1.05],[0,-.8]],
 owl:[[-.1,-1.05],[-.55,-.85],[-.9,-.45],[-1.2,.15],[-.7,.05],[-.85,.75],[-.25,.5],[0,.95],[.25,.5],[.85,.75],[.7,.05],[1.2,.15],[.9,-.45],[.55,-.85],[.1,-1.05]],
 frog:[[-.2,-1],[-.65,-.85],[-1,-.45],[-1.15,.1],[-.75,.45],[-.55,.85],[-.15,.7],[0,.9],[.15,.7],[.55,.85],[.75,.45],[1.15,.1],[1,-.45],[.65,-.85],[.2,-1]],
 mushroom:[[-.2,-1.05],[-.55,-.75],[-.85,-.45],[-1.2,-.25],[-1,.25],[-.6,.35],[-.45,.1],[-.25,.65],[0,1],[.25,.65],[.45,.1],[.6,.35],[1,.25],[1.2,-.25],[.85,-.45],[.55,-.75],[.2,-1.05]],
 golem:[[-.25,-1],[-.75,-.85],[-1,-.4],[-.8,.05],[-1.1,.55],[-.55,.4],[-.4,.95],[0,.72],[.4,.95],[.55,.4],[1.1,.55],[.8,.05],[1,-.4],[.75,-.85],[.25,-1]]
};
export function islandIndexForLevel(level){const value=Number(level),n=Number.isFinite(value)?Math.max(1,Math.floor(value)):1;return Math.floor((n-1)/50)+1}
export function islandStartForLevel(level){return (islandIndexForLevel(level)-1)*50+1}
function sampleOutline(outline,count){
 const points=[...outline,outline[0]],segments=[];let total=0;
 for(let i=0;i<points.length-1;i++){const a=points[i],b=points[i+1],length=Math.hypot(b[0]-a[0],b[1]-a[1]);segments.push({a,b,length,start:total});total+=length}
 return Array.from({length:count},(_,index)=>{
  const target=total*index/count,segment=segments.find(s=>target<=s.start+s.length)||segments.at(-1),t=segment.length?(target-segment.start)/segment.length:0;
  return [segment.a[0]+(segment.b[0]-segment.a[0])*t,segment.a[1]+(segment.b[1]-segment.a[1])*t];
 });
}
function shiftedDate(date,offset){
 if(typeof date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(date))return undefined;
 const value=new Date(date+'T12:00:00');if(Number.isNaN(+value))return undefined;
 value.setDate(value.getDate()+offset);
 return String(value.getFullYear()).padStart(4,'0')+'-'+String(value.getMonth()+1).padStart(2,'0')+'-'+String(value.getDate()).padStart(2,'0');
}
export function sagaMapFor(level,scheduledDate,{nodeCount=50}={}){
 const globalLevel=Math.max(1,Math.floor(Number(level)||1)),count=nodeCount===9?9:50;
 const islandIndex=count===50?islandIndexForLevel(globalLevel):globalLevel;
 const islandStart=count===50?islandStartForLevel(globalLevel):globalLevel;
 const planet=planetFor(islandIndex),theme=SAGA_SHAPES[planet.biome]||SAGA_SHAPES.default;
 const outline=SAGA_OUTLINES[theme.creature]||SAGA_OUTLINES.alien,coords=sampleOutline(outline,count);
 const currentLocal=count===50?globalLevel-islandStart+1:1;
 const baseDate=shiftedDate(scheduledDate,-(globalLevel-islandStart));
 const nodes=coords.map(([x,y],index)=>{
  const globalNodeLevel=islandStart+index,date=baseDate?shiftedDate(baseDate,index):undefined;
  const golden=Boolean(date&&planetFor(globalNodeLevel,date).golden);
  return {id:index+1,globalLevel:globalNodeLevel,x:x*3.05,y:(y+1.2)*3.25,z:Math.sin(index*.71+(planet.seed%13))*.16,kind:index===count-1?'guardian':index%5===4?'trial':'level',golden};
 });
 const connections=nodes.slice(1).map((node,index)=>[nodes[index].id,node.id]);
 if(count===50){connections.push([50,1]);for(let i=0;i<50;i+=5)connections.push([i+1,((i+6)%50)+1])}
 return {...theme,planetName:planet.name,planetSeed:planet.seed,islandIndex,islandStart,currentLocal,nodeCount:count,nodes,connections};
}
export function sagaLevelState(node,completed,current,playable){
 if(node<=completed)return 'complete';
 if(node===current&&playable)return 'current';
 return 'locked';
}
