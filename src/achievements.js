import {profileBanners} from './profileBanners.js';
import {dayKey,shiftDay,observation,validDay} from "./model.js";
const baseCatalog=[
 {id:"your-space",title:"Seu espaço",rarity:"bronze",description:"Dar um nome ao seu perfil.",group:"Seu cuidado"},
 {id:"check-in",title:"Olhar para si",rarity:"bronze",description:"Confirmar um check-in do seu dia.",group:"Seu cuidado"},
 {id:"pause-intent",title:"Uma escolha de pausa",rarity:"silver",description:"Escolher começar uma intenção de pausa. Não representa abstinência comprovada.",group:"Seu cuidado"},
 {id:"pause-1",title:"Primeiro respiro",rarity:"bronze",description:"Confirmar um dia sem consumo.",target:1,group:"Espaço para pausas"},
 {id:"pause-3",title:"Espaço para respirar",rarity:"silver",description:"Confirmar 3 dias sem consumo, em qualquer momento.",target:3,group:"Espaço para pausas"},
 {id:"pause-7",title:"Pausas que florescem",rarity:"gold",description:"Confirmar 7 dias sem consumo. Não precisam ser seguidos.",target:7,group:"Espaço para pausas"},
 {id:"pause-14",title:"Raízes de cuidado",rarity:"platinum",description:"Confirmar 14 dias sem consumo, sem exigência de sequência.",target:14,group:"Espaço para pausas"},
 {id:"pause-30",title:"Um caminho de pausas",rarity:"emerald",description:"Confirmar 30 dias sem consumo ao longo do seu histórico.",target:30,group:"Espaço para pausas"},
 {id:"less-consumption",title:"Um pouco menos",rarity:"silver",description:"Registrar menor quantidade nos mesmos dias de duas semanas, com pelo menos 3 pares acompanhados e sem aumento em outro item.",group:"Seu cuidado"},
 {id:"urge-awareness",title:"Acolher a vontade",rarity:"bronze",description:"Registrar uma vontade sem transformá-la automaticamente em consumo.",group:"Seu cuidado"},
 {id:"budget-choice",title:"Cuidado com os gastos",rarity:"silver",description:"Escolher acompanhar um orçamento pessoal.",group:"Seus dados"},
 {id:"backup",title:"Memórias protegidas",rarity:"gold",description:"Preparar um backup JSON dos seus dados. Guarde o arquivo em um lugar seguro.",group:"Seus dados"}
];

const tiers=["bronze","silver","gold","platinum","emerald","obsidian","diamond"];
const series=(prefix,values,metric,title,description,group,motif)=>values.map((target,i)=>({id:prefix+"-"+target,title:title(target),description:description(target),group,motif,target,metric,rarity:tiers[Math.min(tiers.length-1,Math.floor(i/2))]}));
const extraCatalog=[
 ...series("pause",[2,5,10,21,45,60,75,90,120,150,180,210,240,270,300,365,450,540,730],"pauses",n=>n+" dias de respiro",n=>"Confirmar "+n+" dias sem consumo ao longo do histórico. Não precisam ser seguidos.","Espaço para pausas","Leaf"),
 ...series("pause-weeks",[1,2,3,4,6,8,12,16,20,26,39,52],"pauseWeeks",n=>n+(n===1?" semana com espaço":" semanas com espaço"),n=>"Ter pelo menos uma pausa confirmada em "+n+" semanas diferentes. Sem sequência obrigatória.","Espaço para pausas","Wind"),
 ...series("pause-months",[1,2,3,4,6,9,12,18,24],"pauseMonths",n=>n+(n===1?" mês com uma pausa":" meses com pausas"),n=>"Ter pelo menos uma pausa confirmada em "+n+" meses diferentes.","Espaço para pausas","Trees"),
 ...series("monthly-pauses",[3,5,7,10,14,21],"maxMonthPauses",n=>"Um mês, "+n+" respiros",n=>"Confirmar "+n+" dias sem consumo dentro de um mesmo mês. Os dias não precisam ser seguidos.","Espaço para pausas","Flower2"),
 ...series("checkins",[3,5,7,10,14,21,30,45,60,90,120,180,365],"checkins",n=>n+" dias de atenção",n=>"Confirmar o check-in de "+n+" dias diferentes. Registrar consumo não conta como check-in.","Seu cuidado","NotebookPen"),
 ...series("notes",[1,3,5,7,10,14,21,30,45,60,90,120],"notes",n=>n+(n===1?" nota para si":" notas para si"),n=>"Escrever uma nota pessoal em "+n+" dias diferentes.","Seu cuidado","NotebookPen"),
 ...series("feelings",[1,3,5,7,10,14,21,30],"feelings",n=>n+(n===1?" dia de escuta":" dias de escuta"),n=>"Informar como se sentiu em "+n+" dias diferentes, sem classificar o sentimento como bom ou ruim.","Seu cuidado","HeartHandshake"),
 ...series("urge-days",[3,5,7,10,14,21,30,45,60,90],"urgeDays",n=>n+" dias de acolhimento",n=>"Observar uma vontade em "+n+" dias diferentes. Intensidade maior não dá vantagem; vontade não é consumo.","Seu cuidado","HeartHandshake"),
 ...series("backup-days",[2,3,5,7,10,14,21,30,60],"backupDays",n=>n+" cuidados com a memória",n=>"Preparar backups em "+n+" dias diferentes. Guarde os arquivos em local seguro.","Seus dados","ShieldCheck"),
 {id:"profile-bio",title:"Em suas palavras",description:"Escrever uma frase pessoal no perfil.",group:"Seu espaço",motif:"NotebookPen",rarity:"bronze"},
 {id:"profile-photo",title:"Seu retrato",description:"Escolher uma foto para seu perfil.",group:"Seu espaço",motif:"UserRound",rarity:"silver"},
 {id:"profile-emoji",title:"Um símbolo seu",description:"Escolher um emoji de perfil.",group:"Seu espaço",motif:"Flower2",rarity:"bronze"},
 {id:"profile-featured",title:"Sua pequena galeria",description:"Escolher três medalhas reconhecidas para destacar.",group:"Seu espaço",motif:"ShieldCheck",rarity:"gold"},
 {id:"chosen-aura",title:"Uma atmosfera sua",description:"Escolher um dos presets de AURA para seu espaço.",group:"Seu espaço",motif:"Wind",rarity:"silver"},
 {id:"gentle-reminder",title:"Um lembrete gentil",description:"Optar por um lembrete de check-in no app.",group:"Seu cuidado",motif:"Leaf",rarity:"bronze"}
];
const motifs={"your-space":"UserRound","check-in":"NotebookPen","pause-intent":"Pause","pause-1":"Leaf","pause-3":"Sprout","pause-7":"Flower2","pause-14":"Trees","pause-30":"Wind","less-consumption":"TrendingDown","urge-awareness":"HeartHandshake","budget-choice":"Wallet","backup":"ShieldCheck"};
const playCatalog=[
 ...series('quiz-streak',[3,5,10,20,30],'quizStreak',n=>n+' na mesma sintonia',n=>'Acertar '+n+' perguntas seguidas em uma rodada concluída.','Jornada · Acertos','Sparkles'),
 ...series('quiz-quick',[5,25,100],'quizQuick',n=>n+' ideias rápidas',n=>'Acertar '+n+' perguntas em até 10 segundos de leitura ativa, em rodadas concluídas.','Jornada · Ritmo','Wind'),
 ...series('quiz-perfect',[1,5,20],'quizPerfect',n=>n===1?'Sem deixar passar':n+' rodadas perfeitas',n=>'Concluir '+n+' rodada(s) com todas as respostas corretas.','Jornada · Acertos','Star'),
 ...series('quiz-fast',[1,5,20],'quizFast',n=>n===1?'No seu ritmo, com precisão':n+' rodadas ágeis',n=>'Concluir '+n+' rodada(s) com pelo menos 80% de acertos e média de até 10 segundos por pergunta. Tempo em segundo plano não conta.','Jornada · Ritmo','Wind'),
 ...series('quiz-opinions',[1,5,20],'quizOpinions',n=>n===1?'Cada voz conta':n+' conversas em cores',n=>'Concluir '+n+' Rolê(s) com escolhas dos participantes registradas.','Jornada · Rolê','Users'),
 {id:'chosen-banner',title:'Uma moldura sua',description:'Equipar um banner desbloqueado no Perfil.',group:'Seu espaço',motif:'ShieldCheck',rarity:'silver'},
 {id:'saved-friend',title:'Boa companhia',description:'Adicionar um amigo ao seu perfil.',group:'Seu espaço',motif:'UserRound',rarity:'bronze'}
];
export const achievementCatalog=[...playCatalog,...baseCatalog.map(a=>({...a,motif:motifs[a.id]})),...extraCatalog,
 ...series("journey-role",[1,5,10,25,50,100],"journeyRole",n=>n===1?"Primeira descoberta":n+" desafios em companhia",n=>"Concluir "+n+" rodada(s) do modo Rolê. Consumo não conta.","Jornada · Rolê","Compass"),
 ...series("journey-personal",[1,5,10,25,50,100],"journeyPersonal",n=>n===1?"Um tempo para aprender":n+" treinos pessoais",n=>"Concluir "+n+" rodada(s) do modo Pessoal. Sem sequência obrigatória.","Jornada · Pessoal","Sparkles")
];
export function confirmedPauseDays(data,today=dayKey()){
 return Object.keys(data.days||{}).filter(k=>validDay(k)&&k<=today&&observation(data,k).paused).sort();
}
export function reducedQuantities(data,today=dayKey()){
 const pairs=Array.from({length:7},(_,i)=>shiftDay(today,i-6)).map(k=>({a:observation(data,k),b:observation(data,shiftDay(k,-7))})).filter(p=>p.a.known&&p.b.known);
 if(pairs.length<3)return false;
 const sums=list=>{const m=new Map();list.forEach(e=>{const key=e.category+":"+e.unit;m.set(key,(m.get(key)||0)+e.quantity)});return m};
 const currentEntries=pairs.flatMap(p=>p.a.entries),previousEntries=pairs.flatMap(p=>p.b.entries);
 const groupKeys=new Set([...currentEntries,...previousEntries].map(e=>e.category+":"+e.unit));
 for(const key of groupKeys){
  const a=currentEntries.filter(e=>e.category+":"+e.unit===key),b=previousEntries.filter(e=>e.category+":"+e.unit===key),all=[...a,...b];
  if(all.some(e=>e.grams!=null)){
   if(all.some(e=>e.grams==null))return false;
   if(a.reduce((sum,e)=>sum+e.grams,0)>b.reduce((sum,e)=>sum+e.grams,0))return false;
  }
 }
 const current=sums(currentEntries),previous=sums(previousEntries);
 const keys=new Set([...current.keys(),...previous.keys()]);
 return [...keys].some(k=>(current.get(k)||0)<(previous.get(k)||0))&&[...keys].every(k=>(current.get(k)||0)<=(previous.get(k)||0));
}
export function achievementProgress(data,today=dayKey()){
 const pauseKeys=confirmedPauseDays(data,today),pauses=pauseKeys.length;
 const dayRecords=Object.entries(data.days||{}).filter(([k])=>validDay(k)&&k<=today);
 const months={};pauseKeys.forEach(k=>months[k.slice(0,7)]=(months[k.slice(0,7)]||0)+1);
 const backupDates=[...(data.careMilestones?.backupDays||[]),...(data.careMilestones?.backupPreparedAt?[dayKey(new Date(data.careMilestones.backupPreparedAt))]:[])].filter(k=>validDay(k)&&k<=today);
 const metrics={
 quizStreak:data.journey?.performance?.maxStreak||0,quizQuick:data.journey?.performance?.quickCorrect||0,quizPerfect:data.journey?.performance?.perfectRounds||0,quizFast:data.journey?.performance?.fastRounds||0,quizOpinions:data.journey?.performance?.opinionRounds||0,
 journeyRole:data.journey?.role||0,journeyPersonal:data.journey?.personal||0,
 pauses,pauseWeeks:new Set(pauseKeys.map(k=>shiftDay(k,-((new Date(k+"T12:00").getDay()+6)%7)))).size,
 pauseMonths:Object.keys(months).length,maxMonthPauses:Math.max(0,...Object.values(months)),
 checkins:dayRecords.filter(([,d])=>d.confirmed===true).length,
 notes:dayRecords.filter(([,d])=>d.note?.trim()).length,
 feelings:dayRecords.filter(([,d])=>d.mood&&d.mood!=="unknown").length,
 urgeDays:new Set((data.cravings||[]).map(c=>dayKey(new Date(c.time))).filter(k=>validDay(k)&&k<=today)).size,
 backupDays:new Set(backupDates).size
 };
 const confirmed=Object.entries(data.days||{}).some(([k,v])=>validDay(k)&&k<=today&&v.confirmed===true);
 const flags={
 "chosen-banner":profileBanners.some(b=>b.id===data.profileDetails?.banner&&b.achievement&&data.achievements?.[b.achievement]),"saved-friend":Boolean(data.localFriends?.length),
  "your-space":Boolean(data.displayName?.trim()),
  "check-in":confirmed,"pause-intent":Boolean(data.pause?.startedAt),
  "less-consumption":reducedQuantities(data,today),
  "urge-awareness":Boolean(data.cravings?.some(c=>dayKey(new Date(c.time))<=today)),
  "budget-choice":data.goals?.budgetEnabled===true,
  "backup":Boolean(data.careMilestones?.backupPreparedAt),
  "profile-bio":Boolean(data.profileDetails?.bio?.trim()),
  "profile-photo":data.profile?.type==="photo","profile-emoji":data.profile?.type==="emoji",
  "profile-featured":data.profileDetails?.featured?.filter(id=>data.achievements?.[id]).length===3,
  "chosen-aura":Boolean(data.appearance?.preset&&data.appearance.preset!=="cover"),
  "gentle-reminder":data.preferences?.reminderEnabled===true
 };
 return achievementCatalog.map(a=>{const value=a.metric?metrics[a.metric]:a.target?pauses:flags[a.id]?1:0;return {...a,current:Math.min(value,a.target||1),total:a.target||1,eligible:value>=(a.target||1),earnedAt:data.achievements?.[a.id]?.earnedAt||null};});
}
export function unlockAchievements(data,at=new Date().toISOString()){
 const eligible=achievementProgress(data,dayKey(new Date(at))).filter(a=>a.eligible&&!a.earnedAt);
 if(!eligible.length)return data;
 const achievements={...data.achievements};
 eligible.forEach(a=>{achievements[a.id]={earnedAt:at}});
 return {...data,achievements};
}
