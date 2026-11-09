import {mixDailyTopics} from './quizTopics.js';
// Calendar days use local midnight, including across daylight-saving changes.
export function localDate(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`}
export function validDate(value){if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const d=new Date(value+'T12:00:00');return !Number.isNaN(+d)&&localDate(d)===value}
export function availableDailyLevel(start,now=new Date()){if(!validDate(start))return 1;const [y,m,d]=start.split('-').map(Number);return Math.max(1,Math.floor((Date.UTC(now.getFullYear(),now.getMonth(),now.getDate())-Date.UTC(y,m-1,d))/86400000)+1)}
export function enrollDaily(data,now=new Date()){if(validDate(data.personalStart))return data;const start=new Date(now);start.setDate(start.getDate()-(data.personal||0));return {...data,personalStart:localDate(start)}}
export function dailyStatus(data,now=new Date()){const enrolled=enrollDaily(data,now),today=localDate(now),available=availableDailyLevel(enrolled.personalStart,now);return {available,canPlay:data.personal<available&&(!data.personalLastDate||data.personalLastDate<today),today}}
export const dailyThemes=[
 {title:'Pequenas descobertas',description:'Observe detalhes e encontre padrões no cotidiano.'},
 {title:'Uma cidade de possibilidades',description:'Planeje caminhos, horários e pequenas escolhas.'},
 {title:'O valor das escolhas',description:'Investigue preços, trocos e decisões do dia a dia.'},
 {title:'Olhar com calma',description:'Descubra histórias e curiosidades em diferentes temas.'},
 {title:'Conexões inesperadas',description:'Explore conexões entre arte, ciência e cultura.'},
 {title:'Tempo para descobrir',description:'Resolva enigmas de tempo e organização.'},
 {title:'Um novo horizonte',description:'Reúna as pistas em uma edição com desafios misturados.'}
];
export function dailyEdition(level){return {...dailyThemes[(level-1)%dailyThemes.length],number:level,chapters:['Observar','Conectar','Planejar','Investigar','Revelar']}}
export const weeklyColors=['#c4b5fd','#dfb376','#99dbb5','#f0cd8b','#f2a6bd','#c5b79a','#d3b48b'];
export function dailyLevelDate(data,level,now=new Date()){const start=enrollDaily(data,now).personalStart;const date=new Date(start+'T12:00:00');date.setDate(date.getDate()+level-1);return localDate(date)}
export function weeklyColor(level){return weeklyColors[Math.floor((level-1)/7)%weeklyColors.length]}
export const PERSONAL_QUESTIONS=30;
export function personalQuestions(level,{difficultyLevel=level,history=[],golden=false}={}){
 const edition=dailyEdition(level),items=[];
 const rng=(()=>{let s=(Math.imul(level,2654435761)^Math.imul(difficultyLevel,97)^(golden?0x6a09e667:0))>>>0;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296}})();
 const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
 // Only two slots retain practical arithmetic; all other slots receive topic questions.
 for(let i=0;i<PERSONAL_QUESTIONS;i++){
  const a=3+Math.floor(rng()*40),b=2+Math.floor(rng()*9);let prompt,options,explanation,category;
  if(i%2===0){const total=a*b;prompt=`Você compra ${b} itens de R$ ${a} e paga R$ ${total+a}. Qual é o troco?`;options=[a,a+b,a+2*b,a+3*b].map(n=>`R$ ${n}`);explanation=`A compra custa R$ ${total}. O troco é R$ ${a}.`;category='Escolhas e orçamento'}
  else{const hour=7+Math.floor(rng()*12),start=hour*60+5*b,duration=a+15,finish=start+duration,fmt=n=>`${Math.floor(n/60)}h${String(n%60).padStart(2,'0')}`;prompt=`Um passeio começa às ${fmt(start)} e dura ${duration} minutos. Quando termina?`;options=[finish,finish+10,finish-10,finish+30].map(fmt);explanation=`Somando ${duration} minutos ao início, chegamos às ${fmt(finish)}.`;category='Tempo e caminhos'}
  const right=options[0],shuffled=shuffle(options);items.push({id:`personal-${level}-${i}`,prompt,options:shuffled,correct:shuffled.indexOf(right),explanation,category,phase:golden?['Descobertas douradas','Conexões','Explorar','Investigar','Celebração'][Math.floor(i/6)]:edition.chapters[Math.floor(i/6)],phaseIndex:Math.floor(i/6),source:null,sourceName:'Desafio prático autoral'});
 }
 return mixDailyTopics(items,level,shuffle,{history,difficultyLevel,golden});
}

