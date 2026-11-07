import {emblemIds,emblemFor} from './friendEmblems.js';
import {migrateJourney,validJourney,completeJourney,playerProgress,earnedXP} from './journeyProgression.js';
export const friendColors=['#b79be8','#71b9df','#7bc4a2','#e8b36e','#dd92ad','#83cdd0','#ffb65b','#efb0b6','#ecd9d7','#c268ab','#8d83d4','#c82d46','#ed6338','#ec9c2e','#dd8f78','#e6c399','#9a59ba','#f54635','#1b78ac','#62c2c9','#e82580','#c8baa2','#86b443','#d4df4e'];
export function validFriends(value){return Array.isArray(value)&&value.length<=50&&new Set(value.map(f=>f?.id)).size===value.length&&value.every(f=>f&&typeof f==='object'&&typeof f.id==='string'&&/^[a-zA-Z0-9-]{1,80}$/.test(f.id)&&f.id!=='self'&&typeof f.name==='string'&&f.name.trim().length>0&&f.name.length<=32&&friendColors.includes(f.color)&&(f.emblem===undefined||emblemIds.includes(f.emblem))&&validJourney(f.journey))}
export function addFriend(data,{id,name,color,emblem}){const clean=String(name||'').trim();if(typeof id!=='string'||!clean||clean.length>32||!friendColors.includes(color)||(data.localFriends||[]).length>=50||(data.localFriends||[]).some(f=>f.id===id)||!/^[a-zA-Z0-9-]{1,80}$/.test(id)||id==='self')return data;return {...data,localFriends:[...(data.localFriends||[]),{id,name:clean,color,emblem:emblemIds.includes(emblem)?emblem:emblemFor({id}),journey:migrateJourney(null)}]}}
export function editFriend(data,id,{name,color,emblem}){const clean=String(name||'').trim();if(!clean||clean.length>32||!friendColors.includes(color))return data;return {...data,localFriends:(data.localFriends||[]).map(f=>f.id===id?{...f,name:clean,color,...(emblemIds.includes(emblem)?{emblem}:{})}:f)}}
export function removeFriend(data,id){return {...data,localFriends:(data.localFriends||[]).filter(f=>f.id!==id)}}
export function completeFriendRound(data,id,level,score){const friend=(data.localFriends||[]).find(f=>f.id===id);if(!friend)return data;const journey=completeJourney(friend.journey,'role',level,score);if(journey===friend.journey)return data;return {...data,localFriends:data.localFriends.map(f=>f.id===id?{...f,journey}:f)}}
export function localRanking(data){return [{id:'self',name:data.displayName||'Você',color:data.appearance?.auraColor||friendColors[0],journey:data.journey||migrateJourney(null)},...(data.localFriends||[])].map((f,index)=>({...f,order:index,level:playerProgress(f.journey.xp).level})).sort((a,b)=>b.journey.xp-a.journey.xp||b.journey.stars-a.journey.stars||a.order-b.order).map((f,index,rows)=>({...f,place:index&&f.journey.xp===rows[index-1].journey.xp?rows.findIndex(r=>r.journey.xp===f.journey.xp)+1:index+1}))}
// One shared answer sequence credits every selected participant atomically.
export function completeGroupRound(data,matchId,challengeLevel,score,friendIds){
 if(typeof matchId!=='string'||!/^[a-zA-Z0-9-]{1,80}$/.test(matchId)||!Number.isSafeInteger(challengeLevel)||challengeLevel<1||!Number.isInteger(score)||score<0||score>20||!Array.isArray(friendIds)||!friendIds.length||new Set(friendIds).size!==friendIds.length||friendIds.some(id=>!(data.localFriends||[]).some(f=>f.id===id)))return data;
 if(data.journey?.mode!=='role'||data.journey.lastMatchId===matchId)return data;
 const owner=completeJourney(data.journey,'role',challengeLevel,score);if(owner===data.journey)return data;
 const xp=earnedXP(score,challengeLevel);
 return {...data,journey:{...owner,lastMatchId:matchId},localFriends:data.localFriends.map(f=>{if(!friendIds.includes(f.id))return f;const next=completeJourney(f.journey,'role',f.journey.role+1,score);return {...f,journey:{...next,xp:f.journey.xp+xp,lastMatchId:matchId}}})};
}
export function groupRanking(data){return localRanking(data)}
export function warmFriendColor(color){return color}
