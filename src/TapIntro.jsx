import React, {useEffect, useRef, useState} from "react";
import {ArrowLeft, ArrowRight, Pointer, BarChart3, Plus, Sparkles} from "lucide-react";
import "./tapIntro.css";

const slides = [
  {title: <>Seu momento.<br/>Um toque.</>, body: "Escolha o que acompanha. Toque na AURA para registrar um consumo que já aconteceu.", label: "REGISTRE", kind: "touch"},
  {title: <>Veja seus<br/>padrões.</>, body: "Em Progresso, consulte seu histórico, compare períodos e acompanhe os gastos informados.", label: "ACOMPANHE", kind: "history"},
  {title: <>Dê espaço<br/>à pausa.</>, body: "Registre como você se sente e confirme os dias sem consumo. Seu cuidado, no seu tempo.", label: "CUIDE DE VOCÊ", kind: "care"},
];

export default function TapIntro({onDone}) {
 const [page,setPage]=useState(0), [count,setCount]=useState(0);
 const heading=useRef(null), start=useRef(null), exitTimer=useRef(null);
 const [leaving,setLeaving]=useState(false);
 useEffect(()=>()=>clearTimeout(exitTimer.current),[]);
 function finish(){if(leaving)return;setLeaving(true);exitTimer.current=setTimeout(onDone,matchMedia("(prefers-reduced-motion: reduce)").matches?80:700);}
 const slide=slides[page];
 useEffect(()=>{heading.current?.focus({preventScroll:true});},[page]);
 return <section className={`tap-intro tap-intro--${slide.kind} ${leaving?"intro-is-leaving":""}`} aria-label="Conheça o Sphere Tap"
  onTouchStart={e=>{start.current=e.touches[0].clientX;}}
  onTouchEnd={e=>{if(start.current===null)return;const dx=e.changedTouches[0].clientX-start.current;start.current=null;if(Math.abs(dx)>65)setPage(p=>Math.max(0,Math.min(2,p+(dx<0?1:-1))));}}>
  <header className="tap-intro-brand"><span>sphere. <b>tap</b></span></header>
  <div className="tap-intro-main" key={page}>
   <div className="tap-intro-art">
    {page===0&&<><button className="intro-mascot-tap" aria-label="Experimentar toque, sem salvar consumo" onClick={()=>setCount(v=>v+1)}><img className="intro-mascot" src="./artwork/tip-record.png" alt="Gnomo ensinando a tocar no botão de registro"/>{count>0&&<span className="intro-demo-count" key={count}>+{count}</span>}</button><small>TOQUE PARA EXPERIMENTAR · NÃO SALVA</small></>}
    {page===1&&<img className="intro-mascot" src="./artwork/tip-history.png" alt="Gnomo mostrando um quadro de histórico"/>}
    {page===2&&<img className="intro-mascot" src="./artwork/tip-care.png" alt="Gnomo fazendo uma pausa tranquila"/>}
   </div>
   <div className="tap-intro-copy"><span className="tap-intro-label">{slide.label}</span><h1 ref={heading} tabIndex={-1}>{slide.title}</h1><p>{slide.body}</p></div>
  </div>
  <div className="intro-game-wipe" aria-hidden="true"><span/><span/><span/><span/><span/></div>
  <footer className="tap-intro-footer"><div className="intro-pagination" aria-label="Páginas da introdução">{slides.map((s,i)=><button key={s.kind} aria-label={`Página ${i+1}: ${s.label}`} aria-current={page===i?"step":undefined} onClick={()=>setPage(i)}/>)}</div><div className="intro-controls">{page>0&&<button className="intro-back" aria-label="Voltar" onClick={()=>setPage(p=>p-1)}><ArrowLeft/></button>}<button className="intro-next" onClick={()=>page===2?finish():setPage(p=>p+1)}>{page===2?"Vamos começar":"Próximo"}<ArrowRight size={20}/></button></div></footer>
 </section>;
}
