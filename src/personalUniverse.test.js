import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPlanetChallenges,
  challengeStatus,
  completePlanetChallenge,
  PLANET_CHALLENGE_COUNT,
} from './personalUniverse.js';

test('creates a 50-node branching graph with golden nodes and a guardian', () => {
  const nodes = buildPlanetChallenges('earth');
  assert.equal(nodes.length, PLANET_CHALLENGE_COUNT);
  assert.equal(nodes[0].kind, 'standard');
  assert.equal(nodes[9].kind, 'golden');
  assert.equal(nodes[19].kind, 'golden');
  assert.equal(nodes[49].kind, 'guardian');
  assert.deepEqual(nodes[0].reveals, ['earth-node-2', 'earth-node-3']);
  assert.equal(nodes[49].requiredAccuracy, 80);
});

test('only the root is initially available', () => {
  const nodes = buildPlanetChallenges('earth');
  const available = nodes.filter(node => challengeStatus(node, new Set()) === 'available');
  assert.deepEqual(available.map(node => node.id), ['earth-node-1']);
});

test('passing a node reveals its children exactly once', () => {
  const nodes = buildPlanetChallenges('earth');
  const first = completePlanetChallenge(nodes, new Set(), 'earth-node-1', 11, 15);
  assert.equal(first.passed, true);
  assert.deepEqual(first.newlyUnlocked, ['earth-node-2', 'earth-node-3']);
  const repeated = completePlanetChallenge(nodes, first.completedIds, 'earth-node-1', 15, 15);
  assert.equal(repeated.passed, false);
  assert.deepEqual(repeated.newlyUnlocked, []);
});

test('failing a node does not grant completion or unlock branches', () => {
  const nodes = buildPlanetChallenges('earth');
  const result = completePlanetChallenge(nodes, new Set(), 'earth-node-1', 10, 15);
  assert.equal(result.passed, false);
  assert.equal(result.completedIds.size, 0);
  assert.deepEqual(result.newlyUnlocked, []);
});

test('guardian requires both final branch prerequisites and 80 percent', () => {
  const nodes = buildPlanetChallenges('earth');
  const guardian = nodes.at(-1);
  const partial = new Set(['earth-node-48']);
  assert.equal(challengeStatus(guardian, partial), 'locked');
  const ready = new Set(['earth-node-48', 'earth-node-49']);
  assert.equal(challengeStatus(guardian, ready), 'available');
  const failed = completePlanetChallenge(nodes, ready, guardian.id, 11, 15);
  assert.equal(failed.passed, false);
  const passed = completePlanetChallenge(nodes, ready, guardian.id, 12, 15);
  assert.equal(passed.passed, true);
});

test('rejects malformed planet IDs and challenge results', () => {
  assert.throws(() => buildPlanetChallenges('../role'), TypeError);
  const nodes = buildPlanetChallenges('earth');
  assert.throws(() => completePlanetChallenge(nodes, new Set(), 'earth-node-1', 16, 15), RangeError);
});
