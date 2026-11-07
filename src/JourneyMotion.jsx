import React,{useEffect} from 'react';
import './journeyMotion.css';
export function AnimatedLetters({children}){
 const text=String(children);
 return <span className='tap-animated-letters' aria-label={text}>{text.split(/(\s+)/).map((word,w)=>/^\s+$/.test(word)?' ':<span className='tap-motion-word' aria-hidden='true' key={w}>{Array.from(word).map((letter,i)=><span className='tap-motion-letter' key={i} style={{'--letter-delay':`${Math.min(w*45+i*22,600)}ms`}}>{letter}</span>)}</span>)}</span>
}
const scope='.journey-page,.journey-overlay';
const targets=['h1','h2','h3','p','label','.journey-stop','button'];
export default function JourneyMotion(){
 useEffect(()=>{
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),seen=new WeakSet(),ripples=new Set();
  const selector=targets.flatMap(target=>[`.journey-page ${target}`,`.journey-overlay ${target}`]).join(',');
  const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;observer.unobserve(entry.target);if(reduced.matches)continue;entry.target.animate([{opacity:0,translate:'0 10px'},{opacity:1,translate:'0 0'}],{duration:450,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'})}},{threshold:.06});
  function scan(){document.querySelectorAll(selector).forEach(el=>{if(seen.has(el))return;seen.add(el);observer.observe(el)})}
  let frame=0;const mutations=new MutationObserver(()=>{if(!frame)frame=requestAnimationFrame(()=>{frame=0;scan()})});mutations.observe(document.body,{childList:true,subtree:true});scan();
  function click(event){const button=event.target.closest?.('button');if(!button?.closest(scope)||button.disabled||reduced.matches)return;button.animate([{scale:1},{scale:.95},{scale:1}],{duration:290,easing:'ease-out'});const rect=button.getBoundingClientRect(),dot=document.createElement('span');dot.className='tap-click-wave';dot.style.left=`${event.detail?event.clientX:rect.left+rect.width/2}px`;dot.style.top=`${event.detail?event.clientY:rect.top+rect.height/2}px`;document.body.append(dot);ripples.add(dot);dot.animate([{opacity:.5,scale:0},{opacity:0,scale:3}],{duration:600,easing:'ease-out'}).onfinish=()=>{dot.remove();ripples.delete(dot)}}
  function visibility(){document.querySelectorAll(scope).forEach(el=>el.classList.toggle('journey-motion-paused',document.hidden))}
  document.addEventListener('click',click);document.addEventListener('visibilitychange',visibility);
  return()=>{observer.disconnect();mutations.disconnect();cancelAnimationFrame(frame);ripples.forEach(dot=>dot.remove());document.removeEventListener('click',click);document.removeEventListener('visibilitychange',visibility)};
 },[]);
 return null;
}
