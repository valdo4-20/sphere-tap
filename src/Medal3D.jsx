import React,{useEffect,useRef,useState} from 'react';
import * as T from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import MedalArtwork from './MedalArtwork';
import {rarities} from './rarities';
import {achievementCatalog} from './achievements';
export default function Medal3D({id,title}){
 const host=useRef(null),control=useRef(null),[failed,setFailed]=useState(false);
 useEffect(()=>{
  if(failed)return;
  const el=host.current,rarity=achievementCatalog.find(a=>a.id===id)?.rarity||'bronze',metal=rarities[rarity].color;
  let renderer,scene,environment,pmrem,frame,observer,alive=true,last=0;
  const textures=[],materials=[],geometries=[],target={x:-.16,y:-.28},drag={active:false},coin=new T.Group(),camera=new T.PerspectiveCamera(34,1,.1,30);
  control.current=target;
  function material(props){const m=new T.MeshStandardMaterial(props);materials.push(m);return m}
  function mesh(g,m){geometries.push(g);const o=new T.Mesh(g,m);coin.add(o);return o}
  function ring(r,t,z){const o=mesh(new T.TorusGeometry(r,t,12,96),rim);o.position.z=z;return o}
  let rim;
  try{
   renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;renderer.setClearColor(0,0);el.appendChild(renderer.domElement);el.dataset.renderer='webgl';renderer.domElement.setAttribute('aria-hidden','true');
   scene=new T.Scene();camera.position.set(0,0,4.4);pmrem=new T.PMREMGenerator(renderer);const room=new RoomEnvironment();environment=pmrem.fromScene(room,.04);room.dispose();scene.environment=environment.texture;scene.environmentIntensity=.6;
   scene.add(new T.HemisphereLight(0xffffff,0x30283c,1.4));const light=new T.DirectionalLight(0xffedd5,2.5);light.position.set(-3,4,5);scene.add(light);const fill=new T.DirectionalLight(0xd8eaff,1.4);fill.position.set(4,0,-3);scene.add(fill);
   rim=material({color:metal,metalness:.88,roughness:.24});const side=material({color:metal,metalness:.85,roughness:.38});const body=mesh(new T.CylinderGeometry(1,1,.2,96),side);body.rotation.x=Math.PI/2;
   ring(.982,.024,.109);ring(.982,.024,-.109);ring(.916,.011,.119);ring(.916,.011,-.119);ring(.754,.008,.12);
   const ridgeGeo=new T.BoxGeometry(.013,.036,.17);geometries.push(ridgeGeo);const ridges=new T.InstancedMesh(ridgeGeo,rim,112),dummy=new T.Object3D();for(let i=0;i<112;i++){const a=i*Math.PI*2/112;dummy.position.set(Math.cos(a)*1.003,Math.sin(a)*1.003,0);dummy.rotation.z=a-Math.PI/2;dummy.updateMatrix();ridges.setMatrixAt(i,dummy.matrix)}coin.add(ridges);
   // Raised center and rings have real geometry, independent of the printed face.
   const enamel=material({color:metal,metalness:.55,roughness:.4});const core=mesh(new T.CylinderGeometry(.441,.441,.047,64),enamel);core.rotation.x=Math.PI/2;core.position.z=.128;ring(.441,.012,.154);
   const reverse=document.createElement('canvas');reverse.width=reverse.height=512;const ctx=reverse.getContext('2d');ctx.fillStyle=metal;ctx.fillRect(0,0,512,512);ctx.strokeStyle='#342b35';ctx.fillStyle='#342b35';ctx.lineWidth=3;ctx.beginPath();ctx.arc(256,256,205,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(256,256,180,0,Math.PI*2);ctx.stroke();ctx.textAlign='center';ctx.font='36px sans-serif';ctx.fillText('sphere. tap',256,260);ctx.font='17px sans-serif';ctx.fillText(rarities[rarity].name.toUpperCase(),256,310);
   const backMap=new T.CanvasTexture(reverse);backMap.colorSpace=T.SRGBColorSpace;textures.push(backMap);const back=mesh(new T.CircleGeometry(.963,96),material({map:backMap,metalness:.7,roughness:.35}));back.rotation.y=Math.PI;back.position.z=-.113;ring(.72,.01,-.12);
   scene.add(coin);coin.rotation.set(target.x,target.y,0);
   const image=new Image();image.onload=()=>{if(!alive)return;function texture(sx,sy,sw,sh){const c=document.createElement('canvas');c.width=c.height=1024;c.getContext('2d').drawImage(image,sx,sy,sw,sh,0,0,1024,1024);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());textures.push(t);return t}const face=texture(13,3,230,230),coreMap=texture(77,67,102,102);const front=mesh(new T.CircleGeometry(.963,96),material({map:face,metalness:.3,roughness:.5}));front.position.z=.112;const relief=mesh(new T.CircleGeometry(.431,64),material({map:coreMap,metalness:.55,roughness:.32}));relief.position.z=.153;};image.onerror=()=>{if(alive)setFailed(true)};image.src='./achievements/'+id+'.svg';
   observer=new ResizeObserver(()=>{const size=Math.max(1,el.clientWidth);renderer.setSize(size,size,false);camera.aspect=1;camera.updateProjectionMatrix()});observer.observe(el);
   const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
   function render(t){frame=requestAnimationFrame(render);if(document.hidden||t-last<33)return;last=t;coin.rotation.x+=(target.x-coin.rotation.x)*.2;coin.rotation.y+=(target.y-coin.rotation.y)*.2;coin.position.y=reduced?0:Math.sin(t/2400)*.015;renderer.render(scene,camera)}frame=requestAnimationFrame(render);
   const down=e=>{e.preventDefault();el.dataset.pointer="true";el.focus({preventScroll:true});el.setPointerCapture(e.pointerId);Object.assign(drag,{active:true,x:e.clientX,y:e.clientY,rx:target.x,ry:target.y})};const move=e=>{if(!drag.active)return;target.y=drag.ry+(e.clientX-drag.x)*.018;target.x=Math.max(-1.2,Math.min(1.2,drag.rx+(e.clientY-drag.y)*.012))};const up=()=>{drag.active=false};
   el.addEventListener('pointerdown',down);el.addEventListener('pointermove',move);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);el._coinClean=()=>{el.removeEventListener('pointerdown',down);el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up)};
   renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();if(alive)setFailed(true)});
  }catch{setFailed(true)}
  return()=>{alive=false;control.current=null;cancelAnimationFrame(frame);observer?.disconnect();el._coinClean?.();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());environment?.dispose();pmrem?.dispose();renderer?.dispose();renderer?.forceContextLoss();renderer?.domElement.remove();};
 },[id,failed]);
 if(failed)return <MedalArtwork id={id} title={title} interactive/>;
 return <div className='medal-webgl' ref={host} role='group' tabIndex={0} aria-label={'Moeda 3D '+title+'. Arraste ou use as setas para girar. Home retorna à frente.'} onKeyDown={e=>{if(host.current)host.current.dataset.pointer="false";const t=control.current;if(!t)return;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(e.key)){e.preventDefault();if(e.key==='Home'){t.x=-.16;t.y=-.28}else if(e.key==='ArrowLeft')t.y-=.35;else if(e.key==='ArrowRight')t.y+=.35;else t.x+=e.key==='ArrowUp'?-.2:.2}}}/>;
}
