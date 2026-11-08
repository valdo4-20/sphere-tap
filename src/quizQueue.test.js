import test from 'node:test';
import assert from 'node:assert/strict';
import {deferQuestion} from './quizQueue.js';
const questions=['answered','current','next','last'].map(id=>({id}));
const round=()=>({answers:questions,index:1,selected:null,score:1,performance:{streak:1},draft:2,votes:{friend:2}});
test('postponement moves only the current unanswered question to the end without scoring',()=>{
 const original=round(),next=deferQuestion(original,4200);
 assert.deepEqual(next.answers.map(q=>q.id),['answered','next','last','current']);
 assert.equal(next.index,1);assert.equal(next.score,1);assert.equal(next.performance,original.performance);
 assert.deepEqual(next.votes,{});assert.equal(next.draft,null);assert.equal(next.deferredTimes.current,4200);
 assert.deepEqual(original.answers,questions);
});
test('repeated postponement keeps every question exactly once and retains accumulated time',()=>{
 let q=deferQuestion(round(),4200);q=deferQuestion(q,1000);q=deferQuestion(q,2000);q=deferQuestion(q,6000);
 assert.equal(new Set(q.answers.map(a=>a.id)).size,4);
 assert.equal(q.deferredTimes.current,6000);assert.equal(q.answers.length,4);
});
test('last, answered, entering and completed questions cannot be postponed',()=>{
 for(const patch of [{index:3},{selected:0},{entering:true},{finished:true}]){
  const q={...round(),...patch};assert.equal(deferQuestion(q,100),q);
 }
});
