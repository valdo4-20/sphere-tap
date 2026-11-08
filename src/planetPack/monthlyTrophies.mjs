/** Monthly collection: Nov/2026–Oct/2027. Unlock immediately on monthly XP target. */
export const TROPHY_MONTHS=Object.freeze([
 ['2026-11','Novembro','O despertar','star'],['2026-12','Dezembro','Luz da jornada','lantern'],
 ['2027-01','Janeiro','Novo horizonte','flag'],['2027-02','Fevereiro','Sintonia','music'],
 ['2027-03','Março','Raízes do caminho','sprout'],['2027-04','Abril','A descoberta','book'],
 ['2027-05','Maio','Coragem dourada','shield'],['2027-06','Junho','Sob as estrelas','moon'],
 ['2027-07','Julho','Sabedoria','staff'],['2027-08','Agosto','Cristal do tempo','crystal'],
 ['2027-09','Setembro','A prosperidade','crown'],['2027-10','Outubro','Guardião do portal','key']
].map(([month,label,name,symbol],i)=>Object.freeze({id:`trophy-${month}`,month,label,name,symbol,index:i+1})));
const positive=(n,name)=>{if(!Number.isSafeInteger(n)||n<1)throw new RangeError(`${name} precisa ser um inteiro positivo.`);return n};
function localDay(value){if(value instanceof Date){if(Number.isNaN(+value))throw new RangeError('Data inválida.');return `${value.getFullYear()}-${String(value.getMonth()+1).padStart(2,'0')}-${String(value.getDate()).padStart(2,'0')}`;}if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))throw new TypeError('Use Date ou AAAA-MM-DD.');const d=new Date(value+'T12:00:00');if(Number.isNaN(+d)||localDay(d)!==value)throw new RangeError('Data inválida.');return value}
/** Optional planning helper, not an automatic target change. A full early personal round gives 400 XP. */
export function suggestedTarget(referenceDailyXp=400,referenceDays=14){positive(referenceDailyXp,'XP diário');positive(referenceDays,'Dias');return positive(Math.round(referenceDailyXp*referenceDays),'Meta')}
/** Call with XP already awarded to this player, never with a quiz merely started. */
export function recordMonthlyXp(state,{eventId,xp,date,targetXp}){
 positive(xp,'XP');positive(targetXp,'Meta');if(typeof eventId!=='string'||!eventId||eventId.length>160)throw new TypeError('Identificação estável da recompensa obrigatória.');
 const day=localDay(date),month=day.slice(0,7),trophy=TROPHY_MONTHS.find(t=>t.month===month);if(!trophy)return state;
 const old=state??{version:1,months:{},seenEvents:{}};if(Object.hasOwn(old.seenEvents??{},eventId))return old;
 const before=old.months?.[month]??{xp:0,targetXp,unlockedAt:null};const total=before.xp+xp;if(!Number.isSafeInteger(total))throw new RangeError('XP fora do limite.');
 const record={...before,xp:total,unlockedAt:before.unlockedAt??(total>=before.targetXp?day:null)};
 return {...old,version:1,months:{...old.months,[month]:record},seenEvents:{...old.seenEvents,[eventId]:day}};
}
export function trophyProgress(state,month,targetXp){positive(targetXp,'Meta');const t=TROPHY_MONTHS.find(t=>t.month===month);if(!t)return null;const r=state?.months?.[month]??{xp:0,targetXp,unlockedAt:null};return {...t,...r,percent:Math.min(100,r.xp/r.targetXp*100),remaining:Math.max(0,r.targetXp-r.xp),unlocked:Boolean(r.unlockedAt)}}
function emblem(kind){switch(kind){
case'star':return '<path d="M0-21 7-7 22-6 11 4 14 20 0 12-14 20-11 4-22-6-7-7Z"/>';
case'lantern':return '<path d="M-14-14h28v31h-28ZM-10-14v-9q10-12 20 0v9M-18 20h36" fill-rule="evenodd"/><path d="M-6-6h12v16H-6Z" fill="#fff4bd"/>';
case'flag':return '<path d="M-11 26v-56h5v3h34l-10 12 10 11H-6v30Z"/>';
case'music':return '<path d="M-4-17 22-24v36q-2 14-14 12-14-6-1-14l9-1V-9L2-5v25q-4 13-16 9-12-7 0-14l10-1Z"/>';
case'sprout':return '<path d="M-3 24V2q-30 0-25-25Q-2-24 0-5q8-29 31-27 4 30-28 35v21Z"/>';
case'book':return '<path d="M-27-19q17-8 27 1 10-9 27-1v40q-16-9-27 0-11-9-27 0ZM-2-16h4v34h-4Z" fill-rule="evenodd"/>';
case'shield':return '<path d="M-25-19 0-27 25-19v24Q24 24 0 33-24 24-25 5Z"/><path d="M0-14 5-3 17-2 8 6 10 17 0 11-10 17-8 6-17-2-5-3Z" fill="#fff3b3"/>';
case'moon':return '<path d="M10-29C-24-31-38 13-10 29 2 37 17 29 25 15 0 29-17-4 10-29Z"/>';
case'staff':return '<path d="M-4-15h8v65h-8Z"/><path d="M0-43 10-30 25-27 13-16 15-1 0-8-15-1-13-16-25-27-10-30Z"/>';
case'crystal':return '<path d="M0-33 19-20 12 19 0 30-15 13-20-19Z"/><path d="M0-33 3-13 0 30-5-10Z" fill="#fff2bd"/>';
case'crown':return '<path d="M-29-15-15-3 0-28 15-3 29-15 21 23h-42Z"/><path d="M-20 12h40v6h-40Z" fill="#fff2bd"/>';
case'key':return '<path d="M-13-24a17 17 0 1 1-1 34v30h-7v-9h-8v-7h8V9a17 17 0 0 1 8-33ZM-13-14a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z" fill-rule="evenodd"/>';
}}
export function renderTrophySvg(trophy,{animated=true,instanceId=trophy.id}={}){
 const id=String(instanceId).replace(/[^a-zA-Z0-9_-]/g,'-'),i=trophy.index;const bend=i%3,armY=[244,225,257][i%3],toolX=i%2?302:96,flip=i%2?1:-1;
 const hand=`M${i%2?262:138} 250 Q${toolX} ${armY+16} ${toolX} ${armY} Q${toolX-12} ${armY-19} ${toolX+4} ${armY-22} Q${toolX+20} ${armY-15} ${toolX+14} ${armY+8} Q${toolX-7} ${armY+48} ${i%2?258:142} 289Z`;
 const silhouette=`<path d="M143 259Q127 289 129 314L122 329H181L187 316H213L219 329H278L271 314Q273 289 257 259L239 233H161Z"/><path d="M144 256Q105 ${armY+55} 85 ${armY+24}Q74 ${armY+9} 83 ${armY}Q95 ${armY-11} 105 ${armY+9}L160 235ZM256 256Q295 ${armY+55} 315 ${armY+24}Q326 ${armY+9} 317 ${armY}Q305 ${armY-11} 295 ${armY+9}L240 235Z"/><path d="${hand}"/><path d="M120 181Q139 119 205 82Q249 60 ${275+bend*5} 108Q285 126 300 136Q320 154 305 165Q284 175 268 152Q258 171 265 189Q298 212 278 233Q255 251 236 247L164 238Q118 238 102 218Q91 201 120 181Z"/><path d="M145 225Q126 244 142 262Q139 280 159 286Q167 304 183 302L200 321L217 302Q233 304 241 286Q261 280 258 262Q274 244 255 225L227 218H173Z"/>`;
 const cuts='<path d="M123 211Q190 178 269 216Q284 228 267 233L227 215Q195 201 161 218L137 230Q121 226 123 211Z" fill="#60491d" opacity=".78"/><ellipse cx="200" cy="225" rx="26" ry="19"/>';
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400" role="img" aria-label="${trophy.label}: ${trophy.name}" class="trophy-${id}"><defs><radialGradient id="aura-${id}"><stop stop-color="#ffd35e" stop-opacity=".48"/><stop offset=".45" stop-color="#e6ab33" stop-opacity=".18"/><stop offset="1" stop-color="#d08a18" stop-opacity="0"/></radialGradient><linearGradient id="gold-${id}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff0b2"/><stop offset=".32" stop-color="#efc75f"/><stop offset=".62" stop-color="#c48a2c"/><stop offset="1" stop-color="#ffe49b"/></linearGradient></defs>${animated?`<style>.trophy-${id} .aura{transform-origin:200px 210px;animation:st-aura 4s ease-in-out infinite}.trophy-${id} .glint{animation:st-glint 3s ease-in-out infinite}@keyframes st-aura{50%{opacity:.65;transform:scale(1.06)}}@keyframes st-glint{50%{opacity:.15}}@media(prefers-reduced-motion:reduce){.trophy-${id} *{animation:none!important}}</style>`:''}<circle class="aura" cx="200" cy="210" r="186" fill="url(#aura-${id})"/><g fill="url(#gold-${id})">${silhouette}${cuts}<g transform="translate(${toolX} ${armY-29}) scale(.8)">${emblem(trophy.symbol)}</g></g><g class="glint" fill="#fff5c4"><path d="M96 106l3 9 9 3-9 3-3 9-3-9-9-3 9-3Z"/><path d="M305 300l3 8 8 3-8 3-3 8-3-8-8-3 8-3Z"/><circle cx="302" cy="105" r="2"/></g></svg>`;
}
