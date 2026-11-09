/**
 * Data model for the personal cosmic journey.
 *
 * This is deliberately separate from the legacy daily/Role progression:
 * it does not read or mutate saved Sphere progress and grants no rewards.
 * The UI/service integration can consume this graph without coupling Rolê.
 */
export const PERSONAL_PLANET_CHAPTER_SIZE = 50;

export function createPlanetChallengeGraph(planetId, { size = PERSONAL_PLANET_CHAPTER_SIZE } = {}) {
  if (typeof planetId !== 'string' || !/^[a-z0-9-]+$/i.test(planetId)) {
    throw new TypeError('planetId inválido.');
  }
  if (!Number.isInteger(size) || size < 2 || size > 50) {
    throw new RangeError('Cada capítulo deve conter entre 2 e 50 desafios.');
  }

  return Array.from({ length: size }, (_, index) => {
    const number = index + 1;
    const guardian = number === size;
    const golden = !guardian && number % 10 === 0;
    // Two interleaved paths create visible branches instead of one long list.
    const parent = index === 0 ? null : Math.max(1, Math.floor((index - 1) / 2) + 1);
    const secondaryParent = index > 3 && number % 5 === 0 ? number - 2 : null;
    const prerequisites = [...new Set([parent, secondaryParent].filter(Boolean))];
    return {
      id: `${planetId}-challenge-${String(number).padStart(2, '0')}`,
      planetId,
      number,
      kind: guardian ? 'guardian' : golden ? 'golden' : 'standard',
      prerequisites,
      questionCount: 15,
      requiredAccuracy: guardian ? 80 : 70
    };
  });
}

export function challengeStatus(node, completedIds) {
  if (completedIds.has(node.id)) return 'completed';
  return node.prerequisites.every(id => completedIds.has(id)) ? 'available' : 'locked';
}

export function visiblePlanetChallenges(nodes, completedIds) {
  return nodes
    .filter(node => challengeStatus(node, completedIds) !== 'locked')
    .map(node => ({ ...node, status: challengeStatus(node, completedIds) }));
}
