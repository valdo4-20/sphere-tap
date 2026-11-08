export function recordVote(votes,id,answer,participants){
 if(!participants.includes(id)||!Number.isInteger(answer)||answer<0||answer>3)return votes;
 const next={...votes};if(next[id]===answer)delete next[id];else next[id]=answer;return next;
}

export function opinionOutcomes(players,votes,correct){return players.map(p=>{const answer=votes?.[p.id],answered=Number.isInteger(answer)&&answer>=0&&answer<4;return {...p,answer:answered?answer:null,status:!answered?'unanswered':answer===correct?'correct':'incorrect'}})}
export function confirmGroupAnswer(quiz){
 if(!quiz||quiz.finished||quiz.entering||quiz.selected!==null||!Number.isInteger(quiz.draft)||quiz.draft<0||quiz.draft>3)return quiz;
 const correct=quiz.answers[quiz.index].correct,opinionResults={...quiz.opinionResults};
 for(const p of opinionOutcomes(quiz.players,quiz.votes,correct)){const prior=opinionResults[p.id]||{answered:0,correct:0};opinionResults[p.id]={answered:prior.answered+(p.status!=='unanswered'?1:0),correct:prior.correct+(p.status==='correct'?1:0)}}
 return {...quiz,selected:quiz.draft,score:quiz.score+(quiz.draft===correct?1:0),opinionResults};
}
