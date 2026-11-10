import test from 'node:test';
import assert from 'node:assert/strict';
import {sagaMapFor,planetFor,sagaLevelState} from './journeyPlanets.js';
test('each planet saga has nine connected spatial nodes and a guardian',()=>{
 for(let level=1;level<=10;level++){
  const map=sagaMapFor(level);
  assert.equal(map.nodes.length,9);
  assert.equal(map.connections.length,8);
  assert.ok(map.boss.length>0);
  assert.ok(map.glow.startsWith('#'));
  assert.equal(map.nodes[0].y,0);
  assert.ok([8,8.3].includes(map.nodes[8].y));
 }
});
test('planet themes resolve to a saga map for all generated biomes',()=>{
 for(let level=1;level<=10;level++){
  const planet=planetFor(level),map=sagaMapFor(level);
  assert.equal(map.planetName,planet.name);
  assert.ok(map.nodes.every(n=>Number.isFinite(n.x)&&Number.isFinite(n.y)&&Number.isFinite(n.z)));
 }
});
test('saga progression state follows completed, current and locked states',()=>{
 assert.equal(sagaLevelState(1,1,2,true),'complete');
 assert.equal(sagaLevelState(2,1,2,true),'current');
 assert.equal(sagaLevelState(3,1,2,true),'locked');
 assert.equal(sagaLevelState(2,1,2,false),'locked');
});
