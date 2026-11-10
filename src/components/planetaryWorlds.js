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
const templates = [
  {id:'aurora',name:'Planeta Aurora',backgroundGradient:'radial-gradient(ellipse at 50% 15%, #8a5ab0 0%, #30234e 48%, #090b19 100%)',start:1,layout:layouts.aurora},
  {id:'cristal',name:'Planeta Prisma',backgroundGradient:'radial-gradient(ellipse at 50% 15%, #496caa 0%, #222b58 48%, #080b1c 100%)',start:6,layout:layouts.cristal},
  {id:'floresta',name:'Planeta Éter',backgroundGradient:'radial-gradient(ellipse at 50% 15%, #367d78 0%, #183d49 48%, #07131e 100%)',start:14,layout:layouts.floresta}
];
const LEVELS_PER_CYCLE = 25;

function buildWorlds(cycles=1){
  return Array.from({length:cycles},(_,cycle)=>templates.map(planet=>({
    id:cycle?planet.id+'-'+(cycle+1):planet.id,
    name:cycle?`${planet.name} · Ciclo ${cycle+1}`:planet.name,
    backgroundGradient:planet.backgroundGradient,
    levels:planet.layout.map((coords,index)=>{
      const id=cycle*LEVELS_PER_CYCLE+planet.start+index;
      const templateIndex=(id-1)%LEVELS_PER_CYCLE;
      return {id,dayNumber:id,title:titles[templateIndex],date:'',status:'locked',type:biomes[templateIndex],coords:{x:coords[0],y:coords[1]}};
    })
  }))).flat();
}

export const planetaryWorlds = buildWorlds();
export function worldsForProgress({done=0,level=1,playable=false,scheduledDateFor=()=>''}={}){
  const furthest=Math.max(1,Number.isSafeInteger(level)?level:1,Number.isSafeInteger(done)?done+1:1);
  const cycles=Math.ceil(furthest/LEVELS_PER_CYCLE);
  return buildWorlds(cycles).map(planet=>({...planet,levels:planet.levels.map(item=>({...item,date:scheduledDateFor(item.id)||'',status:item.id<=done?'completed':item.id===level&&playable?'active':'locked'}))}));
}
