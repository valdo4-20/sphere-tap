import {countries} from './quizGeography.js';
import {editorialQuestions} from './quizEditorial.js';
export const QUESTIONS_PER_LEVEL=20;
export const INITIAL_LEVEL_CAPACITY=10000; // Internal capacity, never an end marker in the interface.
export function localDate(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`}
export function availableDailyLevel(start,now=new Date()){const [y,m,d]=start.split('-').map(Number);return Math.max(1,Math.floor((Date.UTC(now.getFullYear(),now.getMonth(),now.getDate())-Date.UTC(y,m-1,d))/86400000)+1)}
export function difficultyFor(level){const n=Math.max(1,Number(level)||1);return n<=10?{tier:1,name:'Leve'}:n<=35?{tier:2,name:'Curioso'}:n<=100?{tier:3,name:'Desafiador'}:{tier:4,name:'Profundo'}}
export function personalDifficulty(roleCompleted){return difficultyFor(Math.max(0,roleCompleted)+1)}
function random(seed){let state=(seed>>>0)||1;return()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)/4294967296}}
function shuffle(array,rng){const a=[...array];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
const countryOf=(name)=>name==='Portugal'?'de Portugal':name==='Estados Unidos'?'dos Estados Unidos':['Brasil','Reino Unido','Canadá','Chile','Equador','Peru','México','Japão','Egito','Sudão'].includes(name)?`do ${name}`:`da ${name}`;
const geography=countries.flatMap((c,i)=>{
 const wrong=countries.filter(x=>x.capital!==c.capital);const options=[c.capital,...[0,7,14].map(n=>wrong[(i+n)%wrong.length].capital)];
 return [{id:`capital-${c.id}`,category:'Mundo',difficulty:i<12?1:i<22?2:3,prompt:`Qual é a capital ${countryOf(c.country)}?`,options,correct:0,explanation:`${c.capital} é a capital ${countryOf(c.country)}.`,source:c.source,sourceName:'Wikidata · CC0'},
 {id:`country-${c.id}`,category:'Mundo',difficulty:i<12?2:3,prompt:`${c.capital} é a capital de qual país?`,options:[c.country,...[0,7,14].map(n=>wrong[(i+n)%wrong.length].country)],correct:0,explanation:`${c.capital} é a capital ${countryOf(c.country)}.`,source:c.source,sourceName:'Wikidata · CC0'}]
});
export const questionBank=[...editorialQuestions,...geography];
function numericQuestion(level,tier,index,rng){
 const limit=[0,18,70,180,450][tier],a=2+Math.floor(rng()*limit),b=2+Math.floor(rng()*Math.min(limit,25)),kind=(level+index)%6;let answer,prompt,explanation;
 if(kind===0){answer=a+b;prompt=`Quanto é ${a} + ${b}?`;explanation=`${a} + ${b} = ${answer}.`}
 else if(kind===1){answer=a;prompt=`Qual número completa ${b} + ? = ${a+b}?`;explanation=`Basta subtrair: ${a+b} − ${b} = ${a}.`}
 else if(kind===2){answer=a*b;prompt=`Um conjunto tem ${a} peças. Quantas peças há em ${b} conjuntos iguais?`;explanation=`Multiplicando ${a} por ${b}, temos ${answer} peças.`}
 else if(kind===3){const step=tier+2+index;answer=a+step*3;prompt=`Qual número vem a seguir: ${a}, ${a+step}, ${a+2*step}, …?`;explanation=`Somamos ${step} a cada passo. O próximo é ${answer}.`}
 else if(kind===4){answer=(a+b)*2;prompt=`Um retângulo mede ${a} cm por ${b} cm. Qual é seu perímetro?`;explanation=`São dois lados de cada medida: 2 × (${a} + ${b}) = ${answer} cm.`}
 else {answer=a;prompt=`Quanto é ${a*b} ÷ ${b}?`;explanation=`Como ${a} × ${b} = ${a*b}, a divisão resulta em ${a}.`}
 const offsets=shuffle([1,2,3,5,7,11],rng).slice(0,3);return {id:`number-${level}-${index}-${a}-${b}-${kind}`,category:'Lógica e números',difficulty:tier,prompt,options:[answer,...offsets.map((x,i)=>answer+x*(i%2?-1:1))].map(String),correct:0,explanation,source:null,sourceName:'Desafio gerado localmente'};
}
export function questionPlan(difficultyLevel){
 const base=difficultyFor(difficultyLevel).tier;
 return [{name:'Aquecimento',count:5,facts:3,tier:Math.max(1,base-1)},
 {name:'Exploração',count:10,facts:6,tier:Math.min(4,base+1)},
 {name:'Desafio final',count:5,facts:3,tier:Math.min(4,base+2)}];
}
export function questionsFor(level,{difficultyLevel=level,mode='role',round=level}={}){
 if(!Number.isSafeInteger(level)||level<1)throw new RangeError('Nível inválido');
 const rng=random((level*2654435761+round*97+(mode==='personal'?1234567:0))>>>0),used=new Set(),items=[],categoryCounts=new Map();
 for(const [phaseIndex,phase] of questionPlan(difficultyLevel).entries()){
  const available=questionBank.filter(q=>q.difficulty<=phase.tier&&!used.has(q.prompt));
  const preferred=shuffle(available.filter(q=>q.difficulty>=Math.max(1,phase.tier-1)),rng);
  const candidates=[...preferred,...shuffle(available.filter(q=>!preferred.includes(q)),rng)],selected=[];
  for(let i=0;i<phase.facts;i++){candidates.sort((a,b)=>(categoryCounts.get(a.category)||0)-(categoryCounts.get(b.category)||0));const q=candidates.shift();if(!q)break;selected.push(q);categoryCounts.set(q.category,(categoryCounts.get(q.category)||0)+1)}
  for(const q of selected){used.add(q.prompt);items.push({...q,phase:phase.name,phaseIndex})}
  for(let i=phase.facts;i<phase.count;i++){
   let q;do{q=numericQuestion(level,phase.tier,items.length,rng)}while(used.has(q.prompt));
   used.add(q.prompt);items.push({...q,phase:phase.name,phaseIndex});
  }
 }
 return items.map(q=>{const indexed=shuffle(q.options.map((text,i)=>({text,correct:i===q.correct})),rng);return {...q,options:indexed.map(x=>x.text),correct:indexed.findIndex(x=>x.correct)}})
}
export {starsFor,visibleLevels,migrateJourney,completeJourney,starRanks,starRankFor,earnedXP,playerProgress,validJourney} from './journeyProgression.js';
