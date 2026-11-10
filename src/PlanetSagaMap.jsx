import React,{useEffect,useMemo,useRef,useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {X,Lock,Check,Play,Shield,Star} from 'lucide-react';
import {sagaMapFor} from './journeyPlanets.js';
import {sagaLevelState} from './journeyLogic.js';
import './planetSagaMap.css';
function SagaWebGL({map}){
 const host=useRef(null);
 useEffect(()=>{
  const el=host.current;if(!el)return;
  let renderer,controls,frame,observer,alive=true;
  const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x050b18,.035);
  const camera=new THREE.PerspectiveCamera(42,1,.1,100);camera.position.set(0,4.1,17);camera.lookAt(0,4.1,0);
  scene.add(new THREE.HemisphereLight(0x9cb8e8,0x111522,1.15));
  const key=new THREE.DirectionalLight(0x8ab6ff,1.5);key.position.set(-4,8,7);scene.add(key);
  const boss=new THREE.Group();boss.position.set(0,4.1,-3.5);boss.scale.set(1.55,1.55,1.05);scene.add(boss);
  const mat=new THREE.MeshStandardMaterial({color:0x08101d,roughness:1,transparent:true,opacity:.84,flatShading:true});
  const part=(g,x,y,z,sx=1,sy=1,sz=1,r=0)=>{const m=new THREE.Mesh(g,mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.rotation.z=r;boss.add(m);return m};
  const ico=(x,y,z,sx,sy,sz)=>part(new THREE.IcosahedronGeometry(1,1),x,y,z,sx,sy,sz);
  const cone=(x,y,z,sx=1,sy=1,sz=1,r=0)=>part(new THREE.ConeGeometry(.32,1.3,5),x,y,z,sx,sy,sz,r);
  const limb=(x,y,z,sx=1,sy=1,sz=1,r=0)=>part(new THREE.CapsuleGeometry(.28,1.1,3,5),x,y,z,sx,sy,sz,r);
  if(map.creature==='serpent'){
   const c=new THREE.CatmullRomCurve3([[-1.5,-1.1,0],[-.4,-1.5,.1],[1.2,-.8,0],[1.4,.2,.1],[.2,.8,0],[-1.2,.5,.1],[-1.35,1.2,.1]].map(p=>new THREE.Vector3(...p)));
   part(new THREE.TubeGeometry(c,64,.38,8,false),0,0,0);ico(-1.35,1.2,.1,.52,.45,.48);cone(-1.65,1.55,.1,.7,.7,.7,-.5);cone(-1.05,1.55,.1,.7,.7,.7,.5);
  }else if(map.creature==='scorpion'){
   ico(0,-.2,0,.8,.65,.7);ico(0,.65,0,.48,.42,.5);limb(-1.2,-.45,0,.8,1,.7,-.8);limb(1.2,-.45,0,.8,1,.7,.8);
   for(let i=0;i<4;i++){const side=i%2?-1:1;limb(side*(.55+i*.18),-.9-(i%2)*.18,0,.48,.8,.55,side*.55)}
   const c=new THREE.CatmullRomCurve3([[0,.9,0],[.55,1.45,0],[.7,2.05,0],[.15,2.55,0]].map(p=>new THREE.Vector3(...p)));
   part(new THREE.TubeGeometry(c,28,.16,6,false),0,0,0);cone(.15,2.75,0,.7,.8,.7);
  }else if(map.creature==='dragon'){
   ico(0,0,0,1.15,1.25,.72);ico(0,1.5,0,.72,.62,.62);cone(-.45,2.1,0,.8,.9,.8,-.35);cone(.45,2.1,0,.8,.9,.8,.35);
   part(new THREE.ConeGeometry(1.2,2.2,4),-1.25,.75,-.1,1,1,.25,-.9);part(new THREE.ConeGeometry(1.2,2.2,4),1.25,.75,-.1,1,1,.25,.9);limb(-.7,-1.2,0,.8,1,.8,.2);limb(.7,-1.2,0,.8,1,.8,-.2);
  }else if(map.creature==='alien'){
   ico(0,.9,0,1.05,1.25,.7);ico(0,-.65,0,.85,.85,.58);cone(-.45,2.15,0,.5,.9,.5,-.3);cone(.45,2.15,0,.5,.9,.5,.3);
   const eyes=new THREE.MeshBasicMaterial({color:map.glow});for(const x of [-.42,.42]){const e=new THREE.Mesh(new THREE.SphereGeometry(.13,10,8),eyes);e.position.set(x,1,.64);boss.add(e)}
   for(let i=0;i<4;i++)limb(i<2?-1.2:1.2,-.65-(i%2)*.5,0,.55,.9,.6,(i<2?-1:1)*.65);
  }else if(map.creature==='owl'){
   ico(0,0,0,.9,1.25,.6);ico(0,1.25,0,.78,.75,.65);
   for(const x of [-.42,.42]){ico(x,1.35,.58,.3,.32,.2);cone(x*1.7,2,.1,.55,.7,.55,x<0?-.25:.25)}
   part(new THREE.ConeGeometry(.8,1.5,4),-1,.1,0,1,1,.3,-.8);part(new THREE.ConeGeometry(.8,1.5,4),1,.1,0,1,1,.3,.8);cone(0,.8,.7,.35,.6,.35,Math.PI);
  }else if(map.creature==='frog'||map.creature==='bear'||map.creature==='wolf'){
   ico(0,-.1,0,map.creature==='bear'?1.15:1,.95,.7);ico(0,1,0,.8,.75,.62);
   if(map.creature==='wolf'){cone(-.48,1.9,0,.65,1,.65,-.3);cone(.48,1.9,0,.65,1,.65,.3)}
   else if(map.creature==='bear'){ico(-.55,1.55,0,.25,.25,.25);ico(.55,1.55,0,.25,.25,.25)}
   else{ico(-.52,1.48,.2,.28,.32,.3);ico(.52,1.48,.2,.28,.32,.3)}
   limb(-1,-.75,0,.9,1,.7,-.55);limb(1,-.75,0,.9,1,.7,.55);limb(-.5,-1.25,0,.8,.75,.7,.1);limb(.5,-1.25,0,.8,.75,.7,-.1);
  }else if(map.creature==='mushroom'){
   part(new THREE.CylinderGeometry(.38,.55,1.65,7),0,-.35,0);part(new THREE.SphereGeometry(1,8,6),0,1,0,1.45,.72,1);limb(-.8,-1,0,.7,.75,.65,-.5);limb(.8,-1,0,.7,.75,.65,.5);
  }else{
   part(new THREE.BoxGeometry(1.7,2.1,1.1),0,0,0);part(new THREE.IcosahedronGeometry(.85,0),0,1.7,0,1,1,.9);
   part(new THREE.BoxGeometry(.75,1.7,.85),-1.15,.05,0);part(new THREE.BoxGeometry(.75,1.7,.85),1.15,.05,0);part(new THREE.BoxGeometry(.85,1.5,.9),-.55,-1.55,0);part(new THREE.BoxGeometry(.85,1.5,.9),.55,-1.55,0);
  }
  const glow=new THREE.PointLight(map.glow,3.2,18);glow.position.set(0,4.8,1);scene.add(glow);
  const points=map.nodes.map(n=>new THREE.Vector3(n.x,n.y,n.z-.2)),closed=map.nodeCount===50;
  const curve=new THREE.CatmullRomCurve3(points,closed);
  scene.add(new THREE.Mesh(new THREE.TubeGeometry(curve,closed?180:90,.035,6,closed),new THREE.MeshBasicMaterial({color:map.glow,transparent:true,opacity:.88})));
  scene.add(new THREE.Mesh(new THREE.TubeGeometry(curve,closed?180:90,.105,6,closed),new THREE.MeshBasicMaterial({color:map.glow,transparent:true,opacity:.12})));
  const links=[];for(const [a,b] of map.connections){const p=points[a-1],q=points[b-1];links.push(p.x,p.y,p.z,q.x,q.y,q.z)}
  const linkGeo=new THREE.BufferGeometry();linkGeo.setAttribute('position',new THREE.Float32BufferAttribute(links,3));scene.add(new THREE.LineSegments(linkGeo,new THREE.LineBasicMaterial({color:map.glow,transparent:true,opacity:.32})));
  const nodeMeshes=map.nodes.map((n,i)=>{const g=new THREE.Group();g.position.copy(points[i]);const gold=n.golden,material=new THREE.MeshStandardMaterial({color:gold?0xffd76a:map.glow,emissive:gold?0xffb52e:map.glow,emissiveIntensity:gold?1.45:.9,roughness:.3,metalness:.35});g.add(new THREE.Mesh(new THREE.OctahedronGeometry(i===map.nodeCount-1?.27:.17,0),material));const ring=new THREE.Mesh(new THREE.TorusGeometry(gold?.37:.28,.018,5,20),new THREE.MeshBasicMaterial({color:gold?0xffe6a0:map.glow,transparent:true,opacity:gold?.95:.65}));ring.rotation.x=Math.PI/2;g.add(ring);scene.add(g);return g});
  const stars=new Float32Array(990);for(let i=0;i<330;i++){stars[i*3]=(Math.sin(i*127.1)*.5+.5)*28-14;stars[i*3+1]=(Math.sin(i*311.7)*.5+.5)*15-2;stars[i*3+2]=-7-(i%13)*.55}
  const starGeo=new THREE.BufferGeometry();starGeo.setAttribute('position',new THREE.BufferAttribute(stars,3));scene.add(new THREE.Points(starGeo,new THREE.PointsMaterial({color:0xa9c9ff,size:.045,transparent:true,opacity:.7})));
  try{
   renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));renderer.setSize(el.clientWidth,el.clientHeight,false);renderer.outputColorSpace=THREE.SRGBColorSpace;el.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-label','Circuito tridimensional de progressão. Arraste para explorar.');
   controls=new OrbitControls(camera,renderer.domElement);controls.enablePan=false;controls.enableDamping=true;controls.minDistance=12;controls.maxDistance=22;controls.target.set(0,4.1,0);controls.update();
   observer=new ResizeObserver(()=>{const w=Math.max(1,el.clientWidth),h=Math.max(1,el.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()});observer.observe(el);
   const clock=new THREE.Clock();const render=()=>{if(!alive)return;frame=requestAnimationFrame(render);const t=clock.getElapsedTime();nodeMeshes.forEach((g,i)=>{g.position.y=points[i].y+Math.sin(t*1.1+i*.22)*.035;g.rotation.y=t*.25+i*.08;g.scale.setScalar(1+Math.sin(t*2+i*.31)*.055)});boss.rotation.y=Math.sin(t*.18)*.08;controls.update();renderer.render(scene,camera)};frame=requestAnimationFrame(render);
  }catch(error){console.error('Saga WebGL unavailable',error)}
  return()=>{alive=false;cancelAnimationFrame(frame);observer?.disconnect();controls?.dispose();renderer?.dispose();renderer?.forceContextLoss?.();renderer?.domElement?.remove();scene.traverse(o=>{o.geometry?.dispose?.();if(Array.isArray(o.material))o.material.forEach(m=>m.dispose());else o.material?.dispose?.()})};
 },[map]);
 return <div className="planet-saga-webgl" ref={host}/>;
}
export default function PlanetSagaMap({level,scheduledDate,completed=0,current=1,playable=true,nodeCount=50,onClose,onPlay}){
 const map=useMemo(()=>sagaMapFor(level,scheduledDate,{nodeCount}),[level,scheduledDate,nodeCount]),[selected,setSelected]=useState(current);
 useEffect(()=>setSelected(current),[current,map.islandIndex]);
 useEffect(()=>{const previous=document.activeElement,old=document.body.style.overflow;document.body.style.overflow='hidden';const key=e=>{if(e.key==='Escape')onClose()};window.addEventListener('keydown',key);return()=>{document.body.style.overflow=old;window.removeEventListener('keydown',key);if(previous?.isConnected)previous.focus?.({preventScroll:true})}},[onClose]);
 const state=sagaLevelState(selected,completed,current,playable),canPlay=state==='current',selectedNode=map.nodes[selected-1],goldenCount=map.nodes.filter(n=>n.golden).length;
 const pointStyle=node=>({'--node-index':node.id,left:(50+node.x/8.3*100)+'%',top:(node.y/8.4*100)+'%'});
 return <main className="planet-saga" style={{'--saga-glow':map.glow}} role="dialog" aria-modal="true" aria-labelledby="saga-title">
  <div className="planet-saga-stars" aria-hidden="true"/><SagaWebGL map={map}/>
  <header className="planet-saga-header"><div><span className="planet-saga-kicker">{nodeCount===50?'CIRCUITO DE ASCENSÃO · 50 NÍVEIS':'MUNDO · TRILHA DE ASCENSÃO'}</span><h1 id="saga-title">{map.planetName}</h1><p>Ilha {map.islandIndex} · Guardião: {map.boss}</p></div><button className="planet-saga-close" onClick={onClose} aria-label="Fechar mapa"><X size={21}/></button></header>
  <div className="planet-saga-guardian"><Shield size={13}/><span>{map.boss}</span><small>{completed}/{nodeCount} CONCLUÍDOS</small></div>
  <nav className="planet-saga-levels" aria-label="Níveis do circuito">{map.nodes.map(node=>{const status=sagaLevelState(node.id,completed,current,playable);return <button key={node.id} type="button" disabled={status==='locked'} style={pointStyle(node)} className={'planet-saga-node '+status+(selected===node.id?' selected':'')+(node.golden?' golden':'')} onClick={()=>setSelected(node.id)} aria-label={'Nível '+node.id+(node.golden?', nível dourado':'')+', '+status}><span>{status==='complete'?<Check size={12}/>:status==='locked'?<Lock size={11}/>:node.golden?<Star size={12} fill="currentColor"/>:node.id}</span></button>})}</nav>
  <footer className="planet-saga-footer"><div><b>{selectedNode?.golden?'✦ Nível dourado · ':''}{selected===nodeCount?map.boss:'Nível '+selected+' / '+nodeCount}</b><small>{state==='complete'?'Desafio concluído':state==='current'?(selectedNode?.golden?'Marco dourado disponível':'Próximo desafio disponível'):'Ainda bloqueado'} · {goldenCount} marcos dourados nesta ilha</small></div>{canPlay&&<button onClick={onPlay}><Play size={16} fill="currentColor"/> Entrar no desafio</button>}</footer>
 </main>;
}
