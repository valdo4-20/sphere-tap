import React,{useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {Star,Lock,LockOpen,Check,ArrowRight,Users,UserRound,Trophy,X,ChevronDown,Sparkles} from 'lucide-react';
import JourneyMotion from './JourneyMotion.jsx';
import WorldDecor,{SceneryShader} from './JourneyScenery.jsx';
import {questionsFor,visibleLevels,migrateJourney,completeJourney,starsFor,starRankFor,earnedXP,playerProgress} from './journeyLogic.js';
import {dailyStatus,enrollDaily,dailyEdition,dailyLevelDate,weeklyColor,PERSONAL_QUESTIONS} from './journeyDaily.js';
import {themeFor,praiseFor} from './quizTopics.js';
import {completeFriendRound} from './localFriends.js';
import {LocalRanking} from './LocalFriends.jsx';
import JourneyXP from './JourneyXP';
import {levelFeedback} from './journeyFeedback';
import './journey.css';
import './journeyInteraction.css';
import './journeyPlay.css';

function Quiz({quiz,onClose,onAnswer,onNext,onReady,mode,onCue}){
 const ref=useRef(null),[confirmExit,setConfirmExit]=useState(false);
 useEffect(()=>{
  const previous=document.activeElement,shell=document.querySelector('.sphere-tap-shell'),overflow=document.body.style.overflow;
  if(shell)shell.inert=true;
  document.body.style.overflow='hidden';ref.current.querySelector('button')?.focus();
  function key(event){
   if(event.key==='Escape'){event.preventDefault();setConfirmExit(v=>!v);return}
   if(event.key!=='Tab')return;
   const buttons=[...ref.current.querySelectorAll('button:not(:disabled), a[href]')],first=buttons[0],last=buttons.at(-1);
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}
  }
  document.addEventListener('keydown',key);
  return()=>{if(shell)shell.inert=false;document.body.style.overflow=overflow;document.removeEventListener('keydown',key);previous?.focus?.({preventScroll:true})};
 },[]);
 useEffect(()=>{
  if(!quiz.entering)return;
  const timer=setTimeout(onReady,matchMedia('(prefers-reduced-motion: reduce)').matches?0:580);
  return()=>clearTimeout(timer);
 },[quiz.entering,onReady]);
 const question=quiz.answers[quiz.index],theme=themeFor(question);
 const requestClose=()=>{onCue('button');setConfirmExit(true)};
 return createPortal(<div className={'journey-overlay'+(quiz.entering?' is-entering':'')} style={{'--question-color':theme.color,'--question-ink':theme.ink}}>
  <section className={'journey-quiz'+(quiz.finished?' is-complete':'')} ref={ref} role='dialog' aria-modal='true' aria-labelledby='quiz-title'>
   <button className='journey-close' aria-label='Fechar quiz' onClick={requestClose}><X size={20}/></button>
   {confirmExit?<div className='journey-exit-confirm'><h2 id='quiz-title'>Quer mesmo sair?</h2><p>{quiz.finished?'Seu XP já foi salvo.':'A rodada atual não será salva. Seu progresso anterior continua guardado.'}</p><button className='journey-primary' autoFocus onClick={()=>setConfirmExit(false)}>Continuar aqui</button><button className='journey-exit-action' onClick={onClose}>Sair da rodada</button></div>
   :quiz.entering?<div className='journey-entry-scene' role='status'><div className='journey-entry-rings' aria-hidden='true'><i/><i/><i/><Star size={40} fill='currentColor'/></div><p className='journey-eyebrow'>{quiz.playerName}</p><h2 id='quiz-title'>Entrando no {mode==='personal'?'dia':'nível'} {quiz.level}</h2><p>Um novo caminho começa.</p></div>
   :quiz.finished?<>
    <div className='journey-complete-scene'><div className='journey-confetti' aria-hidden='true'>{Array.from({length:12},(_,i)=><i key={i} style={{'--piece':i,'--flight-x':`${Math.cos(i*Math.PI/6)*110}px`,'--flight-y':`${Math.sin(i*Math.PI/6)*80}px`}}/>)}</div><div className='journey-result-icon'><Trophy size={48}/></div></div>
    <p className='journey-eyebrow'>{mode==='role'?'NÍVEL CONCLUÍDO':'DIA CONCLUÍDO'}</p><h2 id='quiz-title'>Você foi além.</h2>
    <div className='journey-result-stars' aria-label={`${quiz.stars} estrelas`}>{Array.from({length:3},(_,i)=><Star key={i} fill={i<quiz.stars?'currentColor':'none'} className={i<quiz.stars?'earned-star':''}/>)}</div>
    <p>{quiz.score===quiz.answers.length?`Fenomenal! Você acertou todas as ${quiz.answers.length}.`:`Bom trabalho! ${quiz.score} acertos em ${quiz.answers.length} desafios.`}</p>
    <p className='journey-earned-xp'>+{quiz.xp} XP</p><JourneyXP from={quiz.previousXP} to={quiz.previousXP+quiz.xp}/>
    <button className='journey-primary' onClick={onClose}>Continuar a jornada</button>
   </>:<>
    <p className='journey-eyebrow'>{mode==='role'?`ROLÊ · NÍVEL ${quiz.level}`:`PESSOAL · DIA ${quiz.level}`} · {quiz.index+1} DE {quiz.answers.length}</p>
    <div className='journey-question-meter' role='progressbar' aria-label='Progresso do quiz' aria-valuenow={quiz.index+1} aria-valuemin={0} aria-valuemax={quiz.answers.length}><span style={{width:`${(quiz.index+1)/quiz.answers.length*100}%`}}/></div>
    <div className='journey-question-body' key={`${quiz.level}-${quiz.index}`}><small className='journey-question-category'><Sparkles size={13}/>{theme.name}<span>{question.phase}</span></small><h2 id='quiz-title'>{question.prompt}</h2>
     <div className='journey-answers'>{question.options.map((answer,i)=><button key={i} disabled={quiz.selected!==null} className={quiz.selected!==null?(i===question.correct?'correct':i===quiz.selected?'incorrect':''):''} onClick={()=>onAnswer(i)}><span>{['A','B','C','D'][i]}</span>{answer}{quiz.selected!==null&&i===question.correct&&<Check size={17}/>}</button>)}</div>
    </div>
    {quiz.selected!==null&&<div className={'journey-feedback'+(quiz.selected===question.correct?' is-correct':'')} key={quiz.index} role='status'><b>{quiz.selected===question.correct?<><Sparkles size={19}/>{praiseFor(quiz.level,quiz.index)}</>:'Agora você já sabe.'}</b><p>{question.explanation}</p>{question.source&&<a href={question.source} target='_blank' rel='noreferrer'>Fonte: {question.sourceName} ↗</a>}<button className='journey-primary' onClick={onNext}>{quiz.index===quiz.answers.length-1?'Concluir':'Continuar'}<ArrowRight size={16}/></button></div>}
   </>}
  </section>
 </div>,document.body);
}

export default function Journey({progress,onChange,account,onAccountChange,onManageFriends,onBusy}){
 const owner=progress||migrateJourney(null);
 const [quiz,setQuiz]=useState(null),[selectedLevel,setSelectedLevel]=useState(null),[feedback,setFeedback]=useState(0),[activePlayer,setActivePlayer]=useState('self'),[unlock,setUnlock]=useState(null),[advance,setAdvance]=useState(null),[clock,setClock]=useState(()=>new Date());
 const entering=useRef(false),completion=useRef(false),busyCallback=useRef(onBusy);
 busyCallback.current=onBusy;
 const friend=owner.mode==='role'?(account?.localFriends||[]).find(f=>f.id===activePlayer):null;
 const data=friend?{...friend.journey,mode:'role'}:owner,mode=data.mode,personal=mode==='personal',done=data[mode],level=done+1;
 const daily=dailyStatus(owner,clock),playable=!personal||daily.canPlay,edition=dailyEdition(level),nodes=visibleLevels(done),rank=starRankFor(data.stars),player=playerProgress(data.xp);
 const selected=selectedLevel===`${mode}:${friend?.id||'self'}:${level}`,challengeLevel=personal?data.role+1:level;
 useEffect(()=>{busyCallback.current?.(Boolean(quiz));return()=>busyCallback.current?.(false)},[Boolean(quiz)]);
 useEffect(()=>{
  const refresh=()=>setClock(new Date()),timer=setInterval(refresh,30000);
  window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',refresh);
  return()=>{clearInterval(timer);window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',refresh)};
 },[]);
 useEffect(()=>{if(owner.mode==='personal'&&!owner.personalStart)onChange(d=>enrollDaily(d))},[owner.mode,owner.personalStart,onChange]);
 useEffect(()=>{
  if(!personal||!playable||owner.personalUnlockSeen===daily.today)return;
  setUnlock(level);onChange(d=>({...d,personalUnlockSeen:daily.today}));
 },[personal,playable,daily.today,owner.personalUnlockSeen,level,onChange]);
 useEffect(()=>{if(unlock===null)return;const timer=setTimeout(()=>setUnlock(null),1100);return()=>clearTimeout(timer)},[unlock]);
 useEffect(()=>{if(advance===null)return;const timer=setTimeout(()=>setAdvance(null),1000);return()=>clearTimeout(timer)},[advance]);
 const readyQuiz=React.useCallback(()=>setQuiz(q=>q?{...q,entering:false}:q),[]);
 function cue(kind){levelFeedback({kind,sound:account?.preferences?.journeySound!==false,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches})}
 function select(n){if(n!==level||!playable||quiz)return;setSelectedLevel(`${mode}:${friend?.id||'self'}:${n}`);setFeedback(v=>v+1);cue('button')}
 function begin(n=level){
  if(n!==level||!selected||!playable||entering.current||quiz)return;
  entering.current=true;completion.current=false;cue('question');
  setQuiz({previousXP:data.xp||0,level:n,index:0,answers:questionsFor(n,{difficultyLevel:challengeLevel,mode,round:n}),selected:null,score:0,challengeLevel,finished:false,entering:true,playerId:friend?.id||'self',playerName:friend?.name||account?.displayName||'Você'});
 }
 function closeQuiz(){const finished=quiz?.finished;entering.current=false;setQuiz(null);if(finished){setAdvance(level);requestAnimationFrame(()=>document.querySelector('.journey-node.current,.journey-start-label')?.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}))}}
 function answer(i){cue('button');setQuiz(q=>!q||q.entering||q.selected!==null||q.finished?q:{...q,selected:i,score:q.score+(i===q.answers[q.index].correct?1:0)})}
 function next(){
  if(!quiz||quiz.selected===null||quiz.finished||completion.current)return;
  if(quiz.index===quiz.answers.length-1){
   completion.current=true;cue('complete');
   if(quiz.playerId!=='self')onAccountChange?.(d=>completeFriendRound(d,quiz.playerId,quiz.level,quiz.score));
   else onChange(d=>completeJourney(d,mode,quiz.level,quiz.score));
   setQuiz(q=>({...q,finished:true,stars:starsFor(q.score,q.answers.length),xp:earnedXP(q.score,q.challengeLevel,q.answers.length)}));
  }else{cue('question');setQuiz(q=>({...q,index:q.index+1,selected:null}))}
 }
 let pathHeight=0;
 const positions=nodes.map((n,i)=>{const height=n===level&&selected?206:126,result={n,x:180+(Math.sin(i*1.12)-Math.sin((level-nodes[0])*1.12))*55,y:pathHeight+68,height};pathHeight+=height;return result});
 const path='M '+positions.map(p=>`${p.x},${p.y}`).join(' L ');
 return <section className='journey-page' style={personal?{'--journey-tint':weeklyColor(level),'--journey-tint-ink':weeklyColor(level),'--journey-trail':weeklyColor(level)}:undefined}>
  <JourneyMotion/><SceneryShader/>
  <header className='journey-heading'><div><p className='journey-eyebrow'>SPHERE TAP · JORNADA</p><h1>Descubra pelo caminho.</h1><p>{friend?`O Rolê de ${friend.name}.`:'Seu universo, uma descoberta de cada vez.'}</p></div><div className={`journey-player rank-${rank.id}`} style={{'--rank-color':rank.color}}>
   <div className='journey-player-top'><div className='journey-score' aria-label={`${data.stars} estrelas · ${rank.name}`} title={rank.name}><Star size={17} fill='currentColor'/><b key={data.stars}>{data.stars}</b></div><span className='journey-player-level' aria-label={`Nível de jogador ${player.level}`}>Nv. {player.level}</span></div>
   <div className='journey-xp-meter' role='progressbar' aria-label={`XP do nível ${player.level}`} aria-valuemin={0} aria-valuemax={player.required} aria-valuenow={player.current}><span style={{width:`${player.percent}%`}}/></div><small>{player.current} / {player.required} XP</small>
  </div></header>
  <div className='journey-switch' aria-label='Escolher modo'><button aria-pressed={personal} onClick={()=>{setActivePlayer('self');onChange(d=>({...enrollDaily(d),mode:'personal'}))}}><UserRound size={17}/><span>Modo Pessoal</span></button><button aria-pressed={!personal} onClick={()=>onChange(d=>({...d,mode:'role'}))}><Users size={18}/><span>Modo Rolê</span></button></div>
  {personal?<div className='journey-daily-card' role='status'><small>SEMANA {Math.floor((level-1)/7)+1} · DIA {level}</small><h2>{playable?edition.title:'Seu capítulo de hoje está concluído.'}</h2><p>{playable?edition.description:'O próximo capítulo abre na sua data. Seu progresso está guardado.'}</p><span>{playable?'30 desafios · 5 etapas diferentes':`Próximo nível: ${new Date(dailyLevelDate(owner,level,clock)+'T12:00:00').toLocaleDateString('pt-BR')}`}</span><div className='journey-daily-week' aria-label='Dias da semana da jornada'>{Array.from({length:7},(_,i)=>{const day=Math.floor((level-1)/7)*7+i+1;return <span key={day} className={day<=done?'done':day===level?'today':''}>{day<=done?<Check size={13}/>:i+1}</span>})}</div></div>
  :<LocalRanking data={account||{journey:owner}} active={friend?.id||'self'} onSelect={id=>{setActivePlayer(id);setSelectedLevel(null)}} onManage={onManageFriends}/>}
  <div className='journey-world' key={`${mode}-${friend?.id||'self'}-${Math.floor(done/7)}`}><WorldDecor/>
   <div className='journey-path' aria-label={personal?'Caminho dos seus dias':'Trecho do seu caminho'}>
    <svg className='journey-trail' style={{height:pathHeight}} viewBox={`0 0 360 ${pathHeight}`} preserveAspectRatio='none' aria-hidden='true'><defs><linearGradient id='trailGradient' x1='0' y1='0' x2='0' y2='1'><stop stopColor='currentColor' stopOpacity='.6'/><stop offset='1' stopColor='currentColor' stopOpacity='.16'/></linearGradient></defs><path d={path} fill='none' stroke='url(#trailGradient)' strokeWidth='2' strokeDasharray='2 9' strokeLinecap='round'/></svg>
    {positions.map(({n,x,height},i)=>{const complete=n<=done,current=n===level,unlocked=current&&playable,opening=unlocked&&unlock===n;return <div className={'journey-stop'+(advance===n?' journey-advanced':'')} key={n} style={{'--stop-x':`${x/360*100}%`,'--stop-index':i,...(personal?{'--journey-tint':weeklyColor(n),'--journey-tint-ink':weeklyColor(n)}:{}),height}}><div className='journey-stop-content'>
     {current&&<span className='journey-start-label'>{playable?'CONTINUE AQUI':'ABRE NA SUA DATA'}</span>}
     <button disabled={!unlocked} className={`journey-node ${complete?'complete':unlocked?'current':'locked'}${opening?' journey-unlocking':''}`} aria-label={`${personal?'Dia':'Nível'} ${n}, ${complete?'concluído':unlocked?'selecionar':'a descobrir'}`} aria-expanded={current?selected:undefined} data-feedback={current?feedback:undefined} onClick={()=>select(n)}>{complete?<Check size={25}/>:opening?<span className='journey-unlock-icons'><Lock className='unlock-closed' size={25}/><LockOpen className='unlock-open' size={25}/><Star className='unlock-star' size={26} fill='currentColor'/></span>:unlocked?<Star size={26} fill='currentColor'/>:n%7===0?<Trophy size={21}/>:<Lock size={18}/>}</button>
     <span className='journey-node-caption'>{personal?'Dia':'Nível'} {n}{personal&&<small>{new Date(dailyLevelDate(owner,n,clock)+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})}</small>}</span>
     {current&&selected&&playable&&<div className='journey-level-launch'><button className='journey-start-action' onClick={()=>begin(n)}>Entrar no {personal?'dia':'nível'} {n}</button></div>}
    </div></div>})}
    <div className='journey-horizon' aria-hidden='true'><span>✧</span><p>Novos caminhos se revelam.</p><ChevronDown size={16}/></div>
   </div>
  </div>
  {quiz&&<Quiz quiz={quiz} onClose={closeQuiz} onAnswer={answer} onNext={next} onReady={readyQuiz} onCue={cue} mode={mode}/>}
 </section>;
}
