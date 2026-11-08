import {sceneryFor,biomeEnergy} from './islandScenery.js';
const shade=(hex,n)=>'#'+hex.slice(1).match(/../g).map(x=>Math.min(255,Math.max(0,Math.round(parseInt(x,16)*n))).toString(16).padStart(2,'0')).join('');
export function renderIslandSvg(asset,{instanceId=asset.id,animated=true}={}){
 const id=String(instanceId).replace(/[^a-zA-Z0-9_-]/g,'-'),geometry=sceneryFor(asset).sort((a,b)=>a.x+a.y-b.x-b.y||a.z-b.z),keys=new Set(geometry.filter(v=>!v.s).map(v=>`${v.x},${v.y},${v.z}`)),points=[];
 const project=(x,y,z)=>[200+(x-y)*16,150+(x+y)*8-z*16];
 const polygon=(p,c,k)=>{const projected=p.map(v=>project(...v));points.push(...projected);return `<polygon points="${projected.map(v=>v.map(x=>Math.round(x*100)/100).join(',')).join(' ')}" fill="${c}" stroke="${c}" stroke-width=".45" class="mat-${k}"/>`};
 let faces='',streams='',i=0;
 for(const {x,y,z,c,k,s,h,shape} of geometry){
  if(s){if(shape==='gem'){const a=[x,y+s/2,z+h*.25],b=[x+s/2,y,z+h*.25],d=[x+s,y+s/2,z+h*.25],e=[x+s/2,y+s,z+h*.25],tip=[x+s/2,y+s/2,z+h],base=[x+s/2,y+s/2,z];faces+=polygon([a,b,tip],shade(c,.93),k)+polygon([b,d,tip],shade(c,.77),k)+polygon([d,e,tip],c,k)+polygon([e,a,tip],shade(c,1.13),k)+polygon([d,e,base],shade(c,.73),k)+polygon([e,a,base],shade(c,.87),k);}else faces+=polygon([[x+s,y,z],[x+s,y+s,z],[x+s,y+s,z+h],[x+s,y,z+h]],shade(c,.74),k)+polygon([[x,y+s,z],[x+s,y+s,z],[x+s,y+s,z+h],[x,y+s,z+h]],shade(c,.88),k)+polygon([[x,y,z+h],[x+s,y,z+h],[x+s,y+s,z+h],[x,y+s,z+h]],c,k);continue;}
  if(!keys.has(`${x+1},${y},${z}`))faces+=polygon([[x+1,y,z],[x+1,y+1,z],[x+1,y+1,z+1],[x+1,y,z+1]],shade(c,.74),k);
  if(!keys.has(`${x},${y+1},${z}`))faces+=polygon([[x,y+1,z],[x+1,y+1,z],[x+1,y+1,z+1],[x,y+1,z+1]],shade(c,.88),k);
  if(!keys.has(`${x},${y},${z+1}`))faces+=polygon([[x,y,z+1],[x+1,y,z+1],[x+1,y+1,z+1],[x,y+1,z+1]],c,k);
  if(['water','lava'].includes(k)&&!keys.has(`${x+1},${y},${z}`)){const [px,py]=project(x+1,y+.5,z+1),clip=`waterfall-${id}-${i++}`;streams+=`<defs><clipPath id="${clip}"><rect x="${px-2}" y="${py}" width="4" height="16"/></clipPath></defs><g clip-path="url(#${clip})"><path d="M${px} ${py}v16" fill="none" stroke="${k==='lava'?'#ffd082':'#e6fff9'}" stroke-width="1.4" stroke-dasharray="3 5" opacity=".7" class="${k==='lava'?'lava-stream':'waterfall-stream'}" style="animation-delay:${-i*.12}s"/></g>`;if(k==='water'&&z<0&&!keys.has(`${x},${y},${z-1}`))streams+=`<circle class="waterfall-splash" cx="${px}" cy="${py+16}" r="1.5" fill="#e6fff9"/>`;}
 }
 const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),minx=Math.min(...xs),maxx=Math.max(...xs),miny=Math.min(...ys),maxy=Math.max(...ys),scale=Math.min(344/(maxx-minx),326/(maxy-miny)),energy=biomeEnergy[asset.biome];
 const sparks=Array.from({length:8},(_,n)=>`<circle class="island-particle" cx="${28+(n*71+asset.seed)%342}" cy="${24+(n*43+asset.seed)%320}" r="${energy.particle==='mist'?4:n%2?1.8:1.1}" fill="${energy.colors[n%2]}" style="--particle-delay:${-n*.47}s;--particle-drift:${n%2?5:-5}px"/>`).join('');
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400" aria-hidden="true" data-planet-id="${asset.id}" data-golden="${asset.golden}"><g transform="translate(200 193) scale(${scale}) translate(${-(minx+maxx)/2} ${-(miny+maxy)/2})">${faces}${streams}</g>${animated?sparks:''}</svg>`;
}
