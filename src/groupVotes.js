export function recordVote(votes,id,answer,participants){
 if(!participants.includes(id)||!Number.isInteger(answer)||answer<0||answer>3)return votes;
 const next={...votes};if(next[id]===answer)delete next[id];else next[id]=answer;return next;
}
