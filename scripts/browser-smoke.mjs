import {profileBanners} from '../src/profileBanners.js';
import {loadQuestionCorpus} from '../src/questionCorpus.js';
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
await loadQuestionCorpus();
try{
 for(let i=0;i<80;i++){try{if((await fetch('http://127.0.0.1:4173')).ok)break}catch{}await new Promise(r=>setTimeout(r,100))}
 await mkdir('browser-checks',{recursive:true});
 browser=await chromium.launch({headless:true,...(process.env.TAP_BROWSER_CHANNEL?{channel:process.env.TAP_BROWSER_CHANNEL}:{})});
 async function contextFor(width,data,reducedMotion='no-preference'){
  const context=await browser.newContext({viewport:{width,height:844},hasTouch:width<768,isMobile:width<768,reducedMotion});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(data=>{if(!localStorage.getItem('sphere-tap-v1'))localStorage.setItem('sphere-tap-v1',JSON.stringify(data));sessionStorage.setItem('sphere-tap-opened','yes')},{...data,welcomeDone:true,preferences:{...data.preferences,journeySound:false,achievementSound:false}});
  await page.goto('http://127.0.0.1:4173');return {context,page,errors};
 }
 for(const width of [320,390,768,1280]){
  const data=structuredClone(initial);data.appearance.palette=width===390?'neve':'cristal';data.appearance.preset='eclipse';data.appearance.auraColor='#c77b91';
  const {context,page,errors}=await contextFor(width,data);
  await page.locator('.journey-entry').click();await page.getByRole('button',{name:'Modo Pessoal',exact:true}).click();
  await page.getByRole('heading',{name:'Pequenas descobertas'}).waitFor();await page.getByRole('region',{name:'Seu progresso na Jornada'}).getByText('Nível 1',{exact:true}).waitFor();
  const node=page.getByRole('button',{name:'Dia 1, selecionar',exact:true});await node.scrollIntoViewIfNeeded();
  for(let i=0;i<6;i++){if(width<768)await node.tap();else await node.click()}
  await page.waitForTimeout(300);
  const geometry=await node.evaluate(b=>{const r=b.getBoundingClientRect(),p=document.querySelector('.journey-path').getBoundingClientRect(),s=getComputedStyle(b);return {overflow:document.documentElement.scrollWidth>innerWidth,offset:Math.abs(r.x+r.width/2-p.x-p.width/2),down:b.dataset.down,scale:s.scale}});
  assert.equal(geometry.overflow,false,`${width}: overflow`);assert.ok(geometry.offset<2);assert.equal(geometry.down,undefined);assert.equal(geometry.scale,'1');const nodePaint=await node.evaluate(el=>({background:getComputedStyle(el).backgroundColor,shadow:getComputedStyle(el).boxShadow}));assert.equal(nodePaint.background,'rgba(0, 0, 0, 0)');assert.equal(nodePaint.shadow,'none');
  assert.equal(await page.locator('[data-planet-level]').count(),1);assert.equal(await page.locator('[data-planet-level="2"]').count(),0);const planetWidth=await page.locator('.journey-planet').evaluate(el=>el.getBoundingClientRect().width);assert.ok(planetWidth<=112);assert.ok(await page.locator('.waterfall-stream').count()>0);await page.screenshot({path:`browser-checks/planets-${width}.png`});
  assert.equal(await page.getByText('O XP depende dos acertos.').count(),0);assert.equal(await page.getByText('Conquistas da Jornada',{exact:true}).count(),0);
  const enter=page.getByRole('button',{name:'Entrar no dia 1',exact:true});assert.equal(await enter.locator('svg').count(),0);await enter.scrollIntoViewIfNeeded();assert.equal(await enter.evaluate(el=>getComputedStyle(el,'::before').animationName),'journey-invite-shine');const mapY=await page.evaluate(()=>scrollY);await enter.click();
  assert.equal(await page.locator('.journey-entry-scene').count(),0);await page.locator('.journey-answers button').first().waitFor();
  const lockedY=await page.evaluate(()=>-parseFloat(document.body.style.top));console.log('map-entry',JSON.stringify({width,mapY,lockedY}));
  const questions=questionsFor(1,{mode:'personal',difficultyLevel:1,round:1});
  for(let i=0;i<questions.length;i++){
   if(i===0)await page.waitForTimeout(700);
   await page.locator('.journey-answers button').nth(questions[i].correct).click();
   await page.locator('.journey-feedback.is-correct').waitFor();
   if(i===2){await page.locator('.journey-streak').filter({hasText:'3 seguidos'}).waitFor();assert.equal(await page.getByLabel('Tempo desta pergunta').count(),1)}
   if(i===1)await page.screenshot({path:`browser-checks/question-${width}.png`});
   await page.getByRole('button',{name:i===29?'Concluir':'Continuar',exact:true}).click();
  }
  await page.getByRole('heading',{name:'Você foi além.'}).waitFor();await page.screenshot({path:`browser-checks/result-${width}.png`});
  await page.getByRole('button',{name:'Continuar a jornada',exact:true}).click();await page.locator('.journey-overlay').waitFor({state:'detached'});await page.getByText('Por hoje, você chegou lá.').waitFor();await page.waitForTimeout(100);assert.ok(Math.abs((await page.evaluate(()=>scrollY))-lockedY)<3,`map position restored at ${width}: expected ${lockedY}, got ${await page.evaluate(()=>scrollY)}`);assert.equal(await page.locator('.journey-node.current').count(),0);
  await page.locator('.journey-progress-xp').filter({hasText:'400 XP'}).waitFor();assert.equal(await page.locator('.journey-xp-gain').textContent(),'+400 XP');
  let saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('sphere-tap-v1')));assert.equal(saved.journey.personal,1);assert.equal(saved.journey.xp,400);assert.equal(saved.journey.performance.maxStreak,30);assert.equal(saved.journey.performance.perfectRounds,1);assert.ok(saved.achievements['quiz-streak-30']);
  await page.reload();await page.locator('.journey-entry').click();await page.getByText('Por hoje, você chegou lá.').waitFor();
  await page.screenshot({path:`browser-checks/map-${width}.png`,fullPage:true});
  assert.equal(await page.locator('.journey-page .local-ranking').count(),0);assert.equal(await page.locator('.aura-viewport>.aura-engine').getAttribute('data-aura-preset'),'eclipse');assert.equal(await page.locator('.aura-viewport>.aura-engine').getAttribute('data-aura-color'),'#c77b91');
  assert.deepEqual(errors,[]);results.push({width,centered:true,depthRestored:true,dailyLockPersists:true,auraPreserved:true});await context.close();
 }
 // Persistent local friends, editing, score ownership, ranking, explicit removal.
 {
 const {context,page,errors}=await contextFor(390,initial);
 await page.locator('.nav-glass').getByRole('button',{name:'Perfil',exact:true}).click();await page.getByRole('button',{name:'Amigos',exact:true}).click();await page.getByRole('button',{name:'Adicionar',exact:true}).click();
 await page.getByRole('textbox',{name:'Nome do amigo'}).fill('Alex');await page.getByRole('button',{name:'Chama',exact:true}).click();await page.getByRole('button',{name:'Salvar amigo',exact:true}).click();await page.locator('.friend-management').getByText('Alex',{exact:true}).waitFor();assert.equal(await page.locator('.friend-management .lucide-flame').count(),1);
 await page.getByRole('button',{name:'Editar Alex',exact:true}).click();await page.getByRole('textbox',{name:'Nome do amigo'}).fill('Alexandre');await page.getByRole('button',{name:'Salvar amigo',exact:true}).click();
 await page.reload();await page.locator('.journey-entry').click();await page.getByRole('button',{name:'Modo Rolê',exact:true}).click();assert.equal(await page.locator('.local-ranking').count(),0);
 const node=page.getByRole('button',{name:'Nível 1, selecionar',exact:true});await node.scrollIntoViewIfNeeded();await node.click();await page.getByRole('button',{name:'Entrar no nível 1',exact:true}).click();
 const start=page.getByRole('button',{name:'Começar o Rolê',exact:true});assert.equal(await start.isDisabled(),true);await page.getByRole('checkbox',{name:'Alexandre',exact:true}).check();await start.click();await page.locator('.journey-answers button').first().waitFor();
 const questions=questionsFor(1);
 for(let i=0;i<20;i++){
  if(i===0){
   await page.locator('.journey-answers button').nth((questions[i].correct+1)%4).click();await page.getByRole('button',{name:new RegExp('Alexandre:')}).click();
   await page.locator('.journey-answers button').nth(questions[i].correct).click();await page.getByRole('button',{name:new RegExp('Você:')}).click();
   assert.equal(await page.locator('.answer-voters i').count(),2);await page.screenshot({path:'browser-checks/different-opinions.png'});
  }else await page.locator('.journey-answers button').nth(questions[i].correct).click();
  await page.getByRole('button',{name:'Confirmar resposta',exact:true}).click();if(i===0){const outcomes=page.getByRole('list',{name:'Resultado das escolhas'});await outcomes.waitFor();assert.equal(await outcomes.locator('[data-result=correct]').count(),1);assert.equal(await outcomes.locator('[data-result=incorrect]').count(),1);assert.equal(await page.locator('.answer-voters .opinion-correct').count(),1);assert.equal(await page.locator('.answer-voters .opinion-incorrect').count(),1);await page.waitForTimeout(450);await page.screenshot({path:'browser-checks/individual-answer-outcomes.png'});console.log('OUTCOMES_PREVIEW_JPEG:'+(await page.screenshot({type:'jpeg',quality:55})).toString('base64'))}else assert.equal(await page.locator('.opinion-outcomes [data-result=unanswered]').count(),2);await page.getByRole('button',{name:i===19?'Concluir':'Continuar',exact:true}).click();
 }
 assert.equal(await page.getByRole('button',{name:/Passar para/}).count(),0);
 const summary=page.getByRole('region',{name:'Acertos de cada participante'});await summary.waitFor();await summary.getByText('1 acerto em 1 escolha',{exact:true}).waitFor();await summary.getByText('0 acertos em 1 escolha',{exact:true}).waitFor();await page.getByRole('region',{name:'Ranking do Rolê'}).waitFor();assert.equal(await page.locator('.match-ranking li').count(),2);await page.screenshot({path:'browser-checks/match-ranking.png'});
 await page.getByRole('button',{name:'Continuar a jornada',exact:true}).click();await page.locator('.journey-overlay').waitFor({state:'detached'});assert.equal(await page.locator('.local-ranking,.match-ranking').count(),0);
 let saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('sphere-tap-v1')));assert.equal(saved.localFriends[0].emblem,'flame');assert.equal(saved.journey.xp,300);assert.equal(saved.localFriends[0].journey.xp,300);
 assert.equal(await page.locator('[data-planet-level="2"]').getAttribute('data-biome'),'water');assert.equal(await page.locator('[data-planet-level="3"]').count(),0);
 const next=page.getByRole('button',{name:'Nível 2, selecionar',exact:true});await next.scrollIntoViewIfNeeded();await next.click();await page.getByRole('button',{name:'Entrar no nível 2',exact:true}).click();
 await page.getByRole('button',{name:'Adicionar ou editar amigos',exact:true}).click();await page.getByRole('button',{name:'Adicionar',exact:true}).click();await page.getByRole('textbox',{name:'Nome do amigo'}).fill('Greg');await page.getByRole('button',{name:'Salvar amigo',exact:true}).click();await page.getByRole('button',{name:'Voltar à partida',exact:true}).click();
 await page.getByRole('checkbox',{name:'Alexandre',exact:true}).uncheck();await page.getByRole('checkbox',{name:'Greg',exact:true}).check();await page.getByRole('button',{name:'Adicionar ou editar amigos',exact:true}).click();
 await page.getByRole('button',{name:'Remover Alexandre',exact:true}).click();await page.getByRole('button',{name:'Manter amigo',exact:true}).click();assert.equal(await page.locator('.friend-management>li').count(),2);
 await page.getByRole('button',{name:'Remover Alexandre',exact:true}).click();await page.getByRole('button',{name:'Remover amigo',exact:true}).click();assert.equal(await page.locator('.friend-management>li').count(),1);
 await page.getByRole('button',{name:'Voltar à partida',exact:true}).click();assert.equal(await page.getByRole('checkbox',{name:'Greg',exact:true}).isChecked(),true);
 await page.getByRole('button',{name:'Fechar',exact:true}).click();assert.equal(await page.locator('.nav-glass button').last().evaluate(el=>getComputedStyle(el).pointerEvents),'auto');await page.locator('.nav-glass').getByRole('button',{name:'Perfil',exact:true}).click();
 await page.getByRole('button',{name:'Conquistas',exact:true}).click();await page.getByRole('heading',{name:'Suas conquistas.'}).waitFor();
 assert.deepEqual(errors,[]);results.push({localFriendsPersist:true,sharedRoundXP:true,roleRequiresFriends:true,participantsEditableAtLevel:true,rankingOnlyAfterMatch:true,explicitRemoval:true,conquestsSeparate:true});await context.close();
 }
 // Fade into the actual question and fade out while confirming an unfinished round.
 {
 const {context,page,errors}=await contextFor(390,initial);
 await page.locator('.journey-entry').click();await page.getByRole('button',{name:'Modo Pessoal',exact:true}).click();await page.getByRole('button',{name:'Dia 1, selecionar',exact:true}).click();await page.getByRole('button',{name:'Entrar no dia 1',exact:true}).click();await page.locator('.journey-answers button').first().waitFor();
 assert.equal(await page.locator('.journey-entry-rings').count(),0);assert.equal(await page.locator('.journey-question-body').innerText().then(t=>/DE 30|faltam/i.test(t)),false);
 await page.getByRole('button',{name:'Fechar quiz',exact:true}).click();await page.getByRole('button',{name:'Sair da rodada',exact:true}).click();await page.locator('.journey-overlay.is-leaving').waitFor();await page.locator('.journey-overlay').waitFor({state:'detached'});
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('sphere-tap-v1')));assert.equal(saved.journey.personal,0);assert.deepEqual(errors,[]);results.push({entryHasNoLogo:true,exitFades:true,unfinishedRoundNotCredited:true});await context.close();
 }
 // The actual update modal in light and dark themes, using a waiting-worker fixture.
 for(const palette of ['neve','cristal']){
 const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage();const data=structuredClone(initial);data.appearance={...data.appearance,palette,preset:'eclipse',auraColor:'#c77b91'};
 await page.addInitScript(data=>{
  localStorage.setItem('sphere-tap-v1',JSON.stringify({...data,welcomeDone:true}));sessionStorage.setItem('sphere-tap-opened','yes');
  const worker={state:'installed',scriptURL:location.origin+'/sw.js',postMessage(message,ports){if(message==='SPHERE_UPDATE_INFO')ports?.[0]?.postMessage({build:'fixture-update',version:'1.2.1',title:'Do seu jeito.',changes:['Uma Jornada mais leve.']})}};
  const registration={waiting:worker,active:null,addEventListener(){},removeEventListener(){},update:async()=>{}};
  Object.defineProperty(navigator,'serviceWorker',{configurable:true,value:{controller:{},register:async()=>registration,addEventListener(){},removeEventListener(){}}});
 },data);
 await page.goto('http://127.0.0.1:4173');const modal=page.getByRole('dialog',{name:'Atualização disponível',exact:true});await modal.waitFor();
 const colors=await modal.locator('.dialog-header').evaluate(el=>{const cs=getComputedStyle(el),title=getComputedStyle(el.querySelector('h2'));return {background:cs.backgroundColor,text:title.color,opacity:title.opacity}});assert.notEqual(colors.background,colors.text);assert.equal(colors.opacity,'1');
 assert.equal(await modal.locator('.tap-update-orbit').count(),0);assert.equal(await modal.locator('.tap-update-mark').evaluate(el=>getComputedStyle(el).animationName),'none');assert.equal(await modal.locator('.aura-engine').getAttribute('data-aura-preset'),'eclipse');assert.equal(await modal.locator('.aura-engine').getAttribute('data-aura-color'),'#c77b91');
 await page.screenshot({path:`browser-checks/update-${palette}.png`});await page.getByRole('button',{name:'Depois',exact:true}).click();await modal.waitFor({state:'detached'});results.push({updateTheme:palette,headerReadable:true,logoStatic:true,customAura:true});await context.close();
 }
 // A new local date unlocks with a finite lock animation and is remembered.
 {
 const data=structuredClone(initial),today=localDate(),yesterday=new Date();yesterday.setDate(yesterday.getDate()-1);data.journey={...data.journey,mode:'personal',personal:1,personalStart:localDate(yesterday),personalLastDate:localDate(yesterday)};
 const {context,page}=await contextFor(390,data,'reduce');await page.locator('.journey-entry').click();await page.getByRole('button',{name:'Dia 2, selecionar',exact:true}).waitFor();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('sphere-tap-v1')));assert.equal(saved.journey.personalUnlockSeen,today);
 assert.equal(await page.locator('[data-planet-level="2"]').count(),1);assert.equal(await page.locator('[data-planet-level="3"]').count(),0);assert.equal(await page.locator('[data-planet-level="2"] .planet-art').evaluate(b=>getComputedStyle(b).animationName),'none');
 assert.equal(await page.locator('[data-planet-level="2"] .waterfall-stream').first().evaluate(el=>getComputedStyle(el).animationName),'none');results.push({nextDateUnlocks:true,reducedMotionHonored:true});await context.close();
 }
 // Real earned achievements unlock banners; locked banners only show their goal.
 for(const width of [320,390,1280]){
  const data=structuredClone(initial);data.displayName='Valdo';data.journey={...data.journey,role:1,personal:5,xp:500};data.achievements={'your-space':{earnedAt:'2026-11-07T12:00:00.000Z'},'journey-role-1':{earnedAt:'2026-11-07T12:00:00.000Z'},'journey-personal-5':{earnedAt:'2026-11-07T12:00:00.000Z'}};data.appearance.palette=width===390?'neve':'cristal';
  const {context,page,errors}=await contextFor(width,data,width===320?'reduce':'no-preference');await page.locator('.nav-glass').getByRole('button',{name:'Perfil',exact:true}).click();
  const centeredName=await page.locator('.profile-banner-hero').evaluate(el=>{const hero=el.getBoundingClientRect(),name=el.querySelector('h1').getBoundingClientRect();return Math.abs(hero.x+hero.width/2-name.x-name.width/2)});assert.ok(centeredName<2,'profile name centered');await page.locator('.banner-wardrobe summary').click();await page.getByRole('button',{name:'Banner Explorador',exact:true}).click();assert.equal(await page.getByRole('button',{name:'Banner Explorador',exact:true}).getAttribute('aria-pressed'),'true');
  await page.reload();await page.locator('.nav-glass').getByRole('button',{name:'Perfil',exact:true}).click();await page.locator('.banner-wardrobe summary').click();assert.equal(await page.getByRole('button',{name:'Banner Explorador',exact:true}).getAttribute('aria-pressed'),'true');
  await page.screenshot({path:`browser-checks/banners-${width}.png`});
  await page.getByRole('button',{name:'Banner Coroa solar, bloqueado',exact:true}).click();const detail=page.getByRole('dialog',{name:'10 desafios em companhia',exact:true});await detail.waitFor();assert.equal(await detail.getByRole('button',{name:'Usar banner',exact:true}).count(),0);await detail.getByRole('button',{name:'Fechar',exact:true}).click();
  await page.getByRole('button',{name:'Conquistas',exact:true}).click();const map=page.getByRole('group',{name:'Constelação de conquistas',exact:true});await map.waitFor();await map.scrollIntoViewIfNeeded();await page.waitForTimeout(600);assert.equal(await map.locator('.reward-node').count(),12);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  if(width===320)assert.equal(await map.locator('.reward-node').first().evaluate(el=>getComputedStyle(el).animationName),'none');
  await page.screenshot({path:`browser-checks/rewards-${width}.png`});
  await map.locator('.reward-node').first().click();await page.getByRole('dialog',{name:'Seu espaço',exact:true}).waitFor();await page.getByRole('dialog',{name:'Seu espaço',exact:true}).getByRole('button',{name:'Fechar',exact:true}).click();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('sphere-tap-v1')));assert.equal(saved.profileDetails.banner,'voyager');assert.equal(saved.journey.xp,500);assert.deepEqual(errors,[]);results.push({rewardWidth:width,realBannerUnlock:true,bannerPersists:true,constellationAccessible:true});await context.close();
 }
 // Restore the account's saved XP, player level and every evolving star color.
 {
 const data=structuredClone(initial);data.journey={...data.journey,xp:1500};const {context,page}=await contextFor(320,data,'reduce');
 for(const [stars,rank] of [[0,'yellow'],[15,'orange'],[40,'red'],[80,'purple'],[140,'blue'],[220,'fire'],[340,'ice'],[500,'prismatic']]){
  await page.evaluate(stars=>{const d=JSON.parse(localStorage.getItem('sphere-tap-v1'));d.journey.stars=stars;localStorage.setItem('sphere-tap-v1',JSON.stringify(d))},stars);await page.reload();await page.locator('.nav-glass').getByRole('button',{name:'Jornada',exact:true}).click();const panel=page.getByRole('region',{name:'Seu progresso na Jornada'});await panel.waitFor();assert.equal(await panel.getAttribute('data-star-rank'),rank);const compact=await panel.evaluate(el=>{const r=el.getBoundingClientRect(),head=el.closest('header').getBoundingClientRect();return {width:r.width,rightGap:head.right-r.right,background:getComputedStyle(el).backgroundColor}});assert.ok(compact.width<=112&&Math.abs(compact.rightGap)<2,'compact progress stays at right');assert.equal(compact.background,'rgba(0, 0, 0, 0)');await panel.getByText('Nível 5',{exact:true}).waitFor();await panel.getByText('1500 XP',{exact:true}).waitFor();assert.equal(await panel.locator('svg').evaluate(el=>getComputedStyle(el).opacity),'1');assert.equal(await page.locator('.local-ranking').count(),0);
 }await page.screenshot({path:'browser-checks/journey-saved-progress.png'});console.log('PROGRESS_PREVIEW_JPEG:'+(await page.screenshot({type:'jpeg',quality:55})).toString('base64'));results.push({savedProgressVisible:true,allStarClasses:true});await context.close();
 }
 // Every decorative shape fits inside the banner viewport and its containing card.
 for(const width of [320,390]){
 const data=structuredClone(initial);for(const b of profileBanners)if(b.achievement)data.achievements[b.achievement]={earnedAt:'2026-11-07T12:00:00.000Z'};
 const {context,page}=await contextFor(width,data,'reduce');await page.locator('.nav-glass').getByRole('button',{name:'Perfil',exact:true}).click();await page.locator('.banner-wardrobe summary').click();
 for(const b of profileBanners){await page.getByRole('button',{name:`Banner ${b.name}`,exact:true}).click();const violations=await page.locator('.profile-banner-art svg').evaluateAll(svgs=>svgs.flatMap(svg=>{const box=svg.viewBox.baseVal,root=svg.getScreenCTM().inverse(),errors=[];for(const shape of svg.querySelectorAll('path,circle')){const bounds=shape.getBBox(),m=root.multiply(shape.getScreenCTM());for(const [x,y] of [[bounds.x,bounds.y],[bounds.x+bounds.width,bounds.y],[bounds.x,bounds.y+bounds.height],[bounds.x+bounds.width,bounds.y+bounds.height]]){const p=new DOMPoint(x,y).matrixTransform(m);if(p.x<box.x+1||p.y<box.y+1||p.x>box.x+box.width-1||p.y>box.y+box.height-1)errors.push(shape.getAttribute('class')||shape.tagName)}}return errors}));assert.deepEqual(violations,[],`banner bounds: ${b.name}, ${width}`)}
 await page.locator('.profile-banner-hero').scrollIntoViewIfNeeded();await page.screenshot({path:`browser-checks/banner-unclipped-${width}.png`});results.push({bannerWidth:width,allBannersFit:true});await context.close();
 }
 await writeFile('browser-checks/results.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
}finally{await browser?.close();server.kill()}
