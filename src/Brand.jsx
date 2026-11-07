import React,{useEffect,useState} from "react";
export default function Brand({light,onHome,photo}){
 const [idle,setIdle]=useState(false),[scrollHidden,setScrollHidden]=useState(false);
 useEffect(()=>{
  let timer,lastY=window.scrollY,direction=0,distance=0;
  const wake=()=>{setIdle(false);clearTimeout(timer);timer=setTimeout(()=>setIdle(true),7000)};
  const scroll=()=>{
   const y=Math.max(0,window.scrollY),delta=y-lastY,sign=Math.sign(delta);
   distance=sign===direction?distance+Math.abs(delta):Math.abs(delta);direction=sign;
   if(y<=32){setScrollHidden(false);distance=0;}
   else if(sign>0&&y>72&&distance>=28)setScrollHidden(true);
   else if(sign<0&&distance>=18)setScrollHidden(false);
   lastY=y;wake();
  };
  wake();const events=["pointerdown","pointermove","keydown","touchstart"];
  events.forEach(e=>window.addEventListener(e,wake,{passive:true}));
  window.addEventListener("scroll",scroll,{passive:true});
  return()=>{clearTimeout(timer);events.forEach(e=>window.removeEventListener(e,wake));window.removeEventListener("scroll",scroll)};
 },[]);
 return <div className={"floating-brand"+(photo?" brand-on-photo":"")+(scrollHidden?" brand-scroll-hidden":"")}>
  <button className={"floating-wordmark"+(idle?" brand-idle":"")} onClick={onHome} aria-label="Sphere Tap início"><span>sphere.</span><em>tap</em></button>
  <button className="floating-logo" onClick={onHome} aria-label="Sphere Tap início"><img src={"./tap-mark.svg"} alt=""/></button>
 </div>;
}
