export const performanceKeys=['maxStreak','quickCorrect','correct','perfectRounds','fastRounds','opinionRounds'];
export function validPerformance(value){return !!value&&typeof value==='object'&&!Array.isArray(value)&&performanceKeys.every(k=>Number.isSafeInteger(value[k])&&value[k]>=0&&value[k]<=1e9)}
export function answerPerformance(previous,correct,elapsed){
 const p=previous||{streak:0,maxStreak:0,quickCorrect:0,correct:0,answered:0,totalMs:0,timedAnswers:0};
 const ms=Number.isFinite(elapsed)?Math.max(0,Math.min(3600000,Math.round(elapsed))):0;
 const streak=correct?p.streak+1:0;
 return {...p,streak,maxStreak:Math.max(p.maxStreak,streak),correct:p.correct+(correct?1:0),answered:p.answered+1,totalMs:p.totalMs+ms,timedAnswers:p.timedAnswers+(ms>=500?1:0),quickCorrect:p.quickCorrect+(correct&&ms>=500&&ms<=10000?1:0)};
}
export function completePerformance(before,after,quiz){
 const expected=after.personal>before.personal?30:20;
 if(quiz.answers.length!==expected||before===after||!quiz.performance||quiz.performance.answered!==quiz.answers.length)return after;
 const p=quiz.performance,total=quiz.answers.length,old=before.performance||Object.fromEntries(performanceKeys.map(k=>[k,0]));
 const fast=p.timedAnswers===total&&p.correct/total>=.8&&p.totalMs<=total*10000;
 return {...after,performance:{maxStreak:Math.max(old.maxStreak,p.maxStreak),quickCorrect:old.quickCorrect+p.quickCorrect,correct:old.correct+p.correct,perfectRounds:old.perfectRounds+(p.correct===total?1:0),fastRounds:old.fastRounds+(fast?1:0),opinionRounds:old.opinionRounds+(quiz.friendIds&&Object.values(quiz.opinionResults||{}).some(r=>r.answered>0)?1:0)}};
}
export const clockText=ms=>`${Math.floor(ms/60000)}:${String(Math.floor(ms/1000)%60).padStart(2,'0')}`;
