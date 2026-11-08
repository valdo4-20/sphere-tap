import React,{useEffect,useRef} from 'react';
export default function IslandNode({inspectable,onInspect,onActivate,children,...props}){
 const hold=useRef({timer:null,start:null,suppress:false});
 const clear=()=>{clearTimeout(hold.current.timer);hold.current.timer=null};
 useEffect(()=>()=>clearTimeout(hold.current.timer),[]);
 return <button {...props} onPointerDown={e=>{if(!inspectable||e.button!==0||!e.isPrimary)return;clear();hold.current.suppress=false;hold.current.start=[e.clientX,e.clientY];hold.current.timer=setTimeout(()=>{hold.current.suppress=true;onInspect()},500)}} onPointerMove={e=>{const p=hold.current.start;if(p&&Math.hypot(e.clientX-p[0],e.clientY-p[1])>10)clear()}} onPointerUp={clear} onPointerCancel={clear} onPointerLeave={clear} onContextMenu={e=>{if(inspectable){e.preventDefault();clear();if(!hold.current.suppress)onInspect();hold.current.suppress=true}}} onKeyDown={e=>{if(inspectable&&e.key===' '){e.preventDefault();if(!e.repeat)onInspect()}}} onClick={e=>{if(hold.current.suppress){e.preventDefault();e.stopPropagation();hold.current.suppress=false;return}onActivate()}}>{children}</button>;
}
