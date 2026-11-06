import React from 'react';
import {Plus,Pause,Leaf,ArrowUpRight} from 'lucide-react';
import Greeting from './Greeting';
import RollingNumber from './RollingNumber';
import {CategoryPicker,EntryList} from './ui';
import {dayKey,dayEntries,total,observation,unitLabel} from './model';
export default function Today({data,category,onCategory,onAdd,onDetails,onRoute,onDaySave,onExplain,onNewItem,pulse,now}){
 const categories=data.categories.filter(c=>c.enabled!==false),today=dayKey(now),current=categories.find(c=>c.id===category)||categories[0],entries=dayEntries(data,today),confirmed=observation(data,today).paused;
 if(!current)return <section className='today-page route-transition'><Greeting name={data.displayName} now={now}/><section className='empty-items'><h2>O que você quer acompanhar?</h2><p>Escolha um item para começar.</p><button className='button primary' onClick={onNewItem}><Plus size={17}/>Adicionar item</button></section></section>;
 const count=total(entries.filter(e=>e.category===current.id)).count,pause=data.pause&&!data.pause.endedAt;
 return <section className='today-page route-transition today-focused'>
  <section className='aura-top'>
   <Greeting name={data.displayName} now={now}/>
   <div className='aura-counter-wrap'><button className='aura-touch' data-guide='aura' onClick={onAdd} aria-label={`Registrar mais 1 ${unitLabel(current)} de ${current.name}. Hoje: ${count}.`}>
    <span className='counter-date'>HOJE · {now.toLocaleDateString('pt-BR',{day:'2-digit',month:'short'}).replace('.','')}</span>
    <span className='live-number' aria-live='polite' aria-atomic='true'><span className='sr-only'>{count}</span><RollingNumber value={count} pulse={pulse}/></span>
    <span className='counter-unit'>{current.name} · {({session:'sessões',package:'pacotes',gram:'gramas',item:'unidades'})[current.unit]||'unidades'} hoje</span>
    <span className='tap-hint'><Plus size={13}/>Registrar o que já consumiu</span>
   </button></div>
   <div className='aura-controls'><CategoryPicker categories={categories} value={current.id} onChange={onCategory} onAdd={onNewItem}/><button className='quiet-button detail-link' data-guide='details' onClick={()=>onDetails()}>Detalhes<ArrowUpRight size={13}/></button></div>
  </section>
  <div className='today-care-actions'><button className='button secondary' onClick={()=>onRoute('Cuidado')}><Pause size={15}/>{pause?'Minha pausa':'Fazer uma pausa'}</button>{!entries.length&&<button className='quiet-button' onClick={()=>onDaySave(today,{...data.days[today],confirmed:!confirmed})}><Leaf size={15}/>{confirmed?'Pausa confirmada · desfazer':'Confirmar dia sem consumo'}</button>}</div>
  <details className='compact-explanation today-records'><summary>Registros de hoje <span>{entries.length}</span></summary><EntryList entries={entries} data={data} onEdit={onDetails} pageSize={5} paginationKey={today}/></details>
 </section>;
}
