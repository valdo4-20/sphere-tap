import React,{useEffect} from 'react';
import './journeyMotion.css';
export function AnimatedLetters({children}){
 return <span className='tap-animated-letters'>{children}</span>
}
const scope='.journey-page,.journey-overlay,.journey-awards-dialog';
const targets=['.journey-heading','.journey-stop'];
export default function JourneyMotion(){
 useEffect(()=>{
  const animations=new Set();
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),seen=new WeakSet();
  const selector=targets.flatMap(target=>[`.journey-page ${target}`,`.journey-overlay ${target}`]).join(',');
  const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;observer.unobserve(entry.target);if(reduced.matches)continue;const animation=entry.target.animate([{opacity:0},{opacity:1}],{duration:220,easing:'ease-out'});animations.add(animation);animation.onfinish=()=>animations.delete(animation)}},{threshold:.06});
  function scan(){document.querySelectorAll(selector).forEach(el=>{if(seen.has(el))return;seen.add(el);observer.observe(el)})}
  let frame=0;const mutations=new MutationObserver(()=>{if(!frame)frame=requestAnimationFrame(()=>{frame=0;scan()})});mutations.observe(document.body,{childList:true,subtree:true});scan();

  function visibility(){document.querySelectorAll(scope).forEach(el=>el.classList.toggle('journey-motion-paused',document.hidden))}
  const clear=()=>document.querySelectorAll('.journey-node[data-down]').forEach(b=>delete b.dataset.down);
  const down=e=>{const b=e.target.closest?.('.journey-node.current');if(b&&!b.disabled){clear();b.dataset.down='true'}};
  const keydown=e=>{if(!e.repeat&&[' ','Enter'].includes(e.key))down(e)};
  document.addEventListener('pointerdown',down);document.addEventListener('keydown',keydown);
  const ends=['pointerup','pointercancel','lostpointercapture','keyup','contextmenu','visibilitychange'];ends.forEach(name=>document.addEventListener(name,clear));window.addEventListener('blur',clear);
document.addEventListener('visibilitychange',visibility);
  return()=>{clear();document.removeEventListener('pointerdown',down);document.removeEventListener('keydown',keydown);ends.forEach(name=>document.removeEventListener(name,clear));window.removeEventListener('blur',clear);animations.forEach(a=>a.cancel());observer.disconnect();mutations.disconnect();cancelAnimationFrame(frame);document.removeEventListener('visibilitychange',visibility)};
 },[]);
 return null;
}
