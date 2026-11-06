import React,{useEffect,useRef,useState} from "react";
import Aura from "./Aura";
export default function AuraPreview({preset,color,enabled}){
 const ref=useRef(null),[visible,setVisible]=useState(false);
 useEffect(()=>{
  const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting),{threshold:.1});
  observer.observe(ref.current);return()=>observer.disconnect();
 },[]);
 return <span ref={ref} className="palette-preview aura-preset-preview" aria-hidden="true"><Aura preset={preset} color={color} enabled={enabled&&visible} motion={.4} maxFrameRate={12}/></span>;
}
