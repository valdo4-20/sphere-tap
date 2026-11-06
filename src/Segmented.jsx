import React,{useLayoutEffect,useRef,useState} from 'react';
export default function Segmented({children,className='',...props}){
 const ref=useRef(null),[pill,setPill]=useState({opacity:0});
 useLayoutEffect(()=>{const update=()=>{const b=ref.current?.querySelector('button.active,button[aria-pressed="true"]');if(b)setPill({left:b.offsetLeft,top:b.offsetTop,width:b.offsetWidth,height:b.offsetHeight,opacity:1})};update();const o=new ResizeObserver(update);o.observe(ref.current);return()=>o.disconnect()},[children]);
 return <div {...props} className={'segmented motion-segmented '+className} ref={ref}><span className='segmented-pill' style={pill}/>{children}</div>;
}
