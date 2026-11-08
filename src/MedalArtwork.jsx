import {MonthlyTrophyArtwork} from './MonthlyTrophies';
import {achievementCatalog} from "./achievements";
import React,{useRef} from "react";
import {Leaf} from 'lucide-react';
export default function MedalArtwork({id,title="",locked=false,celebration=false,interactive=false}){
 const ref=useRef(null),drag=useRef(null),rotation=useRef({x:0,y:0});
 if(id?.startsWith('trophy-'))return <MonthlyTrophyArtwork id={id} locked={locked} title={title}/>;
 const rarity=achievementCatalog.find(a=>a.id===id)?.rarity||"bronze";
 const metal={bronze:"#a97651",silver:"#aebdc7",gold:"#d6b367",platinum:"#bbd5d6",emerald:"#5a9b83",obsidian:"#6f5a87",diamond:"#bee3ee"}[rarity];
 function apply(){ref.current.style.setProperty('--medal-rx',rotation.current.x+'deg');ref.current.style.setProperty('--medal-ry',rotation.current.y+'deg');}
 function tilt(e){if(interactive){if(drag.current){rotation.current={x:Math.max(-65,Math.min(65,drag.current.rx-(e.clientY-drag.current.y)*.4)),y:drag.current.ry+(e.clientX-drag.current.x)*1.3};apply()}return}if(e.pointerType==="touch"||locked)return;const r=e.currentTarget.getBoundingClientRect();ref.current.style.setProperty("--medal-rx",((.5-(e.clientY-r.top)/r.height)*18)+"deg");ref.current.style.setProperty("--medal-ry",(((e.clientX-r.left)/r.width-.5)*22)+"deg");}
 function reset(){if(!interactive){ref.current.style.setProperty("--medal-rx","0deg");ref.current.style.setProperty("--medal-ry","0deg");}}
 return <span ref={ref} style={{"--medal-metal":metal}} data-rarity={rarity} className={"medal-object"+(locked?" medal-is-locked":"")+(celebration?" medal-celebrate":"")+(interactive?' medal-interactive':'')} tabIndex={interactive?0:undefined} role={interactive?'group':undefined} aria-label={interactive?'Girar medalha. Arraste ou use as setas. Home retorna à frente.':undefined} onKeyDown={e=>{if(!interactive)return;if(['ArrowLeft','ArrowRight','Home'].includes(e.key)){e.preventDefault();rotation.current.y=e.key==='Home'?0:rotation.current.y+(e.key==='ArrowLeft'?-25:25);apply()}}} onPointerDown={e=>{if(!interactive)return;e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);drag.current={x:e.clientX,y:e.clientY,rx:rotation.current.x,ry:rotation.current.y}}} onPointerUp={()=>{drag.current=null}} onPointerCancel={()=>{drag.current=null}} onPointerMove={tilt} onPointerLeave={reset}>
  <span className="medal-volume">
   {[1,2,3,4,5,6].map(n=><span className="medal-edge" key={n} style={{transform:"translateZ("+(-n*1.1)+"px)"}}/>)}
   <img draggable={false} onDragStart={e=>e.preventDefault()} className="medal-front" src={"./achievements/"+id+".svg"} alt={title} loading={celebration?"eager":"lazy"}/>
   <span className='medal-back' aria-hidden='true'><Leaf size={48}/><small>sphere. tap</small></span>
   <span className="medal-reflection"/>
  </span>
 </span>;
}
