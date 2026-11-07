import React,{useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {Star,Lock,Check,ArrowRight,Users,UserRound,Trophy,X,ChevronDown} from 'lucide-react';
import JourneyMotion,{AnimatedLetters} from './JourneyMotion.jsx';
import WorldDecor,{SceneryShader} from './JourneyScenery.jsx';
import {questionsFor,visibleLevels,migrateJourney,completeJourney,starsFor,starRankFor,earnedXP,playerProgress} from './journeyLogic.js';
import {prepareAchievementAudio} from './achievementAudio';
import JourneyXP from './JourneyXP';
import {levelFeedback} from './journeyFeedback';
import {achievementProgress} from './achievements';
import MedalArtwork from './MedalArtwork';
import {Dialog} from './ui';
import './journey.css';
import './journeyInteraction.css';
function Quiz({quiz,onClose,onAnswer,onNext,mode,onCue}){
 const ref=useRef(null),[confirmExit,setConfirmExit]=useState(false);
 const requestClose=React.useCallback(()=>{onCue("button");setConfirmExit(true)},[onCue]);
 useEffect(()=>{
  const previous=document.activeElement,shell=document.querySelector('.sphere-tap-shell'),overflow=document.body.style.overflow;
  if(shell)shell.inert=true;document.body.style.overflow='hidden';ref.current.querySelector('button')?.focus();
  function key(event){if(event.key==='Escape'){event.preventDefault();setConfirmExit(v=>!v);return}if(event.key!=='Tab')return;const buttons=[...ref.current.querySelectorAll('button:not(:disabled), a[href]')];const first=buttons[0],last=buttons.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}}
  document.addEventListener('keydown',key);return()=>{if(shell)shell.inert=false;document.body.style.overflow=overflow;document.removeEventListener('keydown',key);previous?.focus?.({preventScroll:true})};
 },[]);
 const question=quiz.answers[quiz.index];
 return createPortal(<div className='journey-overlay'><section className='journey-quiz' ref={ref} role='dialog' aria-modal='true' aria-labelledby='quiz-title'>
  <button className='journey-close' aria-label='Fechar quiz' onClick={requestClose}><X size={20}/></button>
  {confirmExit?<div className='journey-exit-confirm'><h2 id='quiz-title'>Quer mesmo sair?</h2><p>{quiz.finished?'Seu XP já foi salvo.':'A rodada atual não será salva. Seu progresso anterior continua guardado.'}</p><button className='journey-primary' autoFocus onClick={()=>setConfirmExit(false)}>Continuar aqui</button><button className='journey-exit-action' onClick={onClose}>Sair da rodada</button></div>:quiz.finished?<>
   <div className='journey-result-icon'><Trophy size={48}/></div><p className='journey-eyebrow'>{mode==='role'?'NÍVEL CONCLUÍDO':'TREINO CONCLUÍDO'}</p>
   <h2 id='quiz-title'><AnimatedLetters>Mais uma descoberta.</AnimatedLetters></h2>
   <div className='journey-result-stars' aria-label={`${quiz.stars} estrelas`}>{Array.from({length:3},(_,i)=><Star key={i} fill={i<quiz.stars?'currentColor':'none'} opacity={i<quiz.stars?1:.2}/>)}</div>
   <p>{quiz.score===quiz.answers.length?`Você gabaritou! ${quiz.score} de ${quiz.answers.length}.`:`Você acertou ${quiz.score} de ${quiz.answers.length} perguntas.`}</p><p className='journey-earned-xp'>+{quiz.xp} XP</p><JourneyXP from={quiz.previousXP} to={quiz.previousXP+quiz.xp}/>
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
export default function Journey({progress,onChange,account}){
 const data=progress||migrateJourney(null),setData=onChange;
 const [quiz,setQuiz]=useState(null),[selectedLevel,setSelectedLevel]=useState(null),[feedback,setFeedback]=useState(0),[awards,setAwards]=useState(false);
 const mode=data.mode,personal=mode==='personal',done=data[mode],level=done+1,nodes=visibleLevels(done),rank=starRankFor(data.stars),player=playerProgress(data.xp);
 const selected=selectedLevel===`${mode}:${level}`,challengeLevel=personal?data.role+1:level;
 const gameMedals=account?achievementProgress(account).filter(a=>a.group.startsWith('Jornada')):[];
 function select(n,event){if(n!==level)return;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;if(!reduced)event.currentTarget.animate([{translate:"0 0"},{translate:"-2px 0"},{translate:"2px 0"},{translate:"0 0"}],{duration:210});prepareAchievementAudio();setSelectedLevel(`${mode}:${n}`);setFeedback(v=>v+1);levelFeedback({sound:account?.preferences?.journeySound!==false,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches})}
 const closeQuiz=React.useCallback(()=>setQuiz(null),[]);
 function cue(kind){levelFeedback({kind,sound:account?.preferences?.journeySound!==false,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches})}
 function begin(n=level){if(n!==level||!selected)return;cue("question");setQuiz({previousXP:data.xp||0,level:n,index:0,answers:questionsFor(n,{difficultyLevel:personal?data.role+1:n,mode,round:n}),selected:null,score:0,challengeLevel:personal?data.role+1:n,finished:false})}
 function answer(i){cue("button");setQuiz(q=>!q||q.selected!==null||q.finished?q:{...q,selected:i,score:q.score+(i===q.answers[q.index].correct?1:0)})}
 function next(){if(!quiz||quiz.selected===null||quiz.finished)return;if(quiz.index===quiz.answers.length-1){cue("complete");setData(d=>completeJourney(d,mode,quiz.level,quiz.score));setQuiz(q=>({...q,finished:true,stars:starsFor(q.score,q.answers.length),xp:earnedXP(q.score,q.challengeLevel)}))}else {cue("question");setQuiz(q=>({...q,index:q.index+1,selected:null}))}}
 let pathHeight=0;const positions=nodes.map((n,i)=>{const height=n===level&&selected?206:126,result={n,x:180+Math.sin(i*1.12)*88,y:pathHeight+78,height};pathHeight+=height;return result});
 const path='M '+positions.map(p=>`${p.x},${p.y}`).join(' L ');
 return <section className='journey-page'>
  <JourneyMotion sound={account?.preferences?.journeySound!==false}/>
  <SceneryShader/>
  <header className='journey-heading'><div><p className='journey-eyebrow'>SPHERE TAP · JORNADA</p><h1><AnimatedLetters>Descubra pelo caminho.</AnimatedLetters></h1><p>Seu universo, uma descoberta de cada vez.</p></div><div className={`journey-player rank-${rank.id}`} style={{'--rank-color':rank.color}}>
   <div className='journey-player-top'><div className='journey-score' aria-label={`${data.stars} estrelas · ${rank.name}`} title={rank.name}><Star size={17} fill='currentColor'/><b key={data.stars}>{data.stars}</b></div><span className='journey-player-level' aria-label={`Nível de jogador ${player.level}`}>Nv. {player.level}</span></div>
   <div className='journey-xp-meter' role='progressbar' aria-label={`XP do nível ${player.level}`} aria-valuemin={0} aria-valuemax={player.required} aria-valuenow={player.current}><span style={{width:`${player.percent}%`}}/></div><small>{player.current} / {player.required} XP</small>
  </div></header>
  <div className='journey-switch' aria-label='Escolher modo'>
   <button aria-pressed={personal} onClick={()=>setData(d=>({...d,mode:'personal'}))}><UserRound size={17}/><span>Modo Pessoal</span></button>
   <button aria-pressed={!personal} onClick={()=>setData(d=>({...d,mode:'role'}))}><Users size={18}/><span>Modo Rolê</span></button>
  </div>
  <button className='journey-awards-link quiet-button' onClick={()=>setAwards(true)}><Trophy size={15}/>Conquistas da Jornada</button>
  <div className='journey-world' key={`${mode}-${Math.floor(done/7)}`}>
   <WorldDecor/>
   <div className='journey-path' aria-label={personal?'Caminho dos seus treinos':'Trecho do seu caminho'}>
    <svg className='journey-trail' style={{height:pathHeight}} viewBox={`0 0 360 ${pathHeight}`} preserveAspectRatio='none' aria-hidden='true'><defs><linearGradient id='trailGradient' x1='0' y1='0' x2='0' y2='1'><stop stopColor='currentColor' stopOpacity='.6'/><stop offset='1' stopColor='currentColor' stopOpacity='.16'/></linearGradient></defs><path d={path} fill='none' stroke='url(#trailGradient)' strokeWidth='2' strokeDasharray='2 9' strokeLinecap='round'/></svg>
    {positions.map(({n,x,height},i)=>{const complete=n<=done,current=n===level;return <div className='journey-stop' key={n} style={{'--offset':`${x-180}px`,'--stop-index':i,height}}>
     {current&&<span className='journey-start-label'>CONTINUE AQUI</span>}
     <button disabled={!current} className={`journey-node ${complete?'complete':current?'current':'locked'}`} aria-label={`${personal?'Treino':'Nível'} ${n}, ${complete?'concluído':current?'selecionar':'a descobrir'}`} aria-expanded={current?selected:undefined} data-feedback={current?feedback:undefined} onClick={event=>select(n,event)}>{complete?<Check size={25}/>:current?<Star size={26} fill='currentColor'/>:n%7===0?<Trophy size={21}/>:<Lock size={18}/>}</button>
     <span className='journey-node-caption'>{personal?'Treino':'Nível'} {n}</span>
     {current&&selected&&<div className='journey-level-launch' key={`${mode}-${n}`}><button className='journey-start-action' onClick={()=>begin(n)}>Entrar · até {earnedXP(20,challengeLevel)} XP<ArrowRight size={14}/></button><small>O XP depende dos acertos.</small></div>}
    </div>})}
    <div className='journey-horizon' aria-hidden='true'><span>✧</span><p>Novos caminhos se revelam.</p><ChevronDown size={16}/></div>
   </div>
  </div>
  {awards&&<Dialog className='journey-awards-dialog' title='Conquistas da Jornada' onClose={()=>setAwards(false)}><div className='journey-medal-grid'>{gameMedals.map(a=><div key={a.id}><MedalArtwork id={a.id} title={a.title} locked={!a.earnedAt}/><b>{a.title}</b><small>{a.earnedAt?'Conquistada':`${a.current} / ${a.total}`}</small></div>)}</div></Dialog>}
  {quiz&&<Quiz quiz={quiz} onClose={closeQuiz} onAnswer={answer} onNext={next} onCue={cue} mode={mode}/>}
 </section>
}
