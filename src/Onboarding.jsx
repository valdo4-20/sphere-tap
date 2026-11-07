import DatePicker from "./DatePicker";
import React,{useEffect,useRef,useState} from "react";
import {ArrowLeft,ArrowRight,Check,HardDrive,ShieldCheck,Leaf} from "lucide-react";
import Aura from "./Aura";
import ProfilePicker from "./ProfilePicker";
import Terms,{TERMS_VERSION} from "./Terms";
import {intentions} from "./intentions";
import {dayKey} from "./model";
export default function Onboarding({onComplete,initialIntent="monitor",initialName="",initialProfile,initialBirthDate="",color="#b7beca"}){
 const [step,setStep]=useState(0),[name,setName]=useState(initialName),[birthDate,setBirthDate]=useState(initialBirthDate),[profile,setProfile]=useState(initialProfile||{type:"icon",value:"user"}),[intent,setIntent]=useState(initialIntent),[accepted,setAccepted]=useState(false),[demo,setDemo]=useState(0),[storage,setStorage]=useState("Salvamento ativo"),[busy,setBusy]=useState(false),[ready,setReady]=useState(false),[preparation,setPreparation]=useState(0);

 const heading=useRef(null), form=useRef(null);
 const titles=["Bem-vindo ao seu espaço.","Quando você nasceu?","Um perfil com a sua cara.","Você controla os acessos.","Antes de começar.","Criando seu ambiente saudável.","Um toque. Mais consciência."];
 useEffect(()=>{heading.current?.focus({preventScroll:true});window.scrollTo({top:0,behavior:"instant"});},[step]);
 useEffect(()=>{
  if(step!==5)return;
  setReady(false);setPreparation(0);
  const changes=[3500,7000,10500].map((delay,i)=>setTimeout(()=>setPreparation(i+1),delay));
  const done=setTimeout(()=>setReady(true),14000);
  return()=>{changes.forEach(clearTimeout);clearTimeout(done)};
 },[step]);
 async function requestStorage(){
  if(!navigator.storage?.persist){setStorage("Seus dados ficam neste aparelho. Faça backups.");return;}
  setBusy(true);try{setStorage(await navigator.storage.persist()?"Persistência autorizada · mantenha backups.":"Persistência não concedida. O salvamento continua ativo.");}catch{setStorage("Seus dados ficam neste aparelho. Faça backups.");}finally{setBusy(false)}
 }
 function finish(){onComplete({displayName:name.trim(),birthDate,profile,intent,consent:{version:TERMS_VERSION,acceptedAt:new Date().toISOString()}},false);}
 function next(e){e.preventDefault();if(step===6)finish();else setStep(v=>v+1);}
 return <div className="welcome onboarding">
  <div className="aura-viewport"><Aura fullscreen color={color} motion={.3} pulse={demo}/></div>
  <header className="onboarding-brand"><span className="wordmark">sphere. <em>tap</em></span><img src="./sphere-mark.png" alt="Sphere"/></header>
  <form ref={form} className="welcome-content onboarding-content" onSubmit={next}>
   <div className="onboarding-step" key={step}>
    <h1 tabIndex={-1} ref={heading}>{titles[step]}</h1>
    {step===0&&<><p>Acompanhe seu consumo e seus gastos. Faça espaço para pausas.</p><label>Como podemos chamar você?<input name="nickname" autoComplete="nickname" maxLength={32} required value={name} onChange={e=>setName(e.target.value)} placeholder="Nome ou apelido" autoFocus/></label><small className="field-help">Um perfil só seu, salvo neste dispositivo.</small></>}
    {step===1&&<><p>Essa informação fica apenas no seu perfil.</p><label>Data de nascimento<DatePicker className="birth-date-input" type="date" autoComplete="bday" min="1900-01-01" max={dayKey()} required value={birthDate} onChange={e=>setBirthDate(e.target.value)}/></label></>}
    {step===2&&<><p>Escolha um ícone, emoji ou foto.</p><ProfilePicker value={profile} onChange={setProfile}/></>}
    {step===3&&<><p>Tudo aqui é opcional. Você pode continuar sem liberar acesso.</p>
     <div className="permission-card"><ShieldCheck size={22}/><div><b>Câmera e fotos</b><small>Solicitadas só quando você escolhe uma foto para o perfil.</small></div></div>
     <div className="permission-card"><HardDrive size={22}/><div><b>Armazenamento offline</b><small>{storage}</small></div><button className="button secondary" type="button" disabled={busy} onClick={requestStorage}>Proteger</button></div>
    </>}
    {step===4&&<><ShieldCheck className="onboarding-shield" size={50}/><p>Privado, gratuito e sob seu controle.</p><details className="compact-explanation terms-disclosure"><summary>Termos de uso e privacidade</summary><Terms/></details><label className="consent-check"><input type="checkbox" checked={accepted} onChange={e=>setAccepted(e.target.checked)} required/>Li e aceito os termos de uso e privacidade.</label></>}
    {step===5&&<div className={"environment-build "+(ready?"is-ready":"")} role="status"><div className="environment-orbit"><Leaf size={36}/></div><p className="preparation-message" key={preparation+(ready?10:0)}>{ready?"Seu espaço está pronto.":["Sua AURA encontra um ritmo…","Um espaço para observar suas escolhas.","Mais consciência. Espaço para a pausa.","Seu cuidado, no seu tempo."][preparation]}</p><small>Sem envio dos seus dados.</small></div>}
    {step===6&&<><p>Toque na AURA para registrar o que já consumiu. Cada +1 representa consumo e, quando informado, mais gasto.</p>
     <div className="onboarding-demo"><button type="button" aria-label="Experimentar registro sem salvar consumo" onClick={()=>setDemo(v=>v+1)}><span className="animated-count" key={demo}>{demo}</span><small>Experimentar · não salva consumo</small></button></div>
     <label>O que você quer acompanhar?</label><div className="onboarding-intents">{Object.entries(intentions).map(([id,{title,icon:Icon}])=><button type="button" key={id} className="button secondary" aria-pressed={intent===id} onClick={()=>setIntent(id)}><Icon size={17}/>{title}</button>)}</div>
     <details className="compact-explanation"><summary>Como usar</summary><p>Escreva o que consome e escolha cor e preço nas configurações. Histórico e Análises mostram períodos e gastos. Em Cuidado, confirme pausas ou registre vontades.</p><p>Sem informação não significa sem consumo. A AURA não mede saúde.</p></details>
    </>}
   </div>

   <div className="welcome-actions"><button className="button secondary" type="button" disabled={step===0} onClick={()=>setStep(v=>Math.max(0,v-1))}><ArrowLeft size={16}/>Voltar</button><button className="button primary" type="submit" disabled={step===4&&!accepted||step===5&&!ready}>{step===6?"Entrar no Tap":step===5?"Conhecer o app":"Continuar"}<ArrowRight size={16}/></button></div>
  </form>
 </div>;
}
