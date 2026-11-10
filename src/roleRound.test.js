import test from 'node:test';
import assert from 'node:assert/strict';
import {answerRoleQuestion} from './roleRound.js';
const state=()=>({players:[{id:'self'},{id:'lia'}],voter:null,votes:{},selected:null,index:0,score:0,answers:[{options:['A','B','C','D'],correct:2}],opinionResults:{}});
test('group answer is immediate and scored once',()=>{const q=answerRoleQuestion(state(),2,3000);assert.equal(q.selected,2);assert.equal(q.score,1);assert.equal(answerRoleQuestion(q,2,4000),q)});
test('answer is submitted directly without selecting group opinion mode',()=>{const q=answerRoleQuestion({...state(),voter:'lia'},2,3000);assert.equal(q.selected,2);assert.equal(q.score,1)});
test('guards entry, completion and invalid answers',()=>{for(const patch of [{entering:true},{finished:true}]){const q={...state(),...patch};assert.equal(answerRoleQuestion(q,1,1000),q)}for(const i of [-1,4,NaN]){const q=state();assert.equal(answerRoleQuestion(q,i,1000),q)}});
