import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {initial} from '../src/model.js';
import {migrateJourney} from '../src/journeyProgression.js';
import {loadQuestionCorpus} from '../src/questionCorpus.js';
import {questionsFor} from '../src/journeyLogic.js';
await loadQuestionCorpus();
const browser=await chromium.launch({headless:true,...(process.env.TAP_BROWSER_EXECUTABLE?{executablePath:process.env.TAP_BROWSER_EXECUTABLE}:{})});
try{for(const width of [375,768])for(const reducedMotion of ['no-preference','reduce']){
 const context=await browser.newContext({viewport:{width,height:844},reducedMotion,serviceWorkers:'block'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const data=structuredClone(initial);data.welcomeDone=true;data.preferences={...data.preferences,journeySound:false,achievementSound:false};data.localFriends=[{id:'lia',name:'Lia',color:'#e8b36e',emblem:'sun',journey:migrateJourney(null)},{id:'absent',name:'Ausente',color:'#dd92ad',emblem:'heart',journey:migrateJourney(null)}];
 await page.addInitScript(data=>{localStorage.setItem('sphere-tap-v1',JSON.stringify(data));sessionStorage.setItem('sphere-tap-opened','yes');localStorage.setItem('sphere-tap-intro-seen','yes')},data);
 await page.goto(process.env.TAP_QA_URL||'http://127.0.0.1:4186');await page.locator('.journey-entry').click();await page.getByRole('button',{name:'Modo Rolê',exact:true}).click();await page.getByRole('button',{name:'Nível 1, selecionar',exact:true}).click();await page.getByRole('button',{name:'Entrar no nível 1',exact:true}).click();await page.getByRole('checkbox',{name:'Lia',exact:true}).check();await page.getByRole('button',{name:'Começar o Rolê',exact:true}).click();
 const group=page.getByRole('button',{name:'Grupo',exact:true});await group.waitFor();await page.waitForFunction(()=>!document.querySelector('.role-voters button').disabled);
 assert.equal(await group.getAttribute('aria-pressed'),'true');assert.equal(await page.getByRole('button',{name:'Confirmar resposta',exact:true}).count(),0);
 const first=await page.locator('#quiz-title').innerText();await page.getByRole('button',{name:'Opinião de Lia',exact:true}).click();await page.locator('.role-answers>button').first().click();assert.equal(await page.locator('.role-feedback').count(),0);assert.equal(await page.locator('.answer-voters i').count(),1);
 await group.click();await page.locator('.role-answers>button').first().click();await page.locator('.role-feedback').waitFor();assert.equal(await page.locator('.role-voters>button').count(),3);assert.equal(await group.isDisabled(),true);
 await page.getByRole('button',{name:'Próxima',exact:true}).click();assert.equal(await group.getAttribute('aria-pressed'),'true');assert.equal(await page.locator('.answer-voters i').count(),0);
 const deferred=await page.locator('#quiz-title').innerText();await page.getByRole('button',{name:'Deixar para depois',exact:true}).click();assert.notEqual(await page.locator('#quiz-title').innerText(),deferred);
 let count=1;while(await page.locator('.role-question').count()){
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.locator('.role-answers>button').first().click();await page.locator('.role-feedback').waitFor();count++;
  if(count===13)assert.equal(await page.locator('#quiz-title').innerText(),deferred);
  await page.getByRole('button',{name:count===13?'Concluir':'Próxima',exact:true}).click();
 }
 assert.equal(count,13);await page.getByRole('button',{name:'Continuar a jornada',exact:true}).waitFor();const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('sphere-tap-v1')));
 assert.equal(saved.journey.role,1);assert.equal(saved.journey.personal,0);assert.equal(saved.localFriends[0].journey.xp,saved.journey.xp);assert.equal(saved.localFriends[1].journey.xp,0);assert.equal(saved.localFriends.length,2);assert.deepEqual(errors,[]);
 console.log(JSON.stringify({width,reducedMotion,questions:count,sharedXP:saved.journey.xp,alwaysVisible:true,postponement:true,errors}));await context.close();
}}finally{await browser.close()}
