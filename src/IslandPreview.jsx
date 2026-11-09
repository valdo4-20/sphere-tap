import React,{Suspense,useEffect,useMemo,useRef,useState} from 'react';
import {RotateCcw,RotateCw} from 'lucide-react';
import {Dialog} from './ui';
import {planetFor,planetSVG} from './journeyPlanets';
import {biomeEnergy} from './islandScenery';
import './islandPreview.css';
const IslandScene=React.lazy(()=>import('./IslandScene'));
export default function IslandPreview({level,scheduledDate,onClose}){
 const asset=useMemo(()=>planetFor(level,scheduledDate),[level,scheduledDate]),energy=biomeEnergy[asset.biome],controlsRef=useRef(null),[rotation,setRotation]=useState(45),[leaving,setLeaving]=useState(false);
 useEffect(()=>{if(!leaving)return;const timer=setTimeout(onClose,matchMedia('(prefers-reduced-motion: reduce)').matches?0:180);return()=>clearTimeout(timer)},[leaving,onClose]);
 const placeholder=<span className='island-scene-loading' dangerouslySetInnerHTML={{__html:planetSVG(level,{scheduledDate,instanceId:'inspect-loading',animated:false})}}/>;
 return <Dialog title={asset.name} className={'island-inspect-dialog'+(leaving?' is-leaving':'')} onClose={()=>setLeaving(true)} style={{'--island-energy':energy.colors[0],'--island-light':energy.colors[1]}}><div className='island-preview-stage' tabIndex={0} aria-label='Explorar ilha em 3D' onKeyDown={e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();controlsRef.current?.rotate(e.key==='ArrowLeft'?-Math.PI/12:Math.PI/12)}}}><div className='island-preview-energy' aria-hidden='true'/><Suspense fallback={placeholder}><IslandScene asset={asset} controlsRef={controlsRef} onRotation={setRotation}/></Suspense></div><div className='island-orbit-controls' aria-label='Girar a ilha'><button className='quiet-button' aria-label='Girar ilha para a esquerda' onClick={()=>controlsRef.current?.rotate(-Math.PI/4)}><RotateCcw size={18}/></button><span aria-live='off'>{rotation}°</span><button className='quiet-button' aria-label='Girar ilha para a direita' onClick={()=>controlsRef.current?.rotate(Math.PI/4)}><RotateCw size={18}/></button><button className='quiet-button' onClick={()=>controlsRef.current?.reset()}>Reposicionar</button></div><p className='island-orbit-hint'>Arraste para explorar a ilha em 360°.</p></Dialog>;
}
