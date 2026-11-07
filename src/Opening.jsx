import React,{useEffect,useState} from 'react';
import TapMark from './TapMark';
import './opening.css';
export default function Opening({onComplete}){
 const [leaving,setLeaving]=useState(false);
 useEffect(()=>{const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;const a=setTimeout(()=>setLeaving(true),reduced?650:2800);const b=setTimeout(onComplete,reduced?850:3400);return()=>{clearTimeout(a);clearTimeout(b)}},[onComplete]);
 return <div className={'tap-gnome-opening'+(leaving?' is-leaving':'')} role="status" aria-label="Abrindo Sphere Tap"><TapMark size={280} animated/></div>;
}
