import test from 'node:test';
import assert from 'node:assert/strict';
import {dailyStatus,enrollDaily,dailyLevelDate,weeklyColor,availableDailyLevel,personalQuestions} from './journeyDaily.js';
import {completeJourney,migrateJourney,validJourney,earnedXP} from './journeyProgression.js';
const date=s=>new Date(s+'T12:00:00');
test('calendário libera o nível na data, nunca ao concluir o anterior',()=>{
 const start=date('2026-11-07'),data=enrollDaily(migrateJourney(null),start);
 assert.equal(dailyLevelDate(data,2,start),'2026-11-08');
 const done=completeJourney(data,'personal',1,30,start);
 assert.equal(done.personal,1);assert.equal(done.xp,earnedXP(30,1,30));
 assert.equal(dailyStatus(done,start).canPlay,false);
 assert.equal(completeJourney(done,'personal',2,30,start),done);
 assert.equal(dailyStatus(done,date('2026-11-08')).canPlay,true);
 const next=completeJourney(done,'personal',2,30,date('2026-11-08'));
 assert.equal(next.personal,2);assert.equal(dailyStatus(next,date('2026-11-08')).canPlay,false);
 assert.deepEqual(migrateJourney(JSON.parse(JSON.stringify(next))),next);
 assert.equal(validJourney(next),true);
});
test('progresso antigo é preservado; retorno não permite encadear capítulos no mesmo dia',()=>{
 const now=date('2026-11-07'),old=migrateJourney({personal:20,role:7,xp:100});
 const data=enrollDaily(old,now);assert.equal(dailyLevelDate(data,21,now),'2026-11-07');assert.equal(data.personal,20);
 const done=completeJourney(data,'personal',21,25,now);assert.equal(done.role,7);
 const returned=date('2026-11-20'),one=completeJourney(done,'personal',22,30,returned);
 assert.equal(one.personal,22);assert.equal(completeJourney(one,'personal',23,30,returned),one);
 assert.equal(dailyStatus(one,date('2026-11-19')).canPlay,false);
});
test('virada local, meses e anos; datas inválidas são rejeitadas',()=>{
 assert.equal(availableDailyLevel('2026-12-31',date('2027-01-01')),2);
 assert.equal(availableDailyLevel('2028-02-28',date('2028-03-01')),3);
 assert.equal(validJourney({...migrateJourney(null),personalStart:'2026-02-30'}),false);
 const done=completeJourney(enrollDaily(migrateJourney(null),date('2026-11-07')),'personal',1,10,date('2026-11-07'));
 assert.equal(dailyStatus(done,new Date('2026-11-07T23:59:59')).canPlay,false);
 assert.equal(dailyStatus(done,new Date('2026-11-08T00:00:00')).canPlay,true);
});
test('sete dias compartilham cor; semana seguinte muda',()=>{
 for(let n=1;n<=7;n++)assert.equal(weeklyColor(n),weeklyColor(1));assert.notEqual(weeklyColor(8),weeklyColor(7));
});
test('mil edições têm 30 desafios válidos, temas variados e cinco etapas',()=>{
 const signatures=new Set();for(let n=1;n<=1000;n++){
 const questions=personalQuestions(n);assert.equal(questions.length,30);assert.equal(new Set(questions.map(q=>q.prompt)).size,30);
 assert.ok(new Set(questions.map(q=>q.category)).size>=9);
 assert.deepEqual([0,1,2,3,4].map(p=>questions.filter(q=>q.phaseIndex===p).length),[6,6,6,6,6]);
 for(const q of questions){assert.equal(new Set(q.options).size,4);assert.ok(q.correct>=0&&q.correct<4)}
 signatures.add(questions.map(q=>q.prompt).join('|'));
 }assert.equal(signatures.size,1000);assert.deepEqual(personalQuestions(22),personalQuestions(22));
});
