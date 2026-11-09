import test from 'node:test';
import assert from 'node:assert/strict';
import { createPlanetChallengeGraph, challengeStatus, visiblePlanetChallenges } from './personalUniverseModel.js';

test('gera capítulo ramificado com até 50 desafios e chefe final', () => {
  const nodes = createPlanetChallengeGraph('earth');
  assert.equal(nodes.length, 50);
  assert.equal(nodes[0].prerequisites.length, 0);
  assert.equal(nodes[9].kind, 'golden');
  assert.equal(nodes[49].kind, 'guardian');
  assert.equal(nodes[49].requiredAccuracy, 80);
  assert.ok(nodes.some(node => node.prerequisites.length === 2));
});

test('revela somente desafios cujos pré-requisitos foram concluídos', () => {
  const nodes = createPlanetChallengeGraph('earth');
  const completed = new Set();
  assert.deepEqual(visiblePlanetChallenges(nodes, completed).map(node => node.id), [nodes[0].id]);
  completed.add(nodes[0].id);
  assert.equal(challengeStatus(nodes[1], completed), 'available');
  assert.ok(visiblePlanetChallenges(nodes, completed).length > 1);
});

test('valida identificador e quantidade de desafios', () => {
  assert.throws(() => createPlanetChallengeGraph('../role'), TypeError);
  assert.throws(() => createPlanetChallengeGraph('earth', { size: 51 }), RangeError);
});
