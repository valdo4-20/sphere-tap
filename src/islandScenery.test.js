import test from 'node:test';
import assert from 'node:assert/strict';
import {assetAt} from './planetPack/planetAssets.mjs';
import {sceneryFor,biomeEnergy} from './islandScenery.js';
import {journeyPositions} from './journeyLayout.js';
test('crystals belong to their biome; other islands keep distinct natural details',()=>{
 for(let n=1;n<=100;n++){
  const a=assetAt(n),v=sceneryFor(a),gems=v.filter(v=>v.shape==='gem');
  if(a.biome==='crystal')assert.ok(gems.length);
  else if(a.biome==='snow')assert.ok(gems.every(v=>v.s>=.8));
  else assert.equal(gems.length,0,a.biome);
  assert.ok(v.length>50);assert.deepEqual(v,sceneryFor(a));
  assert.ok(v.every(v=>Number.isFinite(v.x)&&Number.isFinite(v.y)&&Number.isFinite(v.z)));
 }
 assert.equal(sceneryFor(assetAt(2,{golden:true})).filter(v=>v.shape==='gem').length,0);
 assert.ok(new Set(Object.values(biomeEnergy).map(v=>v.colors[0])).size>=10);
});
test('map keeps current, completed and future nodes centered with reserved entry space',()=>{
 const rows=journeyPositions([1,2,3,4],{current:2,selected:true,done:1,playable:true});
 assert.ok(rows.every(r=>r.x===180));assert.deepEqual(rows.map(r=>r.height),[300,360,142,142]);
 assert.ok(rows[2].y-rows[1].y>=300);
});
