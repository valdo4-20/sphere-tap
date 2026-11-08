import React,{useEffect} from 'react';
import './opening.css';
export default function Opening({onComplete}){
 useEffect(()=>{const timer=setTimeout(onComplete,1500);return()=>clearTimeout(timer);},[onComplete]);
 return <div className="tap-gnome-opening" role="status" aria-label="Abrindo Sphere Tap"><img className="tap-opening-mark" src="./tap-mark.svg" alt=""/></div>;
}
