import test from 'node:test';
import assert from 'node:assert/strict';
import {dateTimeParts,dateTimeLimits,joinDateTime} from './entryDateTime.js';
import {localTime,dayEntries,initial,validData} from './model.js';
test('yesterday allows 23:59 even when the current time is after midnight',()=>{
 const max='2026-11-09T00:10';assert.equal(dateTimeLimits('2026-11-08',undefined,max).maxTime,undefined);
 assert.equal(dateTimeLimits('2026-11-09',undefined,max).maxTime,'00:10');
 assert.equal(dateTimeLimits('2026-11-08','2026-11-08T09:30',max).minTime,'09:30');
});
test('incomplete edits stay incomplete so the visible required fields can validate them',()=>{
 assert.equal(joinDateTime({date:'',time:'23:59'}),'');assert.equal(joinDateTime({date:'2026-11-08',time:''}),'');
 assert.deepEqual(dateTimeParts('2026-11-08T23:59'),{date:'2026-11-08',time:'23:59'});
});
test('backdating keeps the local day, survives backup and moves the count out of today',()=>{
 const previousTZ=process.env.TZ;process.env.TZ='America/Maceio';
 try{
  const data=structuredClone(initial);data.entries=[{id:'tap',category:'coffee',name:'Café',time:new Date('2026-11-09T00:10').toISOString(),quantity:1,cost:null,unit:'item'}];
  const originalId=data.entries[0].id;
  data.entries[0]={...data.entries[0],time:new Date(joinDateTime({date:'2026-11-08',time:'23:59'})).toISOString()};
  assert.equal(data.entries[0].time,'2026-11-09T02:59:00.000Z');assert.equal(localTime(data.entries[0].time),'2026-11-08T23:59');
  assert.equal(dayEntries(data,'2026-11-08').length,1);assert.equal(dayEntries(data,'2026-11-09').length,0);assert.equal(data.entries.length,1);assert.equal(data.entries[0].id,originalId);assert.ok(validData(JSON.parse(JSON.stringify(data))));
 }finally{if(previousTZ===undefined)delete process.env.TZ;else process.env.TZ=previousTZ}
});
