import React,{useEffect,useRef,useState} from 'react';
import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {sceneryFor,biomeEnergy} from './islandScenery.js';
import {renderIslandSvg} from './islandSvg.js';
export default function IslandScene({asset,controlsRef,onRotation}){
 const host=useRef(null),[failed,setFailed]=useState(false),rotationCallback=useRef(onRotation);rotationCallback.current=onRotation;
 useEffect(()=>{
  if(failed)return;
  const el=host.current,voxels=sceneryFor(asset),energy=biomeEnergy[asset.biome],reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let renderer,controls,frame,observer,alive=true,dirty=true,last=0,start=performance.now();
  const geometries=[],materials=[],shaderTimes=[],meshes=[],scene=new T.Scene(),island=new T.Group(),camera=new T.PerspectiveCamera(36,1,.1,150);
  const cube=new T.BoxGeometry(1,1,1),gem=new T.OctahedronGeometry(1,0);geometries.push(cube,gem);scene.add(island);
  const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
  for(const v of voxels){const s=v.s||1,h=v.h||1;min[0]=Math.min(min[0],v.x);min[1]=Math.min(min[1],v.z);min[2]=Math.min(min[2],v.y);max[0]=Math.max(max[0],v.x+s);max[1]=Math.max(max[1],v.z+h);max[2]=Math.max(max[2],v.y+s)}
  const center=new T.Vector3(...min.map((x,i)=>(x+max[i])/2)),extent=Math.max(...max.map((x,i)=>x-min[i]));island.position.copy(center).multiplyScalar(-1);
  const matrix=new T.Matrix4(),position=new T.Vector3(),scale=new T.Vector3(),quaternion=new T.Quaternion(),groups=new Map();
  for(const v of [...voxels].sort((a,b)=>a.z-b.z||a.x+a.y-b.x-b.y)){const key=v.k+':'+(v.shape||'cube');if(!groups.has(key))groups.set(key,[]);groups.get(key).push(v)}
  let order=0;
  function material(kind){const m=new T.MeshStandardMaterial({roughness:kind==='crystal'?.28:.78,metalness:kind==='gold'?.42:.04,transparent:kind==='water',opacity:kind==='water'?.92:1});materials.push(m);
   if(['water','lava','glow','crystal','gold','leaf','mushroom'].includes(kind))m.onBeforeCompile=shader=>{const time={value:0};shader.uniforms.islandTime=time;shaderTimes.push(time);shader.vertexShader='varying vec3 islandPosition;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n islandPosition=(instanceMatrix*vec4(position,1.0)).xyz;');shader.fragmentShader='uniform float islandTime; varying vec3 islandPosition;\n'+shader.fragmentShader;const strength=kind==='lava'?.4:kind==='glow'?.22:.06;shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>\n float ripple=0.5+0.5*sin(islandPosition.x*4.0+islandPosition.z*3.0-islandTime*${kind==='water'?'3.0':'1.5'});totalEmissiveRadiance+=diffuseColor.rgb*${strength.toFixed(2)}*ripple;`)};
   m.customProgramCacheKey=()=>`island-${kind}`;return m;
  }
  for(const values of groups.values()){
   const mesh=new T.InstancedMesh(values[0].shape==='gem'?gem:cube,material(values[0].k),values.length);mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);mesh.frustumCulled=false;
   const rows=values.map(v=>{const s=v.s||1,h=v.h||1;return {v,order:order++,position:new T.Vector3(v.x+s/2,v.z+h/2,v.y+s/2),scale:new T.Vector3(s,h,s).multiplyScalar(v.shape==='gem'?.5:1)}});
   rows.forEach((r,i)=>{matrix.compose(r.position,quaternion,r.scale);mesh.setMatrixAt(i,matrix);mesh.setColorAt(i,new T.Color(r.v.c))});island.add(mesh);meshes.push({mesh,rows});
  }
  scene.add(new T.HemisphereLight(0xf7fff5,0x26372f,2));const sun=new T.DirectionalLight(0xffefcf,3);sun.position.set(5,12,7);scene.add(sun);const aura=new T.PointLight(energy.colors[0],18,32);aura.position.set(-6,5,-2);scene.add(aura);
  const count=44,particles=new Float32Array(count*3),particleGeometry=new T.BufferGeometry();particleGeometry.setAttribute('position',new T.BufferAttribute(particles,3));geometries.push(particleGeometry);const particleMaterial=new T.PointsMaterial({color:energy.colors[1],size:energy.particle==='mist'?.2:.065,transparent:true,opacity:energy.particle==='mist'?.15:.65,depthWrite:false,blending:T.AdditiveBlending});materials.push(particleMaterial);scene.add(new T.Points(particleGeometry,particleMaterial));
  const waterColumns=new Map();voxels.filter(v=>v.k==='water'&&!v.s).forEach(v=>{const key=v.x+':'+v.y;const col=waterColumns.get(key)||{x:v.x+1.02,z:v.y+.5,top:v.z+1,bottom:v.z};col.top=Math.max(col.top,v.z+1);col.bottom=Math.min(col.bottom,v.z);waterColumns.set(key,col)});
  const falls=[...waterColumns.values()].filter(c=>c.bottom<0).slice(0,7),drops=new Float32Array(falls.length*9*3),dropGeometry=new T.BufferGeometry();dropGeometry.setAttribute('position',new T.BufferAttribute(drops,3));geometries.push(dropGeometry);const dropMaterial=new T.PointsMaterial({color:'#e0fff5',size:.065,transparent:true,opacity:.8,depthWrite:false});materials.push(dropMaterial);scene.add(new T.Points(dropGeometry,dropMaterial));
  function changed(){dirty=true;if(!controls)return;const degrees=((controls.getAzimuthalAngle()*180/Math.PI)%360+360)%360;el.dataset.rotation=String(Math.round(degrees));rotationCallback.current?.(Math.round(degrees));}
  function resize(){dirty=true;if(!renderer)return;const r=el.getBoundingClientRect();renderer.setSize(Math.max(1,r.width),Math.max(1,r.height),false);camera.aspect=r.width/Math.max(1,r.height);camera.updateProjectionMatrix()}
  function contextLost(event){event.preventDefault();setFailed(true)}
  try{
   renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1;renderer.setClearColor(0,0);el.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-label','Ilha 3D. Arraste para girar.');renderer.domElement.addEventListener('webglcontextlost',contextLost);el.dataset.renderer='webgl';
   camera.position.set(extent*1.8,extent*1.3,extent*1.8);controls=new OrbitControls(camera,renderer.domElement);controls.enablePan=false;controls.enableDamping=!reduced.matches;controls.dampingFactor=.1;controls.minDistance=extent*1.35;controls.maxDistance=extent*4.5;controls.minPolarAngle=.15;controls.maxPolarAngle=Math.PI*.84;controls.addEventListener('change',changed);controls.saveState();controls.update();changed();
   controlsRef.current={rotate:radians=>{camera.position.applyAxisAngle(new T.Vector3(0,1,0),radians);controls.update();changed()},reset:()=>{controls.reset();changed()}};
   observer=new ResizeObserver(resize);observer.observe(el);resize();
   function render(now){if(!alive||document.hidden)return;frame=requestAnimationFrame(render);if(now-last<1000/30)return;last=now;if(reduced.matches&&!dirty&&el.dataset.assembled==='true')return;const time=(now-start)/1000,assembling=!reduced.matches&&time<1.45;
    if(assembling||el.dataset.assembled!=='true'){for(const {mesh,rows} of meshes){rows.forEach((r,i)=>{const t=reduced.matches?1:Math.max(0,Math.min(1,(time-r.order/voxels.length*.9)/.45)),ease=1-Math.pow(1-t,3);position.copy(r.position);position.y-=1.5*(1-ease);scale.copy(r.scale).multiplyScalar(Math.max(.001,ease));matrix.compose(position,quaternion,scale);mesh.setMatrixAt(i,matrix)});mesh.instanceMatrix.needsUpdate=true;}if(!assembling)el.dataset.assembled='true';}
    const motion=reduced.matches?0:time;shaderTimes.forEach(t=>{t.value=motion});
    for(let i=0;i<count;i++){const phase=(i*1.618+asset.seed%19),angle=phase*2.4+motion*.03,radius=extent*.45+(i%5)*.3;particles[i*3]=Math.cos(angle)*radius;particles[i*3+2]=Math.sin(angle)*radius;particles[i*3+1]=energy.particle==='snow'?4-(phase+motion*.4)%8:energy.particle==='ember'?-3+(phase+motion*.65)%8:Math.sin(phase+motion*.45)*extent*.4;}particleGeometry.attributes.position.needsUpdate=true;
    falls.forEach((fall,i)=>{for(let j=0;j<9;j++){const n=(i*9+j)*3,t=(j/9+motion*1.2)%1;drops[n]=fall.x-center.x+Math.sin(j)*.04;drops[n+1]=fall.top-center.y-t*(fall.top-fall.bottom+.3);drops[n+2]=fall.z-center.z;}});dropGeometry.attributes.position.needsUpdate=true;controls.update();renderer.render(scene,camera);dirty=false;
   }
   const visibility=()=>{cancelAnimationFrame(frame);if(!document.hidden){last=0;frame=requestAnimationFrame(render)}};document.addEventListener('visibilitychange',visibility);frame=requestAnimationFrame(render);
   return()=>{alive=false;cancelAnimationFrame(frame);document.removeEventListener('visibilitychange',visibility);observer?.disconnect();controlsRef.current=null;controls?.dispose();renderer.domElement.removeEventListener('webglcontextlost',contextLost);geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());meshes.forEach(({mesh})=>mesh.dispose());renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove()};
  }catch{setFailed(true);renderer?.dispose();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());return()=>{alive=false;cancelAnimationFrame(frame);observer?.disconnect();controls?.dispose();renderer?.domElement?.remove()}}
 },[asset,failed,controlsRef]);
 if(failed)return <div className='island-scene-fallback'><span dangerouslySetInnerHTML={{__html:renderIslandSvg(asset,{instanceId:'fallback'})}}/><p>A prévia 3D não está disponível neste navegador.</p></div>;
 return <div ref={host} className='island-scene' data-renderer='loading'/>;
}
