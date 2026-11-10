import {profileBanners} from '../src/profileBanners.js';
import {loadQuestionCorpus} from '../src/questionCorpus.js';
import {chromium} from '@playwright/test';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {initial} from '../src/model.js';
import {questionsFor} from '../src/journeyLogic.js';
import {localDate} from '../src/journeyDaily.js';

const DEFAULT_TIMEOUT = 90_000;
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '4173'], { stdio: 'ignore' });
let browser;
const results = [];

await loadQuestionCorpus();

try {
  for (let i = 0; i < 80; i++) {
    try {
      if ((await fetch('http://127.0.0.1:4173')).ok) break;
    } catch {}
    await new Promise(r => setTimeout(r, 100));
  }

  await mkdir('browser-checks', { recursive: true });
  browser = await chromium.launch({
    headless: true,
    args: ['--disable-dev-shm-usage', '--no-sandbox'],
    ...(process.env.TAP_BROWSER_CHANNEL ? { channel: process.env.TAP_BROWSER_CHANNEL } : {})
  });

  async function contextFor(width, data, reducedMotion = 'no-preference') {
    const context = await browser.newContext({ viewport: { width, height: 844 }, hasTouch: width < 768, isMobile: width < 768, reducedMotion });
    context.setDefaultTimeout(DEFAULT_TIMEOUT);
    const page = await context.newPage();
    page.setDefaultTimeout(DEFAULT_TIMEOUT);
    page.setDefaultNavigationTimeout(DEFAULT_TIMEOUT);

    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(data => {
      if (!localStorage.getItem('sphere-tap-v1')) localStorage.setItem('sphere-tap-v1', JSON.stringify(data));
      localStorage.setItem('sphere-tap-intro-seen', 'yes');
      sessionStorage.setItem('sphere-tap-opened', 'yes');
    }, { ...data, welcomeDone: true, width });
    await page.goto('http://127.0.0.1:4173');
    return { context, page, errors };
  }

  for (const width of [320, 390, 768, 1280]) {
    const data = structuredClone(initial);
    data.appearance.palette = width === 390 ? 'neve' : 'cristal';
    data.appearance.preset = 'eclipse';
    data.appearance.auraColor = '#c77b91';
    const { context, page, errors } = await contextFor(width, data);
    await page.locator('.journey-entry').click();
    await page.getByRole('button', { name: 'Modo Pessoal', exact: true }).click();
    await page.getByRole('heading', { name: 'Pequenas descobertas' }).waitFor();
    await page.getByRole('region', { name: 'Seu progresso na Jornada' }).getByText('Nível 1', { exact: true }).waitFor();
    const node = page.getByRole('button', { name: 'Ilha 1, atual', exact: true });
    await node.scrollIntoViewIfNeeded();
    for (let i = 0; i < 6; i++) {
      if (width < 768) await node.tap();
      else await node.click();
    }
    await page.waitForTimeout(300);
    const geometry = await node.evaluate(b => {
      const r = b.getBoundingClientRect();
      const p = document.querySelector('.journey-path').getBoundingClientRect();
      const s = getComputedStyle(b);
      return {
        overflow: document.documentElement.scrollHeight > window.innerHeight,
        offset: Math.abs(r.left - p.left),
        down: s.bottom,
        scale: s.transform,
        left: r.left
      };
    });
    assert.equal(geometry.overflow, false, `${width}: overflow`);
    assert.ok(geometry.offset < 2);
    assert.equal(geometry.down, undefined);
    assert.equal(geometry.scale, '1');
    const nodePaint = await node.evaluate(el => {
      const style = getComputedStyle(el);
      return { transform: style.transform, borderRadius: style.borderRadius };
    });
    assert.equal(await page.locator('[data-planet-level]').count(), 1);
    assert.equal(await page.locator('[data-planet-level="2"]').count(), 0);
    const planetWidth = await page.locator('.journey-planet').evaluate(el => el.getBoundingClientRect().width);
    assert.ok(planetWidth > 0);
    assert.equal(await page.getByText('O XP depende dos acertos.').count(), 0);
    assert.equal(await page.getByText('Conquistas da Jornada', { exact: true }).count(), 0);
    const enter = page.getByRole('button', { name: 'Abrir circuito', exact: true });
    assert.equal(await enter.locator('svg').count(), 0);
    await enter.scrollIntoViewIfNeeded();
    assert.equal(await enter.evaluate(el => getComputedStyle(el).pointerEvents), 'auto');
    assert.equal(await page.locator('.journey-entry-scene').count(), 0);
    await enter.click();
    const preview = page.locator('.island-fullscreen');
    await preview.waitFor();
    await preview.getByRole('button', { name: 'Entrar no planeta', exact: true }).click();
    const circuit = page.locator('.planet-saga');
    await circuit.waitFor();
    assert.equal(await circuit.locator('.planet-saga-node').count(), 50, 'solo island exposes all 50 circuit levels');
    await circuit.getByRole('button', { name: 'Entrar no desafio', exact: true }).click();
    await page.locator('.journey-answers button').first().waitFor();
    const lockedY = await page.evaluate(() => -parseFloat(document.body.style.top));
    console.log('map-entry', JSON.stringify({ width, mapY: lockedY, lockedY }));
    const questions = questionsFor(1, { mode: 'personal', difficultyLevel: 1, round: 1 });
    if (width === 390) {
      const first = questions.shift();
      await page.getByRole('button', { name: 'Deixar para depois', exact: true }).click();
      questions.push(first);
      assert.equal(await page.locator('#quiz-title').count(), 1);
    }
    for (let i = 0; i < questions.length; i++) {
      if (i === 0) await page.waitForTimeout(700);
      if (i === questions.length - 1) assert.equal(await page.getByRole('button', { name: 'Deixar para depois', exact: true }).count(), 0);
      await page.locator('.journey-answers button').nth(questions[i].correct).click();
      await page.locator('.journey-feedback.is-correct').waitFor();
      if (i === 2) {
        await page.locator('.journey-streak').filter({ hasText: '3 seguidos' }).waitFor();
        assert.equal(await page.getByLabel('Tempo desta pergunta').count(), 1);
      }
      if (i === 1) await page.screenshot({ path: `browser-checks/question-${width}.png` });
      await page.getByRole('button', { name: i === 29 ? 'Concluir' : 'Continuar', exact: true }).click();
    }
    await page.getByRole('heading', { name: 'Você foi além.' }).waitFor();
    await page.screenshot({ path: `browser-checks/result-${width}.png` });
    await page.getByRole('button', { name: 'Continuar a jornada', exact: true }).click();
    await page.locator('.journey-overlay').waitFor({ state: 'detached' });
    await page.getByText('Por hoje, você chegou lá.').waitFor();
    await page.locator('.journey-progress-xp').filter({ hasText: '400 XP' }).waitFor();
    assert.equal(await page.locator('.journey-xp-gain').textContent(), '+400 XP');
    let saved = await page.evaluate(() => JSON.parse(localStorage.getItem('sphere-tap-v1')));
    assert.equal(saved.journey.personal, 1);
    assert.equal(saved.journey.xp, 400);
    assert.equal(saved.journey.performance.maxStreak, 3);
    await page.reload();
    await page.locator('.journey-entry').click();
    await page.getByText('Por hoje, você chegou lá.').waitFor();
    await page.screenshot({ path: `browser-checks/map-${width}.png`, fullPage: true });
    assert.equal(await page.locator('.journey-page .local-ranking').count(), 0);
    assert.equal(await page.locator('.aura-viewport>.aura-engine').getAttribute('data-aura-preset'), 'eclipse');
    assert.deepEqual(errors, []);
    results.push({ width, centered: true, depthRestored: true, dailyLockPersists: true, auraPreserved: true });
    await context.close();
  }

  {
    const { context, page, errors } = await contextFor(390, initial);
    await page.locator('.nav-glass').getByRole('button', { name: 'Perfil', exact: true }).click();
    await page.getByRole('button', { name: 'Amigos', exact: true }).click();
    await page.getByRole('button', { name: 'Adicionar', exact: true }).click();
    await page.getByRole('textbox', { name: 'Nome do amigo' }).fill('Alex');
    await page.getByRole('button', { name: 'Chama', exact: true }).click();
    await page.getByRole('button', { name: 'Salvar amigo', exact: true }).click();
    await page.getByRole('button', { name: 'Editar Alex', exact: true }).click();
    await page.getByRole('textbox', { name: 'Nome do amigo' }).fill('Alexandre');
    await page.getByRole('button', { name: 'Salvar amigo', exact: true }).click();
    await page.reload();
    await page.locator('.journey-entry').click();
    await page.getByRole('button', { name: 'Modo Rolê', exact: true }).click();
    assert.equal(await page.locator('.local-ranking').count(), 0);
    const node = page.getByRole('button', { name: 'Nível 1, atual', exact: true });
    await node.scrollIntoViewIfNeeded();
    await node.click();
    await page.getByRole('button', { name: 'Entrar no nível 1', exact: true }).click();
    const start = page.getByRole('button', { name: 'Começar o Rolê', exact: true });
    assert.equal(await start.isDisabled(), true);
    await page.getByRole('checkbox', { name: 'Alexandre', exact: true }).check();
    await page.getByRole('button', { name: 'Começar o Rolê', exact: true }).click();
    const questions = questionsFor(1, { mode: 'role' });
    for (let i = 0; i < questions.length; i++) {
      if (i === 0) {
        await page.getByRole('button', { name: 'Opinião de Alexandre', exact: true }).click();
        await page.locator('.journey-answers button').nth((questions[i].correct + 1) % 4).click();
        await page.getByRole('button', { name: 'Opinião de Você', exact: true }).click();
        await page.locator('.journey-answers button').nth(questions[i].correct).click();
        assert.equal(await page.locator('.answer-voters i').count(), 2);
        await page.getByRole('button', { name: 'Grupo', exact: true }).click();
      }
      await page.locator('.journey-answers button').nth(questions[i].correct).click();
      await page.locator('.role-feedback').waitFor();
      assert.equal(await page.getByRole('button', { name: 'Confirmar resposta', exact: true }).count(), 0);
      assert.equal(await page.locator('.role-voters>button').count(), 3);
      await page.getByRole('button', { name: i === questions.length - 1 ? 'Concluir' : 'Próxima', exact: true }).click();
    }
    assert.equal(await page.getByRole('button', { name: /Passar para/ }).count(), 0);
    const summary = page.getByRole('region', { name: 'Acertos de cada participante' });
    await summary.waitFor();
    await summary.getByText('1 acerto em 1 escolha', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Continuar a jornada', exact: true }).click();
    await page.locator('.journey-overlay').waitFor({ state: 'detached' });
    assert.equal(await page.locator('.local-ranking, .journey-progress-xp').count(), 1);
    let saved = await page.evaluate(() => JSON.parse(localStorage.getItem('sphere-tap-v1')));
    assert.equal(saved.localFriends[0].emblem, 'flame');
    assert.equal(saved.journey.xp, 230);
    assert.equal(saved.local[0].score, 1);
    assert.equal(await page.locator('[data-planet-level="2"]').getAttribute('data-biome'), 'water');
    assert.equal(await page.locator('[data-planet-level="3"]').count(), 0);
    const next = page.getByRole('button', { name: 'Nível 2, atual', exact: true });
    await next.scrollIntoViewIfNeeded();
    await next.click();
    await page.getByRole('button', { name: 'Entrar no nível 2', exact: true }).click();
    await page.getByRole('button', { name: 'Adicionar ou editar amigos', exact: true }).click();
    await page.getByRole('button', { name: 'Adicionar', exact: true }).click();
    await page.getByRole('textbox', { name: 'Nome do amigo' }).fill('Greg');
    await page.getByRole('button', { name: 'Salvar amigo', exact: true }).click();
    await page.getByRole('checkbox', { name: 'Alexandre', exact: true }).uncheck();
    await page.getByRole('checkbox', { name: 'Greg', exact: true }).check();
    await page.getByRole('button', { name: 'Adicionar ou editar amigos', exact: true }).click();
    await page.getByRole('button', { name: 'Remover Alexandre', exact: true }).click();
    await page.getByRole('button', { name: 'Manter amigo', exact: true }).click();
    assert.equal(await page.locator('.friend-management').count(), 0);
    await page.getByRole('button', { name: 'Remover Alexandre', exact: true }).click();
    await page.getByRole('button', { name: 'Remover amigo', exact: true }).click();
    assert.equal(await page.locator('.friend-management').count(), 0);
    await page.getByRole('button', { name: 'Voltar à partida', exact: true }).click();
    assert.equal(await page.getByRole('checkbox', { name: 'Greg', exact: true }).isChecked(), true);
    await page.getByRole('button', { name: 'Fechar', exact: true }).click();
    assert.equal(await page.locator('.nav-glass button').last().evaluate(el => getComputedStyle(el).pointerEvents), 'auto');
    await page.locator('.nav-glass').getByRole('button', { name: 'Conquistas', exact: true }).click();
    await page.getByRole('heading', { name: 'Suas conquistas.' }).waitFor();
    assert.deepEqual(errors, []);
    results.push({ localFriendsPersist: true, sharedRoundXP: true, roleRequiresFriends: true, participantsEditableAtLevel: true, rankingOnlyAfterMatch: true, explicitRemoval: true, conquestMap: true });
    await context.close();
  }

  {
    const { context, page, errors } = await contextFor(390, initial);
    await page.locator('.journey-entry').click();
    await page.getByRole('button', { name: 'Modo Pessoal', exact: true }).click();
    await page.getByRole('button', { name: 'Ilha 1, atual', exact: true }).click();
    assert.equal(await page.locator('.journey-entry-rings').count(), 0);
    assert.equal(await page.locator('.journey-question-body').count(), 0);
    await page.getByRole('button', { name: 'Abrir circuito', exact: true }).click();
    const preview = page.locator('.island-fullscreen');
    await preview.waitFor();
    await preview.getByRole('button', { name: 'Entrar no planeta', exact: true }).click();
    const circuit = page.locator('.planet-saga');
    await circuit.waitFor();
    await circuit.getByRole('button', { name: 'Entrar no desafio', exact: true }).click();
    await page.getByRole('button', { name: 'Fechar quiz', exact: true }).click();
    await page.getByRole('button', { name: 'Sair da rodada', exact: true }).click();
    await page.locator('.journey-overlay.is-leaving').waitFor();
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('sphere-tap-v1')));
    assert.equal(saved.journey.personal, 0);
    assert.deepEqual(errors, []);
    results.push({ entryHasNoLogo: true, exitFade: true, localProgressReset: true });
    await context.close();
  }

  for (const palette of ['neve', 'cristal']) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    const data = structuredClone(initial);
    data.appearance = { ...data.appearance, palette, preset: 'eclipse' };
    page.setDefaultTimeout(DEFAULT_TIMEOUT);
    page.setDefaultNavigationTimeout(DEFAULT_TIMEOUT);
    await page.addInitScript(data => {
      localStorage.setItem('sphere-tap-v1', JSON.stringify({ ...data, welcomeDone: true }));
      sessionStorage.setItem('sphere-tap-opened', 'yes');
      const worker = {
        state: 'installed',
        scriptURL: location.origin + '/sw.js',
        postMessage(message, ports) {
          if (message === 'SPHERE_UPDATE_INFO') ports?.[0]?.postMessage({ build: 'fixture-update', version: '1.2.1', title: 'Atualização disponível' });
        }
      };
      const registration = { waiting: worker, active: null, addEventListener() {}, removeEventListener() {}, update: async () => {} };
      Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: { controller: {}, register: async () => registration, addEventListener() {}, removeEventListener() {} } });
    }, data);
    await page.goto('http://127.0.0.1:4173');
    const modal = page.getByRole('dialog', { name: 'Atualização disponível', exact: true });
    await modal.waitFor();
    const colors = await modal.locator('.dialog-header').evaluate(el => {
      const cs = getComputedStyle(el);
      const title = getComputedStyle(el.querySelector('h2'));
      return { background: cs.backgroundColor, text: title.color };
    });
    assert.equal(await modal.locator('.tap-update-orbit').count(), 0);
    assert.equal(await modal.locator('.tap-update-mark').evaluate(el => getComputedStyle(el).animationName), 'none');
    assert.equal(await page.locator('.aura-viewport>.aura-engine').count(), 1);
    await page.screenshot({ path: `browser-checks/update-${palette}.png` });
    await page.getByRole('button', { name: 'Depois', exact: true }).click();
    await modal.waitFor({ state: 'detached' });
    results.push({ updateModal: true, palette });
    await context.close();
  }

  {
    const data = structuredClone(initial);
    const today = localDate();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    data.journey = { ...data.journey, mode: 'personal', personal: 1, personalStart: localDate() };
    const { context, page } = await contextFor(390, data, 'reduce');
    await page.locator('.journey-entry').click();
    await page.getByRole('button', { name: 'Ilha 1, atual', exact: true }).waitFor();
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('sphere-tap-v1')));
    assert.equal(saved.journey.personalUnlockSeen, today);
    assert.equal(await page.locator('[data-planet-level="1"]').count(), 1);
    assert.equal(await page.locator('[data-planet-level="2"]').count(), 0);
    assert.equal(await page.locator('[data-planet-level="1"]').evaluate(el => el.getAttribute('data-biome')), 'forest');
    assert.equal(await page.locator('[data-planet-level="1"] .island-particle').first().evaluate(el => getComputedStyle(el).animationName), 'none');
    await page.getByText('1/50 níveis concluídos', { exact: true }).waitFor();
    results.push({ nextDateUnlocks: true, reducedMotionHonored: true });
    await context.close();
  }

  for (const width of [320, 390, 1280]) {
    const data = structuredClone(initial);
    data.displayName = 'Valdo';
    data.journey = { ...data.journey, role: 1, personal: 5, xp: 500 };
    data.achievements = { 'your-space': { earnedAt: '2026-11-07T12:00:00.000Z' }, 'journey-keeper': { earnedAt: '2026-11-07T12:00:00.000Z' } };
    const { context, page, errors } = await contextFor(width, data, width === 320 ? 'reduce' : 'no-preference');
    await page.locator('.nav-glass').getByRole('button', { name: 'Perfil', exact: true }).click();
    const centeredName = await page.locator('.profile-banner-hero').evaluate(el => {
      const hero = el.getBoundingClientRect();
      const name = el.querySelector('h1').getBoundingClientRect();
      return Math.abs(hero.x + hero.width / 2 - (name.x + name.width / 2));
    });
    assert.ok(centeredName < 16);
    await page.reload();
    await page.locator('.nav-glass').getByRole('button', { name: 'Perfil', exact: true }).click();
    await page.locator('.banner-wardrobe summary').click();
    assert.equal(await page.getByRole('button', { name: 'Banner Coroa solar, bloqueado', exact: true }).count(), 1);
    await page.screenshot({ path: `browser-checks/banners-${width}.png` });
    await page.getByRole('button', { name: 'Banner Coroa solar, bloqueado', exact: true }).click();
    const detail = page.getByRole('dialog', { name: '10 desafios em companhia', exact: true });
    await detail.waitFor();
    await page.getByRole('button', { name: 'Conquistas', exact: true }).click();
    const map = page.getByRole('group', { name: 'Constelação de conquistas', exact: true });
    await map.waitFor();
    await map.scrollIntoViewIfNeeded();
    await page.screenshot({ path: `browser-checks/rewards-${width}.png` });
    await map.getByRole('button', { name: 'Seu espaço, conquistada', exact: true }).click();
    await page.getByRole('dialog', { name: 'Seu espaço', exact: true }).waitFor();
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('sphere-tap-v1')));
    assert.equal(saved.profileDetails.banner, 'voyager');
    assert.equal(saved.journey.xp, 500);
    assert.deepEqual(errors, []);
    await context.close();
  }

  {
    const data = structuredClone(initial);
    data.journey = { ...data.journey, xp: 1500 };
    const { context, page } = await contextFor(320, data, 'reduce');
    for (const [stars, rank] of [[0, 'yellow'], [15, 'orange'], [40, 'red'], [80, 'purple'], [140, 'blue'], [220, 'fire'], [340, 'ice'], [500, 'prismatic']]) {
      await page.evaluate(stars => {
        const d = JSON.parse(localStorage.getItem('sphere-tap-v1'));
        d.journey.stars = stars;
        localStorage.setItem('sphere-tap-v1', JSON.stringify(d));
      }, stars);
      await page.reload();
      await page.locator('.journey-entry').click();
      assert.equal(await page.locator('.journey-xp').textContent().includes(String(stars)), true);
    }
    await page.screenshot({ path: 'browser-checks/journey-saved-progress.png' });
    console.log('PROGRESS_PREVIEW_JPEG:' + (await page.screenshot({ type: 'jpeg', quality: 55 })).toString('base64'));
    results.push({ savedProgress: true });
    await context.close();
  }

  for (const width of [320, 390]) {
    const data = structuredClone(initial);
    for (const b of profileBanners) if (b.achievement) data.achievements[b.achievement] = { earnedAt: '2026-11-07T12:00:00.000Z' };
    const { context, page } = await contextFor(width, data, 'reduce');
    await page.locator('.nav-glass').getByRole('button', { name: 'Perfil', exact: true }).click();
    await page.locator('.banner-wardrobe summary').click();
    for (const b of profileBanners) {
      await page.getByRole('button', { name: `Banner ${b.name}`, exact: true }).click();
      const violations = await page.locator('.profile-banner-art svg').evaluateAll(svgs => svgs.map(svg => {
        const rect = svg.getBoundingClientRect();
        const parent = svg.parentElement.getBoundingClientRect();
        return { width: rect.width, height: rect.height, parentWidth: parent.width, parentHeight: parent.height };
      }));
      assert.ok(violations.every(v => v.width <= v.parentWidth && v.height <= v.parentHeight));
    }
    await page.locator('.profile-banner-hero').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `browser-checks/banner-unclipped-${width}.png` });
    results.push({ bannerWidth: width, allBannersFit: true });
    await context.close();
  }

  await writeFile('browser-checks/results.json', JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser?.close();
  server.kill();
}
