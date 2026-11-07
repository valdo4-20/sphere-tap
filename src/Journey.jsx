import React,{useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {Star,Lock,Check,ArrowRight,Users,UserRound,Trophy,X,ChevronDown} from 'lucide-react';
import JourneyMotion,{AnimatedLetters} from './JourneyMotion.jsx';
import WorldDecor,{SceneryShader} from './JourneyScenery.jsx';
import {questionsFor,visibleLevels,migrateJourney,completeJourney,starsFor,starRankFor,earnedXP,playerProgress} from './journeyLogic.js';
import './journey.css';
function Quiz({quiz,onClose,onAnswer,onNext,mode}){
 const ref=useRef(null);
 useEffect(()=>{
  const previous=document.activeElement,shell=document.querySelector('.sphere-tap-shell'),overflow=document.body.style.overflow;
  if(shell)shell.inert=true;document.body.style.overflow='hidden';ref.current.querySelector('button')?.focus();
  function key(event){if(event.key==='Escape'){onClose();return}if(event.key!=='Tab')return;const buttons=[...ref.current.querySelectorAll('button:not(:disabled), a[href]')];const first=buttons[0],last=buttons.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}}
  document.addEventListener('keydown',key);return()=>{if(shell)shell.inert=false;document.body.style.overflow=overflow;document.removeEventListener('keydown',key);previous?.focus?.({preventScroll:true})};
 },[onClose]);
 const question=quiz.answers[quiz.index];
 return createPortal(<div className='journey-overlay'><section className='journey-quiz' ref={ref} role='dialog' aria-modal='true' aria-labelledby='quiz-title'>
  <button className='journey-close' aria-label='Fechar quiz' onClick={onClose}><X size={20}/></button>
  {quiz.finished?<>
   <div className='journey-result-icon'><Trophy size={48}/></div><p className='journey-eyebrow'>{mode==='role'?'NÍVEL CONCLUÍDO':'TREINO CONCLUÍDO'}</p>
   <h2 id='quiz-title'><AnimatedLetters>Mais uma descoberta.</AnimatedLetters></h2>
   <div className='journey-result-stars' aria-label={`${quiz.stars} estrelas`}>{Array.from({length:3},(_,i)=><Star key={i} fill={i<quiz.stars?'currentColor':'none'} opacity={i<quiz.stars?1:.2}/>)}</div>
   <p>{quiz.score===quiz.answers.length?`Você gabaritou! ${quiz.score} de ${quiz.answers.length}.`:`Você acertou ${quiz.score} de ${quiz.answers.length} perguntas.`}</p><p className='journey-earned-xp'>+{quiz.xp} XP</p>
   <button className='journey-primary' onClick={onClose}>Continuar a jornada<ArrowRight size={16}/></button>
  </>:<>
   <p className='journey-eyebrow'>{mode==='role'?`ROLÊ · NÍVEL ${quiz.level}`:'PESSOAL · SEU TREINO'} · {quiz.index+1} DE {quiz.answers.length}</p>
   <div className='journey-question-meter' role='progressbar' aria-label='Progresso do quiz' aria-valuenow={quiz.index+1} aria-valuemin={0} aria-valuemax={quiz.answers.length}><span style={{width:`${(quiz.index+1)/quiz.answers.length*100}%`}}/></div>
   <div className='journey-question-body' key={`${quiz.level}-${quiz.index}`}><small className='journey-question-category'>{question.category}</small><h2 id='quiz-title'><AnimatedLetters>{question.prompt}</AnimatedLetters></h2>
   <div className='journey-answers'>{question.options.map((answer,i)=><button key={i} disabled={quiz.selected!==null} className={quiz.selected!==null?(i===question.correct?'correct':i===quiz.selected?'incorrect':''):''} onClick={()=>onAnswer(i)}><span>{['A','B','C','D'][i]}</span>{answer}{quiz.selected!==null&&i===question.correct&&<Check size={17}/>}</button>)}</div></div>
   {quiz.selected!==null&&<div className='journey-feedback' key={quiz.index} role='status'><b>{quiz.selected===question.correct?'Boa! Você acertou.':'Agora você já sabe.'}</b><p>{question.explanation}</p>{question.source?<a href={question.source} target='_blank' rel='noreferrer'>Fonte: {question.sourceName} ↗</a>:null}<button className='journey-primary' onClick={onNext}>{quiz.index===quiz.answers.length-1?'Concluir':'Continuar'}<ArrowRight size={16}/></button></div>}
  </>}
 </section></div>,document.body)
}
export default function Journey({progress,onChange}){
 const data=progress||migrateJourney(null),setData=onChange;
 const [quiz,setQuiz]=useState(null);
 const mode=data.mode,personal=mode==='personal',done=data[mode],level=done+1,nodes=visibleLevels(done),rank=starRankFor(data.stars),player=playerProgress(data.xp);
 const closeQuiz=React.useCallback(()=>setQuiz(null),[]);
 function begin(n=level){if(n!==level)return;setQuiz({level:n,index:0,answers:questionsFor(n,{difficultyLevel:personal?data.role+1:n,mode,round:n}),selected:null,score:0,challengeLevel:personal?data.role+1:n,finished:false})}
 function answer(i){setQuiz(q=>!q||q.selected!==null||q.finished?q:{...q,selected:i,score:q.score+(i===q.answers[q.index].correct?1:0)})}
 function next(){if(!quiz||quiz.selected===null||quiz.finished)return;if(quiz.index===quiz.answers.length-1){setData(d=>completeJourney(d,mode,quiz.level,quiz.score));setQuiz(q=>({...q,finished:true,stars:starsFor(q.score,q.answers.length),xp:earnedXP(q.score,q.challengeLevel)}))}else setQuiz(q=>({...q,index:q.index+1,selected:null}))}
 const positions=nodes.map((n,i)=>({n,x:180+Math.sin(i*1.12)*88,y:i*126+78}));
 const path='M '+positions.map(p=>`${p.x},${p.y}`).join(' L ');
 return <section className='journey-page'>
  <JourneyMotion/>
  <SceneryShader/>
  <header className='journey-heading'><div><p className='journey-eyebrow'>SPHERE TAP · JORNADA</p><h1><AnimatedLetters>Descubra pelo caminho.</AnimatedLetters></h1><p>Seu universo, uma descoberta de cada vez.</p></div><div className={`journey-player rank-${rank.id}`} style={{'--rank-color':rank.color}}>
   <div className='journey-player-top'><div className='journey-score' aria-label={`${data.stars} estrelas · ${rank.name}`} title={rank.name}><Star size={17} fill='currentColor'/><b key={data.stars}>{data.stars}</b></div><span className='journey-player-level' aria-label={`Nível de jogador ${player.level}`}>Nv. {player.level}</span></div>
   <div className='journey-xp-meter' role='progressbar' aria-label={`XP do nível ${player.level}`} aria-valuemin={0} aria-valuemax={player.required} aria-valuenow={player.current}><span style={{width:`${player.percent}%`}}/></div><small>{player.current} / {player.required} XP</small>
  </div></header>
  <div className='journey-switch' aria-label='Escolher modo'>
   <button aria-pressed={personal} onClick={()=>setData(d=>({...d,mode:'personal'}))}><UserRound size={17}/><span>Modo Pessoal</span></button>
   <button aria-pressed={!personal} onClick={()=>setData(d=>({...d,mode:'role'}))}><Users size={18}/><span>Modo Rolê</span></button>
  </div>
  <div className='journey-world' key={`${mode}-${Math.floor(done/7)}`}>
   <WorldDecor/>
   <div className='journey-path' aria-label={personal?'Caminho dos seus treinos':'Trecho do seu caminho'}>
    <svg className='journey-trail' viewBox={`0 0 360 ${nodes.length*126}`} preserveAspectRatio='none' aria-hidden='true'><defs><linearGradient id='trailGradient' x1='0' y1='0' x2='0' y2='1'><stop stopColor='currentColor' stopOpacity='.6'/><stop offset='1' stopColor='currentColor' stopOpacity='.16'/></linearGradient></defs><path d={path} fill='none' stroke='url(#trailGradient)' strokeWidth='2' strokeDasharray='2 9' strokeLinecap='round'/></svg>
    {positions.map(({n,x},i)=>{const complete=n<=done,current=n===level;return <div className='journey-stop' key={n} style={{'--offset':`${x-180}px`,'--stop-index':i}}>
     {current&&<span className='journey-start-label'>CONTINUE AQUI</span>}
     <button disabled={!current} className={`journey-node ${complete?'complete':current?'current':'locked'}`} aria-label={`${personal?'Treino':'Nível'} ${n}, ${complete?'concluído':current?'começar':'a descobrir'}`} onClick={()=>begin(n)}>{complete?<Check size={25}/>:current?<Star size={26} fill='currentColor'/>:n%7===0?<Trophy size={21}/>:<Lock size={18}/>}</button>
     <span className='journey-node-caption'>{personal?'Treino':'Nível'} {n}</span>
     {current&&<button className='journey-start-action' onClick={()=>begin(n)}>Começar<ArrowRight size={13}/></button>}
    </div>})}
    <div className='journey-horizon' aria-hidden='true'><span>✧</span><p>Novos caminhos se revelam.</p><ChevronDown size={16}/></div>
   </div>
  </div>
  {quiz&&<Quiz quiz={quiz} onClose={closeQuiz} onAnswer={answer} onNext={next} mode={mode}/>}
 </section>
}
