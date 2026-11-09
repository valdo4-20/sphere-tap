// Personal Journey planet challenge graph. This is isolated from Role mode.
// Each planet starts with one visible node, reveals children after completion,
// and reserves the final node for a guardian encounter.
export const PLANET_CHALLENGE_COUNT = 50;
export const STANDARD_QUESTION_COUNT = 15;
export const STANDARD_PASS_PERCENT = 70;
export const GUARDIAN_PASS_PERCENT = 80;

export function buildPlanetChallenges(planetId, count = PLANET_CHALLENGE_COUNT) {
  if (typeof planetId !== 'string' || !/^[a-z0-9-]{1,40}$/.test(planetId)) {
    throw new TypeError('Identificador de planeta inválido.');
  }
  if (!Number.isInteger(count) || count < 3 || count > 200) {
    throw new RangeError('A quantidade de desafios deve ficar entre 3 e 200.');
  }

  return Array.from({ length: count }, (_, index) => {
    const number = index + 1;
    const isGuardian = number === count;
    const isGolden = !isGuardian && number % 10 === 0;
    const parent = number === 1 ? null : Math.floor(number / 2);
    const prerequisites = isGuardian
      ? [count - 2, count - 1].map(n => `${planetId}-node-${n}`)
      : parent === null ? [] : [`${planetId}-node-${parent}`];

    return {
      id: `${planetId}-node-${number}`,
      planetId,
      number,
      kind: isGuardian ? 'guardian' : isGolden ? 'golden' : 'standard',
      questionCount: STANDARD_QUESTION_COUNT,
      requiredAccuracy: isGuardian ? GUARDIAN_PASS_PERCENT : STANDARD_PASS_PERCENT,
      prerequisites,
      reveals: isGuardian ? [] : Array.from({ length: 2 }, (_, childIndex) => number * 2 + childIndex + 1)
        .filter(child => child <= count && child !== count)
        .map(child => `${planetId}-node-${child}`),
    };
  });
}

export function challengeStatus(node, completedIds) {
  if (completedIds.has(node.id)) return 'completed';
  return node.prerequisites.every(id => completedIds.has(id)) ? 'available' : 'locked';
}

export function completePlanetChallenge(nodes, completedIds, challengeId, correct, total) {
  const node = nodes.find(item => item.id === challengeId);
  if (!node) throw new Error('Desafio não encontrado.');
  if (!Number.isInteger(total) || total !== node.questionCount || !Number.isInteger(correct) || correct < 0 || correct > total) {
    throw new RangeError('Resultado de desafio inválido.');
  }
  if (challengeStatus(node, completedIds) !== 'available') {
    return { passed: false, completedIds: new Set(completedIds), newlyUnlocked: [] };
  }

  const accuracy = Math.round(correct / total * 100);
  if (accuracy < node.requiredAccuracy) {
    return { passed: false, accuracy, completedIds: new Set(completedIds), newlyUnlocked: [] };
  }

  const nextCompleted = new Set(completedIds);
  nextCompleted.add(node.id);
  const newlyUnlocked = nodes
    .filter(candidate => challengeStatus(candidate, nextCompleted) === 'available'
      && challengeStatus(candidate, completedIds) !== 'available')
    .map(candidate => candidate.id);
  return { passed: true, accuracy, completedIds: nextCompleted, newlyUnlocked };
}
