import test from 'node:test';
import assert from 'node:assert/strict';
import {planetaryWorlds,worldsForProgress} from './planetaryWorlds.js';

test('os três planetas iniciais preservam os 25 dias e a distribuição original',()=>{
 assert.deepEqual(planetaryWorlds.map(world=>world.levels.length),[5,8,12]);
 assert.equal(planetaryWorlds.flatMap(world=>world.levels).length,25);
 assert.deepEqual(planetaryWorlds.map(world=>world.levels[0].id),[1,6,14]);
});

test('a jornada pessoal continua em novos ciclos depois do dia 25',()=>{
 const worlds=worldsForProgress({done:25,level:26,playable:true,scheduledDateFor:n=>`2026-12-${String(n-25).padStart(2,'0')}`});
 const levels=worlds.flatMap(world=>world.levels);
 assert.equal(levels.length,50);
 assert.equal(new Set(levels.map(item=>item.id)).size,50);
 assert.equal(levels.find(item=>item.id===25).status,'completed');
 assert.equal(levels.find(item=>item.id===26).status,'active');
 assert.equal(levels.find(item=>item.id===26).date,'2026-12-01');
 assert.equal(worlds.find(world=>world.levels.some(item=>item.id===26)).name,'Planeta Aurora · Ciclo 2');
});

test('o mapa alcança níveis altos sem voltar ao primeiro planeta',()=>{
 const worlds=worldsForProgress({done:99,level:100,playable:true});
 const active=worlds.flatMap(world=>world.levels).find(item=>item.status==='active');
 assert.equal(worlds.length,12);
 assert.equal(active.id,100);
 assert.equal(active.dayNumber,100);
});
