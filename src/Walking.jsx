import React,{useState} from 'react';
import {ArrowLeft,Footprints,Pause,Play,Square,Trash2,LocateFixed,SlidersHorizontal,Map,Timer,Route,Activity} from 'lucide-react';
import WalkingMap from './WalkingMap';
import {routeDistance,walkingDistance,walkingTime,walkingPace} from './walking';
export default function Walking({data,tracker,onBack,onDelete,color,onFigure}){
 const [view,setView]=useState(null),[liveMode,setLiveMode]=useState(false),[mode,setMode]=useState('route'),[stride,setStride]=useState(.75),[page,setPage]=useState(0),[removing,setRemoving]=useState(false),[recenter,setRecenter]=useState(0),[personalize,setPersonalize]=useState(false);
 const figures={neutral:{name:"Neutra",src:"./artwork/walking-neutral.png"},feminine:{name:"Feminina",src:"./artwork/walking-feminine.png"},masculine:{name:"Masculina",src:"./artwork/walking-silhouette.png"},none:{name:"Sem figura"}};
 const figure=data.appearance?.walkingFigure||"neutral";
 const session=tracker.session,walk=session||view,points=walk?.points||[],meters=routeDistance(points),seconds=session?tracker.seconds:walk?.seconds||0;
 const live=session&&liveMode,steps=walk?Math.round(meters/walk.stride):0;
 const entries=data.entries.filter(e=>e.location&&(!walk||e.location.walkId===walk.id));
 const saved=[...(data.walks||[])].sort((a,b)=>b.startedAt-a.startedAt),pages=Math.max(1,Math.ceil(saved.length/5)),index=Math.min(page,pages-1);
 if(live)return <section className='walking-live route-transition' style={{'--walk-color':color}}>
  <div className='walking-live-aura' aria-hidden='true'/>
  <header className='walking-live-header'><span className={'walking-live-indicator '+(session.running?'is-running':'')}/><span>{session.running?'CAMINHADA EM ANDAMENTO':'CAMINHADA PAUSADA'}</span><button className='quiet-button' onClick={()=>setLiveMode(false)}><Map size={15}/>Ver percurso</button></header>
  <div className='walking-live-clock'><Timer size={17}/><span>{walkingTime(seconds)}</span><small>TEMPO ATIVO</small></div>
  <div className='walking-live-stats'>
   <div><Route size={17}/><b>{walkingDistance(meters)}</b><small>distância</small></div>
   <div><Footprints size={17}/><b>{steps.toLocaleString('pt-BR')}</b><small>passos estimados</small></div>
   <div><Activity size={17}/><b>{walkingPace(meters,seconds)}</b><small>ritmo médio</small></div>
  </div>
  <p className='walking-live-gps' role='status'>{tracker.error|| (tracker.position?`GPS · precisão aproximada ±${Math.round(tracker.position.accuracy)} m`:'Aguardando sinal de GPS')}</p>
  <div className='walking-live-actions'>
   <button className='button secondary' onClick={()=>session.running?tracker.pause():(tracker.start(),setLiveMode(true))}>{session.running?<Pause size={17}/>:<Play size={17}/>} {session.running?'Pausar':'Retomar'}</button>
   <button className='button primary' onClick={()=>{setView(tracker.finish());setLiveMode(false)}}><Square size={15}/>Finalizar</button>
  </div>
 </section>;
 return <section className='walking-page walking-immersive route-transition'><div className='walking-atmosphere' aria-hidden='true'>{figures[figure]?.src&&<img key={figure} src={figures[figure].src} alt=''/>}</div><button className='quiet-button' onClick={onBack}><ArrowLeft size={16}/>Voltar</button><div className='section-heading'><h1>{session?'Seu tempo ao ar livre.':view?'Caminhada concluída.':'Um espaço para caminhar.'}</h1><button className="icon-button" aria-label="Personalizar caminhada" aria-expanded={personalize} onClick={()=>setPersonalize(v=>!v)}><SlidersHorizontal size={19}/></button></div>{personalize&&<div className="walking-figure-choices" aria-label="Escolher silhueta">{Object.entries(figures).map(([id,f])=><button key={id} className="figure-choice" aria-pressed={figure===id} onClick={()=>{onFigure?.(id);setPersonalize(false)}}>{f.src?<img src={f.src} alt="" loading="lazy"/>:<span>—</span>}<small>{f.name}</small></button>)}</div>}
 <div className='walking-start-bar'>{!session&&<button className='button primary walk-start-prominent' onClick={()=>{setView(null);tracker.start(stride);setLiveMode(true)}}><Footprints size={20}/>Iniciar caminhada</button>}<button className='button secondary' disabled={tracker.locating} onClick={async()=>{setView(null);if(await tracker.locate())setRecenter(v=>v+1)}}><LocateFixed size={17}/>{tracker.locating?'Localizando…':'Minha localização'}</button></div>
 {tracker.error&&<p role='status' className='field-help walking-gps-status'>{tracker.error}</p>}
 {tracker.position&&!tracker.error&&<p className='field-help walking-gps-status'>{session?.running?'Caminhada em andamento':'Sua posição no mapa'} · precisão aproximada ±{Math.round(tracker.position.accuracy)} m</p>}
 <section className='walking-glass-card'><WalkingMap key={walk?.id||"current-location"} position={view?null:tracker.position} live={!!session?.running} recenter={recenter} points={points} entries={entries} mode={mode} color={color}/>
 <details className='compact-explanation map-layer-options'><summary>Camadas do mapa</summary><div className='segmented map-modes'>{[['route','Percurso AURA'],['points','Pontos'],['heat','Calor']].map(([id,label])=><button key={id} aria-pressed={mode===id} className={mode===id?'active':''} onClick={()=>setMode(id)}>{label}</button>)}</div>
 <small className='field-help'>{mode==='heat'?'Densidade de locais de consumo registrados. Não indica saúde, segurança ou temperatura.':mode==='points'?'Locais aproximados dos registros feitos durante a caminhada.':'A AURA acompanha somente os trechos registrados pelo GPS.'}</small>
 </details>
 {walk&&<div className='walk-summary'><div><b>{walkingDistance(meters)}</b><small>distância GPS</small></div><div><b>{walkingTime(seconds)}</b><small>tempo ativo</small></div><div><b>{Math.round(meters/walk.stride).toLocaleString('pt-BR')}</b><small>passos estimados</small></div><div><b>{walkingPace(meters,seconds)}</b><small>ritmo médio</small></div></div>}
 </section>
 <div className='walking-actions'>{session?<><button className='button secondary' onClick={()=>session.running?tracker.pause():(tracker.start(),setLiveMode(true))}>{session.running?<Pause size={16}/>:<Play size={16}/>} {session.running?'Pausar':'Retomar'}</button><button className='button primary' onClick={()=>{setView(tracker.finish());setLiveMode(false)}}><Square size={15}/>Finalizar</button></>:null}</div>
 {!session&&<details className='compact-explanation'><summary>GPS e calibragem</summary><label>Comprimento médio do seu passo (metros)<input type='number' min='.3' max='1.5' step='.01' value={stride} onChange={e=>setStride(Math.min(1.5,Math.max(.3,Number(e.target.value)||.75)))}/></label><p>Para calibrar, divida uma distância conhecida pelos passos contados. Os passos aqui são calculados pela distância, não medidos por um pedômetro. GPS impreciso e deslocamentos acima de 3 m/s são descartados.</p></details>}
 <details className='compact-explanation'><summary>Privacidade e uso</summary><p>O percurso fica neste navegador e no seu backup. O mapa usa OpenStreetMap; carregar ruas informa ao provedor a região visualizada. O GPS só é solicitado ao tocar em Minha localização ou Iniciar caminhada. Tela oculta pausa o registro; não há rastreamento garantido em segundo plano.</p><p>O +1 apenas registra o consumo já ocorrido na sua posição recente, sem prêmio. Medalhas de caminhada dependem do percurso, nunca de consumir.</p></details>
 {view&&!session&&<><p className='field-help'>Salva em {new Date(view.endedAt).toLocaleString('pt-BR')}. Trechos sem sinal não são inventados.</p><button className='quiet-button' onClick={()=>setRemoving(true)}><Trash2 size={15}/>Apagar esta caminhada</button>{removing&&<div className='row'><span>Apagar também os locais associados? O consumo permanece.</span><button className='button secondary' onClick={()=>{onDelete(view.id);setView(null);setRemoving(false)}}>Apagar</button><button className='quiet-button' onClick={()=>setRemoving(false)}>Cancelar</button></div>}</>}
 {!!saved.length&&<details className='walk-history compact-explanation'><summary>Caminhadas anteriores · {saved.length}</summary>{saved.slice(index*5,index*5+5).map(w=><button className='entry-row' key={w.id} onClick={()=>{if(!session){setView(w);setRemoving(false)}}} disabled={!!session}><span>{new Date(w.startedAt).toLocaleDateString('pt-BR')}</span><span>{walkingDistance(routeDistance(w.points))} · {walkingTime(w.seconds)}</span></button>)}{pages>1&&<div className='entry-pagination'><button className='quiet-button' disabled={!index} onClick={()=>setPage(index-1)}>Anterior</button><small>{index+1} / {pages}</small><button className='quiet-button' disabled={index===pages-1} onClick={()=>setPage(index+1)}>Próxima</button></div>}</details>}
 </section>;
}
