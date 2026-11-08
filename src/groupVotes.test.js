import test from 'node:test';
import assert from 'node:assert/strict';
import {recordVote} from './groupVotes.js';
import {lockQuizScroll} from './quizScroll.js';
test('cada amigo marca uma opinião e pode mudá-la sem apagar a dos outros',()=>{
 const ids=['self','alex','greg'];let votes=recordVote({},'self',0,ids);votes=recordVote(votes,'alex',2,ids);
 assert.deepEqual(votes,{self:0,alex:2});votes=recordVote(votes,'alex',3,ids);assert.deepEqual(votes,{self:0,alex:3});
 assert.deepEqual(recordVote(votes,'alex',3,ids),{self:0});assert.equal(recordVote(votes,'missing',1,ids),votes);assert.equal(recordVote(votes,'greg',4,ids),votes);
});
test('modal mantém o ponto do mapa e restaura os estilos originais ao sair',()=>{
 const style={position:'relative',overflow:'',top:'',left:'',width:''},calls=[],win={scrollX:4,scrollY:360,scrollTo:opts=>calls.push(opts)};
 const restore=lockQuizScroll({body:{style}},win);assert.equal(style.position,'fixed');assert.equal(style.top,'-360px');restore();assert.equal(style.position,'relative');assert.equal(style.overflow,'');assert.deepEqual(calls,[{top:360,left:4,behavior:'instant'}]);
});

import {opinionOutcomes,confirmGroupAnswer} from './groupVotes.js';
test('cada opinião recebe o próprio resultado, independentemente da resposta do grupo',()=>{
 const players=[{id:'self'},{id:'alex'},{id:'greg'}],votes={self:0,alex:1};
 assert.deepEqual(opinionOutcomes(players,votes,0).map(p=>p.status),['correct','incorrect','unanswered']);
 const quiz={players,votes,answers:[{correct:0}],index:0,selected:null,draft:1,score:0,opinionResults:{}};
 const done=confirmGroupAnswer(quiz);assert.equal(done.score,0);assert.deepEqual(done.opinionResults,{self:{answered:1,correct:1},alex:{answered:1,correct:0},greg:{answered:0,correct:0}});
 assert.equal(confirmGroupAnswer(done),done); // no double credit on repeated confirm
 const next=confirmGroupAnswer({...done,selected:null,draft:0,votes:{greg:0}});assert.equal(next.score,1);assert.deepEqual(next.opinionResults.self,{answered:1,correct:1});assert.deepEqual(next.opinionResults.greg,{answered:1,correct:1});
});
test('acerto usa o índice real após embaralhar e não trata ausência como erro',()=>{
 const players=[{id:'a'},{id:'b'}];for(let correct=0;correct<4;correct++)assert.deepEqual(opinionOutcomes(players,{a:correct},correct).map(p=>p.status),['correct','unanswered']);
 const state={players,votes:{a:3},answers:[{correct:3}],index:0,selected:null,draft:null,score:0};assert.equal(confirmGroupAnswer(state),state);
});
