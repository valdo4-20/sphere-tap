import {profileBanners} from './profileBanners';
import './rewardDesign.css';
import React,{useEffect,useState} from 'react';
import {X,ArrowUpRight} from "lucide-react";
import MedalArtwork from "./MedalArtwork";
import {achievementCatalog} from "./achievements";
export default function AchievementCelebration({achievement,onClose,onProfile}){
 const [leaving,setLeaving]=useState(false);
 useEffect(()=>{const timer=setTimeout(()=>setLeaving(true),6200);return()=>clearTimeout(timer)},[]);
 useEffect(()=>{if(!leaving)return;const timer=setTimeout(onClose,280);return()=>clearTimeout(timer)},[leaving,onClose]);
 const medal=achievementCatalog.find(a=>a.id===achievement.id);
 if(!medal)return null;
 const banner=profileBanners.find(b=>b.achievement===medal.id);
 const journey=medal.group.startsWith('Jornada');
 return <aside className={"achievement-celebration"+(leaving?" is-leaving":"")} aria-label={journey?"Nova conquista da Jornada":"Novo marco de cuidado"} role="status">
  <div className="achievement-light" aria-hidden="true"/><div className="reward-burst" aria-hidden="true">{Array.from({length:8},(_,i)=><i key={i} style={{"--burst-angle":i*45+"deg","--burst-delay":i*.035+"s"}}/>)}</div>
  <div className="celebration-medal"><MedalArtwork id={medal.id} title={medal.title} celebration/></div>
  <div className="celebration-copy"><span className="eyebrow">{journey?"CONQUISTA DA JORNADA":"MARCO DO SEU CUIDADO"}</span><b>{medal.title}</b>{banner&&<small className="reward-banner-unlocked">Banner {banner.name} desbloqueado</small>}<button className="quiet-button" onClick={onProfile}>Ver conquistas<ArrowUpRight size={14}/></button></div>
  <div className="celebration-actions"><button className="icon-button" aria-label="Fechar conquista" onClick={()=>setLeaving(true)}><X size={17}/></button></div>
 </aside>;
}
