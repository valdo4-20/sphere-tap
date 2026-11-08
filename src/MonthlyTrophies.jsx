import React,{useEffect,useId,useMemo,useRef,useState} from 'react';
import {LockKeyhole,Sparkles} from 'lucide-react';
import {TROPHY_MONTHS,trophyProgress,MONTHLY_XP_TARGET} from './monthlyJourney.js';
import {renderTrophySvg} from './planetPack/monthlyTrophies.mjs';
import {dayKey} from './model.js';
import './monthlyTrophies.css';
export function MonthlyTrophyArtwork({id,locked=false,title=''}){
 const instanceId=useId(),ref=useRef(null),[visible,setVisible]=useState(false),trophy=TROPHY_MONTHS.find(t=>t.id===id);
 const svg=useMemo(()=>trophy&&!locked?renderTrophySvg(trophy,{instanceId}):'',[trophy,locked,instanceId]);
 useEffect(()=>{const el=ref.current;if(!el)return;const observer=new IntersectionObserver(entries=>setVisible(entries.some(e=>e.isIntersecting)),{rootMargin:'30px'});observer.observe(el);return()=>observer.disconnect()},[]);
 if(!trophy)return null;
 return <span ref={ref} className={'monthly-trophy-art'+(visible?' in-view':'')+(locked?' is-locked':'')} role='img' aria-label={title||`${trophy.label}: ${trophy.name}${locked?', bloqueado':''}`} data-trophy-id={locked?undefined:id}>{locked?<LockKeyhole size={28}/>:<span aria-hidden='true' dangerouslySetInnerHTML={{__html:svg}}/>}</span>;
}
export default function MonthlyTrophies({journey,onSelect,today=dayKey()}){
 const month=today.slice(0,7),state=journey?.monthlyTrophies,current=trophyProgress(state,month,MONTHLY_XP_TARGET);
 const earned=TROPHY_MONTHS.filter(t=>state?.months?.[t.month]?.unlockedAt&&state.months[t.month].unlockedAt<=today);
 if(!current&&!earned.length)return null;
 return <section className='monthly-trophies' aria-label='Troféus mensais'>
  <h3><Sparkles size={17}/>Troféus do gnomo</h3>
  {current&&<div className={'monthly-goal'+(current.unlocked?' is-earned':'')}><div><span>{current.label} · {current.name}</span><strong>{current.unlocked?'Troféu conquistado':`${current.xp} / ${current.targetXp} XP`}</strong></div><progress aria-label={`XP para o troféu de ${current.label}`} value={Math.min(current.xp,current.targetXp)} max={current.targetXp}/>{!current.unlocked&&<p>O XP das rodadas concluídas neste mês aproxima você do troféu. A contagem começa nesta atualização.</p>}</div>}
  {earned.length>0&&<div className='monthly-trophy-shelf'>{earned.map(t=><button key={t.id} onClick={()=>onSelect(t.id)} aria-label={`Ver troféu de ${t.label}: ${t.name}`}><MonthlyTrophyArtwork id={t.id}/><span>{t.label}</span></button>)}</div>}
 </section>;
}
