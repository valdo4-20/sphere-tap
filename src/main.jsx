import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import {UpdateLifecycle} from './AppUpdate';
import TapIntro from './TapIntro';

function Root(){
 const [preview,setPreview]=React.useState(()=>{
  if(new URLSearchParams(location.search).get('preview')==='intro')return true;
  try{
   const saved=JSON.parse(localStorage.getItem('sphere-tap-v1')||'null');
   return !saved?.welcomeDone&&localStorage.getItem('sphere-tap-intro-seen')!=='yes';
  }catch{return false;}
 });
 React.useEffect(()=>{const show=()=>setPreview(true);window.addEventListener('sphere-tap:show-intro',show);return()=>window.removeEventListener('sphere-tap:show-intro',show);},[]);
 return preview?<TapIntro onDone={()=>{const url=new URL(location.href);url.searchParams.delete('preview');history.replaceState(null,'',url);try{localStorage.setItem('sphere-tap-intro-seen','yes');sessionStorage.setItem("sphere-tap-opened","yes");}catch{}setPreview(false);}}/>:<App/>;
}

createRoot(document.getElementById("root")).render(<><UpdateLifecycle/><Root /></>);
