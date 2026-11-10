import {confirmGroupAnswer} from './groupVotes.js';
import {answerPerformance} from './quizPerformance.js';
// Optional opinions never submit an answer or award shared points.
export function answerRoleQuestion(quiz,answer,ms){
 if(!quiz||quiz.entering||quiz.finished||quiz.selected!==null||!Number.isInteger(answer)||answer<0||answer>=quiz.answers[quiz.index].options.length)return quiz;
 const next=confirmGroupAnswer({...quiz,draft:answer});
 return {...next,performance:answerPerformance(quiz.performance,answer===quiz.answers[quiz.index].correct,ms)};
}
