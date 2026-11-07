// Voxel geometry adapted from the user's Sphere Tap planet preview.
export const biomes=[
 {name:'Broto',kind:'forest',palette:['#9bce74','#56844b','#365943']},
 {name:'Maré',kind:'water',palette:['#9bcdb3','#448b79','#315449']},
 {name:'Duna',kind:'desert',palette:['#f4d18a','#c58b54','#8e5940']},
 {name:'Aurora',kind:'crystal',palette:['#cdb7ef','#9272ad','#674d7b']},
 {name:'Brasa',kind:'lava',palette:['#e59377','#a54b41','#63383e']},
 {name:'Luar',kind:'moon',palette:['#dce5dc','#939eac','#596675']}
];
export function planetFor(level){if(!Number.isSafeInteger(level)||level<1)throw new RangeError('Nível inválido');const biome=biomes[(level-1)%biomes.length];return {...biome,level,name:`${biome.name} ${Math.floor((level-1)/biomes.length)+1}`}}
export function planetIsVisible(n,done,playable){return n<=done||(n===done+1&&playable)}
function shadeColor(hex,n){return '#'+hex.slice(1).match(/../g).map(v=>Math.max(0,Math.min(255,Math.round(parseInt(v,16)*n))).toString(16).padStart(2,'0')).join('')}
export function planetSVG(level){
 const w=planetFor(level);
 const palettes={forest:{grass:'#8bcf58',earth:'#8d6947',rock:'#586a63',water:'#51c5cc'},water:{grass:'#b6db6c',earth:'#b99b64',rock:'#3189a2',water:'#4bc8de'},desert:{grass:'#f4cc76',earth:'#c28b4b',rock:'#9d6641',water:'#51bfbb'},crystal:{grass:'#d6c6df',earth:'#9284b1',rock:'#6e638b',water:'#ac96cf'},lava:{grass:'#665465',earth:'#6d414c',rock:'#403943',water:'#ff873e'},moon:{grass:'#c7d3cb',earth:'#899ba1',rock:'#647a89',water:'#8fbec7'}};
 const p=palettes[w.kind],vox=new Map(),key=(x,y,z)=>`${x},${y},${z}`;
 const add=(x,y,z,c)=>vox.set(key(x,y,z),{x,y,z,c});
 const water=(x,y)=>Math.abs(y-(2+Math.round(Math.sin(x*1.1))))===0;
 for(let x=0;x<6;x++)for(let y=0;y<6;y++)for(let z=-5;z<=0;z++){
  let c=z===0?p.grass:z>-3?p.earth:p.rock;
  if(z<0){let n=(x*13+y*7+z*3+60+level)%7;if(n===0)c=z>-3?'#a17d55':p.earth;}
  if(w.kind==='forest'&&water(x,y)&&z===0)c=p.water;
  if(w.kind==='water'&&z===0&&!(x<3&&y<3))c=p.water;
  if(w.kind==='desert'&&x<2&&y>2&&z===0)c=p.water;
  if(w.kind==='lava'&&(water(x,y)||x===3)&&z===0)c=p.water;
  if(w.kind==='moon'&&z===0&&((x===3&&y===3)||(x===4&&y===3)||(x===3&&y===4)))c=p.rock;
  if((w.kind==='forest'&&x===5&&y===1||w.kind==='water'&&x===5&&y===2)&&z<0)c=p.water;
  if(w.kind==='lava'&&x===5&&y===3&&z<0)c=z%2?'#e24c36':'#ffad42';
  if(z===0)c=shadeColor(c,Math.floor(level/2**((x*6+y)%24))%2?1.08:.96);
  add(x,y,z,c);
 }
 const tree=(x,y,h=3)=>{for(let z=1;z<h;z++)add(x,y,z,'#92704a');for(let a=0;a<2;a++)for(let b=0;b<2;b++)for(let z=h;z<h+2;z++)add(x+a,y+b,z,z===h?'#63a34a':'#8fcb59');};
 const crystal=(x,y,h)=>{for(let z=1;z<=h;z++)add(x,y,z,z===h?'#f6e7fb':z%2?'#ac8bd2':'#c6a7e5');};
 if(w.kind==='forest'){tree(level%2,0,3+Math.floor(level/6)%2);tree(3,level%2,2);add(4,4,1,'#a3b3a2');add(4,4,2,'#b3c4b3');add(1,4,1,'#e6cd70');}
 if(w.kind==='water'){tree(0,0,3);add(2,1,1,'#ead6a1');add(1,2,1,'#e8d79c');add(4,4,1,'#a6e6e6');}
 if(w.kind==='desert'){for(let z=1;z<4;z++)add(3,1,z,'#729e5a');add(4,1,2,'#85b16a');add(4,1,3,'#85b16a');add(2,4,1,'#edb85a');add(3,4,1,'#f6d17a');add(3,4,2,'#f4c363');}
 if(w.kind==='crystal'){crystal(1,1,3+level%3);crystal(3,1,2+level%2);crystal(2,3,2);crystal(4,4,1);}
 if(w.kind==='lava'){for(let x=0;x<3;x++)for(let y=0;y<3;y++)add(x,y,1,'#574652');for(let x=0;x<2;x++)for(let y=0;y<2;y++)add(x,y,2,'#76525b');add(0,0,3,'#ffbd55');add(1,0,2,'#ff873e');add(1,1,1,'#ef613d');add(4,0,1,'#6c5360');add(4,0,2,'#6c5360');}
 if(w.kind==='moon'){add(0,1,1,'#b8c6c6');add(0,1,2,'#d4dcd3');add(1,1,1,'#a8bbbf');add(4,1,1,'#9caeb5');add(1,4,1,'#e1e8df');}
 const shade=shadeColor;
 const point=(x,y,z)=>[114+(x-y)*15,91+(x+y)*7.5-z*15];
 const poly=(points,color)=>`<polygon points="${points.map(v=>point(...v).join(',')).join(' ')}" fill="${color}" stroke="${color}" stroke-width=".5" stroke-linejoin="round" class="${color===p.water?'planet-flow':''}"/>`;
 let draw=[...vox.values()].sort((a,b)=>(a.x+a.y)-(b.x+b.y)||a.z-b.z).map(({x,y,z,c})=>{
 let out='';if(!vox.has(key(x+1,y,z)))out+=poly([[x+1,y,z],[x+1,y+1,z],[x+1,y+1,z+1],[x+1,y,z+1]],shade(c,.72));
 if(!vox.has(key(x,y+1,z)))out+=poly([[x,y+1,z],[x+1,y+1,z],[x+1,y+1,z+1],[x,y+1,z+1]],shade(c,.88));
 if(!vox.has(key(x,y,z+1)))out+=poly([[x,y,z+1],[x+1,y,z+1],[x+1,y+1,z+1],[x,y+1,z+1]],c);return out;
 }).join('');
 const cloud=(x,y)=>`<g transform="translate(${x} ${y})" opacity=".85"><g class="planet-cloud"><path d="M0 4l10-5 10 5-10 5Z" fill="#fff5df"/><path d="M0 4v8l10 5V9Z" fill="#c0e0df"/><path d="M10 9l10-5v8l-10 5Z" fill="#e2f3e8"/></g></g>`;
 return `<svg viewBox="0 0 230 280" aria-hidden="true"><ellipse cx="114" cy="261" rx="75" ry="12" fill="${w.palette[0]}" opacity=".09"/>${w.kind!=='lava'&&w.kind!=='moon'?cloud(176,55):''}<g class="planet-blocks">${draw}</g><g class="planet-sparks">${Array.from({length:5},(_,i)=>`<circle cx="${35+(i*43+level*7)%160}" cy="${32+(i*31+level*3)%155}" r="${1+i%2}" fill="${w.palette[0]}" style="animation-delay:${i*.27}s"/>`).join('')}</g>${w.kind==='water'||w.kind==='forest'?cloud(16,170):''}<circle cx="20" cy="68" r="1.5" fill="#e8ebcc" opacity=".5"/><circle cx="207" cy="191" r="1" fill="#e8ebcc" opacity=".5"/></svg>`;
}
