import test from 'node:test';
import assert from 'node:assert/strict';
import {initial,validData,migrate} from './model.js';
import {cashFlow,tapSequence} from './wallet.js';
const fresh=()=>structuredClone(initial);
test('90 em compras menos 10 recebidos = 80; consumo não é duplicado',()=>{
 const d=fresh();d.purchases=[{date:'2026-11-07',amount:90}];d.receipts=[{date:'2026-11-07',amount:10}];d.entries=[{time:'2026-11-07T12:00:00',cost:90}];
 assert.deepEqual(cashFlow(d),{spent:9000,received:1000,net:8000,unknown:0});
 assert.equal(cashFlow(d,'2026-11-07','2026-11-08','consumption').net,8000);
});
test('centavos, filtro temporal, valor zero e recebimentos acima dos gastos',()=>{
 const d=fresh();d.purchases=[{date:'2026-11-07',amount:.1},{date:'2026-11-07',amount:.2},{date:'2026-11-08',amount:999}];d.receipts=[{date:'2026-11-07',amount:.4}];
 assert.equal(cashFlow(d,'2026-11-07','2026-11-08').net,-10);
 d.receipts=[];assert.equal(cashFlow(d,'2026-11-07','2026-11-08').net,30);
});
test('custo ausente deixa o total incompleto e não transforma ausência em zero',()=>{
 const d=fresh();d.entries=[{time:'2026-11-07T12:00:00',cost:null},{time:'2026-11-07T12:01:00',cost:0}];
 assert.deepEqual(cashFlow(d,'2026-11-07','2026-11-08','consumption'),{spent:0,received:0,net:null,unknown:1});
});
test('recebimentos e escolha de cálculo sobrevivem ao backup; entradas inválidas são rejeitadas',()=>{
 const d=fresh();d.preferences.walletBasis='consumption';d.receipts=[{id:'r',date:'2026-11-07',amount:10,kind:'profit',note:'Informado por mim'}];
 assert.equal(validData(d),true);assert.deepEqual(migrate(JSON.parse(JSON.stringify(d))).receipts,d.receipts);
 d.receipts[0].amount=-10;assert.equal(validData(d),false);d.receipts[0].amount=10;d.receipts[0].kind='automatic-profit';assert.equal(validData(d),false);
});
test('sequência conta dias distintos com tap, aceita ontem e termina após lacuna',()=>{
 const d=fresh();d.entries=['07','07','06','05','03'].map(day=>({time:`2026-11-${day}T12:00:00`}));
 assert.equal(tapSequence(d,'2026-11-07'),3);assert.equal(tapSequence(d,'2026-11-08'),3);assert.equal(tapSequence(d,'2026-11-09'),0);
});
