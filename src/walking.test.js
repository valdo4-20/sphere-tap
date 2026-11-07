import test from 'node:test';
import assert from 'node:assert/strict';
import {acceptPoint,distanceBetween,routeDistance,validWalk} from './walking.js';
import {initial,validData,migrate} from './model.js';
import {unlockAchievements} from './achievements.js';
import {estimatedSavings} from './wallet.js';
import {recentCare,pauseScenario} from './profileMetrics.js';
const p=(latitude,timestamp,segment=0)=>({latitude,longitude:0,accuracy:5,timestamp,segment});
test('GPS descarta ruído, baixa precisão, saltos e timestamps antigos',()=>{const a=p(0,1000);assert.equal(acceptPoint(a,p(.000001,6000)),false);assert.equal(acceptPoint(a,p(.1,6000)),false);assert.equal(acceptPoint(a,{...p(.0001,6000),accuracy:100}),false);assert.equal(acceptPoint(a,p(.0001,900)),false);assert.equal(acceptPoint(a,p(.0001,6000)),true)});
test('distância respeita lacunas e pausas, sem unir segmentos',()=>{const points=[p(0,1000),p(.001,61000),p(.02,120000,1),p(.021,180000,1)];assert.ok(Math.abs(routeDistance(points)-222.39)<1);assert.ok(distanceBetween(points[0],points[2])>2000)});
test('backup preserva caminhadas e posição aproximada, rejeita coordenadas inválidas',()=>{const d=structuredClone(initial);d.walks=[{id:'w',startedAt:1000,endedAt:61000,seconds:60,stride:.75,points:[p(0,1000),p(.001,61000)]}];assert.equal(validWalk(d.walks[0]),true);assert.equal(validData(d),true);assert.deepEqual(migrate(d).walks,d.walks);d.walks[0].points[0].latitude=100;assert.equal(validData(d),false)});
test('caminhadas antigas não desbloqueiam novas conquistas',()=>{const d=structuredClone(initial);d.walks=[{id:'w',startedAt:1000,endedAt:61000,seconds:60,stride:.75,points:[p(0,1000),p(.001,61000)]}];const a=unlockAchievements(d,'2026-11-07T12:00:00Z');assert.equal(Object.keys(a.achievements).some(id=>id.startsWith('walk-')),false)});

test('economia exclui dias não confirmados e preços ausentes, mantém gasto acima da referência',()=>{const d=structuredClone(initial);d.walletReference={start:'2026-11-01',dailyCost:10};d.days={'2026-11-01':{confirmed:true},'2026-11-02':{confirmed:true},'2026-11-03':{confirmed:true}};d.entries=[{id:'a',category:'c',time:'2026-11-02T12:00:00Z',quantity:1,cost:null},{id:'b',category:'c',time:'2026-11-03T12:00:00Z',quantity:1,cost:30}];assert.deepEqual(estimatedSavings(d,'2026-11-04'),{days:2,excluded:2,actual:3000,reference:2000,difference:-1000})});
test('gráfico não inventa pausa; cenário vazio não vira economia e preço zero é explícito',()=>{const d=structuredClone(initial);assert.equal(recentCare(d,'2026-11-04',4).filter(x=>x.paused).length,0);assert.equal(pauseScenario('',7,10),null);assert.deepEqual(pauseScenario(2,3,null),{quantity:6,cents:null});assert.deepEqual(pauseScenario(2,3,0),{quantity:6,cents:0})});
