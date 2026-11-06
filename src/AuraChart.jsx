import useTweenNumbers from "./useTweenNumbers";
import Segmented from "./Segmented";
import React,{useId,useState} from "react";
import {money,dayKey} from "./model";
const weekdays=["dom","seg","ter","qua","qui","sex","sáb"];
const point=(i,r)=>[180+Math.cos(-Math.PI/2+i*2*Math.PI/7)*r,180+Math.sin(-Math.PI/2+i*2*Math.PI/7)*r];
function smooth(points){
 const mid=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];
 const start=mid(points[points.length-1],points[0]);
 return "M "+start.join(" ")+" "+points.map((p,i)=>"Q "+p.join(" ")+" "+mid(p,points[(i+1)%points.length]).join(" ")).join(" ")+" Z";
}
export default function AuraChart({entries,range}){
 const [metric,setMetric]=useState("consumo"),[selected,setSelected]=useState(null);
 const id=useId().replace(/:/g,""),groups=Array.from({length:7},()=>({count:0,cost:0,missing:0}));
 entries.forEach(e=>{const i=new Date(e.time).getDay();groups[i].count++;if(e.cost==null)groups[i].missing++;else groups[i].cost+=Math.round(e.cost*100);});
 const order=[1,2,3,4,5,6,0], values=order.map(i=>metric==="consumo"?groups[i].count:groups[i].cost);
 const maximum=Math.max(1,...values),sum=values.reduce((a,b)=>a+b,0),missing=groups.reduce((a,b)=>a+b.missing,0);
 const radii=useTweenNumbers(values.map(v=>28+v/maximum*86));
 const points=radii.map((v,i)=>point(i,v));
 const info=selected==null?null:groups[order[selected]];
 const allUnknownCost=metric==="gastos"&&entries.length>0&&entries.every(e=>e.cost==null);
 return <section className="tap-card aura-chart-card">
  <div className="section-heading"><h2>Sua AURA em números</h2><Segmented className=""><button aria-pressed={metric==="consumo"} className={metric==="consumo"?"active":""} onClick={()=>{setMetric("consumo");setSelected(null)}}>Consumo</button><button aria-pressed={metric==="gastos"} className={metric==="gastos"?"active":""} onClick={()=>{setMetric("gastos");setSelected(null)}}>Gastos</button></Segmented></div>
  <p className="field-help">Distribuição dos registros por dia da semana no período escolhido.</p>
  <div className="aura-chart-layout">
   <svg className="aura-radar" viewBox="0 0 360 360" role="img" aria-label={"Distribuição de "+(metric==="consumo"?"ocasiões registradas":"custos informados")+" por dia da semana"}>
    <defs><radialGradient id={id+"fill"}><stop offset="0%" stopColor="var(--active-aura)" stopOpacity=".58"/><stop offset="65%" stopColor="var(--active-aura)" stopOpacity=".24"/><stop offset="100%" stopColor="var(--active-aura)" stopOpacity=".07"/></radialGradient><filter id={id+"blur"} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter></defs>
    {[.33,.66,1].map(k=><path key={k} d={smooth(order.map((_,i)=>point(i,28+86*k)))} fill="none" stroke="currentColor" opacity=".12"/>)}
    {order.map((d,i)=>{const [x,y]=point(i,122);return <line key={d} x1="180" y1="180" x2={x} y2={y} stroke="currentColor" opacity=".06"/>})}
    {entries.length>0&&!allUnknownCost&&<><path className="aura-chart-halo" d={smooth(points)} fill={"url(#"+id+"fill)"} filter={"url(#"+id+"blur)"}/><path className="aura-chart-shape" d={smooth(points)} fill={"url(#"+id+"fill)"} stroke="var(--active-aura)" strokeOpacity=".75" strokeWidth="1.5"/></>}
    {order.map((d,i)=>{const [x,y]=point(i,150);const [px,py]=points[i];const g=groups[d];const label=metric==="consumo"?g.count+" reg.":g.missing&&g.cost===0?"?":money(g.cost);return <g key={d} role="button" tabIndex={0} aria-label={weekdays[d]+": "+label} aria-pressed={selected===i} onClick={()=>setSelected(selected===i?null:i)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setSelected(selected===i?null:i)}}}><circle cx={x} cy={y} r="20" fill="transparent"/><circle cx={px} cy={py} r={selected===i?5:3} fill="var(--active-aura)" opacity={entries.length&&!allUnknownCost?".9":".25"}/><text x={x} y={y-4} textAnchor="middle" fill="currentColor" fontSize="12">{weekdays[d]}</text><text x={x} y={y+12} textAnchor="middle" fill="currentColor" opacity=".65" fontSize="10">{label}</text></g>})}
    <text x="180" y="177" textAnchor="middle" fill="currentColor" fontSize={metric==="consumo"?36:24} fontFamily="Botanic Grotesque">{!entries.length||allUnknownCost?"—":metric==="consumo"?sum:money(sum)}</text><text x="180" y="199" textAnchor="middle" fill="currentColor" opacity=".65" fontSize="10">{!entries.length?"sem registros":metric==="consumo"?"ocasiões registradas":allUnknownCost?"custo não informado":missing?"custo parcial":"custo registrado"}</text>
   </svg>
   <div className="aura-chart-details">
    <p role="status">{info?weekdays[order[selected]]+": "+info.count+" ocasiões registradas · "+(info.missing===info.count&&info.count?"custo não informado":money(info.cost)+(info.missing?" (parcial)":"")):"Toque em um dia."}</p>
    <details className="compact-explanation"><summary>Sobre este gráfico</summary><p>A escala é relativa ao maior valor registrado no período. O desenho não é uma nota de saúde. Mais área significa mais registros ou gasto, não uma conquista.</p><p>Dias sem registros não comprovam pausas. Custos ausentes não são tratados como gratuitos.</p></details>
   </div>
  </div>
 </section>;
}
