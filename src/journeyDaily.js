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
 {title:'Olhar com calma',description:'Encontre o que mudou e complete pistas visuais.'},
 {title:'Conexões inesperadas',description:'Conecte palavras, símbolos e sequências.'},
 {title:'Tempo para descobrir',description:'Resolva enigmas de tempo e organização.'},
 {title:'Um novo horizonte',description:'Reúna as pistas em uma edição com desafios misturados.'}
];
export function dailyEdition(level){return {...dailyThemes[(level-1)%dailyThemes.length],number:level,chapters:['Observar','Conectar','Planejar','Investigar','Revelar']}}
export const weeklyColors=['#c4b5fd','#93c5fd','#99dbb5','#f0cd8b','#f2a6bd','#8ed6da','#d3b48b'];
export function dailyLevelDate(data,level,now=new Date()){const start=enrollDaily(data,now).personalStart;const date=new Date(start+'T12:00:00');date.setDate(date.getDate()+level-1);return localDate(date)}
export function weeklyColor(level){return weeklyColors[Math.floor((level-1)/7)%weeklyColors.length]}
export const PERSONAL_QUESTIONS=30;
export function personalQuestions(level,{difficultyLevel=level}={}){
 const edition=dailyEdition(level),items=[];
 const rng=(()=>{let s=(Math.imul(level,2654435761)^Math.imul(difficultyLevel,97))>>>0;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296}})();
 const symbols=['○','△','□','◇','☆','☾','♧','⬡'];
 const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
 const focus=[3,1,0,4,5,2,-1][(level-1)%7];
 const kinds=shuffle(Array.from({length:6},(_,kind)=>Array.from({length:focus<0?5:kind===focus?8:kind===(focus+1)%6?6:4},()=>kind)).flat());
 for(let i=0;i<PERSONAL_QUESTIONS;i++){
  const a=3+Math.floor(rng()*40),b=2+Math.floor(rng()*9),kind=kinds[i];let prompt,options,explanation,category;
  if(kind===0){const price=a*b,paid=price+a;prompt=`Na compra ${i+1}, ${b} itens custam R$ ${a} cada. Você paga R$ ${paid}. Qual é o troco?`;options=[a,a+b,a+2*b,a+3*b].map(n=>`R$ ${n}`);explanation=`Os itens custam R$ ${price}. R$ ${paid} − R$ ${price} = R$ ${a}.`;category='Escolhas e orçamento'}
  if(kind===1){const hour=7+Math.floor(rng()*12),minute=5*b,duration=a+15,total=hour*60+minute+duration,fmt=n=>`${Math.floor(n/60)}h${String(n%60).padStart(2,'0')}`;prompt=`Seu passeio começa às ${fmt(hour*60+minute)} e dura ${duration} minutos. Quando termina?`;options=[total,total+10,total-10,total+30].map(fmt);explanation=`Somando ${duration} minutos ao início, chegamos às ${fmt(total)}.`;category='Tempo e caminhos'}
  if(kind===2){const step=b+1;prompt=`Encontre a próxima pista: ${a} → ${a+step} → ${a+step*2} → ?`;options=[a+step*3,a+step*4,a+step*2+1,a+step*3-1].map(String);explanation=`Cada pista aumenta ${step}. A próxima é ${options[0]}.`;category='Padrões e lógica'}
  if(kind===3){const s=shuffle(symbols),row=Array.from({length:5},(_,j)=>s[(j+a)%3]),pos=b%5;prompt=`Observe a trilha ${row.join('  ')}. Qual símbolo está na posição ${pos+1}, contando da esquerda?`;options=[row[pos],...s.filter(x=>x!==row[pos]).slice(0,3)];explanation=`Contando da esquerda, o símbolo ${pos+1} é ${row[pos]}.`;category='Observação'}
  if(kind===4){const s=shuffle(symbols);prompt=`Qual símbolo completa a repetição? ${s[0]} ${s[1]} ${s[2]} · ${s[0]} ${s[1]} ?`;options=[s[2],s[0],s[1],s[3]];explanation=`O grupo ${s.slice(0,3).join(' ')} se repete na mesma ordem.`;category='Conexões visuais'}
  if(kind===5){const names=shuffle(['Lia','Caio','Bia','Rui','Iara','Nina','Davi','Noa']);prompt=`${names[0]} chegou antes de ${names[1]}. ${names[1]} chegou antes de ${names[2]}, e ${names[2]} antes de ${names[3]}. Quem chegou em segundo?`;options=[names[1],names[0],names[2],names[3]];explanation=`A ordem é ${names.slice(0,4).join(' → ')}. ${names[1]} está na segunda posição.`;category='Investigação'}
  if(items.some(q=>q.prompt===prompt)){i--;continue}
  const correct=options[0],shuffled=shuffle(options);items.push({id:`personal-${level}-${i}`,prompt,options:shuffled,correct:shuffled.indexOf(correct),explanation,category,phase:edition.chapters[Math.floor(i/6)],phaseIndex:Math.floor(i/6),source:null,sourceName:'Desafio autoral gerado localmente'});
 }
 return mixDailyTopics(items,level,shuffle);
}
