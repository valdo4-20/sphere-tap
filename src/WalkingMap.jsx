import React,{useEffect,useRef,useState} from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
export default function WalkingMap({points=[],entries=[],mode='route',color='#91b8df',position=null,recenter=0,live=false}){
 const host=useRef(null),map=useRef(null),group=useRef(null),canvas=useRef(null),inputs=useRef(null),userLayer=useRef(null),follow=useRef(true),[online,setOnline]=useState(true);
 inputs.current={points,entries,mode,color};
 useEffect(()=>{
  const m=L.map(host.current,{zoomControl:false,preferCanvas:true,scrollWheelZoom:false}).setView([-14.2,-51.9],4);map.current=m;
  L.control.zoom({position:'bottomright'}).addTo(m);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).on('tileerror',()=>setOnline(false)).addTo(m);
  group.current=L.layerGroup().addTo(m);userLayer.current=L.layerGroup().addTo(m);m.on("dragstart",()=>{follow.current=false});
  const c=document.createElement('canvas');c.className='walking-heat-canvas';host.current.append(c);canvas.current=c;
  function draw(){const {points,entries,mode}=inputs.current;const size=m.getSize(),dpr=Math.min(devicePixelRatio,2);c.width=size.x*dpr;c.height=size.y*dpr;c.style.width=size.x+'px';c.style.height=size.y+'px';const ctx=c.getContext('2d');ctx.scale(dpr,dpr);if(mode==='points')return;
   const pixels=mode==='heat'?entries.filter(e=>e.location).map(e=>m.latLngToContainerPoint([e.location.latitude,e.location.longitude])):[];
   const stride=Math.max(1,Math.ceil(points.length/1200));if(mode==='route')points.forEach((p,i)=>{if(i%stride&&i!==points.length-1)return;const b=m.latLngToContainerPoint([p.latitude,p.longitude]),prev=points[Math.max(0,i-stride)],a=prev?.segment===p.segment?m.latLngToContainerPoint([prev.latitude,prev.longitude]):b,steps=Math.min(30,Math.max(1,Math.ceil(a.distanceTo(b)/14)));for(let j=0;j<steps;j++)pixels.push({x:a.x+(b.x-a.x)*j/steps,y:a.y+(b.y-a.y)*j/steps})});
   // Fixed opacity per sample. Heat is density, never a health score or reward.
   const skip=Math.max(1,Math.ceil(pixels.length/800));pixels.forEach((p,i)=>{if(i%skip||p.x< -80||p.x>size.x+80||p.y< -80||p.y>size.y+80)return;const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,mode==='heat'?48:32);g.addColorStop(0,'rgba(255,197,100,.22)');g.addColorStop(.3,'rgba(231,110,156,.15)');g.addColorStop(.65,'rgba(139,113,213,.1)');g.addColorStop(1,'rgba(94,140,215,0)');ctx.fillStyle=g;ctx.fillRect(p.x-50,p.y-50,100,100)})
  }
  m.on('move zoom resize',draw);m._tapRedraw=draw;
  const resize=new ResizeObserver(()=>m.invalidateSize());resize.observe(host.current);
  return()=>{resize.disconnect();m.remove();map.current=null};
 },[]);
 useEffect(()=>{const m=map.current;if(!m)return;const g=group.current;g.clearLayers();const segments=new Map();points.forEach(p=>{if(!segments.has(p.segment))segments.set(p.segment,[]);segments.get(p.segment).push([p.latitude,p.longitude])});segments.forEach(coords=>{L.polyline(coords,{color,weight:4,opacity:.9}).addTo(g)});
  entries.filter(e=>e.location).forEach(e=>{const marker=L.circleMarker([e.location.latitude,e.location.longitude],{radius:6,color:'#fff',weight:2,fillColor:'#b26068',fillOpacity:1}).addTo(g);const text=document.createElement('span');text.textContent=(e.name||'Consumo')+' · '+new Date(e.time).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})+' · posição aproximada';marker.bindPopup(text)});
  if(points.length){const first=points[0];if(!m._tapCentered){m.setView([first.latitude,first.longitude],16);m._tapCentered=true}}
  m._tapRedraw?.();
 },[points,entries,mode,color]);
 useEffect(()=>{follow.current=true;if(map.current&&position)map.current.setView([position.latitude,position.longitude],16)},[recenter]);
 useEffect(()=>{const m=map.current;if(!m)return;userLayer.current.clearLayers();if(!position)return;L.circle([position.latitude,position.longitude],{radius:position.accuracy,color:'#377ac3',weight:1,fillOpacity:.08}).addTo(userLayer.current);L.circleMarker([position.latitude,position.longitude],{radius:7,color:'#fff',weight:3,fillColor:'#377ac3',fillOpacity:1}).bindTooltip('Sua posição aproximada').addTo(userLayer.current);if(follow.current&&(!points.length||live))m.setView([position.latitude,position.longitude],Math.max(15,m.getZoom()));},[position,live]);
 return <div className='walking-map-wrap'><div className='walking-map' ref={host} aria-label='Mapa interativo do percurso e dos registros'/>{points.length>0&&<button className='button secondary map-fit' onClick={()=>{const coords=[...points,...entries.filter(e=>e.location).map(e=>e.location)].map(p=>[p.latitude,p.longitude]);if(coords.length)map.current.fitBounds(L.latLngBounds(coords),{padding:[35,35],maxZoom:17})}}>Ver percurso</button>}{!online&&<small className='map-offline'>Mapa sem conexão. O percurso continua disponível.</small>}</div>;
}
