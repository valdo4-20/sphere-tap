import assert from 'node:assert/strict';
import {questionsFor} from '../src/journeyLogic.js';
import {loadQuestionCorpus,playableCorpusCandidates} from '../src/questionCorpus.js';
import {rememberQuestion,subjectKey,tierForLevel} from '../src/questionSelection.js';
await loadQuestionCorpus();
const report={scope:'Selection simulation, not an individual fact check',curatedImported:playableCorpusCandidates(1).length,modes:[]};
for(const mode of ['personal','role']){
 let history=[],previous=new Set(),immediateRepeats=0,total=0;
 for(let level=1;level<=100;level++){
  const qs=questionsFor(level,{mode,history});
  assert.equal(qs.length,mode==='personal'?30:level===1?13:20);
  assert.equal(new Set(qs.map(subjectKey)).size,qs.length);
  for(const q of qs){assert.ok(q.difficulty<=tierForLevel(level));assert.equal(new Set(q.options).size,4);assert.ok(q.options[q.correct]);immediateRepeats+=previous.has(q.prompt);history=rememberQuestion(history,q);total++}
  previous=new Set(qs.map(q=>q.prompt));
 }
 assert.ok(immediateRepeats<(mode==='personal'?150:80));
 report.modes.push({mode,rounds:100,total,immediateRepeats});
}
console.log(JSON.stringify(report,null,2));
