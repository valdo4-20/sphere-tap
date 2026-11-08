/** Sphere Tap — 100 planets + 52 Sunday golden planets. Offline, no dependencies. */
export const PACK_VERSION='1.1.0';
const THEMES=[
 ['forest','Broto','#88c954','#98754b','#536b51','#53c9d3'],
 ['water','Maré','#93d7c4','#bdac72','#337b99','#53cce3'],
 ['desert','Duna','#f2ce7d','#bd8a50','#826041','#50c4c2'],
 ['crystal','Aurora','#c4a7e5','#8e78b1','#5e5787','#b2e9f3'],
 ['lava','Brasa','#62505a','#6e4344','#403842','#ff8d40'],
 ['moon','Luar','#d4ded4','#9baab3','#627784','#b4d0dd'],
 ['snow','Nevada','#ebf4ea','#a6cad5','#648ca8','#7bcfe7'],
 ['swamp','Mangue','#77b789','#8e7852','#465e58','#499f9b'],
 ['fungal','Micélio','#b89dcb','#90779d','#575171','#88d8cd'],
 ['ruins','Relíquia','#a7ba81','#a39170','#657568','#68bfc6']
].map(([kind,name,top,earth,rock,fluid])=>({kind,name,top,earth,rock,fluid}));
const FORMS=['cube','terraces','island','split','bridge','ring','crater','arch','shards','twin'];
const FORM_NAMES=['Cubo','Terraços','Ilha suspensa','Fenda','Ponte entre mundos','Anel','Cratera','Arco rochoso','Fragmentos','Mundos gêmeos'];
const EPITHETS=['das origens','dos jardins','da vigia','das ruínas','da travessia','do santuário','das cavernas','das nascentes','das estrelas','dos portais'];
const GOLD_NAMES=['Coroa do amanhecer','Terraços do tesouro','Templo solar','Portões da fortuna','Ponte da conquista','Anel da abundância','Caldeira de âmbar','Arco do domingo','Fragmentos de ouro','Torres gêmeas douradas','Jardim da coroa','Escadaria do sol','Farol do tesouro','Fortaleza radiante','Travessia celestial','Órbita da vitória','Santuário de mel','Portal do horizonte','Estilhaços solares','Palácios gêmeos'];
function validPositive(n){if(!Number.isSafeInteger(n)||n<1)throw new RangeError('Use um inteiro positivo.');return n}
export function assetAt(index,{golden=false}={}){
 validPositive(index);const n=index-1,b=n%10,v=Math.floor(n/10)%10,cycle=Math.floor(n/(golden?20:100));
 if(golden){const g=n%20;return {id:`gold-${String(index).padStart(3,'0')}`,index,golden:true,name:GOLD_NAMES[g]+(cycle?` · ${cycle+1}`:''),biome:'golden',form:FORMS[g%10],formName:FORM_NAMES[g%10],variant:g,seed:index*7919+991,cycle,theme:{kind:'golden',name:'Domingo dourado',top:g<10?'#ffe37a':'#fbd798',earth:g<10?'#d3a13d':'#bd8b42',rock:'#816133',fluid:g<10?'#7ed4c9':'#b5a4e4'}}}
 const theme=THEMES[b];return {id:`normal-${String(index).padStart(3,'0')}`,index,golden:false,name:`${theme.name} ${EPITHETS[v]}${cycle?` · ${cycle+1}`:''}`,biome:theme.kind,form:FORMS[v],formName:FORM_NAMES[v],variant:v,seed:index*3571+17,cycle,theme};
}
export const NORMAL_ASSETS=Object.freeze(Array.from({length:100},(_,i)=>Object.freeze(assetAt(i+1))));
export const GOLDEN_ASSETS=Object.freeze(Array.from({length:52},(_,i)=>Object.freeze(assetAt(i+1,{golden:true}))));
/** Date-only strings are interpreted at local noon, never as UTC midnight. */
export function isSunday(date){let d;if(date instanceof Date){d=new Date(date)}else if(typeof date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(date)){d=new Date(date+'T12:00:00');if(Number.isNaN(+d)||`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`!==date)throw new RangeError('Data inválida.')}else throw new TypeError('Informe Date ou AAAA-MM-DD.');if(Number.isNaN(+d))throw new RangeError('Data inválida.');return d.getDay()===0}
/** Sunday occurrence uses the level's scheduled local date; no XP or progress mutation. */
export function assetForScheduledDate(level,date){validPositive(level);if(!isSunday(date))return assetAt(level);const d=date instanceof Date?date:new Date(date+'T12:00:00');const days=Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/86400000);const sundayOrdinal=Math.floor((days-Math.floor(Date.UTC(2026,10,1)/86400000))/7);return assetAt(1+((sundayOrdinal%52)+52)%52,{golden:true})}
/** Preserve an existing golden flag when the host app already supplies one. */
export function planetForLevel(level,{golden=false,goldenOrdinal=level}={}){return golden?assetAt(validPositive(goldenOrdinal),{golden:true}):assetAt(validPositive(level))}
export function planetIsVisible(n,done,playable){return n<=done||(n===done+1&&playable)}
function rng(seed){let s=seed>>>0;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296}}
const shade=(hex,f)=>'#'+hex.slice(1).match(/../g).map(v=>Math.max(0,Math.min(255,Math.round(parseInt(v,16)*f))).toString(16).padStart(2,'0')).join('');
export function geometryFor(a){
 const p=a.theme,random=rng(a.seed),vox=new Map(),top=new Map(),details=[],reserved=new Set(),key=(x,y,z)=>`${x},${y},${z}`,xy=(x,y)=>`${x},${y}`;
 const add=(x,y,z,c,k='stone')=>vox.set(key(x,y,z),{x,y,z,c,k});
 const box=(x,y,z,w,d,h,c,k='stone')=>{for(let i=0;i<w;i++)for(let j=0;j<d;j++)for(let q=0;q<h;q++)add(x+i,y+j,z+q,c,k)};
 const shape=(x,y)=>{const r=x*x+y*y;switch(a.form){case'cube':return Math.abs(x)<=3&&Math.abs(y)<=3;case'terraces':return r<=18;case'island':return r<=19&&!(x===-4&&y<0);case'split':return Math.abs(x)<=3&&Math.abs(y)<=3&&!(x===0&&y!==3);case'bridge':return ((x<=-2||x>=2)&&Math.abs(y)<=2&&Math.abs(x)<=4)||(Math.abs(y)<=0&&Math.abs(x)<=4);case'ring':return r>=5&&r<=20;case'crater':return r<=19;case'arch':return Math.abs(x)<=3&&Math.abs(y)<=2;case'shards':return r<=15||((x===4||x===-4)&&Math.abs(y)<=1);case'twin':return ((x+2)**2+(y+1)**2<=6)||((x-2)**2+(y-1)**2<=6);default:return false}};
 for(let x=-4;x<=4;x++)for(let y=-4;y<=4;y++)if(shape(x,y)){
 const r=x*x+y*y;let zTop=0,bottom=-4;
 if(a.form==='terraces')zTop=r<3?2:r<10?1:0;
 if(a.form==='island')bottom=-Math.max(1,5-Math.floor(Math.sqrt(r)));
 if(a.form==='bridge'){if(Math.abs(x)<2)bottom=0;else bottom=-4;}
 if(a.form==='crater')zTop=r>=9?1:r<=2?-1:0;
 if(a.form==='arch'&&Math.abs(x)<=1)bottom=-1;
 if(a.form==='shards'&&Math.abs(x)===4){zTop=-1;bottom=-3;}
 if(a.form==='twin')zTop=x<0?0:1;
 if(a.cycle&&random()<.14)zTop+=1;
 top.set(xy(x,y),zTop);
 for(let z=bottom;z<=zTop;z++){
 let c=z===zTop?p.top:z>=zTop-1?p.earth:p.rock,k=z===zTop?'ground':'stone';
 if(z<zTop&&random()<.13)c=shade(c,random()<.5?.9:1.09);
 const river=y===Math.round(Math.sin((x+a.seed%3)*.8));
 if(z===zTop&&(a.biome==='water'&&(x>0||y>0)||a.biome==='swamp'&&river||a.biome==='forest'&&river||a.biome==='lava'&&river||a.biome==='desert'&&x<-1&&y>0||a.biome==='snow'&&river)){c=p.fluid;k=a.biome==='lava'?'lava':'water'}
 if(z<zTop&&x===3&&river&&['water','forest','swamp'].includes(a.biome)){c=p.fluid;k='water'}
 if(a.biome==='moon'&&z===zTop&&r<=2)c=p.rock;
 if(a.biome==='crystal'&&z===zTop)c=shade(c,1+random()*.07);
 add(x,y,z,c,k);
 }
 }
 const surface=(x,y)=>top.get(xy(x,y))??0;
 const anchor=(x,y)=>{if(top.has(xy(x,y)))return[x,y,surface(x,y)+1];const pts=[...top.keys()].map(v=>v.split(',').map(Number)).sort((a,b)=>(a[0]-x)**2+(a[1]-y)**2-((b[0]-x)**2+(b[1]-y)**2));return[...pts[0],surface(...pts[0])+1]};
 const tree=(x,y,h=3,color='#6eb950')=>{const [xx,yy,z]=anchor(x,y);box(xx,yy,z,1,1,h,'#987346','wood');box(xx-1,yy,z+h,2,2,1,color,'leaf');box(xx,yy,z+h+1,1,1,1,shade(color,1.18),'leaf')};
 const pillar=(x,y,h=3,color=p.rock)=>{const [xx,yy,z]=anchor(x,y);box(xx,yy,z,1,1,h,color);add(xx,yy,z+h,shade(color,1.17))};
 const gem=(x,y,h=3,color=p.fluid)=>{const [xx,yy,z]=anchor(x,y);reserved.add(xy(xx,yy));details.push({x:xx,y:yy,z,s:1,c:color,k:'crystal',h:h+1,shape:'gem'});};
 const mushroom=(x,y,h=2)=>{const [xx,yy,z]=anchor(x,y);box(xx,yy,z,1,1,h,'#f1dfbb');box(xx-1,yy,z+h,3,2,1,'#bd679e','mushroom');add(xx,yy,z+h+1,'#e0a7c3','mushroom');};
 // Every biome contributes real geometry, even when the architectural landmark matches.
 switch(a.biome){
 case'forest':tree(-2,-1,2+a.cycle%2);tree(2,-2,1);break;
 case'water':{const [x,y,z]=anchor(-2,-2);box(x,y,z,2,1,1,'#dbad6b','wood');box(x,y,z+1,1,1,3,'#d3bd8c','wood');box(x+1,y,z+2,1,1,2,'#f3edcb','sail');break}
 case'desert':{const [x,y,z]=anchor(2,-2);box(x,y,z,1,1,3,'#7aa45f','cactus');box(x+1,y,z+1,1,1,2,'#8fbd6c','cactus');break}
 case'crystal':gem(-2,-1,3);gem(2,-2,2);gem(2,2,1);break;
 case'lava':{const [x,y,z]=anchor(-2,-2);box(x,y,z,2,2,1,'#73545e');box(x,y,z+1,1,1,2,'#51414b');add(x,y,z+3,'#ffbd63','lava');break}
 case'moon':{const [x,y,z]=anchor(2,-2);box(x,y,z,2,1,1,'#a7bec7');add(x,y,z+1,'#e2e9dd');box(x+1,y,z+1,1,1,2,'#7a919e');add(x+1,y,z+3,'#e4ecdf');break}
 case'snow':{const [x,y,z]=anchor(-2,-2);box(x,y,z,1,1,2,'#8a7767','wood');box(x-1,y,z+2,3,2,1,'#679a9b','leaf');box(x,y,z+3,1,1,1,'#eef8f1','snow');gem(2,-2,1,'#d7eef2');break}
 case'swamp':tree(-2,-2,3,'#519780');{const [x,y,z]=anchor(2,-1);box(x,y,z,2,1,1,'#b5a173','wood');box(x,y,z+1,1,1,2,'#6ca78e','leaf')}break;
 case'fungal':mushroom(-2,-2,2);mushroom(2,-1,1);add(...anchor(2,2),'#efd688','glow');break;
 case'ruins':pillar(-2,-2,2,'#d0c8a3');pillar(2,-2,3,'#b7b795');{const [x,y,z]=anchor(-1,-2);box(x,y,z+2,3,1,1,'#d2ccac')}break;
 case'golden':{const [x,y,z]=anchor(-2,-2);box(x,y,z,2,2,1,'#a87b31','gold');box(x,y,z+1,2,2,1,'#ffdf66','gold');add(x,y,z+2,'#fff0a2','gold');gem(2,-2,2,a.variant<10?'#73cbbf':'#c6b0ec');break}
 }
 const v=a.variant%10,[ax,ay,az]=anchor(0,0),stone=a.golden?'#e5bd58':shade(p.rock,1.35),cap=a.golden?'#ffe991':shade(p.top,1.1);
 // Ten landmark plans, each paired with a different silhouette.
 if(v===1){for(let i=0;i<3;i++){const [x,y,z]=anchor(-2+i*2,2);box(x,y,z,1,1,1,a.golden?'#ffde74':p.earth);add(x,y,z+1,a.golden?'#fff0ac':p.top,a.golden?'gold':'leaf')}}
 if(v===2){box(ax,ay,az,2,2,3,stone);box(ax-1,ay,az+3,3,2,1,cap);add(ax,ay,az+4,p.fluid,'crystal');add(ax+1,ay+1,az+3,'#354957')}
 if(v===3){pillar(-1,2,3,stone);pillar(2,2,2,stone);const [x,y,z]=anchor(1,2);add(x,y,z,cap);add(x,y,z+1,stone)}
 if(v===4){for(let x=-3;x<=3;x++){const [xx,yy,z]=anchor(x,0);add(xx,yy,z,a.golden?'#edc760':'#b89968',a.golden?'gold':'wood');if(x%2===0){add(xx,yy-1,z+1,stone);add(xx,yy+1,z+1,stone)}}}
 if(v===5){const [x,y,z]=anchor(0,-3);box(x-1,y,z,3,2,1,stone);pillar(x-1,y,2,stone);pillar(x+1,y,2,stone);box(x-1,y,z+3,3,1,1,cap);add(0,0,2,p.fluid,'crystal');add(0,0,3,a.golden?'#fff1b3':cap,'crystal')}
 if(v===6){const [x,y,z]=anchor(0,3);box(x-1,y,z,1,1,2,stone);box(x+1,y,z,1,1,2,stone);box(x-1,y,z+2,3,1,1,cap);add(x,y,z,'#273843');if(a.golden)add(x,y,z+1,'#ffde6a','gold')}
 if(v===7){const [x,y,z]=anchor(2,0);box(x,y,z,1,2,3,stone);add(x,y,z+3,cap);for(let k=-4;k<=z+3;k++)add(x+1,y,k,p.fluid,a.biome==='lava'?'lava':'water');add(x+1,y+1,-4,p.fluid,'water')}
 if(v===8){const [x,y,z]=anchor(0,-1);box(x-1,y-1,z,3,3,1,stone);box(x,y,z+1,1,1,2,stone);box(x,y,z+3,2,1,1,p.fluid,'crystal');add(x+1,y,z+4,cap,'glow')}
 if(v===9){const [x,y,z]=anchor(0,1);box(x-1,y,z,1,1,3,stone);box(x+1,y,z,1,1,3,stone);box(x-1,y,z+3,3,1,1,cap);add(x,y,z+1,p.fluid,'crystal');add(x,y,z+2,p.fluid,'crystal')}
 if(a.golden){
 // Gold planets receive a crown or a treasure altar, not a palette swap.
 if(a.variant<10){const [x,y,z]=anchor(1,1);box(x-1,y,z,3,1,1,'#e5aa36','gold');for(let i=0;i<3;i++)box(x-1+i,y,z+1,1,1,i===1?3:2,i===1?'#fff3ad':'#ffdc6d','gold');add(x,y,z+4,'#f6fff0','glow')}
 else{const [x,y,z]=anchor(1,2);box(x-1,y,z,3,2,1,'#aa7c35','gold');box(x,y,z+1,2,1,1,'#f4ce68','gold');box(x,y,z+2,1,1,2,'#fff0a3','gold');add(x,y,z+4,'#b9e6d8','crystal');pillar(-3,0,3,'#c9a04d');}
 }
 if(a.cycle){const n=1+a.cycle%4;for(let i=0;i<n;i++){const [x,y,z]=anchor((i*3+a.cycle)%7-3,(i*2+a.cycle)%7-3);box(x,y,z,1,1,1+(a.cycle+i)%3,p.fluid,i%2?'crystal':'stone')}}
 // Small, individually modelled scenery. Keep the original silhouettes and calendar IDs.
 const small=(x,y,z,s,c,k='detail',h=s,shape='cube')=>details.push({x,y,z,s,c,k,h,shape});
 const crystal=(x,y,z,s,h,c)=>small(x,y,z,s,c,'crystal',h,'gem');
 const bare=[...top.entries()].map(([k,z])=>[...k.split(',').map(Number),z+1])
  .filter(([x,y,z])=>!reserved.has(xy(x,y))&&!vox.has(key(x,y,z))&&vox.get(key(x,y,z-1))?.k==='ground')
  .sort((u,v)=>Math.sin(u[0]*19+u[1]*41+a.seed)-Math.sin(v[0]*19+v[1]*41+a.seed));
 const jewel=a.golden?'#8ae6dc':({forest:'#91e9c3',water:'#7de9f4',desert:'#ffb35f',crystal:'#a4f2ff',lava:'#ffae58',moon:'#a9d9ff',snow:'#a5eeff',swamp:'#98e8bc',fungal:'#f7b5ed',ruins:'#9fe3db'}[a.biome]);
 for(let n=0;n<Math.min(bare.length,22);n++){
  const [x,y,z]=bare[n],cx=x+.18,cy=y+.2;
  if(n<4){
   // Clusters have tall faceted tips and two shorter satellite crystals.
   crystal(cx,cy,z,.36,.9+(n%3)*.2,jewel);
   crystal(cx+.4,cy+.15,z,.23,.48,shade(jewel,.83));
   crystal(cx-.12,cy+.42,z,.21,.35,shade(jewel,1.13));
   small(x+.08,y+.08,z,.7,shade(p.rock,1.2),'ore',.12);
  }else if(n<9){
   if(['forest','swamp','fungal','snow'].includes(a.biome)){
    const leaf=a.biome==='snow'?'#c4e4dd':a.biome==='fungal'?'#bb78c3':'#4a9b69';
    small(cx,cy,z,.23,'#8f754a','wood',.4);
    small(cx-.17,cy,z+.2,.22,leaf,'leaf',.25);small(cx+.19,cy+.12,z+.3,.24,shade(leaf,1.2),'leaf',.22);
    small(cx+.02,cy+.02,z+.5,.16,a.biome==='fungal'?'#ffe294':'#f1d69b','flower',.12);
   }else if(a.biome==='desert'){
    small(cx,cy,z,.28,'#699c6c','cactus',.65);small(cx+.25,cy,z+.25,.2,'#86b779','cactus',.25);
    small(cx,cy,z+.65,.16,'#f6a4a0','flower',.12);
   }else if(a.biome==='golden'){
    small(cx,cy,z,.48,'#bb8435','gold',.2);small(cx+.06,cy+.06,z+.2,.35,'#ffe79b','gold',.26);
    crystal(cx+.15,cy+.13,z+.46,.16,.3,jewel);
   }else{
    small(cx,cy,z,.48,shade(p.rock,1.23),'pebble',.25);
    small(cx+.4,cy+.2,z,.25,shade(p.rock,1.4),'pebble',.18);
   }
  }else if(n<14){
   // Broken steps and archaeological tiles give scale without hiding the terrain.
   small(cx-.08,cy,z,.55,a.golden?'#e8c574':shade(p.earth,1.25),'tile',.12);
   small(cx+.14,cy+.18,z+.12,.12,shade(p.rock,.84),'rune',.025);
  }else if(n<17){
   small(cx,cy,z,.22,shade(p.rock,1.3),'stone',.45);
   small(cx-.1,cy-.1,z+.45,.42,a.golden?'#e6ba50':'#907754','wood',.12);
   small(cx,cy,z+.57,.22,a.golden?'#fff1a2':jewel,'glow',.3);
   small(cx-.1,cy-.1,z+.87,.42,shade(p.rock,1.18),'stone',.1);
  }else{
   small(cx,cy,z,.3,shade(p.top,.8),'tuft',.24);
   small(cx+.33,cy+.13,z,.16,shade(p.top,1.16),'tuft',.35);
  }
 }
 // Visible cliff faces contain ore seams, hanging roots and crystal outcrops.
 const sides=[...vox.values()].filter(v=>v.k==='stone'&&v.z<0&&(!vox.has(key(v.x+1,v.y,v.z))||!vox.has(key(v.x,v.y+1,v.z))));
 for(let n=0;n<sides.length;n+=Math.max(1,Math.floor(sides.length/13))){
  const v=sides[n],east=!vox.has(key(v.x+1,v.y,v.z)),x=v.x+(east?1:.25),y=v.y+(east?.25:1);
  small(x,y,v.z+.25,.23,a.golden?'#ffdb76':jewel,'ore',.23);
  if(n%3===0)crystal(x+.04,y+.04,v.z+.48,.18,.45,jewel);
  if(['forest','swamp'].includes(a.biome)&&n%2===0)small(x,y,v.z+.1,.12,'#619457','vine',.75);
 }
 for(let n=0;n<3;n++){
  const x=n%2?4.7:-5.2,y=(n-1)*2.2,z=-1.3-n*.65;
  small(x,y,z,.6,shade(p.rock,1.1),'satellite',.55);small(x,y,z+.55,.6,p.top,'satellite',.14);
  crystal(x+.14,y+.15,z+.69,.25,.55,jewel);
 }
 return [...vox.values(),...details];
}
export function renderPlanetSvg(asset,{animated=true,instanceId=asset.id}={}){
 const voxels=geometryFor(asset),keys=new Set(voxels.filter(v=>!v.s).map(v=>`${v.x},${v.y},${v.z}`)),id=String(instanceId).replace(/[^a-zA-Z0-9_-]/g,'-');
 const points=[],project=(x,y,z)=>[200+(x-y)*16,150+(x+y)*8-z*16];let faces='';
 const poly=(p,c,k)=>{const pts=p.map(v=>project(...v));points.push(...pts);return `<polygon points="${pts.map(v=>v.map(x=>Math.round(x*100)/100).join(',')).join(' ')}" fill="${c}" stroke="${c}" stroke-width=".45" class="mat-${k}"/>`};
 for(const {x,y,z,c,k,s,h,shape}of voxels.sort((a,b)=>(a.x+a.y)-(b.x+b.y)||a.z-b.z)){
 if(s){
  if(shape==='gem'){
   const a=[x,y+s/2,z+h*.25],b=[x+s/2,y,z+h*.25],d=[x+s,y+s/2,z+h*.25],e=[x+s/2,y+s,z+h*.25],tip=[x+s/2,y+s/2,z+h],base=[x+s/2,y+s/2,z];
   faces+=poly([a,b,tip],shade(c,.93),k)+poly([b,d,tip],shade(c,.77),k)+poly([d,e,tip],c,k)+poly([e,a,tip],shade(c,1.13),k)+poly([d,e,base],shade(c,.73),k)+poly([e,a,base],shade(c,.87),k);
  }else{
   faces+=poly([[x+s,y,z],[x+s,y+s,z],[x+s,y+s,z+h],[x+s,y,z+h]],shade(c,.74),k)+poly([[x,y+s,z],[x+s,y+s,z],[x+s,y+s,z+h],[x,y+s,z+h]],shade(c,.88),k)+poly([[x,y,z+h],[x+s,y,z+h],[x+s,y+s,z+h],[x,y+s,z+h]],c,k);
  }
  continue;
 }
 if(!keys.has(`${x+1},${y},${z}`))faces+=poly([[x+1,y,z],[x+1,y+1,z],[x+1,y+1,z+1],[x+1,y,z+1]],shade(c,.74),k);
 if(!keys.has(`${x},${y+1},${z}`))faces+=poly([[x,y+1,z],[x+1,y+1,z],[x+1,y+1,z+1],[x,y+1,z+1]],shade(c,.88),k);
 if(!keys.has(`${x},${y},${z+1}`))faces+=poly([[x,y,z+1],[x+1,y,z+1],[x+1,y+1,z+1],[x,y+1,z+1]],c,k);
 }
 let minx=Infinity,miny=Infinity,maxx=-Infinity,maxy=-Infinity;for(const [x,y]of points){minx=Math.min(x,minx);maxx=Math.max(x,maxx);miny=Math.min(y,miny);maxy=Math.max(y,maxy)}const scale=Math.min(344/(maxx-minx),326/(maxy-miny)),mx=(minx+maxx)/2,my=(miny+maxy)/2;
 let streams='';for(const v of voxels.filter(v=>v.k==='water'&&!keys.has(`${v.x+1},${v.y},${v.z}`))){const [x,y]=project(v.x+1,v.y+.5,v.z+1);streams+=`<path d="M${x} ${y}v16" fill="none" stroke="#e6fff9" stroke-width="1.3" stroke-dasharray="3 5" opacity=".5" class="water-line"/>`}
 const sparkColor=asset.golden?'#e5b644':asset.theme.fluid;const sparks=Array.from({length:5},(_,i)=>`<rect x="${25+(i*71+asset.seed)%350}" y="${30+(i*43+asset.seed)%300}" width="${i%2?3:2}" height="${i%2?3:2}" fill="${sparkColor}" class="spark" style="animation-delay:${-.3*i}s"/>`).join('');
 const css=animated?`<style>.planet-${id} .water-line{animation:sp-flow 1.1s linear infinite}.planet-${id} .mat-lava{animation:sp-lava 3s ease-in-out infinite}.planet-${id} .mat-crystal,.planet-${id} .mat-gold{animation:sp-shine 4s ease-in-out infinite}.planet-${id} .spark{animation:sp-spark 3s ease-in-out infinite}@keyframes sp-flow{to{stroke-dashoffset:-16}}@keyframes sp-lava{50%{filter:brightness(1.15)}}@keyframes sp-shine{50%{filter:brightness(1.08)}}@keyframes sp-spark{50%{opacity:.15}}@media(prefers-reduced-motion:reduce){.planet-${id} *{animation:none!important}}</style>`:'';
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400" role="img" aria-label="${asset.name}" class="planet-${id}" data-planet-id="${asset.id}" data-golden="${asset.golden}">${css}<ellipse cx="200" cy="368" rx="95" ry="12" fill="${asset.theme.rock}" opacity=".07"/><g transform="translate(200 193) scale(${scale}) translate(${-mx} ${-my})">${faces}${streams}</g>${sparks}</svg>`;
}
