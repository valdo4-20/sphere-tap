import {test} from 'node:test';
import assert from 'node:assert/strict';
import {NORMAL_ASSETS,GOLDEN_ASSETS,geometryFor,isSunday,assetForScheduledDate,planetIsVisible} from './planetAssets.mjs';
import {TROPHY_MONTHS,recordMonthlyXp,trophyProgress} from './monthlyTrophies.mjs';

test('todos os 152 planetas têm detalhes, cristais facetados e fragmentos',()=>{
 for(const a of [...NORMAL_ASSETS,...GOLDEN_ASSETS]){
  const geometry=geometryFor(a),details=geometry.filter(v=>v.s);
  assert.ok(details.length>=30,a.id+' sem detalhes suficientes');
  assert.ok(details.some(v=>v.shape==='gem'),a.id+' sem cristais facetados');
  assert.ok(details.some(v=>v.k==='satellite'),a.id+' sem fragmentos');
  assert.ok(geometry.every(v=>[v.x,v.y,v.z].every(Number.isFinite)),a.id+' com posição inválida');
 }
});

test('ilhas têm base afunilada em camadas e cactos com silhueta de saguaro',()=>{
 const desert=NORMAL_ASSETS.find(a=>a.biome==='desert');
 const cacti=geometryFor(desert).filter(v=>v.k==='cactus'&&v.shape==='cactus');
 assert.ok(cacti.length>=3,'deserto precisa de um grupo de cactos, não colunas isoladas');
 assert.ok(cacti.some(v=>v.s>=1&&v.h>=2.5),'cacto principal precisa de tronco largo e braços reconhecíveis');
 const island=NORMAL_ASSETS.find(a=>a.form==='island'),voxels=geometryFor(island).filter(v=>!v.s);
 const bottoms=new Map();
 for(const v of voxels){const k=v.x+','+v.y;bottoms.set(k,Math.min(bottoms.get(k)??Infinity,v.z));}
 assert.ok(Math.max(...bottoms.values())-Math.min(...bottoms.values())>=2,'a base da ilha deve afunilar, sem fundo plano');
});

test('catálogo tem 100 comuns, 52 dourados e 12 meses consecutivos',()=>{
 assert.equal(NORMAL_ASSETS.length,100);assert.equal(GOLDEN_ASSETS.length,52);
 assert.equal(TROPHY_MONTHS.length,12);assert.equal(TROPHY_MONTHS[0].month,'2026-11');assert.equal(TROPHY_MONTHS.at(-1).month,'2027-10');
 const all=[...NORMAL_ASSETS,...GOLDEN_ASSETS];
 assert.equal(new Set(all.map(a=>a.id)).size,152);
 assert.equal(new Set(all.map(a=>JSON.stringify(geometryFor(a).map(v=>[v.x,v.y,v.z]).sort()))).size,152);
});
test('dourado depende do domingo local e não do nível',()=>{
 assert.equal(isSunday('2026-11-08'),true);assert.equal(isSunday('2026-11-09'),false);
 assert.equal(assetForScheduledDate(1,'2026-11-08').id,assetForScheduledDate(27,'2026-11-08').id);
 assert.notEqual(assetForScheduledDate(7,'2026-11-09').id,assetForScheduledDate(7,'2026-11-08').id);
 assert.throws(()=>isSunday('2026-02-30'));
 const ids=[];for(let i=0;i<52;i++){const d=new Date(2026,10,1+7*i,12);ids.push(assetForScheduledDate(1,d).id)}assert.equal(new Set(ids).size,52);
});
test('planetas futuros permanecem ocultos',()=>{
 assert.equal(planetIsVisible(3,2,true),true);assert.equal(planetIsVisible(3,2,false),false);assert.equal(planetIsVisible(4,2,true),false);
});
test('XP mensal libera imediatamente, não duplica e conserva a meta',()=>{
 let s=recordMonthlyXp(null,{eventId:'a',xp:400,date:'2026-11-08',targetXp:800});
 assert.equal(trophyProgress(s,'2026-11',800).unlocked,false);
 assert.equal(recordMonthlyXp(s,{eventId:'a',xp:400,date:'2026-11-08',targetXp:800}),s);
 s=recordMonthlyXp(s,{eventId:'b',xp:400,date:'2026-11-09',targetXp:9999});
 assert.equal(trophyProgress(s,'2026-11',9999).unlocked,true);assert.equal(s.months['2026-11'].unlockedAt,'2026-11-09');
 s=recordMonthlyXp(s,{eventId:'c',xp:20,date:'2026-12-01',targetXp:800});
 assert.equal(s.months['2026-12'].xp,20);assert.equal(s.months['2026-11'].unlockedAt,'2026-11-09');
 assert.throws(()=>recordMonthlyXp(s,{eventId:'d',xp:1,date:'2026-11-31',targetXp:800}));
});
