import React,{Suspense,useEffect,useMemo,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {RotateCcw,RotateCw,X} from 'lucide-react';
import {planetFor,planetSVG} from './journeyPlanets';
import {biomeEnergy} from './islandScenery';
import './islandPreview.css';

const IslandScene=React.lazy(()=>import('./IslandScene'));

export default function IslandPreview({level,scheduledDate,onClose,onEnter}){
 const asset=useMemo(()=>planetFor(level,scheduledDate),[level,scheduledDate]);
 const energy=biomeEnergy[asset.biome];
 const controlsRef=useRef(null),dialogRef=useRef(null),closeRef=useRef(null);
 const [rotation,setRotation]=useState(45),[phase,setPhase]=useState('day'),[entering,setEntering]=useState(false);

 useEffect(()=>{
  const start=Date.now();
  const timer=setInterval(()=>setPhase(Math.floor((Date.now()-start)/18000)%2?'night':'day'),1000);
  return()=>clearInterval(timer);
 },[]);

 useEffect(()=>{
  const previous=document.activeElement,old=document.body.style.overflow;
  document.body.style.overflow='hidden';
  closeRef.current?.focus({preventScroll:true});
  const key=e=>{
   if(e.key==='Escape'){e.preventDefault();onClose();return}
   if(e.key!=='Tab')return;
   const items=[...dialogRef.current.querySelectorAll('button:not(:disabled),[tabindex="0"]')].filter(el=>el.getClientRects().length);
   const first=items[0],last=items.at(-1);
   if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus({preventScroll:true})}
   else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus({preventScroll:true})}
  };
  window.addEventListener('keydown',key);
  return()=>{
   document.body.style.overflow=old;
   window.removeEventListener('keydown',key);
   if(previous?.isConnected)previous.focus?.({preventScroll:true});
  };
 },[onClose]);

 const placeholder=<span className='island-scene-loading' dangerouslySetInnerHTML={{__html:planetSVG(level,{scheduledDate,instanceId:'inspect-loading',animated:false})}}/>;
 const enterPlanet=()=>{
  if(entering||!onEnter)return;
  setEntering(true);
  setTimeout(()=>onEnter(),650);
 };

 return createPortal(
  <main ref={dialogRef} tabIndex={-1} className={'island-fullscreen'+(entering?' island-entering':'')+' island-phase-'+phase+' island-weather-'+(asset.biome==='snow'?'snow':asset.biome==='water'?'mist':'clear')} style={{'--island-energy':energy.colors[0],'--island-light':energy.colors[1]}} role="dialog" aria-modal="true" aria-labelledby="island-explore-title">
   <div className="island-sky" aria-hidden="true"/><div className="island-atmosphere" aria-hidden="true"/>
   <header className="island-fullscreen-header">
    <div><span className="island-eyebrow">ESFERA · EXPLORAÇÃO</span><h1 id="island-explore-title">{asset.name}</h1><p>Um pequeno mundo para descobrir, sem pressa.</p></div>
    <button ref={closeRef} type="button" className="island-exit" onClick={onClose} aria-label="Fechar exploração"><X size={22}/></button>
   </header>
   <div className="island-fullscreen-stage" tabIndex={0} aria-label="Ilha em blocos. Arraste para girar.">
    <div className="island-preview-energy" aria-hidden="true"/>
    <Suspense fallback={placeholder}><IslandScene asset={asset} controlsRef={controlsRef} onRotation={setRotation} mode="planet"/></Suspense>
    <div className="island-ground-glow" aria-hidden="true"/>
   </div>
   <div className="island-fullscreen-footer">
    <div className="island-orbit-controls" aria-label="Girar a ilha">
     <button type="button" className="quiet-button" aria-label="Girar ilha para a esquerda" onClick={()=>controlsRef.current?.rotate(-Math.PI/4)}><RotateCcw size={18}/></button>
     <span>{rotation}°</span>
     <button type="button" className="quiet-button" aria-label="Girar ilha para a direita" onClick={()=>controlsRef.current?.rotate(Math.PI/4)}><RotateCw size={18}/></button>
     <button type="button" className="quiet-button" onClick={()=>controlsRef.current?.reset()}>Reposicionar</button>
    </div>
    <p className="island-orbit-hint">Arraste para explorar em 360° · {phase==='day'?'Dia':'Noite'}</p>
    {onEnter&&<button type="button" className="island-enter-planet" disabled={entering} onClick={enterPlanet}>{entering?'Atravessando a atmosfera…':'Entrar no planeta'}</button>}
   </div>
  </main>,
  document.body
 );
}
