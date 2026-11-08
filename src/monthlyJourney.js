import {TROPHY_MONTHS,recordMonthlyXp,suggestedTarget,trophyProgress} from './planetPack/monthlyTrophies.mjs';
export {TROPHY_MONTHS,trophyProgress};
// No previous monthly goal exists: fourteen initial perfect personal rounds (400 XP each).
export const MONTHLY_XP_TARGET=suggestedTarget(400,14);
export function awardMonthlyJourney(before,after,{eventId,xp,date}){
 if(before===after||xp<=0)return after;
 const monthlyTrophies=recordMonthlyXp(before.monthlyTrophies,{eventId,xp,date,targetXp:MONTHLY_XP_TARGET});
 return monthlyTrophies===before.monthlyTrophies?after:{...after,monthlyTrophies};
}
const record=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
const integer=x=>Number.isSafeInteger(x)&&x>=0;
const day=x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&!Number.isNaN(+new Date(x+'T12:00:00'))&&new Date(x+'T12:00:00').getDate()===Number(x.slice(8));
export function validMonthlyJourney(state){
 if(!record(state)||state.version!==1||!record(state.months)||!record(state.seenEvents))return false;
 if(Object.keys(state.months).length>12)return false;
 return Object.entries(state.months).every(([month,r])=>TROPHY_MONTHS.some(t=>t.month===month)&&record(r)&&integer(r.xp)&&integer(r.targetXp)&&r.targetXp>0&&(r.unlockedAt===null?r.xp<r.targetXp:day(r.unlockedAt)&&r.unlockedAt.startsWith(month)&&r.xp>=r.targetXp))&&Object.entries(state.seenEvents).every(([id,date])=>id.length>0&&id.length<=160&&day(date)&&Object.hasOwn(state.months,date.slice(0,7)));
}
