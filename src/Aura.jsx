import AuraWaves from "./AuraWaves";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { AuraSurface } from "./sphere-engine/components/AuraCanvas";
export function auraForCategory(c) {
  const hex = c?.auraColor;
  return /^#[0-9a-f]{6}$/i.test(hex || "") ? hex : /cigar|tabaco/i.test(c?.name) ? "#b5b8bd" : /camomila/i.test(c?.name) ? "#efce6b" : "#63d7a1";
}
const ambient = { id: "sphere-tap-ambient" };
const silence = () => ({bass:0,mids:0,treble:0,energy:0,beat:0,onset:0});
function palette(hex) {
  const [r,g,b] = hex.match(/[a-f0-9]{2}/gi).map(x => parseInt(x,16)/255);
  const max=Math.max(r,g,b), min=Math.min(r,g,b), d=max-min, l=(max+min)/2;
  const h=d===0?0:(max===r?((g-b)/d+(g<b?6:0)):max===g?(b-r)/d+2:(r-g)/d+4)*60;
  const s=d===0?0:d/(1-Math.abs(2*l-1))*100;
  return [-12,0,12,24].map(offset=>({hue:(h+offset+360)%360,saturation:s,lightness:l*100}));
}
// AuraSurface original do kit, sem áudio, player ou respostas a batidas.
export default function Aura({enabled=true,pulse=0,color="#a8a7cd",pulseColor,alert=false,motion=.5,fullscreen=false,preset="cover",maxFrameRate=30}) {
  const ref=useRef(null), previous=useRef(pulse), sequence=useRef(0);
  const [pulseLayers,setPulseLayers]=useState([]);
  const [reduced,setReduced]=useState(()=>matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(()=>{ const q=matchMedia("(prefers-reduced-motion: reduce)");const update=()=>setReduced(q.matches);q.addEventListener("change",update);return ()=>q.removeEventListener("change",update); },[]);
  const preferences=useMemo(()=>({ customPalette:preset==="cover"?palette(color):undefined, audioReactive:false, sensitivityMode:false, motionIntensity:Math.min(.65,Math.max(.1,motion)), colorIntensity:.65, brightness:.8, transitionSoftness:.85, freeze:!enabled||reduced }),[color,motion,enabled,reduced,preset]);
  useEffect(()=>{
    if(previous.current===pulse) return;
    previous.current=pulse;
    if(reduced||!enabled||!ref.current) return;
    setPulseLayers(layers=>[...layers,{id:++sequence.current,color:pulseColor||color,alert}]);
  },[pulse,reduced,enabled,pulseColor,color,alert]);
  return <div ref={ref} data-aura-preset={preset} data-aura-color={color} className={"aura-engine "+(fullscreen?"aura-engine-fullscreen":"aura-engine-local")} aria-hidden="true">
    <AuraSurface key={String(enabled)+String(reduced)} currentTrack={ambient} isPlaying auraEnabled auraPreset={preset} auraPreferences={preferences} getAudioLevels={silence} maxFrameRate={maxFrameRate} adaptiveResolution />
    {fullscreen&&<AuraWaves color={color} pulse={pulse} pulseColor={pulseColor} enabled={enabled}/>}
    {pulseLayers.map(layer=><div key={layer.id} className={`aura-pulse-layer${layer.alert?" is-alert":""}`} style={{"--tap-color":layer.color}} onAnimationEnd={event=>{if(event.target===event.currentTarget)setPulseLayers(layers=>layers.filter(item=>item.id!==layer.id));}}>
      <div className="aura-tap-glow aura-item-glow"/>
      {layer.alert&&<div className="aura-tap-glow aura-warning-glow"/>}
    </div>)}
  </div>;
}
