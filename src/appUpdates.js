// Sphere's lifecycle adapted to Workbox: user decides when the waiting worker takes over.
export function createUpdateManager(env){
 let registration,pending,applying=false,timer,checking=false,error='',message='',disposed=false,reloadRequested=false,lastCheck=0;
 const listeners=new Set(),cleanups=[];
 let snapshot={pending:null,applying:false,checking:false,error:'',message:''};
 const emit=()=>{snapshot={pending,applying,checking,error,message};listeners.forEach(fn=>fn())};
 const fail=()=>{reloadRequested=false;applying=false;error='Não foi possível atualizar agora. Tente novamente.';emit()};
 async function offer(worker){
  if(!worker||pending?.worker===worker||!env.serviceWorker.controller)return;
  let release;
  try{release=await env.identify(worker)}catch{}
  if(disposed||(registration?.waiting!==worker&&registration?.active!==worker))return;
  if(registration.waiting!==worker&&(!release?.build||release.build===env.build))return;
  const id=release?.build||worker.scriptURL;
  pending={worker,release,id,dismissed:env.dismissed?.()===id};error='';message='';emit();
 }
 const inspect=()=>void offer(registration?.waiting||registration?.active);
 function watch(){const worker=registration?.installing;if(!worker)return;const changed=()=>{if(worker.state==='installed')inspect()};worker.addEventListener('statechange',changed);cleanups.push(()=>worker.removeEventListener('statechange',changed));}
 async function check(manual=false){
  if(checking)return;
  if(!env.online()){if(manual){error='Conecte-se à internet para buscar atualizações.';emit()}return}
  if(!registration){if(manual){error='Atualização indisponível neste momento. Tente novamente.';emit()}return}
  if(!manual&&env.now()-lastCheck<60000)return;
  lastCheck=env.now();checking=true;error='';message='';emit();
  try{await registration.update();await offer(registration.waiting||registration.active);if(manual){if(pending){pending={...pending,dismissed:false}}else message=registration.installing?'Baixando a atualização…':'Nenhuma atualização disponível.'}}
  catch{if(manual)error='Não foi possível verificar. Tente novamente quando estiver online.'}
  finally{checking=false;emit()}
 }
 async function start(url,scope){
  if(!env.serviceWorker)return;
  const changed=()=>{if(reloadRequested){reloadRequested=false;env.clearTimeout(timer);env.reload() }else inspect()};
  env.serviceWorker.addEventListener('controllerchange',changed);cleanups.push(()=>env.serviceWorker.removeEventListener('controllerchange',changed));
  try{registration=await env.serviceWorker.register(url,{scope,updateViaCache:'none'});if(disposed)return;registration.addEventListener('updatefound',watch);cleanups.push(()=>registration.removeEventListener('updatefound',watch));watch();inspect();await check();}
  catch{error='Não foi possível preparar a atualização. Tente novamente.';emit()}
 }
 return {
  getSnapshot:()=>snapshot,subscribe:fn=>{listeners.add(fn);return()=>listeners.delete(fn)},start,check,
  dismiss(){if(!pending||applying)return;pending={...pending,dismissed:true};env.remember?.(pending.id);emit()},
  reopen(){if(pending){pending={...pending,dismissed:false};emit()}else return check(true)},
  async apply(prepare){if(!pending||applying)return;applying=true;error='';emit();try{await prepare();reloadRequested=true;timer=env.setTimeout(fail,20000);if(pending.worker.state==='activated'){reloadRequested=false;env.clearTimeout(timer);env.reload()}else pending.worker.postMessage({type:'SKIP_WAITING'});}catch{env.clearTimeout(timer);fail()}},
  stop(){disposed=true;env.clearTimeout(timer);cleanups.forEach(fn=>fn())},
 };
}
export function identifyWorker(worker){return new Promise(resolve=>{
 const channel=new MessageChannel(),timeout=setTimeout(()=>{channel.port1.close();resolve(undefined)},1200);
 channel.port1.onmessage=e=>{clearTimeout(timeout);channel.port1.close();resolve(e.data?.build?e.data:undefined)};
 try{worker.postMessage('SPHERE_UPDATE_INFO',[channel.port2])}catch{clearTimeout(timeout);channel.port1.close();resolve(undefined)}
})}
const dismissalKey='sphere-tap-update-dismissed';
export const appUpdates=createUpdateManager({
 build:typeof __TAP_RELEASE__!=='undefined'?__TAP_RELEASE__.build:undefined,
 serviceWorker:typeof navigator!=='undefined'?navigator.serviceWorker:undefined,
 online:()=>navigator.onLine,now:()=>Date.now(),identify:identifyWorker,
 setTimeout:(fn,ms)=>setTimeout(fn,ms),clearTimeout:id=>clearTimeout(id),reload:()=>window.location.reload(),
 dismissed:()=>{try{return localStorage.getItem(dismissalKey)}catch{return null}},
 remember:id=>{try{localStorage.setItem(dismissalKey,id)}catch{}},
});
