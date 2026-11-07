import React,{useEffect,useState} from 'react';
import {playerProgress} from './journeyProgression';
export default function JourneyXP({from,to}){
 const [xp,setXP]=useState(from);
 useEffect(()=>{if(matchMedia('(prefers-reduced-motion: reduce)').matches){setXP(to);return}let frame,start;const tick=t=>{start??=t;const progress=Math.min(1,(t-start)/2100);setXP(Math.round(from+(to-from)*(1-(1-progress)**2)));if(progress<1)frame=requestAnimationFrame(tick)};frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame)},[from,to]);
 const p=playerProgress(xp),before=playerProgress(from),leveled=p.level>before.level;
 return <div className={'journey-xp-transfer'+(leveled?' leveled':'')}>
  <div className='journey-xp-particles' aria-hidden='true'>{[0,1,2,3,4].map(i=><i key={i} style={{'--xp-delay':`${i*150}ms`}}>✦</i>)}</div>
  <strong key={p.level} className='journey-xp-level'>Nível {p.level}</strong><div className='journey-transfer-meter'><span style={{width:`${p.percent}%`}}/></div><small aria-hidden='true'>{p.current} / {p.required} XP</small><span className='sr-only'>+{to-from} XP. Nível final {playerProgress(to).level}.</span>{leveled&&<p role='status'>Você subiu de nível!</p>}
 </div>;
}
