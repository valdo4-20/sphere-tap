import {awardMonthlyJourney,validMonthlyJourney} from './monthlyJourney.js';
import {validPerformance} from './quizPerformance.js';
import {dailyStatus,enrollDaily,localDate,validDate,PERSONAL_QUESTIONS} from './journeyDaily.js';
const QUESTIONS_PER_LEVEL=20;
export function starsFor(score,total=QUESTIONS_PER_LEVEL){return score/total>=.8?3:score/total>=.5?2:1}
export function visibleLevels(completed){const start=Math.max(1,completed-1);return Array.from({length:9},(_,i)=>start+i)}
export const starRanks=[
 {id:'yellow',name:'Amarelo',min:0,color:'#e9c465'},
 {id:'orange',name:'Laranja',min:15,color:'#e5a05c'},
 {id:'red',name:'Vermelho',min:40,color:'#e57883'},
 {id:'purple',name:'Roxo',min:80,color:'#b798e6'},
 {id:'blue',name:'Azul',min:140,color:'#80b6ed'},
 {id:'fire',name:'Fogo',min:220,color:'#f79c58'},
 {id:'ice',name:'Gelo',min:340,color:'#97e0e5'},
 {id:'prismatic',name:'Prismático',min:500,color:'#cfb6ef'}
];
export function starRankFor(stars){return [...starRanks].reverse().find(rank=>stars>=rank.min)||starRanks[0]}
export function earnedXP(score,challengeLevel=1,total=QUESTIONS_PER_LEVEL){const correct=Math.min(total,Math.max(0,Math.floor(score)||0));const multiplier=1+Math.floor((Math.max(1,challengeLevel)-1)/10)*.1;return Math.round((correct*10+40+(correct===total?60:0))*multiplier)}
export function playerProgress(xp=0){const total=Number.isSafeInteger(xp)&&xp>=0?xp:0;const completed=Math.floor((Math.sqrt(9+total/12.5)-3)/2);const start=50*completed*(completed+3),required=200+100*completed;return {level:completed+1,current:total-start,required,percent:Math.min(100,(total-start)/required*100)}}
export function migrateJourney(raw){const base={version:3,mode:'role',role:0,personal:0,stars:0,xp:0};if(!raw||typeof raw!=='object')return base;const integer=n=>Number.isSafeInteger(n)&&n>=0?n:0;return {...base,...(validMonthlyJourney(raw.monthlyTrophies)?{monthlyTrophies:raw.monthlyTrophies}:{}),...(validPerformance(raw.performance)?{performance:raw.performance}:{}),mode:raw.mode==='personal'?'personal':'role',role:integer(raw.role??raw.infinite),personal:integer(raw.personal),stars:integer(raw.stars),xp:integer(raw.xp),...(validDate(raw.personalStart)?{personalStart:raw.personalStart}:{}),...(validDate(raw.personalLastDate)?{personalLastDate:raw.personalLastDate}:{}),...(validDate(raw.personalUnlockSeen)?{personalUnlockSeen:raw.personalUnlockSeen}:{}),...(typeof raw.lastMatchId==='string'&&/^[a-zA-Z0-9-]{1,80}$/.test(raw.lastMatchId)?{lastMatchId:raw.lastMatchId}:{})}}
export function completeJourney(data,mode,expectedLevel,score,now=new Date(),reward={}){const field=mode==='personal'?'personal':'role',total=field==='personal'?PERSONAL_QUESTIONS:QUESTIONS_PER_LEVEL;if(expectedLevel!==data[field]+1||!Number.isInteger(score)||score<0||score>total)return data;if(field==='personal'&&!dailyStatus(data,now).canPlay)return data;const challengeLevel=field==='personal'?data.role+1:expectedLevel;const xp=reward.xp??earnedXP(score,challengeLevel,total);const after={...(field==='personal'?enrollDaily(data,now):data),version:3,[field]:expectedLevel,stars:data.stars+starsFor(score,total),xp:(data.xp||0)+xp,...(field==='personal'?{personalLastDate:localDate(now)}:{})};return awardMonthlyJourney(data,after,{eventId:reward.eventId||`level:${field}:${expectedLevel}`,xp,date:now})}

export function validJourney(value){return Boolean(value&&typeof value==='object'&&!Array.isArray(value)&&value.version===3&&(value.monthlyTrophies===undefined||validMonthlyJourney(value.monthlyTrophies))&&(value.performance===undefined||validPerformance(value.performance))&&(value.lastMatchId===undefined||typeof value.lastMatchId==='string'&&/^[a-zA-Z0-9-]{1,80}$/.test(value.lastMatchId))&&['personalStart','personalLastDate','personalUnlockSeen'].every(key=>value[key]===undefined||validDate(value[key]))&&['role','personal'].includes(value.mode)&&['role','personal','stars','xp'].every(key=>Number.isSafeInteger(value[key])&&value[key]>=0&&value[key]<Number.MAX_SAFE_INTEGER))}
