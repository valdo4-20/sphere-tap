import React,{useEffect,useMemo,useRef,useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {X,Lock,Check,Play,Shield} from 'lucide-react';
import {sagaMapFor} from './journeyPlanets.js';
import {sagaLevelState} from './journeyLogic.js';
import './planetSagaMap.css';
function SagaWebGL({map}){
 const host=useRef(null);
 useEffect(()=>{
  const el=host.current;if(!el)return;
  let renderer,controls,frame,observer,alive=true;
  const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x050b18,.035);
  const camera=new THREE.PerspectiveCamera(42,1,.1,100);camera.position.set(0,5.2,17);camera.lookAt(0,4,0);
  scene.add(new THREE.HemisphereLight(0x9cb8e8,0x111522,1.15));
  const key=new THREE.DirectionalLight(0x8ab6ff,1.5);key.position.set(-4,8,7);scene.add(key);
  const boss=new THREE.Group();boss.position.set(0,4.9,-3.4);boss.scale.set(1.8,1.8,1.1);scene.add(boss);
  const shadowMat=new THREE.MeshStandardMaterial({color:0x08101d,roughness:1,transparent:true,opacity:.82,flatShading:true});
  const part=(geometry,x,y,z,sx,sy,sz,rotation=0)=>{const mesh=new THREE.Mesh(geometry,shadowMat);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);mesh.rotation.z=rotation;boss.add(mesh)};
  part(new THREE.IcosahedronGeometry(1.2,1),0,0,0,1.1,1.55,.65);part(new THREE.IcosahedronGeometry(.8,1),0,1.75,0,.82,.9,.7);
  part(new THREE.ConeGeometry(.32,1.55,5),-.55,2.75,-.02,1,1,1,-.38);part(new THREE.ConeGeometry(.32,1.55,5),.55,2.75,-.02,1,1,1,.38);
  part(new THREE.CapsuleGeometry(.35,1.35,3,5),-1.35,.1,0,1,1,.9,-.42);part(new THREE.CapsuleGeometry(.35,1.35,3,5),1.35,.1,0,1,1,.9,.42);
  part(new THREE.ConeGeometry(.7,1.8,5),-.8,-1.35,0,1,1,1,.12);part(new THREE.ConeGeometry(.7,1.8,5),.8,-1.35,0,1,1,1,-.12);
  const glow=new THREE.PointLight(map.glow,3.2,18);glow.position.set(0,5,1);scene.add(glow);
  const points=map.nodes.map(n=>new THREE.Vector3(n.x*1.55,n.y,n.z)),curve=new THREE.CatmullRomCurve3(points);
  scene.add(new THREE.Mesh(new THREE.TubeGeometry(curve,100,.045,8,false),new THREE.MeshBasicMaterial({color:map.glow,transparent:true,opacity:.88})));
  scene.add(new THREE.Mesh(new THREE.TubeGeometry(curve,100,.12,8,false),new THREE.MeshBasicMaterial({color:map.glow,transparent:true,opacity:.13})));
  const nodeMeshes=map.nodes.map((n,i)=>{const group=new THREE.Group();group.position.copy(points[i]);const core=new THREE.Mesh(new THREE.OctahedronGeometry(i===8?.32:.22,0),new THREE.MeshStandardMaterial({color:map.glow,emissive:map.glow,emissiveIntensity:i===8?1.8:.9,roughness:.3,metalness:.35}));group.add(core);const ring=new THREE.Mesh(new THREE.TorusGeometry(i===8?.48:.34,.025,6,28),new THREE.MeshBasicMaterial({color:map.glow,transparent:true,opacity:.75}));ring.rotation.x=Math.PI/2;group.add(ring);scene.add(group);return group});
  const stars=new Float32Array(330*3);for(let i=0;i<330;i++){stars[i*3]=(Math.sin(i*127.1)*.5+.5)*28-14;stars[i*3+1]=(Math.sin(i*311.7)*.5+.5)*15-2;stars[i*3+2]=-7-(i%13)*.55}
  const starGeo=new THREE.BufferGeometry();starGeo.setAttribute('position',new THREE.BufferAttribute(stars,3));scene.add(new THREE.Points(starGeo,new THREE.PointsMaterial({color:0xa9c9ff,size:.045,transparent:true,opacity:.7})));
  try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));renderer.setSize(el.clientWidth,el.clientHeight,false);renderer.outputColorSpace=THREE.SRGBColorSpace;el.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-label','Mapa tridimensional de progressão. Arraste para explorar.');controls=new OrbitControls(camera,renderer.domElement);controls.enablePan=false;controls.enableDamping=true;controls.minDistance=10;controls.maxDistance=23;controls.target.set(0,4,0);controls.update();observer=new ResizeObserver(()=>{const w=Math.max(1,el.clientWidth),h=Math.max(1,el.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()});observer.observe(el);
   const clock=new THREE.Clock();const render=()=>{if(!alive)return;frame=requestAnimationFrame(render);const t=clock.getElapsedTime();nodeMeshes.forEach((g,i)=>{g.position.y=points[i].y+Math.sin(t*1.1+i*.8)*.045;g.rotation.y=t*.28+i*.4});boss.rotation.y=Math.sin(t*.18)*.08;controls.update();renderer.render(scene,camera)};frame=requestAnimationFrame(render);
  }catch(error){console.error('Saga WebGL unavailable',error)}
  return()=>{alive=false;cancelAnimationFrame(frame);observer?.disconnect();controls?.dispose();renderer?.dispose();renderer?.forceContextLoss?.();renderer?.domElement?.remove();scene.traverse(o=>{o.geometry?.dispose?.();if(Array.isArray(o.material))o.material.forEach(m=>m.dispose());else o.material?.dispose?.()})};
 },[map]);
 return <div className="planet-saga-webgl" ref={host}/>;
}
export default function PlanetSagaMap({level,scheduledDate,completed=0,current=1,playable=true,onClose,onPlay}){
 const map=useMemo(()=>sagaMapFor(level,scheduledDate),[level,scheduledDate]),[selected,setSelected]=useState(current);
 useEffect(()=>{const previous=document.activeElement,old=document.body.style.overflow;document.body.style.overflow='hidden';const key=e=>{if(e.key==='Escape')onClose()};window.addEventListener('keydown',key);return()=>{document.body.style.overflow=old;window.removeEventListener('keydown',key);if(previous?.isConnected)previous.focus?.({preventScroll:true})}},[onClose]);
 const state=sagaLevelState(selected,completed,current,playable),canPlay=state==='current';
 return <main className="planet-saga" style={{'--saga-glow':map.glow}} role="dialog" aria-modal="true" aria-labelledby="saga-title">
  <div className="planet-saga-stars" aria-hidden="true"/><SagaWebGL map={map}/>
  <header className="planet-saga-header"><div><span className="planet-saga-kicker">MUNDO · TRILHA DE ASCENSÃO</span><h1 id="saga-title">{map.planetName}</h1><p>{map.name} · Guardião: {map.boss}</p></div><button className="planet-saga-close" onClick={onClose} aria-label="Fechar mapa"><X size={21}/></button></header>
  <div className="planet-saga-guardian"><Shield size={13}/><span>{map.boss}</span><small>DOMÍNIO FINAL</small></div>
  <nav className="planet-saga-levels" aria-label="Níveis do planeta">{map.nodes.map(node=>{const status=sagaLevelState(node.id,completed,current,playable);return <button key={node.id} disabled={status==='locked'} className={'planet-saga-node '+status+(selected===node.id?' selected':'')} onClick={()=>setSelected(node.id)} aria-label={'Nível '+node.id+', '+status}><span>{status==='complete'?<Check size={14}/>:status==='locked'?<Lock size={13}/>:node.id}</span><small>{node.kind==='guardian'?'Boss':'N'+node.id}</small></button>})}</nav>
  <footer className="planet-saga-footer"><div><b>{selected===9?map.boss:'Nível '+selected}</b><small>{state==='complete'?'Desafio concluído':state==='current'?'Próximo desafio disponível':'Ainda bloqueado'}</small></div>{canPlay&&<button onClick={onPlay}><Play size={16} fill="currentColor"/> Entrar no desafio</button>}</footer>
 </main>;
}
