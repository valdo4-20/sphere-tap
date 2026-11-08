import React,{useEffect,useState} from 'react';
import './opening.css';
const scenes=['cosmic-pool','waterfall','garden','doorway'];
export default function Opening({onComplete}){
 const [index]=useState(()=>{try{const n=Number(localStorage.getItem('sphere-tap-opening-scene')||0);return Number.isSafeInteger(n)&&n>=0?n%scenes.length:0;}catch{return 0;}}),[loaded,setLoaded]=useState(false),[leaving,setLeaving]=useState(false);
 useEffect(()=>{
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const leave=setTimeout(()=>setLeaving(true),loaded?(reduced?850:1650):4500);
  return()=>clearTimeout(leave);
 },[loaded]);
 useEffect(()=>{if(!leaving)return;const timer=setTimeout(onComplete,matchMedia('(prefers-reduced-motion: reduce)').matches?100:450);return()=>clearTimeout(timer);},[leaving,onComplete]);
 useEffect(()=>{try{localStorage.setItem('sphere-tap-opening-scene',String((index+1)%scenes.length));}catch{}},[index]);
 return <div className={"tap-gnome-opening has-scene"+(loaded?" is-loaded":"")+(leaving?" is-leaving":"")} role="status" aria-label="Abrindo Sphere Tap">
  <img className="tap-opening-scene" src={`./artwork/opening/${scenes[index]}.jpg`} alt="" onLoad={()=>setLoaded(true)} onError={()=>setLoaded(true)} fetchPriority="high"/>
  <div className="tap-opening-shade"/>
  <div className="tap-opening-sign"><img className="tap-opening-mark" src="./tap-mark.svg" alt=""/></div>
 </div>;
}
