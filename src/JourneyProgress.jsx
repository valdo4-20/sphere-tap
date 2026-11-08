import React,{useEffect,useRef,useState} from 'react';
import {Star} from 'lucide-react';
import {playerProgress,starRankFor} from './journeyProgression.js';
export default function JourneyProgress({progress,reward}){
 const xp=progress.xp||0,stars=progress.stars||0,rank=starRankFor(stars);
 const [shownXP,setShownXP]=useState(xp),star=useRef(null);
 const player=playerProgress(shownXP);
 useEffect(()=>{
  if(!reward||matchMedia('(prefers-reduced-motion: reduce)').matches){setShownXP(xp);return;}
  const from=Math.min(xp,Math.max(0,reward.from||0)),start=performance.now();let frame;
  const hop=star.current?.animate([{transform:'translateY(0) scale(1)'},{transform:'translateY(-7px) scale(1.16)',offset:.4},{transform:'translateY(0) scale(1)'}],{duration:560,easing:'ease-out'});
  function tick(now){const t=Math.min(1,(now-start)/800);setShownXP(Math.round(from+(xp-from)*(1-Math.pow(1-t,3))));if(t<1)frame=requestAnimationFrame(tick);}
  frame=requestAnimationFrame(tick);return()=>{cancelAnimationFrame(frame);hop?.cancel();};
 },[xp,reward]);
 return <section className={'journey-personal-progress star-class-'+rank.id} data-star-rank={rank.id} style={{'--star-color':rank.color}} aria-label='Seu progresso na Jornada'>
  <div className='journey-progress-numbers'><span className='journey-progress-star' aria-label={`${stars} estrelas, classe ${rank.name}`}><Star ref={star} key={rank.id} size={18} fill='currentColor'/><b>{stars}</b></span><strong>Nível {player.level}</strong></div><span className='journey-progress-xp'>{shownXP} XP</span>{reward&&<span key={reward.id} className="journey-xp-gain" aria-hidden="true">+{reward.xp} XP</span>}
  <progress aria-label='XP para o próximo nível' value={player.current} max={player.required} aria-valuetext={`${player.current} de ${player.required} XP para o nível ${player.level+1}`}/>
 </section>;
}
