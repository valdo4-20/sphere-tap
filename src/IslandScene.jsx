import React,{useEffect,useRef,useState} from 'react';
import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {sceneryFor,biomeEnergy} from './islandScenery.js';
import {renderIslandSvg} from './islandSvg.js';
function voxelPlanetFor(asset){
 const radius=7,voxels=[],seed=(asset.seed||1)>>>0;
 const palette=asset.theme||{},colors=[palette.top||'#65a86c',palette.earth||'#8b6d50',palette.rock||'#64717c'];
 const rand=(n)=>{let x=(seed+n*2654435761)>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296};
 for(let x=-radius;x<=radius;x++)for(let y=-radius;y<=radius;y++)for(let z=-radius;z<=radius;z++){
  const d=Math.sqrt(x*x+y*y+z*z);
  if(d>radius+.25||d<radius-1.25)continue;
  const band=z>2?0:z>-2?1:2,noise=rand((x+12)*37+(y+12)*71+(z+12)*113);
  const color=band===0?(noise>.83?colors[1]:colors[0]):band===1?colors[1]:colors[2];
  voxels.push({x:x-.45,y:y-.45,z:z-.45,s:.9,h:.9,k:'stone',c:color});
 }
 // Small surface biomes are built from the same integer grid as the shell.
 let treeCount=0,crystalCount=0;
 for(let x=-5;x<=5;x++)for(let y=-5;y<=5;y++){
  const d2=x*x+y*y;if(d2>25||d2<5)continue;
  const roll=rand(700+x*29+y*43),surface=Math.floor(Math.sqrt(Math.max(0,radius*radius-d2)));
  if(roll>.955&&treeCount<5){
   treeCount++;const trunk=2+Math.floor(roll*3);
   for(let h=0;h<trunk;h++)voxels.push({x,y,z:surface+h,s:1,h:1,k:'leaf',c:'#8b6848'});
   for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)for(let dz=trunk-1;dz<=trunk+1;dz++)
    if(Math.abs(dx)+Math.abs(dy)+Math.abs(dz-trunk)<4)voxels.push({x:x+dx,y:y+dy,z:surface+dz,s:1,h:1,k:'leaf',c:roll>.98?'#b5d78b':'#4e9566'});
  }else if(roll<.035&&crystalCount<5){
   crystalCount++;for(let h=0;h<3;h++)voxels.push({x,y,z:surface+h,s:1,h:1,k:'crystal',c:h===2?'#c4e8f4':'#77b9d0'});
  }
 }
 return voxels;
}
export default function IslandScene({asset,controlsRef,onRotation,mode='island'}){
 const host=useRef(null),[failed,setFailed]=useState(false),rotationCallback=useRef(onRotation);rotationCallback.current=onRotation;
 useEffect(()=>{
  if(failed)return;
  const el=host.current,voxels=mode==='planet'?voxelPlanetFor(asset):sceneryFor(asset),energy=biomeEnergy[asset.biome],reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let renderer,controls,frame,observer,alive=true,dirty=true,last=0,start=performance.now();
  const geometries=[],materials=[],shaderTimes=[],meshes=[],scene=new T.Scene(),island=new T.Group(),camera=new T.PerspectiveCamera(36,1,.1,150);
  const cube=new T.BoxGeometry(1,1,1),gem=new T.OctahedronGeometry(1,0),canopy=new T.DodecahedronGeometry(.78,0),cactusParts=[new T.CylinderGeometry(.34,.42,1,7,2),new T.CylinderGeometry(.16,.18,.52,6).translate(.34,.02,0),new T.CylinderGeometry(.16,.18,.38,6).rotateZ(Math.PI/2).translate(.22,-.16,0),new T.CylinderGeometry(.14,.16,.4,6).translate(-.3,.22,0),new T.CylinderGeometry(.14,.16,.3,6).rotateZ(Math.PI/2).translate(-.16,.04,0)],cactus=mergeGeometries(cactusParts,false),pebble=new T.DodecahedronGeometry(.62,0),mushroom=new T.SphereGeometry(.62,1,6,5);cactusParts.forEach(g=>g.dispose());geometries.push(cube,gem,canopy,cactus,pebble,mushroom);scene.add(island);
  const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
  for(const v of voxels){const s=v.s||1,h=v.h||1;min[0]=Math.min(min[0],v.x);min[1]=Math.min(min[1],v.z);min[2]=Math.min(min[2],v.y);max[0]=Math.max(max[0],v.x+s);max[1]=Math.max(max[1],v.z+h);max[2]=Math.max(max[2],v.y+s)}
  const center=new T.Vector3(...min.map((x,i)=>(x+max[i])/2)),extent=Math.max(...max.map((x,i)=>x-min[i]));island.position.copy(center).multiplyScalar(-1);
  const matrix=new T.Matrix4(),position=new T.Vector3(),scale=new T.Vector3(),quaternion=new T.Quaternion(),groups=new Map();
  for(const v of [...voxels].sort((a,b)=>a.z-b.z||a.x+a.y-b.x-b.y)){const key=v.k+':'+(v.shape||'cube');if(!groups.has(key))groups.set(key,[]);groups.get(key).push(v)}
  let order=0;
  function material(kind){const m=new T.MeshStandardMaterial({roughness:kind==='crystal'?.28:.78,metalness:kind==='gold'?.42:.04,transparent:kind==='water',opacity:kind==='water'?.92:1});materials.push(m);
   if(['water','lava','glow','crystal','gold','leaf','mushroom'].includes(kind))m.onBeforeCompile=shader=>{const time={value:0};shader.uniforms.islandTime=time;shaderTimes.push(time);let begin='islandPosition=(instanceMatrix*vec4(position,1.0)).xyz;';if(kind==='water')begin+='transformed.y+=sin((position.x+instanceMatrix[3].x)*2.7+(position.z+instanceMatrix[3].z)*1.9+islandTime*1.8)*0.055;';shader.vertexShader='uniform float islandTime; varying vec3 islandPosition;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n '+begin);shader.fragmentShader='uniform float islandTime; varying vec3 islandPosition;\n'+shader.fragmentShader;const strength=kind==='lava'?.4:kind==='glow'?.22:kind==='water'?.12:.06;shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>\n float ripple=0.5+0.5*sin(islandPosition.x*4.0+islandPosition.z*3.0-islandTime*${kind==='water'?'3.0':'1.5'});totalEmissiveRadiance+=diffuseColor.rgb*${strength.toFixed(2)}*ripple;`)};
   m.customProgramCacheKey=()=>`island-${kind}`;return m;
  }
  for(const values of groups.values()){
   const kind=values[0].k,geometry=mode==='planet'?cube:values[0].shape==='gem'?gem:kind==='leaf'?canopy:kind==='cactus'?cactus:kind==='pebble'?pebble:kind==='mushroom'?mushroom:cube;const mesh=new T.InstancedMesh(geometry,material(kind),values.length);mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);mesh.frustumCulled=false;
   const rows=values.map(v=>{const s=v.s||1,h=v.h||1;return {v,order:order++,position:new T.Vector3(v.x+s/2,v.z+h/2,v.y+s/2),scale:new T.Vector3(s,h,s).multiplyScalar(v.shape==='gem'?.5:1)}});
   rows.forEach((r,i)=>{matrix.compose(r.position,quaternion,r.scale);mesh.setMatrixAt(i,matrix);mesh.setColorAt(i,new T.Color(r.v.c))});island.add(mesh);meshes.push({mesh,rows});
  }
  scene.add(new T.HemisphereLight(0xf7fff5,0x26372f,1.65));const sun=new T.DirectionalLight(0xffefcf,3.2);sun.position.set(5,12,7);scene.add(sun);const fill=new T.DirectionalLight(0xb8d9e8,.72);fill.position.set(-7,5,-5);scene.add(fill);const aura=new T.PointLight(energy.colors[0],15,32);aura.position.set(-6,5,-2);scene.add(aura);const contactShadow=new T.Mesh(new T.CircleGeometry(extent*.72,48),new T.MeshBasicMaterial({color:0x9bb5a4,transparent:true,opacity:.055,depthWrite:false}));contactShadow.rotation.x=-Math.PI/2;contactShadow.scale.set(1,.62,1);contactShadow.position.set(0,min[1]-center.y-.28,0);geometries.push(contactShadow.geometry);materials.push(contactShadow.material);island.add(contactShadow);
  const count=44,particles=new Float32Array(count*3),particleGeometry=new T.BufferGeometry();particleGeometry.setAttribute('position',new T.BufferAttribute(particles,3));geometries.push(particleGeometry);const particleMaterial=new T.PointsMaterial({color:energy.colors[1],size:energy.particle==='mist'?.2:.065,transparent:true,opacity:energy.particle==='mist'?.15:.65,depthWrite:false,blending:T.AdditiveBlending});materials.push(particleMaterial);scene.add(new T.Points(particleGeometry,particleMaterial));const impactCount=voxels.length*4,impactPositions=new Float32Array(impactCount*3),impactGeometry=new T.BufferGeometry();impactGeometry.setAttribute('position',new T.BufferAttribute(impactPositions,3));for(let i=1;i<impactPositions.length;i+=3)impactPositions[i]=-100;geometries.push(impactGeometry);const impactMaterial=new T.PointsMaterial({color:energy.colors[1],size:.045,transparent:true,opacity:.72,depthWrite:false,blending:T.AdditiveBlending});materials.push(impactMaterial);scene.add(new T.Points(impactGeometry,impactMaterial));
  const waterColumns=new Map();voxels.filter(v=>v.k==='water'&&!v.s).forEach(v=>{const key=v.x+':'+v.y;const col=waterColumns.get(key)||{x:v.x+1.02,z:v.y+.5,top:v.z+1,bottom:v.z};col.top=Math.max(col.top,v.z+1);col.bottom=Math.min(col.bottom,v.z);waterColumns.set(key,col)});
  const falls=[...waterColumns.values()].filter(c=>c.bottom<0).slice(0,7),drops=new Float32Array(falls.length*9*3),dropGeometry=new T.BufferGeometry();dropGeometry.setAttribute('position',new T.BufferAttribute(drops,3));geometries.push(dropGeometry);const dropMaterial=new T.PointsMaterial({color:'#e0fff5',size:.065,transparent:true,opacity:.8,depthWrite:false});materials.push(dropMaterial);scene.add(new T.Points(dropGeometry,dropMaterial));
  function changed(){dirty=true;if(!controls)return;const degrees=((controls.getAzimuthalAngle()*180/Math.PI)%360+360)%360;el.dataset.rotation=String(Math.round(degrees));rotationCallback.current?.(Math.round(degrees));}
  function resize(){dirty=true;if(!renderer)return;const r=el.getBoundingClientRect();renderer.setSize(Math.max(1,r.width),Math.max(1,r.height),false);camera.aspect=r.width/Math.max(1,r.height);camera.updateProjectionMatrix()}
  function contextLost(event){event.preventDefault();setFailed(true)}
  try{
   renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1;renderer.setClearColor(0,0);el.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-label','Ilha 3D. Arraste para girar.');renderer.domElement.addEventListener('webglcontextlost',contextLost);el.dataset.renderer='webgl';
   camera.position.set(extent*1.3,extent*.95,extent*1.3);controls=new OrbitControls(camera,renderer.domElement);controls.enablePan=false;controls.enableDamping=!reduced.matches;controls.dampingFactor=.1;controls.minDistance=extent;controls.maxDistance=extent*3.5;controls.minPolarAngle=.15;controls.maxPolarAngle=Math.PI*.84;controls.addEventListener('change',changed);controls.saveState();controls.update();changed();
   controlsRef.current={rotate:radians=>{camera.position.applyAxisAngle(new T.Vector3(0,1,0),radians);controls.update();changed()},reset:()=>{controls.reset();changed()}};
   observer=new ResizeObserver(resize);observer.observe(el);resize();
   function render(now){if(!alive||document.hidden)return;frame=requestAnimationFrame(render);if(now-last<1000/30)return;last=now;if(reduced.matches&&!dirty&&el.dataset.assembled==='true')return;const time=(now-start)/1000,assembling=!reduced.matches&&time<1.45;
    if(assembling||el.dataset.assembled!=='true'){for(const {mesh,rows} of meshes){rows.forEach((r,i)=>{const t=reduced.matches?1:Math.max(0,Math.min(1,(time-r.order/voxels.length*.9)/.45)),ease=1-Math.pow(1-t,3),bounce=t>0?Math.sin(t*Math.PI)*.075:0;position.copy(r.position);position.y-=1.5*(1-ease)-bounce;scale.copy(r.scale).multiplyScalar(Math.max(.001,ease*(1+.055*Math.sin(t*Math.PI))));matrix.compose(position,quaternion,scale);mesh.setMatrixAt(i,matrix)});mesh.instanceMatrix.needsUpdate=true;}if(!assembling)el.dataset.assembled='true';}
    const motion=reduced.matches?0:time;shaderTimes.forEach(t=>{t.value=motion});if(el.dataset.assembled==='true'&&!reduced.matches){for(const {mesh,rows} of meshes){const kind=rows[0]?.v.k;if(!['leaf','cactus','water','mushroom'].includes(kind))continue;rows.forEach((r,i)=>{position.copy(r.position);let angle=0;if(kind==='leaf')angle=Math.sin(motion*1.35+r.order*.73)*.055;else if(kind==='cactus')angle=Math.sin(motion*.7+r.order)*.006;else if(kind==='mushroom')angle=Math.sin(motion*.65+r.order)*.012;quaternion.setFromAxisAngle(kind==='leaf'?new T.Vector3(1,0,.35):new T.Vector3(0,1,0),angle);matrix.compose(position,quaternion,r.scale);mesh.setMatrixAt(i,matrix)});mesh.instanceMatrix.needsUpdate=true;}}if(assembling){for(const {rows} of meshes){for(const r of rows){const age=time-(r.order/voxels.length*.9+.45),base=r.order*12;for(let p=0;p<4;p++){const n=(base+p)*3;if(age>=0&&age<.42){const angle=p*Math.PI/2+r.order*.37,spread=age*1.15;impactPositions[n]=r.position.x-center.x+Math.cos(angle)*spread;impactPositions[n+1]=r.position.y-center.y+.08+age*.32-age*age*.55;impactPositions[n+2]=r.position.z-center.z+Math.sin(angle)*spread;}else{impactPositions[n]=0;impactPositions[n+1]=-100;impactPositions[n+2]=0;}}}}impactGeometry.attributes.position.needsUpdate=true;}else if(el.dataset.assembled==='true'){for(let i=1;i<impactPositions.length;i+=3)impactPositions[i]=-100;impactGeometry.attributes.position.needsUpdate=true;}
    for(let i=0;i<count;i++){const phase=(i*1.618+asset.seed%19),angle=phase*2.4+motion*.03,radius=extent*.45+(i%5)*.3;particles[i*3]=Math.cos(angle)*radius;particles[i*3+2]=Math.sin(angle)*radius;particles[i*3+1]=energy.particle==='snow'?4-(phase+motion*.4)%8:energy.particle==='ember'?-3+(phase+motion*.65)%8:Math.sin(phase+motion*.45)*extent*.4;}particleGeometry.attributes.position.needsUpdate=true;
    falls.forEach((fall,i)=>{for(let j=0;j<9;j++){const n=(i*9+j)*3,t=(j/9+motion*1.2)%1;drops[n]=fall.x-center.x+Math.sin(j)*.04;drops[n+1]=fall.top-center.y-t*(fall.top-fall.bottom+.3);drops[n+2]=fall.z-center.z;}});dropGeometry.attributes.position.needsUpdate=true;controls.update();renderer.render(scene,camera);dirty=false;
   }
   const visibility=()=>{cancelAnimationFrame(frame);if(!document.hidden){last=0;frame=requestAnimationFrame(render)}};document.addEventListener('visibilitychange',visibility);frame=requestAnimationFrame(render);
   return()=>{alive=false;cancelAnimationFrame(frame);document.removeEventListener('visibilitychange',visibility);observer?.disconnect();controlsRef.current=null;controls?.dispose();renderer.domElement.removeEventListener('webglcontextlost',contextLost);geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());meshes.forEach(({mesh})=>mesh.dispose());renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove()};
  }catch{setFailed(true);renderer?.dispose();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());return()=>{alive=false;cancelAnimationFrame(frame);observer?.disconnect();controls?.dispose();renderer?.domElement?.remove()}}
 },[asset,failed,controlsRef,mode]);
 if(failed)return <div className='island-scene-fallback'><span dangerouslySetInnerHTML={{__html:renderIslandSvg(asset,{instanceId:'fallback'})}}/><p>A prévia 3D não está disponível neste navegador.</p></div>;
 return <div ref={host} className='island-scene' data-renderer='loading'/>;
}
