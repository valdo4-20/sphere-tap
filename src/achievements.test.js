import {test} from "node:test";
import assert from "node:assert/strict";
import {initial,dayKey,shiftDay,createEntry,migrate,validData} from "./model.js";
import {achievementCatalog,achievementProgress,unlockAchievements,reducedQuantities,confirmedPauseDays} from "./achievements.js";
const today="2026-11-06",at="2026-11-06T12:00:00.000Z";
const fresh=()=>structuredClone(initial);
const item={id:"herb",name:"Meu item",unit:"item",price:null};
const entry=(key,qty=1,c=item)=>({...createEntry(c,new Date(key+"T12:00").toISOString()),quantity:qty});
test("consumo alto e dias ausentes não geram medalhas",()=>{
 const d=fresh();d.categories=[item];d.entries=Array.from({length:100},()=>entry(today));
 assert.equal(confirmedPauseDays(d,today).length,0);
 assert.equal(achievementProgress(d,today).filter(a=>a.eligible).length,0);
 assert.equal(unlockAchievements(d,at),d);
});
test("pausas confirmadas não precisam ser consecutivas e excluem dia com consumo ou futuro",()=>{
 const d=fresh();["2026-10-01","2026-10-20",today,"2026-11-07"].forEach(k=>d.days[k]={confirmed:true});
 d.entries=[entry(today)];
 assert.equal(confirmedPauseDays(d,today).length,2);
 const progress=achievementProgress(d,today);
 assert.equal(progress.find(a=>a.id==="pause-1").eligible,true);
 assert.equal(progress.find(a=>a.id==="pause-3").eligible,false);
});
test("reconhecimentos permanecem após um novo consumo e entram no backup",()=>{
 let d=fresh();d.days[today]={confirmed:true};d=unlockAchievements(d,at);
 const earned=d.achievements["pause-1"].earnedAt;
 d.entries=[entry(today)];const after=unlockAchievements(d,at);
 assert.equal(after.achievements["pause-1"].earnedAt,earned);
 assert.equal(confirmedPauseDays(after,today).length,0);
 assert.equal(validData(after),true);
 assert.deepEqual(migrate(JSON.parse(JSON.stringify(after))).achievements,after.achievements);
});
test("menos lançamentos com quantidade maior não é redução",()=>{
 const d=fresh();
 for(let i=0;i<3;i++){const a=shiftDay(today,-i),b=shiftDay(a,-7);d.days[a]={confirmed:true};d.days[b]={confirmed:true};d.entries.push(entry(a,5),entry(b),entry(b));}
 assert.equal(reducedQuantities(d,today),false);
});
test("redução exige dados comparáveis e não aceita aumento em outro item",()=>{
 const d=fresh(),other={...item,id:"other"};
 for(let i=0;i<3;i++){const a=shiftDay(today,-i),b=shiftDay(a,-7);d.days[a]={confirmed:true};d.days[b]={confirmed:true};d.entries.push(entry(a),entry(b,2));}
 assert.equal(reducedQuantities(d,today),true);
 d.entries.push(entry(today,1,other));
 assert.equal(reducedQuantities(d,today),false);
 d.entries=d.entries.filter(e=>dayKey(new Date(e.time))!==shiftDay(today,-2));delete d.days[shiftDay(today,-2)];
 assert.equal(reducedQuantities(d,today),false);
});
test("backup preparado e destaques são locais e validados",()=>{
 const d=fresh();d.careMilestones.backupPreparedAt=at;d.profileDetails={bio:"No meu tempo.",featured:["backup"]};
 const out=unlockAchievements(d,at);
 assert.ok(out.achievements.backup);assert.equal(validData(out),true);
 out.profileDetails.featured=["a","b","c","d"];assert.equal(validData(out),false);
});

test("catálogo tem mais de 100 conquistas distintas, sem critérios de volume consumido",()=>{
 assert.ok(achievementCatalog.length>100);
 assert.equal(new Set(achievementCatalog.map(a=>a.id)).size,achievementCatalog.length);
 assert.ok(achievementCatalog.every(a=>a.motif&&a.description&&a.rarity));
});
test("conquistas por vontade e backup contam dias diferentes, sem premiar repetições",()=>{
 const d=fresh();d.cravings=Array.from({length:100},(_,i)=>({id:"u"+i,time:at,intensity:5,context:"teste"}));
 d.careMilestones={backupPreparedAt:at,backupDays:[today,today,today]};
 const progress=achievementProgress(d,today);
 assert.equal(progress.find(a=>a.id==="urge-days-3").eligible,false);
 assert.equal(progress.find(a=>a.id==="backup-days-2").eligible,false);
});

test("menos unidades com maior peso conhecido não rende medalha de redução",()=>{
 const d=fresh();
 for(let i=0;i<3;i++){
  const a=shiftDay(today,-i),b=shiftDay(a,-7);d.days[a]={confirmed:true};d.days[b]={confirmed:true};
  d.entries.push({...entry(a,1),grams:3},{...entry(b,2),grams:2});
 }
 assert.equal(reducedQuantities(d,today),false);
});
