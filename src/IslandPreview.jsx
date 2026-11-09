import React,{Suspense,useEffect,useMemo,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {RotateCcw,RotateCw,X} from 'lucide-react';
import {planetFor,planetSVG} from './journeyPlanets';
import {biomeEnergy} from './islandScenery';
import './islandPreview.css';
const IslandScene=React.lazy(()=>import('./IslandScene'));
function VoxelGnome(){
 return <svg className="island-gnome" viewBox="0 0 128 176" role="img" aria-label="Gnomo de blocos com gorro verde e barba branca">
  <ellipse cx="64" cy="164" rx="34" ry="7" fill="#07130f" opacity=".3"/>
  <g className="gnome-body">
   <g className="gnome-arm gnome-arm-left"><rect x="20" y="86" width="18" height="30" fill="#477b43"/><rect x="17" y="111" width="17" height="14" fill="#d9a36e"/></g>
   <g className="gnome-arm gnome-arm-right"><rect x="90" y="86" width="18" height="30" fill="#477b43"/><rect x="94" y="111" width="17" height="14" fill="#d9a36e"/></g>
   <rect x="39" y="84" width="50" height="52" fill="#568c4a"/><rect x="34" y="91" width="60" height="34" fill="#6da653"/>
   <rect x="45" y="130" width="17" height="25" fill="#6b4934"/><rect x="67" y="130" width="17" height="25" fill="#6b4934"/>
   <rect x="39" y="151" width="25" height="9" fill="#45352b"/><rect x="65" y="151" width="25" height="9" fill="#45352b"/>
   <rect x="39" y="45" width="50" height="44" fill="#e7b982"/><rect x="31" y="55" width="66" height="27" fill="#f0c896"/>
   <rect x="53" y="64" width="8" height="8" fill="#2a2922"/><rect x="72" y="64" width="8" height="8" fill="#2a2922"/>
   <rect x="59" y="72" width="13" height="12" fill="#d88c52"/>
   <path d="M38 77h13v8h9v9h-9v8h-8v-8h-8V85h3zm50 0H75v8h-9v9h9v8h8v-8h8V85h-3z" fill="#f5f1df"/>
   <rect x="43" y="87" width="42" height="9" fill="#fffdf0"/><rect x="48" y="96" width="32" height="8" fill="#e9e4d5"/>
   <rect x="35" y="36" width="59" height="14" fill="#34753e"/><rect x="44" y="23" width="42" height="14" fill="#3e8847"/><rect x="53" y="10" width="27" height="14" fill="#4b9a50"/><rect x="62" y="2" width="15" height="10" fill="#5aa75a"/>
   <rect x="34" y="44" width="60" height="7" fill="#285e37"/>
  </g>
 </svg>;
}
export default function IslandPreview({level,scheduledDate,onClose}){
 const asset=useMemo(()=>planetFor(level,scheduledDate),[level,scheduledDate]),energy=biomeEnergy[asset.biome],controlsRef=useRef(null),dialogRef=useRef(null),closeRef=useRef(null),[rotation,setRotation]=useState(45),[phase,setPhase]=useState('day');
 useEffect(()=>{const start=Date.now(),timer=setInterval(()=>setPhase(Math.floor((Date.now()-start)/18000)%2?'night':'day'),1000);return()=>clearInterval(timer)},[]);
 useEffect(()=>{
  const previous=document.activeElement,old=document.body.style.overflow;document.body.style.overflow='hidden';closeRef.current?.focus({preventScroll:true});
  const key=e=>{
   if(e.key==='Escape'){e.preventDefault();onClose();return}
   if(e.key!=='Tab')return;
   const items=[...dialogRef.current.querySelectorAll('button:not(:disabled),[tabindex="0"]')].filter(el=>el.getClientRects().length),first=items[0],last=items.at(-1);
   if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus({preventScroll:true})}
   else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus({preventScroll:true})}
  };
  window.addEventListener('keydown',key);
  return()=>{document.body.style.overflow=old;window.removeEventListener('keydown',key);if(previous?.isConnected)previous.focus?.({preventScroll:true})};
 },[onClose]);
 const placeholder=<span className='island-scene-loading' dangerouslySetInnerHTML={{__html:planetSVG(level,{scheduledDate,instanceId:'inspect-loading',animated:false})}}/>;
 return createPortal(<main ref={dialogRef} tabIndex={-1} className={'island-fullscreen island-phase-'+phase+' island-weather-'+(asset.biome==='snow'?'snow':asset.biome==='water'?'mist':'clear')} style={{'--island-energy':energy.colors[0],'--island-light':energy.colors[1]}} role="dialog" aria-modal="true" aria-labelledby="island-explore-title">
  <div className="island-sky" aria-hidden="true"/><div className="island-atmosphere" aria-hidden="true"/>
  <header className="island-fullscreen-header"><div><span className="island-eyebrow">ESFERA · EXPLORAÇÃO</span><h1 id="island-explore-title">{asset.name}</h1><p>Um pequeno mundo para descobrir, sem pressa.</p></div><button ref={closeRef} type="button" className="island-exit" onClick={onClose} aria-label="Fechar exploração"><X size={22}/></button></header>
  <div className="island-fullscreen-stage" tabIndex={0} aria-label="Ilha em blocos. Arraste para girar."><div className="island-preview-energy" aria-hidden="true"/><Suspense fallback={placeholder}><IslandScene asset={asset} controlsRef={controlsRef} onRotation={setRotation}/></Suspense><VoxelGnome/><div className="island-ground-glow" aria-hidden="true"/></div>
  <div className="island-fullscreen-footer"><div className="island-orbit-controls" aria-label="Girar a ilha"><button className="quiet-button" aria-label="Girar ilha para a esquerda" onClick={()=>controlsRef.current?.rotate(-Math.PI/4)}><RotateCcw size={18}/></button><span>{rotation}°</span><button className="quiet-button" aria-label="Girar ilha para a direita" onClick={()=>controlsRef.current?.rotate(Math.PI/4)}><RotateCw size={18}/></button><button className="quiet-button" onClick={()=>controlsRef.current?.reset()}>Reposicionar</button></div><p className="island-orbit-hint">Arraste para explorar em 360° · {phase==='day'?'Dia':'Noite'}</p></div>
 </main>,document.body);
}
