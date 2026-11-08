// Keep answered questions in place; postponed questions remain required.
export function deferQuestion(quiz, elapsed = 0) {
 if (!quiz || quiz.entering || quiz.finished || quiz.selected !== null || quiz.index >= quiz.answers.length - 1) return quiz;
 const answers = [...quiz.answers], [question] = answers.splice(quiz.index, 1);
 answers.push(question);
 const key = question.id || question.prompt;
 return {...quiz, answers, draft:null, votes:{}, deferredTimes:{...quiz.deferredTimes,[key]:Number.isFinite(elapsed)?Math.max(0,elapsed):0}};
}
