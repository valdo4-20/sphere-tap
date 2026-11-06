import React, { useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, UserRound, Leaf, Moon, Sun, Heart, Sparkles, X } from "lucide-react";
export const profileIcons={user:UserRound,leaf:Leaf,moon:Moon,sun:Sun,heart:Heart,sparkles:Sparkles};
export function Avatar({profile={},size=64}) {
 const Icon=profileIcons[profile.value]||UserRound;
 return <span className="profile-avatar" style={{width:size,height:size}}>{profile.type==="photo"?<img src={profile.value} alt="Seu perfil"/>:profile.type==="emoji"?<span>{profile.value}</span>:<Icon size={size*.43}/>}</span>;
}
export default function ProfilePicker({value,onChange}) {
 const [error,setError]=useState(""),[stream,setStream]=useState(null);
 const video=useRef(null),file=useRef(null),tracks=useRef(null);
 useEffect(()=>()=>tracks.current?.getTracks().forEach(t=>t.stop()),[]);
 useEffect(()=>{if(video.current&&stream){video.current.srcObject=stream;video.current.play().catch(()=>{});}},[stream]);
 function stop(){tracks.current?.getTracks().forEach(t=>t.stop());tracks.current=null;setStream(null);}
 function image(source,w,h){const canvas=document.createElement("canvas");canvas.width=768;canvas.height=768;const side=Math.min(w,h);canvas.getContext("2d").drawImage(source,(w-side)/2,(h-side)/2,side,side,0,0,768,768);let quality=.82,value=canvas.toDataURL("image/jpeg",quality);while(value.length>245000&&quality>.2){quality-=.08;value=canvas.toDataURL("image/jpeg",quality)}if(value.length>250000){setError("Escolha uma imagem mais simples, para caber no armazenamento local.");return}onChange({type:"photo",value});}
 async function upload(e){
  setError("");const f=e.target.files?.[0];if(!f)return;
  if(!["image/jpeg","image/png","image/webp","image/gif"].includes(f.type)||f.size>8*1024*1024){setError("Use uma imagem JPG, PNG, WebP ou GIF de até 8 MB.");return;}
  const url=URL.createObjectURL(f);
  const img=new Image();img.onload=()=>{image(img,img.width,img.height);URL.revokeObjectURL(url)};img.onerror=()=>{URL.revokeObjectURL(url);setError("Não foi possível abrir essa foto.")};img.src=url;e.target.value="";
 }
 async function camera(){
  setError("");
  if(!window.isSecureContext||!navigator.mediaDevices?.getUserMedia){setError("A câmera precisa de HTTPS ou localhost. Você pode escolher uma foto.");return;}
  try{const s=await navigator.mediaDevices.getUserMedia({video:{facingMode:"user",width:512,height:512},audio:false});tracks.current=s;setStream(s);}
  catch{setError("Câmera indisponível ou acesso não autorizado. Escolha um ícone ou foto.");}
 }
 return <div className="profile-picker">
  <Avatar profile={value} size={92}/>
  <div className="avatar-choices" aria-label="Ícones de perfil">{Object.entries(profileIcons).map(([id,Icon])=><button type="button" key={id} className="icon-button" aria-label={"Ícone "+({user:"pessoa",leaf:"folha",moon:"lua",sun:"sol",heart:"coração",sparkles:"estrelas"}[id])} aria-pressed={value?.type==="icon"&&value.value===id} onClick={()=>onChange({type:"icon",value:id})}><Icon size={22}/></button>)}</div>
  <div className="avatar-choices" aria-label="Emojis de perfil">{["🌿","🌙","🫧","🪷","🌻","🦋"].map(emoji=><button type="button" className="icon-button" key={emoji} aria-label={"Usar "+emoji} aria-pressed={value?.type==="emoji"&&value.value===emoji} onClick={()=>onChange({type:"emoji",value:emoji})}>{emoji}</button>)}</div>
  <div className="row"><button type="button" className="button secondary" onClick={()=>file.current.click()}><ImagePlus size={17}/>Escolher foto</button><button type="button" className="button secondary" onClick={camera}><Camera size={17}/>Câmera</button></div>
  <input ref={file} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={upload} hidden aria-label="Foto de perfil"/>
  {stream&&<div className="camera-preview"><video ref={video} autoPlay playsInline muted/><div className="row"><button type="button" className="button primary" onClick={()=>{if(video.current.videoWidth){image(video.current,video.current.videoWidth,video.current.videoHeight);stop();}}}>Usar foto</button><button type="button" className="icon-button" aria-label="Fechar câmera" onClick={stop}><X size={20}/></button></div></div>}
  {error&&<p className="field-help" role="status">{error}</p>}
 </div>;
}
