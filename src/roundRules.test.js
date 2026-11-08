import test from 'node:test';
import assert from 'node:assert/strict';
import {questionsFor} from './journeyLogic.js';
import {initial,migrate,validData} from './model.js';
import {completeGroupRound,addFriend,friendColors} from './localFriends.js';
test('first Rolê has 13 questions; subsequent Rolês have 20 and Personal retains 30',()=>{
 assert.equal(questionsFor(1).length,13);assert.equal(questionsFor(2).length,20);
 assert.equal(questionsFor(1,{mode:'personal'}).length,30);
 assert.deepEqual([0,1,2].map(i=>questionsFor(1).filter(q=>q.phaseIndex===i).length),[3,6,4]);
});
test('13-answer reward credits only participants, once, preserving old progress and backups',()=>{
 let d=addFriend(structuredClone(initial),{id:'alex',name:'Alex',color:friendColors[0]});
 d=addFriend(d,{id:'greg',name:'Greg',color:friendColors[1]});
 d.localFriends[0].journey={...d.localFriends[0].journey,role:4,xp:700};
 const absent=structuredClone(d.localFriends[1]);
 const next=completeGroupRound(d,'intro-13',1,13,['alex'],new Date('2026-11-08T15:00:00Z'),13);
 assert.equal(next.journey.xp,230);assert.equal(next.localFriends[0].journey.xp,930);
 assert.deepEqual(next.localFriends[1],absent);assert.equal(validData(next),true);
 assert.equal(completeGroupRound(next,'intro-13',1,13,['alex'],new Date(),13),next);
 assert.deepEqual(migrate(JSON.parse(JSON.stringify(next))).journey,next.journey);
 assert.equal(completeGroupRound(d,'legacy-20',1,20,['alex']).journey.xp,300);
});
