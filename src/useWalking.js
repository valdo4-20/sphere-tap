import {useEffect,useRef,useState} from 'react';
import {uid} from './model';
import {acceptPoint,validPoint,validWalk} from './walking';
const KEY='sphere-tap-active-walk';
export default function useWalking(onSave){
 const [session,setSession]=useState(()=>{try{const s=JSON.parse(localStorage.getItem(KEY));return s&&validWalk({...s,endedAt:Date.now()})&&Number.isInteger(s.segment)&&s.segment>=0?{...s,running:false,segment:(s.segment||0)+1}:null}catch{return null}}),[error,setError]=useState(''),[clock,setClock]=useState(Date.now()),[position,setPosition]=useState(null),[locating,setLocating]=useState(false);
 const ref=useRef(session),watch=useRef(null),started=useRef(0),save=useRef(onSave);ref.current=session;save.current=onSave;
 useEffect(()=>{try{session?localStorage.setItem(KEY,JSON.stringify(session)):localStorage.removeItem(KEY)}catch{setError('Não foi possível guardar o percurso. Finalize e exporte um backup.')}},[session]);
 function stopWatch(){if(watch.current!=null)navigator.geolocation.clearWatch(watch.current);watch.current=null;}
 function pause(){stopWatch();setSession(s=>s?.running?{...s,running:false,seconds:s.seconds+(Date.now()-started.current)/1000,segment:s.segment+1}:s);}
 useEffect(()=>{const hide=()=>{if(document.hidden&&ref.current?.running){pause();setError('Caminhada pausada com a tela oculta. Retome quando estiver pronto.')}};document.addEventListener('visibilitychange',hide);const t=setInterval(()=>{if(ref.current?.running)setClock(Date.now())},1000);return()=>{clearInterval(t);stopWatch();document.removeEventListener('visibilitychange',hide)}},[]);
 function locate(){
  if(!isSecureContext||!navigator.geolocation){setError('A localização precisa de HTTPS ou localhost.');return Promise.resolve(false)}
  setLocating(true);setError('');return new Promise(resolve=>navigator.geolocation.getCurrentPosition(pos=>{const p={latitude:pos.coords.latitude,longitude:pos.coords.longitude,accuracy:pos.coords.accuracy,timestamp:pos.timestamp};setLocating(false);setPosition(p);resolve(true)},e=>{setLocating(false);setError(e.code===1?'Localização não autorizada. Libere o GPS no navegador para ver sua posição.':'Não foi possível localizar você. Verifique o sinal de GPS.');resolve(false)},{enableHighAccuracy:true,maximumAge:10000,timeout:15000}));
 }
 function start(stride=.75){
  if(!isSecureContext||!navigator.geolocation){setError('O GPS precisa de HTTPS ou localhost. Abra a versão HTTPS no celular.');return;}
  if(ref.current?.running)return;
  setError('Buscando sinal de GPS…');started.current=Date.now();
  setSession(s=>s?{...s,running:true}:{id:uid(),startedAt:Date.now(),seconds:0,stride,points:[],segment:0,running:true});
  watch.current=navigator.geolocation.watchPosition(pos=>{const p={latitude:pos.coords.latitude,longitude:pos.coords.longitude,accuracy:pos.coords.accuracy,timestamp:pos.timestamp};setPosition(p);if(!validPoint(p)){setError('Sinal impreciso. Aguardando GPS melhor.');return}setError('');setSession(s=>{if(!s?.running)return s;const last=s.points.at(-1);p.segment=s.segment;if(last&&p.timestamp-last.timestamp>30000)p.segment=s.segment+1;if(!acceptPoint(last?.segment===p.segment?last:null,p))return s;if(s.points.length>=15000){setError('Limite deste percurso atingido. Finalize a caminhada.');return s}return {...s,segment:p.segment,points:[...s.points,p]}})},e=>{setError(e.code===1?'Localização não autorizada. Você pode liberar o GPS no navegador.':'GPS indisponível. Tente ao ar livre.');if(e.code===1)pause()},{enableHighAccuracy:true,maximumAge:0,timeout:15000});
 }
 function finish(){const s=ref.current;if(!s)return null;stopWatch();const done={...s,endedAt:Date.now(),seconds:s.seconds+(s.running?(Date.now()-started.current)/1000:0),running:false};delete done.running;save.current(done);setSession(null);setError('');return done;}
 function discard(){stopWatch();setSession(null);setError("");try{localStorage.removeItem(KEY)}catch{setError("Não foi possível remover a sessão local.")}}
 function location(){const s=ref.current,p=s?.points.at(-1);return s?.running&&p&&Date.now()-p.timestamp<15000?{latitude:p.latitude,longitude:p.longitude,accuracy:p.accuracy,walkId:s.id}:undefined;}
 return {session,error,position,locating,locate,start,pause,finish,discard,location,seconds:session?session.seconds+(session.running?Math.max(0,(clock-started.current)/1000):0):0};
}
