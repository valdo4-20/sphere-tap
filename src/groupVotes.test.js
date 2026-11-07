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
