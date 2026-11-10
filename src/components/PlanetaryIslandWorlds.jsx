import React,{useEffect,useMemo,useRef,useState} from 'react';
import {ChevronLeft,ChevronRight,Lock,CalendarDays,Sparkles} from 'lucide-react';
import IslandNode from '../IslandNode.jsx';
import JourneyPlanet from '../JourneyPlanet.jsx';
import {worldsForProgress} from './planetaryWorlds.js';
import './planetaryWorlds.css';

function project(levels){
  const values=levels.map(level=>({level,isoX:level.coords.x-level.coords.y,isoY:level.coords.x+level.coords.y}));
  const minX=Math.min(...values.map(p=>p.isoX)),maxX=Math.max(...values.map(p=>p.isoX));
  const minY=Math.min(...values.map(p=>p.isoY)),maxY=Math.max(...values.map(p=>p.isoY));
  const width=Math.max(390,(maxX-minX)*88+240),height=Math.max(390,(maxY-minY)*43+220);
  return {width,height,points:values.map(p=>({...p,x:120+(p.isoX-minX)*88,y:90+(p.isoY-minY)*43}))};
}
function dateLabel(value){if(!value)return 'Aguardando';const [y,m,d]=value.split('-');return d&&m?d+'/'+m:value;}

export default function PlanetaryIslandWorlds({done,level,playable,loading,scheduledDateFor,onSelect,onBegin}){
  const worlds=useMemo(()=>worldsForProgress({done,level,playable,scheduledDateFor}),[done,level,playable,scheduledDateFor]);
  const initial=Math.max(0,worlds.findIndex(world=>level>=world.levels[0].id&&level<=world.levels.at(-1).id));
  const [planetIndex,setPlanetIndex]=useState(initial);
  const [preview,setPreview]=useState(null);
  const scrollRef=useRef(null),mapRef=useRef(null);
  useEffect(()=>{setPlanetIndex(initial);setPreview(null)},[initial]);
  const planet=worlds[planetIndex],layout=useMemo(()=>project(planet.levels),[planet]);
  const positioned=layout.points;
  const pointById=new Map(positioned.map(point=>[point.level.id,point]));
  const edges=positioned.slice(1).map((point,index)=>({from:positioned[index],to:point,lit:point.level.status!=='locked'}));
  function move(direction){setPreview(null);setPlanetIndex(index=>Math.max(0,Math.min(worlds.length-1,index+direction)));scrollRef.current?.scrollTo({left:0,top:0,behavior:'smooth'});}
  function inspect(item){setPreview(item);if(item.status==='active')onSelect(item.id);}
  useEffect(()=>{if(!preview||!scrollRef.current||!mapRef.current)return;const point=pointById.get(preview.id);if(!point)return;const box=scrollRef.current;box.scrollTo({left:Math.max(0,point.x-box.clientWidth/2),top:Math.max(0,point.y-box.clientHeight/2),behavior:'smooth'});},[preview,planetIndex]);
  const active=planet.levels.find(item=>item.status==='active');
  return <section className="planetary-worlds" style={{'--planet-background':planet.backgroundGradient}} aria-label="Mapas planetários da Jornada">
    <div className="planetary-worlds-heading">
      <div><span className="planetary-kicker">MAPA DA JORNADA</span><h2>{planet.name}</h2><p>{planet.levels.filter(item=>item.status==='completed').length} de {planet.levels.length} etapas deste mundo concluídas</p></div>
      <div className="planetary-world-count">{String(planetIndex+1).padStart(2,'0')} <i>/ {String(worlds.length).padStart(2,'0')}</i></div>
    </div>
    <div className="planetary-map-shell">
      <button className="planetary-arrow planetary-arrow-left" onClick={()=>move(-1)} disabled={planetIndex===0} aria-label="Planeta anterior"><ChevronLeft size={20}/></button>
      <div className="planetary-map-scroll" ref={scrollRef} key={planet.id}>
        <div className="planetary-map-canvas" ref={mapRef} style={{width:layout.width,height:layout.height}}>
          <div className="planetary-stars" aria-hidden="true"/>
          <svg className="planetary-connections" viewBox={`0 0 ${layout.width} ${layout.height}`} aria-hidden="true">
            {edges.map((edge,index)=><line key={edge.to.level.id} x1={edge.from.x} y1={edge.from.y} x2={edge.to.x} y2={edge.to.y} className={edge.lit?'is-lit':''} style={{'--line-delay':index*110+'ms'}}/>)}
          </svg>
          {positioned.map(({level:item,x,y},index)=>{
            const visible=item.status!=='locked',isActive=item.status==='active',isSelected=preview?.id===item.id;
            return <div key={item.id} className={`planetary-level ${item.status}${isSelected?' is-selected':''}`} style={{left:x,top:y,'--float-delay':index*-.73+'s','--node-index':index}}>
              {visible?<IslandNode inspectable onInspect={()=>inspect(item)} aria-label={`Dia ${item.dayNumber}: ${item.title}, ${item.status==='completed'?'concluído':'disponível'}`} aria-expanded={isSelected} className={`journey-node ${item.status==='completed'?'complete':'current'} planetary-island`} onActivate={()=>inspect(item)}><JourneyPlanet level={item.id} scheduledDate={item.date||undefined} reveal={isActive}/></IslandNode>:<div className="planetary-locked" aria-label={`Dia ${item.dayNumber}, bloqueado`}><Lock size={17}/></div>}
              <div className="planetary-level-caption"><b>Dia {item.dayNumber}</b><span>{item.title}</span><small>{dateLabel(item.date)}</small></div>
            </div>;
          })}
          <div className="planetary-map-origin"><Sparkles size={13}/> PORTAL DE CHEGADA</div>
        </div>
      </div>
      <button className="planetary-arrow planetary-arrow-right" onClick={()=>move(1)} disabled={planetIndex===worlds.length-1} aria-label="Próximo planeta"><ChevronRight size={20}/></button>
    </div>
    <div className="planetary-pagination" aria-label="Selecionar planeta">{worlds.map((world,index)=><button key={world.id} aria-label={world.name} aria-current={planetIndex===index?'page':undefined} className={planetIndex===index?'is-current':''} onClick={()=>move(index-planetIndex)}/>)}</div>
    {preview&&<aside className="planetary-preview" aria-live="polite">
      <div className="planetary-preview-art"><JourneyPlanet level={preview.id} scheduledDate={preview.date||undefined}/></div>
      <div className="planetary-preview-copy"><span>{preview.status==='completed'?'ETAPA CONCLUÍDA':preview.status==='active'?'PRÓXIMA ETAPA':'ETAPA BLOQUEADA'}</span><h3>Dia {preview.dayNumber} · {preview.title}</h3><p><CalendarDays size={13}/>{dateLabel(preview.date)}</p></div>
      {preview.status==='active'?<button className="planetary-enter" disabled={loading} onClick={()=>onBegin(preview.id)}>{loading?'Preparando…':`Entrar no dia ${preview.dayNumber}`}</button>:<button className="planetary-enter is-muted" onClick={()=>setPreview(null)}>{preview.status==='completed'?'Concluído':'Em breve'}</button>}
      <button className="planetary-preview-close" aria-label="Fechar prévia" onClick={()=>setPreview(null)}>×</button>
    </aside>}
    {!preview&&active&&<p className="planetary-map-hint">Explore as ilhas e selecione a próxima etapa para continuar.</p>}
  </section>;
}
