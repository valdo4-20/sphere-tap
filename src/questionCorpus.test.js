import {roleQuestionCount} from './roundRules.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {loadQuestionCorpus,corpusCandidates,corpusCount} from './questionCorpus.js';
import {questionsFor} from './journeyLogic.js';
import {themeFor} from './quizTopics.js';
test('acervo importado contém fatos rastreáveis e quatro opções distintas',async()=>{
 const count=await loadQuestionCorpus();assert.equal(count,10000);assert.equal(count,corpusCount());const seen=new Set();
 for(let level=1;level<=100;level++)for(const q of corpusCandidates(level)){
 assert.equal(new Set(q.options).size,4);assert.ok(q.options[q.correct]);assert.match(q.source,/^https:\/\/(www.wikidata.org|www.gutenberg.org|www.geonames.org|pokeapi.co)\//);assert.ok(q.reference);seen.add(q.id);
 }assert.ok(seen.size>=1000);
});
test('matemática deixa de preencher as rodadas; no máximo duas perguntas por nível',async()=>{
 await loadQuestionCorpus();for(let level=1;level<=100;level++)for(const mode of ['personal','role']){
 const qs=questionsFor(level,{mode});assert.equal(qs.length,mode==='personal'?30:roleQuestionCount(level));assert.equal(new Set(qs.map(q=>q.prompt)).size,qs.length);assert.ok(qs.filter(q=>themeFor(q).id==='math').length<=2,`${level}: ${mode}`);
 }
});
