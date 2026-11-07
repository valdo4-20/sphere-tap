import LocalFriends from './LocalFriends.jsx';
import Segmented from "./Segmented";
import GlassSelect from "./GlassSelect";
import {rarities} from "./rarities";
import MedalArtwork from "./MedalArtwork";
import Aura from "./Aura";
import {Dialog} from "./ui";
import React,{useEffect,useState} from "react";
import {ArrowLeft,Check,ChevronRight,LockKeyhole,Pencil,ShieldCheck,Leaf,Bookmark,Settings2} from "lucide-react";
import {Avatar} from "./ProfilePicker";
import ProfilePicker from "./ProfilePicker";
import {achievementProgress,confirmedPauseDays} from "./achievements";
import {tapSequence} from "./wallet";
import {intentions} from "./intentions";
const Medal3D=React.lazy(()=>import("./Medal3D"));
export default function Profile({data,onChange,onNotify,onBack,onSettings,onCare,initialSection="profile"}){
 const [tab,setTab]=useState(initialSection);
 useEffect(()=>setTab(initialSection),[initialSection]);
 const [editing,setEditing]=useState(false),[selected,setSelected]=useState(null),[collection,setCollection]=useState("earned"),[group,setGroup]=useState("all"),[page,setPage]=useState(0),[rarity,setRarity]=useState("all");
 const medals=achievementProgress(data),earned=medals.filter(a=>a.earnedAt),pauses=confirmedPauseDays(data).length,sequence=tapSequence(data);
 const featuredIds=Array.isArray(data.profileDetails?.featured)?data.profileDetails.featured:earned.slice(0,3).map(a=>a.id);
 const featured=earned.filter(a=>featuredIds.includes(a.id));
 const groups=[...new Set(medals.map(a=>a.group))];
 const active=medals.find(a=>a.id===selected),allShown=collection==="earned"?earned:medals.filter(a=>!a.earnedAt),filtered=allShown.filter(a=>(group==="all"||a.group===group)&&(rarity==="all"||a.rarity===rarity)),pages=Math.max(1,Math.ceil(filtered.length/12)),current=Math.min(page,pages-1),shown=filtered.slice(current*12,current*12+12);
 function toggleFeatured(id){
  onChange(d=>{const current=Array.isArray(d.profileDetails?.featured)?d.profileDetails.featured:earned.slice(0,3).map(a=>a.id);const next=current.includes(id)?current.filter(x=>x!==id):[...current.slice(-2),id];return {...d,profileDetails:{...d.profileDetails,featured:next}}});
 }
 return <section className={"profile-page route-transition "+(data.profile?.type==="photo"?"has-profile-photo":"")}>
  {data.profile?.type==="photo"&&<div className="profile-photo-backdrop" aria-hidden="true"><img src={data.profile.value} alt=""/></div>}
  <div className="profile-toolbar"><button className="quiet-button" onClick={onBack}><ArrowLeft size={16}/>Voltar</button><span><ShieldCheck size={13}/>Perfil privado</span><button className="icon-button" aria-label="Preferências do perfil" onClick={onSettings}><Settings2 size={17}/></button></div>
  <Segmented className="profile-area-tabs"><button className={tab==='profile'?'active':''} aria-pressed={tab==='profile'} onClick={()=>setTab('profile')}>Perfil</button><button className={tab==='achievements'?'active':''} aria-pressed={tab==='achievements'} onClick={()=>setTab('achievements')}>Conquistas</button><button className={tab==='friends'?'active':''} aria-pressed={tab==='friends'} onClick={()=>setTab('friends')}>Amigos</button></Segmented>
  {tab==='profile'&&<><section className="profile-hero">
   <div className="profile-portrait"><Avatar profile={data.profile} size={112}/><span className="profile-portrait-ring"/></div>
   <h1>{data.displayName||"Do seu jeito."}</h1>
   {data.profileDetails?.bio&&<p className="profile-bio">{data.profileDetails.bio}</p>}
   <span className="profile-intent"><Leaf size={14}/>{intentions[data.intent]?.title||"Acompanhar"}</span>
   <div className="profile-featured" aria-label="Medalhas em destaque">{featured.map(a=><button key={a.id} onClick={()=>setSelected(a.id)} aria-label={"Ver medalha "+a.title}><MedalArtwork id={a.id} title={a.title}/></button>)}</div>
   <button className="button secondary" aria-expanded={editing} onClick={()=>setEditing(v=>!v)}><Pencil size={14}/>{editing?"Fechar edição":"Editar perfil"}</button>
  </section>
  {editing&&<section className="tap-card profile-editor">
   <h2>Do seu jeito.</h2>
   <ProfilePicker value={data.profile} onChange={profile=>onChange(d=>({...d,profile}))}/>
   <form onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget);onChange(d=>({...d,displayName:f.get("displayName").trim(),profileDetails:{...d.profileDetails,bio:f.get("bio").trim()}}));setEditing(false);onNotify("Perfil atualizado.");}}>
    <label>Nome ou apelido<input name="displayName" defaultValue={data.displayName||""} maxLength={32} required autoComplete="nickname"/></label>
    <label>Uma frase sua · opcional<textarea name="bio" defaultValue={data.profileDetails?.bio||""} maxLength={120} rows={2} placeholder="Como você quer cuidar de si?"/></label>
    <button className="button primary"><Check size={16}/>Salvar perfil</button>
   </form>
  </section>}
  <div className="profile-stats"><div><b>{sequence}</b><span>{sequence===1?"dia com tap em sequência":"dias com tap em sequência"}</span><small>Apenas acompanhamento.</small></div><div><b>{pauses}</b><span>{pauses===1?"dia de pausa confirmado":"dias de pausa confirmados"}</span></div><div><b>{earned.length}</b><span>{earned.length===1?"medalha reconhecida":"medalhas reconhecidas"}</span></div></div>
  <button className="button secondary profile-care" onClick={onCare}>Meu cuidado</button>
  </>}
  {tab==='friends'&&<LocalFriends data={data} onChange={onChange} onNotify={onNotify}/>}
  {tab==='achievements'&&<section className="profile-collection">
   <div className="section-heading"><div><span className="eyebrow">MARCOS DO SEU CUIDADO</span><h2>Suas conquistas.</h2></div></div>
   <p className="field-help">Pausas não precisam ser seguidas. Um dia difícil não apaga seu caminho.</p>
   <Segmented className="profile-medal-tabs"><button className={collection==="earned"?"active":""} aria-pressed={collection==="earned"} onClick={()=>{setCollection("earned");setPage(0)}}>Suas medalhas <span>{earned.length}</span></button><button className={collection==="explore"?"active":""} aria-pressed={collection==="explore"} onClick={()=>{setCollection("explore");setPage(0)}}>Para explorar</button></Segmented>
   <div className="profile-filters"><GlassSelect aria-label="Grupo de conquistas" value={group} onChange={e=>{setGroup(e.target.value);setPage(0)}}><option value="all">Todos os grupos</option>{groups.map(g=><option key={g} value={g}>{g}</option>)}</GlassSelect><GlassSelect aria-label="Raridade" value={rarity} onChange={e=>{setRarity(e.target.value);setPage(0)}}><option value="all">Todas as raridades</option>{Object.entries(rarities).map(([id,r])=><option key={id} value={id}>{r.name}</option>)}</GlassSelect></div>
   <small className="profile-collection-count">{earned.length} reconhecidas · {medals.length} marcos para conhecer</small>
   {shown.length?<div className="profile-medal-grid">{shown.map(a=><button className={"profile-medal "+(a.earnedAt?"earned":"locked")} key={a.id} onClick={()=>setSelected(a.id)} aria-label={a.title+(a.earnedAt?", reconhecida":", conhecer esse marco")}><span className="profile-medal-image"><MedalArtwork id={a.id} locked={!a.earnedAt}/>{!a.earnedAt&&<LockKeyhole size={12}/>}</span><b>{a.title}</b><small>{a.earnedAt?"Reconhecida":a.target?a.current+" de "+a.total:"No seu tempo"}</small></button>)}</div>:<div className="profile-collection-empty"><Leaf size={28}/><p>Seu caminho está começando.</p><button className="quiet-button" onClick={()=>{setCollection("explore");setPage(0)}}>Conhecer os marcos<ChevronRight size={15}/></button></div>}
   {pages>1&&<div className="entry-pagination"><button className="quiet-button" disabled={!current} onClick={()=>setPage(current-1)}>Anterior</button><span>{current+1} / {pages}</span><button className="quiet-button" disabled={current===pages-1} onClick={()=>setPage(current+1)}>Próxima</button></div>}
  </section>}
  {active&&<Dialog className="medal-overlay" title={active.title} onClose={()=>setSelected(null)}><div className="medal-overlay-stage" style={{"--rarity-color":rarities[active.rarity].color}}>
<div className="medal-aura-backdrop" aria-hidden="true"><Aura color={rarities[active.rarity].color} motion={.45} maxFrameRate={24}/></div>
<div className="profile-medal-detail rarity-detail" style={{"--rarity-color":rarities[active.rarity].color}}>
<div className="profile-detail-medal"><React.Suspense fallback={<MedalArtwork id={active.id} title={active.title}/>}><Medal3D key={active.id} id={active.id} title={active.title}/></React.Suspense></div><small className="medal-rarity">{rarities[active.rarity].name} · arraste para girar</small><span className="eyebrow">{active.earnedAt?"UM MARCO DO SEU CUIDADO":"PARA CONHECER, SEM PRESSA"}</span><h2>{active.title}</h2><p>{active.description}</p>
   {active.earnedAt?<><small>Reconhecida em {new Date(active.earnedAt).toLocaleDateString("pt-BR")}</small><button className="button secondary" onClick={()=>toggleFeatured(active.id)} aria-pressed={featuredIds.includes(active.id)}><Bookmark size={15}/>{featuredIds.includes(active.id)?"Retirar do destaque":"Destacar no perfil"}</button></>:<small>Você escolhe seu ritmo. Nada aqui é uma obrigação.</small>}
  </div></div></Dialog>}
 </section>;
}
