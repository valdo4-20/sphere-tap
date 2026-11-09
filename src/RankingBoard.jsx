import React,{useEffect,useRef} from 'react';
import {Trophy,Users} from 'lucide-react';
import FriendEmblem from './FriendEmblem';
import './rankingBoard.css';
function AnimatedXP({value}){
 const ref=useRef(null);
 useEffect(()=>{
  const el=ref.current;if(!el)return;
  const media=matchMedia('(prefers-reduced-motion: reduce)');let frame;
  const finish=()=>{cancelAnimationFrame(frame);el.textContent=value.toLocaleString('pt-BR')};
  if(media.matches){finish();return}
  const start=performance.now();const tick=now=>{const t=Math.min(1,(now-start)/650);el.textContent=Math.round(value*(1-(1-t)**3)).toLocaleString('pt-BR');if(t<1)frame=requestAnimationFrame(tick)};
  frame=requestAnimationFrame(tick);media.addEventListener('change',finish);return()=>{cancelAnimationFrame(frame);media.removeEventListener('change',finish)};
 },[value]);
 return <span aria-label={`${value} XP`}><span ref={ref} aria-hidden='true'>{value.toLocaleString('pt-BR')}</span><span aria-hidden='true'> XP</span></span>;
}
export default function RankingBoard({rows,title='Ranking',className='',active='self',onSelect,onManage}){
 const top=rows.slice(0,3),podium=top.length===3?[top[1],top[0],top[2]]:top.length===2?[top[1],top[0]]:top;
 return <section className={`ranking-board ${className}`} aria-label={title}>
  <header className='ranking-board-header'><div><span className='ranking-eyebrow'>AMIGOS POR PERTO</span><h2><Trophy size={19}/>{title}</h2></div>{onManage&&<button className='quiet-button' onClick={onManage}><Users size={16}/>Amigos</button>}</header>
  <div className='ranking-podium' aria-hidden='true'>{podium.map(f=><div key={f.id} className={'ranking-podium-person'+(f.place===1?' is-first':'')} style={{'--person-color':f.color,'--podium-height':`${f.place===1?124:f.place===2?92:66}px`}}><div className='ranking-podium-avatar'><FriendEmblem friend={f}/></div><span className='ranking-podium-name'>{f.name}</span><div className='ranking-pedestal'><span className='ranking-medal'>{f.place}</span><span className='ranking-podium-xp'>{f.journey.xp.toLocaleString('pt-BR')} XP</span></div></div>)}</div>
  <ol className='ranking-board-list'>{rows.map(f=>{
   const content=<><span className='ranking-place'>{f.place}</span><FriendEmblem friend={f}/><span className='ranking-person-name'>{f.name}{f.id==='self'&&f.name!=='Você'&&<small>Você</small>}</span><strong className='ranking-person-xp'><AnimatedXP value={f.journey.xp}/></strong></>;
   return <li key={f.id} value={f.place} className={active===f.id?'is-player':''} style={{'--person-color':f.color}}>{onSelect?<button aria-pressed={active===f.id} onClick={()=>onSelect(f.id)}>{content}</button>:<div className='ranking-board-row'>{content}</div>}</li>;
  })}</ol>
  {rows.some((f,i)=>i>0&&f.place===rows[i-1].place)&&<p className='ranking-tie-note'>Mesmo XP, mesma posição.</p>}
 </section>;
}
