import {roleQuestionCount} from './roundRules.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {themeFor,praiseFor,topicQuestions,quizThemes} from './quizTopics.js';
import {questionsFor} from './journeyLogic.js';
test('temas têm cores e contraste próprios; conteúdo contém cinema, geek, música e países',()=>{
 assert.equal(new Set(Object.values(quizThemes).map(t=>t.color)).size,Object.keys(quizThemes).length);
 for(const q of topicQuestions){assert.equal(new Set(q.options).size,4);assert.ok(themeFor(q).name);assert.ok(q.source?.startsWith('https://'));assert.ok(q.explanation)}
 for(let n=1;n<=30;n++){const questions=questionsFor(n,{mode:'personal'}),themes=new Set(questions.map(q=>themeFor(q).id));for(const t of ['cinema','geek','music','geography','history','biology'])assert.ok(themes.has(t),`${n}: ${t}`)}
 assert.ok(new Set(Array.from({length:8},(_,i)=>praiseFor(1,i))).size>=8);
});
test('música e fatos novos participam do Rolê, com fases e vinte alternativas válidas',()=>{
 const themes=new Set();for(let n=1;n<=30;n++){const qs=questionsFor(n);assert.equal(qs.length,roleQuestionCount(n));for(const q of qs){themes.add(themeFor(q).id);assert.equal(new Set(q.options).size,4)}}for(const t of ['cinema','geek','music','geography','history','biology'])assert.ok(themes.has(t),t);
});
