import React from 'react';
import {Check,X,Sparkles,ArrowRight,Users} from 'lucide-react';
import {themeFor,praiseFor} from './quizTopics';
import './roleQuestion.css';
export default function RoleQuestion({quiz,answerTime,onAnswer,onNext,onDefer,disabled}){
 const q=quiz.answers[quiz.index],answered=quiz.selected!==null,theme=themeFor(q);
 return <div className='role-question' key={q.id||q.prompt}>
  <div className='journey-question-meter' role='progressbar' aria-label='Progresso do Rolê' aria-valuenow={quiz.index+1} aria-valuemin={0} aria-valuemax={quiz.answers.length}><span style={{width:`${(quiz.index+1)/quiz.answers.length*100}%`}}/></div>
  <div className='role-topic-row'><small className='journey-question-category'><Sparkles size={14}/>{theme.name}</small>{quiz.performance?.streak>=3&&<span className='journey-streak' key={quiz.performance.streak}><Sparkles size={14}/>{quiz.performance.streak} seguidos</span>}</div>
  <div className='role-question-heading'><h2 id='quiz-title'>{q.prompt}</h2></div>
  <div className='role-answer-context'><span>Resposta do grupo</span><span><Users size={14}/>Todos participam</span></div>
  <div className='journey-answers role-answers'>{q.options.map((a,i)=><button key={i} disabled={answered||disabled} className={answered?(i===q.correct?'correct':i===quiz.selected?'incorrect':''):voter&&quiz.votes[voter.id]===i?'role-opinion-selected':''} onClick={()=>onAnswer(i,answerTime())}><span>{'ABCD'[i]}</span><span className='journey-answer-copy'>{a}</span><span className='answer-voters'></span>{answered&&i===q.correct&&<Check size={18}/ >}{answered&&i===quiz.selected&&i!==q.correct&&<X size={18}/>}</button>)}</div>
  {answered?<div className={'journey-feedback role-feedback'+(quiz.selected===q.correct?' is-correct':'')} role='status'><b>{quiz.selected===q.correct?<><Sparkles size={19}/>{praiseFor(quiz.level,quiz.index)}</>:'Agora a gente sabe.'}</b><p>{q.explanation}</p>{q.source&&<details className='journey-source'><summary>Fonte</summary><a href={q.source} target='_blank' rel='noreferrer'>{q.sourceName} ↗</a></details>}<button className='journey-primary' onClick={onNext}>{quiz.index===quiz.answers.length-1?'Concluir':'Próxima'}<ArrowRight size={18}/></button></div>:quiz.index<quiz.answers.length-1&&<button className='journey-defer' disabled={disabled} onClick={()=>onDefer(answerTime())}>Deixar para depois</button>}
 </div>;
}
