const layouts = {
  aurora: [[0,0],[1,0],[2,1],[1,2],[0,3]],
  cristal: [[0,0],[1,0],[2,0],[2,1],[1,2],[0,3],[-1,3],[-2,2]],
  floresta: [[0,0],[1,0],[2,0],[3,1],[2,2],[1,3],[0,4],[-1,4],[-2,3],[-2,2],[-1,1],[0,2]]
};
const titles = [
  'Aurora das origens','Primeiro horizonte','Ecos da descoberta','Trilha luminosa','Portal do começo',
  'Vale dos cristais','Ressonância violeta','Ponte de quartzo','Câmara prismática','Lago espelhado','Coração mineral','Guardião cristalino','Portal de cristal',
  'Bosque suspenso','Raízes do céu','Clareira antiga','Caminho das copas','Santuário verde','Rio das estrelas','Jardim oculto','Vigília ancestral','Círculo dos espíritos','Ruínas vivas','Prova do guardião','Núcleo da floresta'
];
const biomes = ['desert','desert','desert','desert','boss','crystal','crystal','crystal','crystal','crystal','crystal','boss','boss','forest','forest','forest','forest','forest','forest','forest','forest','forest','forest','boss','boss'];
const definitions = [
  {id:'aurora',name:'Planeta Aurora',backgroundGradient:'radial-gradient(ellipse at 50% 15%, #8a5ab0 0%, #30234e 48%, #090b19 100%)',start:1,count:5,layout:layouts.aurora},
  {id:'cristal',name:'Planeta Prisma',backgroundGradient:'radial-gradient(ellipse at 50% 15%, #496caa 0%, #222b58 48%, #080b1c 100%)',start:6,count:8,layout:layouts.cristal},
  {id:'floresta',name:'Planeta Éter',backgroundGradient:'radial-gradient(ellipse at 50% 15%, #367d78 0%, #183d49 48%, #07131e 100%)',start:14,count:12,layout:layouts.floresta}
];
export const planetaryWorlds = definitions.map((planet,index)=>({
  id:planet.id,name:planet.name,backgroundGradient:planet.backgroundGradient,
  levels:planet.layout.map((coords,i)=>{const id=planet.start+i;return {id,dayNumber:id,title:titles[id-1],date:'',status:'locked',type:biomes[id-1],coords:{x:coords[0],y:coords[1]}}})
}));
export function worldsForProgress({done=0,level=1,playable=false,scheduledDateFor=()=>''}={}){
  return planetaryWorlds.map(planet=>({...planet,levels:planet.levels.map(item=>({...item,date:scheduledDateFor(item.id)||'',status:item.id<=done?'completed':item.id===level&&playable?'active':'locked'}))}));
}
