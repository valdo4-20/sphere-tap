import {chromium} from '@playwright/test';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {initial} from '../src/model.js';
import {questionsFor} from '../src/journeyLogic.js';
import {localDate} from '../src/journeyDaily.js';
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','4173'],{stdio:'ignore'});
let browser;
const results=[];
try{
 for(let i=0;i<80;i++){try{if((await fetch('http://127.0.0.1:4173')).ok)break}catch{}await new Promise(r=>setTimeout(r,100))}
 await mkdir('browser-checks',{recursive:true});
 browser=await chromium.launch({headless:true});
 async function contextFor(width,data,reducedMotion='no-preference'){
  const context=await browser.newContext({viewport:{width,height:844},hasTouch:width<768,isMobile:width<768,reducedMotion});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(data=>{if(!localStorage.getItem('sphere-tap-v1'))localStorage.setItem('sphere-tap-v1',JSON.stringify(data));sessionStorage.setItem('sphere-tap-opened','yes')},{...data,welcomeDone:true,preferences:{...data.preferences,journeySound:false,achievementSound:false}});
  await page.goto('http://127.0.0.1:4173');return {context,page,errors};
 }
 for(const width of [320,390,768,1280]){
  const data=structuredClone(initial);data.appearance.palette=width===390?'neve':'cristal';
  const {context,page,errors}=await contextFor(width,data);
  await page.locator('.journey-entry').click();await page.getByRole('button',{name:'Modo Pessoal',exact:true}).click();
  await page.getByRole('heading',{name:'Pequenas descobertas'}).waitFor();
  const node=page.getByRole('button',{name:'Dia 1, selecionar',exact:true});await node.scrollIntoViewIfNeeded();
  for(let i=0;i<6;i++){if(width<768)await node.tap();else await node.click()}
  await page.waitForTimeout(300);
  const geometry=await node.evaluate(b=>{const r=b.getBoundingClientRect(),p=document.querySelector('.journey-path').getBoundingClientRect(),s=getComputedStyle(b);return {overflow:document.documentElement.scrollWidth>innerWidth,offset:Math.abs(r.x+r.width/2-p.x-p.width/2),down:b.dataset.down,scale:s.scale}});
  assert.equal(geometry.overflow,false,`${width}: overflow`);assert.ok(geometry.offset<2);assert.equal(geometry.down,undefined);assert.equal(geometry.scale,'1');
  assert.equal(await page.getByText('O XP depende dos acertos.').count(),0);assert.equal(await page.getByText('Conquistas da Jornada',{exact:true}).count(),0);
  const enter=page.getByRole('button',{name:'Entrar no dia 1',exact:true});assert.equal(await enter.locator('svg').count(),0);await enter.click();
  await page.getByRole('heading',{name:'Entrando no dia 1'}).waitFor();await page.locator('.journey-answers button').first().waitFor();
  const questions=questionsFor(1,{mode:'personal',difficultyLevel:1,round:1});
  for(let i=0;i<questions.length;i++){
   await page.locator('.journey-answers button').nth(questions[i].correct).click();
   await page.locator('.journey-feedback.is-correct').waitFor();
   if(i===1)await page.screenshot({path:`browser-checks/question-${width}.png`});
   await page.getByRole('button',{name:i===29?'Concluir':'Continuar',exact:true}).click();
  }
  await page.getByRole('heading',{name:'Você foi além.'}).waitFor();await page.screenshot({path:`browser-checks/result-${width}.png`});
  await page.getByRole('button',{name:'Continuar a jornada',exact:true}).click();await page.getByText('Seu capítulo de hoje está concluído.').waitFor();assert.equal(await page.locator('.journey-node.current').count(),0);
  let saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('sphere-tap-v1')));assert.equal(saved.journey.personal,1);assert.equal(saved.journey.xp,400);
  await page.reload();await page.locator('.journey-entry').click();await page.getByText('Seu capítulo de hoje está concluído.').waitFor();
  await page.screenshot({path:`browser-checks/map-${width}.png`,fullPage:true});
  assert.deepEqual(errors,[]);results.push({width,centered:true,depthRestored:true,dailyLockPersists:true});await context.close();
 }
 // Persistent local friends, editing, score ownership, ranking, explicit removal.
 {
 const {context,page,errors}=await contextFor(390,initial);
 await page.locator('.nav-glass').getByRole('button',{name:'Perfil',exact:true}).click();await page.getByRole('button',{name:'Amigos',exact:true}).click();await page.getByRole('button',{name:'Adicionar',exact:true}).click();
 await page.getByRole('textbox',{name:'Nome do amigo'}).fill('Alex');await page.getByRole('button',{name:'Salvar amigo',exact:true}).click();await page.locator('.friend-management').getByText('Alex',{exact:true}).waitFor();
 await page.getByRole('button',{name:'Editar Alex',exact:true}).click();await page.getByRole('textbox',{name:'Nome do amigo'}).fill('Alexandre');await page.getByRole('button',{name:'Salvar amigo',exact:true}).click();
 await page.reload();await page.locator('.journey-entry').click();await page.getByRole('button',{name:'Modo Rolê',exact:true}).click();await page.locator('.local-ranking li').filter({hasText:'Alexandre'}).getByRole('button').click();
 const node=page.getByRole('button',{name:'Nível 1, selecionar',exact:true});await node.scrollIntoViewIfNeeded();await node.click();await page.getByRole('button',{name:'Entrar no nível 1',exact:true}).click();await page.locator('.journey-answers button').first().waitFor();
 const questions=questionsFor(1);for(let i=0;i<20;i++){await page.locator('.journey-answers button').nth(questions[i].correct).click();await page.getByRole('button',{name:i===19?'Concluir':'Continuar',exact:true}).click()}
 await page.getByRole('button',{name:'Continuar a jornada',exact:true}).click();
 let saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('sphere-tap-v1')));assert.equal(saved.journey.xp,0);assert.equal(saved.localFriends[0].journey.xp,300);
 await page.screenshot({path:'browser-checks/friends-rank.png',fullPage:true});
 await page.locator('.local-ranking').getByRole('button',{name:'Amigos',exact:true}).click();await page.getByRole('button',{name:'Remover Alexandre',exact:true}).click();await page.getByRole('button',{name:'Manter amigo',exact:true}).click();assert.equal(await page.locator('.friend-management>li').count(),1);
 await page.getByRole('button',{name:'Remover Alexandre',exact:true}).click();await page.getByRole('button',{name:'Remover amigo',exact:true}).click();assert.equal(await page.locator('.friend-management>li').count(),0);
 await page.getByRole('button',{name:'Conquistas',exact:true}).click();await page.getByRole('heading',{name:'Suas conquistas.'}).waitFor();
 assert.deepEqual(errors,[]);results.push({localFriendsPersist:true,friendXPIsolated:true,explicitRemoval:true,conquestsSeparate:true});await context.close();
 }
 // A new local date unlocks with a finite lock animation and is remembered.
 {
 const data=structuredClone(initial),today=localDate(),yesterday=new Date();yesterday.setDate(yesterday.getDate()-1);data.journey={...data.journey,mode:'personal',personal:1,personalStart:localDate(yesterday),personalLastDate:localDate(yesterday)};
 const {context,page}=await contextFor(390,data,'reduce');await page.locator('.journey-entry').click();await page.getByRole('button',{name:'Dia 2, selecionar',exact:true}).waitFor();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('sphere-tap-v1')));assert.equal(saved.journey.personalUnlockSeen,today);
 assert.equal(await page.locator('.journey-unlocking').evaluate(b=>getComputedStyle(b.querySelector('.unlock-star')).animationName),'none');
 results.push({nextDateUnlocks:true,reducedMotionHonored:true});await context.close();
 }
 await writeFile('browser-checks/results.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
}finally{await browser?.close();server.kill()}
