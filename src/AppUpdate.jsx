import React,{useEffect,useState,useSyncExternalStore} from 'react';
import {RefreshCw} from 'lucide-react';
import {Dialog} from './ui';
import {appUpdates} from './appUpdates';
import {validData} from './model';
import Aura from './Aura';
import {appearanceFor} from './appearance';
import './appUpdate.css';
const release=typeof __TAP_RELEASE__!=='undefined'?__TAP_RELEASE__:{version:'desenvolvimento'};
export function UpdateLifecycle(){
 useEffect(()=>{
  if(!import.meta.env.PROD||!navigator.serviceWorker)return;
  const base=new URL(import.meta.env.BASE_URL,location.href);
  void appUpdates.start(new URL('sw.js',base).href,base.pathname);
  const visible=()=>{if(document.visibilityState==='visible')void appUpdates.check()};
  const online=()=>void appUpdates.check();
  document.addEventListener('visibilitychange',visible);window.addEventListener('focus',visible);window.addEventListener('online',online);
  const timer=setInterval(visible,60*60*1000);
  return()=>{clearInterval(timer);appUpdates.stop();document.removeEventListener('visibilitychange',visible);window.removeEventListener('focus',visible);window.removeEventListener('online',online)};
 },[]);
 return null;
}
export function AppUpdateSettings(){
 const state=useSyncExternalStore(appUpdates.subscribe,appUpdates.getSnapshot);
 return <section className='tap-update-settings' aria-label='Atualização do aplicativo'><div><strong>{state.pending?'Atualização disponível':'Atualização do aplicativo'}</strong><p>Versão {release.version}{state.pending?' · pronta para instalar':''}</p><small role='status'>{state.error||state.message}</small></div><button className='button secondary' disabled={state.checking||state.applying} onClick={()=>state.pending?appUpdates.reopen():appUpdates.check(true)}><RefreshCw size={15}/>{state.pending?'Ver atualização':state.checking?'Verificando…':'Buscar atualização'}</button></section>;
}
export function AppUpdateNotice({data,blocked,storageError}){
 const state=useSyncExternalStore(appUpdates.subscribe,appUpdates.getSnapshot),[closing,setClosing]=useState(false);
 useEffect(()=>{if(!closing)return;const timer=setTimeout(()=>{appUpdates.dismiss();setClosing(false)},220);return()=>clearTimeout(timer)},[closing]);
 if(!state.pending||state.pending.dismissed||blocked)return null;
 const info=state.pending.release,visual=appearanceFor(data),palette=visual.palette;
 const modalStyle={'--update-bg':palette.page,'--update-neutral':palette.panel,'--update-accent':palette.text,'--update-text':palette.text};
 function close(){if(state.applying)return;if(matchMedia('(prefers-reduced-motion: reduce)').matches)appUpdates.dismiss();else setClosing(true)}
 return <Dialog title='Atualização disponível' onClose={close} style={modalStyle} className={'tap-update-dialog'+(closing?' is-closing':'')}><article className='tap-update-card'>
  <div className='tap-update-art' aria-hidden='true'><div className='tap-update-aura'><Aura color={visual.color} preset={data.appearance?.preset||'cover'} enabled={data.aura} motion={.3} maxFrameRate={18}/></div><img className='tap-update-mark' src='./tap-mark.svg' alt=''/><span className='tap-update-wordmark'>sphere. <em>tap</em></span></div>
  <div className='tap-update-copy'><h2>{info?.title||'Seu Tap, atualizado.'}</h2>{info?.version&&<p className='tap-update-version'>Versão {info.version}</p>}{info?.changes?.length>0&&<ul>{info.changes.slice(0,3).map(change=><li key={change}>{change}</li>)}</ul>}
   {state.error&&<p role='alert'>{state.error}</p>}
   <footer><button className='quiet-button' disabled={state.applying} onClick={close}>Depois</button><button className='button primary' disabled={state.applying} onClick={()=>appUpdates.apply(async()=>{if(storageError||!validData(data))throw Error('storage');localStorage.setItem('sphere-tap-v1',JSON.stringify(data));})}><RefreshCw size={16} className={state.applying?'is-spinning':''}/>{state.applying?'Atualizando…':'Atualizar'}</button></footer>
  </div></article></Dialog>;
}
