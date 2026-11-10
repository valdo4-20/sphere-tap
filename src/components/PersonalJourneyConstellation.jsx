import React,{useId} from 'react';
import {Lock, Sparkles} from 'lucide-react';
import IslandNode from '../IslandNode.jsx';
import JourneyPlanet from '../JourneyPlanet.jsx';
import {planetFor,planetIsVisible} from '../journeyPlanets.js';
import './personalJourneyConstellation.css';

const CENTER={x:180,y:285};
const ANGLES=[[225,270,315],[315,270,225],[225,270,315]];
const RADII=[88,148,208];

function pointFor(index){
 const ring=Math.floor(index/3),slot=index%3,angle=ANGLES[ring][slot]*Math.PI/180,radius=RADII[ring];
 return {x:CENTER.x+Math.cos(angle)*radius,y:CENTER.y+Math.sin(angle)*radius};
}
function edgePath(a,b){
 const mx=(a.x+b.x)/2,my=(a.y+b.y)/2,dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy)||1;
 const bend=10,px=-dy/length,py=dx/length;
 return `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} Q ${(mx+px*bend).toFixed(1)} ${(my+py*bend).toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
}

export default function PersonalJourneyConstellation({
 nodes,done,level,playable,selected,loading,unlock,advance,
 scheduledDateFor,onInspect,onSelect,onBegin
}){
 const rawId=useId().replace(/[^a-zA-Z0-9_-]/g,'');
 const points=nodes.map((n,i)=>({...pointFor(i),n}));
 const base={x:CENTER.x,y:340};
 const basePath=edgePath(base,points[0]||{x:CENTER.x,y:CENTER.y});
 const edges=points.slice(0,-1).map((from,i)=>({from,to:points[i+1],d:edgePath(from,points[i+1]),id:`journey-edge-${rawId}-${i}`}));
 const baseActive=done>0||(points[0]?.n===level&&playable);
 return <div className="personal-constellation" role="group" aria-label="Constelação da Jornada Pessoal">
  <svg className="personal-constellation-lines" viewBox="0 0 360 360" role="img" aria-label="Linhas de progressão entre os dias">
   <defs>
    <linearGradient id={`journey-line-${rawId}`} x1="0" y1="1" x2="0" y2="0">
     <stop offset="0" stopColor="var(--journey-trail)" stopOpacity=".12"/>
     <stop offset=".55" stopColor="var(--journey-tint)" stopOpacity=".9"/>
     <stop offset="1" stopColor="var(--journey-tint)" stopOpacity=".24"/>
    </linearGradient>
    <filter id={`journey-glow-${rawId}`} x="-100%" y="-100%" width="300%" height="300%">
     <feGaussianBlur stdDeviation="2.8" result="blur"/>
     <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
   </defs>
   <path d={basePath} className={`personal-constellation-edge ${baseActive?'is-lit':''}`} pathLength="1" style={{'--edge-delay':'40ms'}}/>
   {edges.map((edge,i)=>{
    const lit=edge.from.n<=done;
    const animating=advance===edge.to.n;
    return <g key={edge.id}>
     <path id={edge.id} d={edge.d} pathLength="1" className={`personal-constellation-edge ${lit?'is-lit':''}`} style={{'--edge-delay':`${100+i*75}ms`}}/>
     {animating&&<circle r="3.2" className="personal-constellation-traveller">
      <animateMotion dur="950ms" begin="0ms" fill="freeze" path={edge.d}/>
     </circle>}
    </g>;
   })}
   <circle cx={CENTER.x} cy={340} r="4" className="personal-constellation-origin"/>
   <circle cx={CENTER.x} cy={340} r="11" className="personal-constellation-origin-halo"/>
  </svg>
  {points.map(({n,x,y},i)=>{
   const complete=n<=done,current=n===level,available=current&&playable;
   const inspectable=planetIsVisible(n,done,playable);
   const scheduledDate=scheduledDateFor(n);
   const arriving=advance===n;
   const state=complete?'complete':available?'available':'locked';
   const world=inspectable?planetFor(n,scheduledDate):null;
   return <div key={n} className={`personal-constellation-node ${state}${unlock===n?' is-unlocking':''}${arriving?' is-arriving':''}`} style={{left:`${x/360*100}%`,top:`${y/360*100}%`,'--node-delay':`${i*65}ms`}}>
    <IslandNode
     inspectable={inspectable}
     onInspect={()=>onInspect({level:n,scheduledDate})}
     disabled={!complete&&!available}
     aria-label={`Dia ${n}, ${complete?'concluído':available?'disponível para jogar':'bloqueado'}`}
     aria-describedby={inspectable?'island-inspect-hint':undefined}
     aria-expanded={current?selected:undefined}
     className={`journey-node ${complete?'complete':available?'current':'locked'}${unlock===n?' journey-unlocking':''}`}
     onActivate={()=>complete?onInspect({level:n,scheduledDate}):available?onSelect(n):undefined}
    >
     {inspectable?<JourneyPlanet level={n} scheduledDate={scheduledDate} reveal={unlock===n||arriving}/>:<Lock size={17}/>}
    </IslandNode>
    <span className="personal-constellation-caption">
     <b>Dia {n}</b>
     {world&&<small>{world.name}</small>}
     {scheduledDate&&<small className="personal-constellation-date">{new Date(scheduledDate+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})}</small>}
    </span>
    {current&&selected&&playable&&<div className="personal-constellation-launch">
     <button className="journey-start-action" disabled={loading} onClick={()=>onBegin(n)}>{loading?'Preparando…':`Entrar no dia ${n}`}</button>
    </div>}
    {arriving&&<Sparkles className="personal-constellation-arrival" size={17} aria-hidden="true"/>}
   </div>;
  })}
  <span className="personal-constellation-origin-label">SUA JORNADA</span>
 </div>;
}
