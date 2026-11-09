import test from 'node:test';import assert from 'node:assert/strict';
import {questionsFor,migrateJourney,validJourney} from './journeyLogic.js';
import {loadQuestionCorpus} from './questionCorpus.js';
import {factKey,subjectKey,rememberQuestion,selectQuestions} from './questionSelection.js';
import {themeFor} from './quizTopics.js';
test('inverted capital facts share identity and repeat avoidance survives migration',()=>{
 assert.equal(factKey({id:'capital-Q155'}),factKey({id:'daily-world-Q155'}));
 const h=rememberQuestion([],{prompt:'Qual é a capital?',id:'capital-Q155'});const d=migrateJourney({...migrateJourney(null),questionHistory:h});assert.deepEqual(d.questionHistory,h);assert.ok(validJourney(d));assert.equal(validJourney({...d,questionHistory:[null]}),false);
});
test('recent question gives way to unseen question at same difficulty; sourced never bypasses tier',()=>{
 const q=(id,difficulty=1)=>({id,prompt:id,category:'Música',difficulty,options:['A','B','C','D'],correct:0});
 const a=q('a'),b=q('b'),hard={...q('hard',3),sourced:true};
 const selected=selectQuestions([a,b,hard],1,{history:rememberQuestion([],a),tier:1,themeFor,shuffle:a=>a});assert.equal(selected[0].id,'b');
});
test('both modes and golden editions stay within difficulty and contain no repeated subjects',async()=>{
 await loadQuestionCorpus();for(const mode of ['personal','role'])for(const golden of [false,true])for(const level of [1,2,10,11,36,101]){
 const qs=questionsFor(level,{mode,golden});assert.equal(qs.length,mode==='personal'?30:level===1?13:20);assert.equal(new Set(qs.map(subjectKey)).size,qs.length);for(const q of qs){assert.ok(q.difficulty<=(level<=10?1:level<=35?2:3));assert.equal(new Set(q.options).size,4)}assert.deepEqual(qs,questionsFor(level,{mode,golden}));
 }
 assert.notDeepEqual(questionsFor(7,{mode:'personal'}),questionsFor(7,{mode:'personal',golden:true}));
});
test('100 rounds reduce immediate repetition; history shared across modes remains bounded',async()=>{
 await loadQuestionCorpus();for(const mode of ['personal','role']){let history=[],previous=new Set(),repeats=0;for(let level=1;level<=100;level++){
 const qs=questionsFor(level,{mode,history});for(const q of qs){repeats+=previous.has(q.prompt);history=rememberQuestion(history,q)}previous=new Set(qs.map(q=>q.prompt));
 }assert.ok(repeats<(mode==='personal'?150:80),`${mode}: ${repeats}`);assert.ok(history.length<=600)}
});
