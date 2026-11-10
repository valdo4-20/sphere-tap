import test from 'node:test';
import assert from 'node:assert/strict';
import {sagaMapFor,planetFor,sagaLevelState,islandIndexForLevel,islandStartForLevel} from './journeyPlanets.js';
test('each solo island has fifty connected circuit nodes and a themed guardian',()=>{
 for(let level=1;level<=100;level+=7){
  const map=sagaMapFor(level,'2026-11-10');
  assert.equal(map.nodes.length,50);
  assert.ok(map.connections.length>=50);
  assert.ok(map.boss.length>0);
  assert.ok(map.glow.startsWith('#'));
  assert.equal(map.islandStart,islandStartForLevel(level));
  assert.equal(map.islandIndex,islandIndexForLevel(level));
  assert.ok(map.nodes.every((n,i)=>n.id===i+1&&Number.isFinite(n.x)&&Number.isFinite(n.y)&&Number.isFinite(n.z)));
 }
});
test('fifty challenge levels share one island and the next fifty unlock a new island',()=>{
 assert.equal(islandIndexForLevel(1),1);
 assert.equal(islandIndexForLevel(50),1);
 assert.equal(islandIndexForLevel(51),2);
 assert.equal(islandStartForLevel(100),51);
 assert.equal(sagaMapFor(73).planetName,planetFor(2).name);
});
test('golden Sunday levels are marked in the circuit',()=>{
 assert.equal(sagaMapFor(1,'2026-11-15').nodes[0].golden,true);
 assert.ok(sagaMapFor(1,'2026-11-10').nodes.every(n=>typeof n.golden==='boolean'));
});
test('progression state follows completed, current and locked states',()=>{
 assert.equal(sagaLevelState(1,1,2,true),'complete');
 assert.equal(sagaLevelState(2,1,2,true),'current');
 assert.equal(sagaLevelState(3,1,2,true),'locked');
 assert.equal(sagaLevelState(2,1,2,false),'locked');
});
test('group mode can retain its compact nine-node map',()=>{
 const map=sagaMapFor(3,undefined,{nodeCount:9});
 assert.equal(map.nodes.length,9);
 assert.equal(map.connections.length,8);
});
