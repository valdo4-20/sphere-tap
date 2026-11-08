import {answerPerformance,completePerformance,clockText} from './quizPerformance.js';
import JourneyProgress from './JourneyProgress';
import FriendEmblem from './FriendEmblem';
import {loadQuestionCorpus} from './questionCorpus.js';
import {animate} from 'motion/mini';
import {lockQuizScroll} from './quizScroll.js';
import {recordVote,opinionOutcomes,confirmGroupAnswer} from './groupVotes.js';
import React,{useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {Star,Lock,LockOpen,Check,ArrowRight,Users,UserRound,Trophy,X,ChevronDown,Sparkles} from 'lucide-react';
import JourneyMotion from './JourneyMotion.jsx';
import JourneyPlanet from './JourneyPlanet.jsx';
import {planetFor,planetIsVisible} from './journeyPlanets';
import {questionsFor,visibleLevels,migrateJourney,completeJourney,starsFor,earnedXP} from './journeyLogic.js';
import {dailyStatus,enrollDaily,dailyEdition,dailyLevelDate,weeklyColor} from './journeyDaily.js';
import {themeFor,praiseFor} from './quizTopics.js';
import {completeGroupRound,groupRanking,warmFriendColor} from './localFriends.js';
import LocalFriends from './LocalFriends.jsx';
import {uid} from './model.js';
import {Dialog} from './ui';
import JourneyXP from './JourneyXP';
import {levelFeedback} from './journeyFeedback';
import './journey.css';
import './journeyInteraction.css';
import './journeyPlay.css';

function Quiz({quiz,onClose,onAnswer,onNext,onReady,mode,onCue,onVote,onConfirm}){
 const time=useRef({elapsed:0,start:null}),[elapsed,setElapsed]=useState(0);
 const ref=useRef(null),[confirmExit,setConfirmExit]=useState(false),[leaving,setLeaving]=useState(false);
 function answerTime(){const t=time.current;return t.elapsed+(t.start===null?0:performance.now()-t.start);}
 useEffect(()=>{time.current={elapsed:0,start:null};setElapsed(0)},[quiz.index]);
 useEffect(()=>{
  const running=!quiz.entering&&!quiz.finished&&quiz.selected===null&&!confirmExit&&!leaving;
  function visibility(){const t=time.current;if(t.start!==null){t.elapsed+=performance.now()-t.start;t.start=null;}if(running&&!document.hidden)t.start=performance.now();setElapsed(answerTime());}
  visibility();const timer=setInterval(()=>setElapsed(answerTime()),1000);document.addEventListener('visibilitychange',visibility);
  return()=>{clearInterval(timer);document.removeEventListener('visibilitychange',visibility);const t=time.current;if(t.start!==null){t.elapsed+=performance.now()-t.start;t.start=null;}};
 },[quiz.index,quiz.entering,quiz.selected,quiz.finished,confirmExit,leaving]);
 useEffect(()=>{if(!leaving)return;const timer=setTimeout(onClose,matchMedia('(prefers-reduced-motion: reduce)').matches?0:220);return()=>clearTimeout(timer)},[leaving,onClose]);
 useEffect(()=>{
  const previous=document.activeElement,shell=document.querySelector('.sphere-tap-shell'),restoreScroll=lockQuizScroll();
  if(shell)shell.inert=true;
  ref.current.querySelector('button')?.focus();
  function key(event){
   if(event.key==='Escape'){event.preventDefault();setConfirmExit(v=>!v);return}
   if(event.key!=='Tab')return;
   const buttons=[...ref.current.querySelectorAll('button:not(:disabled), a[href]')],first=buttons[0],last=buttons.at(-1);
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}
  }
  document.addEventListener('keydown',key);
  return()=>{if(shell)shell.inert=false;document.removeEventListener('keydown',key);if(previous?.isConnected)previous.focus?.({preventScroll:true});else document.querySelector('.journey-node.current')?.focus({preventScroll:true});restoreScroll()};
 },[]);
 useEffect(()=>{ref.current?.scrollTo({top:0,behavior:'instant'})},[quiz.index,quiz.finished]);
 useEffect(()=>{
  if(!quiz.entering)return;
  const timer=setTimeout(onReady,matchMedia('(prefers-reduced-motion: reduce)').matches?0:280);
  return()=>clearTimeout(timer);
 },[quiz.entering,onReady]);
 useEffect(()=>{
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const el=ref.current?.querySelector('.journey-opinion-picker');if(!el)return;
  const effect=animate(el,{opacity:[.45,1]},{duration:.18});return()=>effect.stop();
 },[quiz.draft]);
 const question=quiz.answers[quiz.index],theme=themeFor(question),outcomes=quiz.players?opinionOutcomes(quiz.players,quiz.votes,question.correct):[];
 const requestClose=()=>{if(leaving)return;onCue('button');setConfirmExit(true)};
 const leave=()=>setLeaving(true);
 return createPortal(<div className={'journey-overlay'+(quiz.entering?' is-entering':'')+(leaving?' is-leaving':'')} style={{'--question-color':theme.color,'--question-ink':theme.ink}}>
  <section className={'journey-quiz'+(quiz.finished?' is-complete':'')} ref={ref} role='dialog' aria-modal='true' aria-labelledby='quiz-title'>
   <button className='journey-close' aria-label='Fechar quiz' onClick={requestClose}><X size={20}/></button>
   {confirmExit?<div className='journey-exit-confirm'><h2 id='quiz-title'>Quer mesmo sair?</h2><p>{quiz.finished?'Seu progresso está salvo.':'Sair descarta esta rodada.'}</p><button className='journey-primary' autoFocus onClick={()=>setConfirmExit(false)}>Continuar aqui</button><button className='journey-exit-action' disabled={leaving} onClick={leave}>Sair da rodada</button></div>
   :quiz.finished?<>
    <div className='journey-complete-scene'><div className='journey-confetti' aria-hidden='true'>{Array.from({length:12},(_,i)=><i key={i} style={{'--piece':i,'--flight-x':`${Math.cos(i*Math.PI/6)*110}px`,'--flight-y':`${Math.sin(i*Math.PI/6)*80}px`}}/>)}</div><div className='journey-result-icon'><Trophy size={48}/></div></div>
    <p className='journey-completed-label' role='status'>{mode==='personal'?`Dia ${quiz.level} concluído`:`Nível ${quiz.level} concluído`}</p>
    <h2 id='quiz-title'>{quiz.friendIds?'Vocês foram além.':'Você foi além.'}</h2>
    <div className='journey-result-stars' aria-label={`${quiz.stars} estrelas`}>{Array.from({length:3},(_,i)=><Star key={i} fill={i<quiz.stars?'currentColor':'none'} className={i<quiz.stars?'earned-star':''}/>)}</div>
    <p>{quiz.score===quiz.answers.length?'Fenomenal!':'Bom trabalho!'}</p>
    {quiz.performance&&<p className='journey-performance-result'>Melhor sequência: {quiz.performance.maxStreak} · Tempo respondendo: {clockText(quiz.performance.totalMs)}</p>}
    <p className='journey-earned-xp'>+{quiz.xp} XP</p><JourneyXP from={quiz.previousXP} to={quiz.previousXP+quiz.xp}/>
    {quiz.friendIds&&<section className='opinion-round-summary' aria-label='Acertos de cada participante'><h3>Suas escolhas</h3><ul>{quiz.players.map(p=>{const result=quiz.opinionResults[p.id]||{answered:0,correct:0};return <li key={p.id}><FriendEmblem friend={p}/><span>{p.name}</span><b>{result.answered?`${result.correct} ${result.correct===1?'acerto':'acertos'} em ${result.answered} ${result.answered===1?'escolha':'escolhas'}`:'Sem escolhas registradas'}</b></li>})}</ul></section>}
    {quiz.friendIds&&<section className='match-ranking' aria-label='Ranking do Rolê'><h3>Ranking do Rolê</h3><ol>{quiz.ranking.map(r=><li key={r.id}><b>{r.place}</b><FriendEmblem friend={r}/><span>{r.name}</span><strong>{r.journey.xp} XP</strong></li>)}</ol></section>}
    <button className='journey-primary' disabled={leaving} onClick={leave}>Continuar a jornada</button>
   </>:<>
    <div className='journey-round-rhythm'><span className='journey-answer-clock' aria-label='Tempo desta pergunta'>{clockText(elapsed)}</span>{quiz.performance?.streak>=3&&<span className='journey-streak' key={quiz.performance.streak}><Sparkles size={14}/>{quiz.performance.streak} seguidos</span>}</div>
    <div className='journey-question-meter' role='progressbar' aria-label='Progresso do quiz' aria-valuenow={quiz.index+1} aria-valuemin={0} aria-valuemax={quiz.answers.length}><span style={{width:`${(quiz.index+1)/quiz.answers.length*100}%`}}/></div>
    <div className='journey-question-body' key={`${quiz.level}-${quiz.index}`}><small className='journey-question-category'><Sparkles size={13}/>{theme.name}</small><h2 id='quiz-title'>{question.prompt}</h2>
     <div className='journey-answers'>{question.options.map((answer,i)=><button key={i} disabled={quiz.entering||leaving||quiz.selected!==null} aria-pressed={quiz.friendIds&&quiz.selected===null?quiz.draft===i:undefined} className={quiz.selected!==null?(i===question.correct?'correct':i===quiz.selected?'incorrect':''):quiz.draft===i?'draft':''} onClick={()=>onAnswer(i,answerTime())}><span>{['A','B','C','D'][i]}</span><span className='journey-answer-copy'>{answer}</span>{quiz.players&&<span className='answer-voters'>{quiz.players.filter(p=>quiz.votes?.[p.id]===i).map(p=><i key={p.id} className={quiz.selected!==null?(i===question.correct?'opinion-correct':'opinion-incorrect'):''} title={quiz.selected!==null?`${p.name}: ${i===question.correct?'acertou':'errou'}`:p.name} aria-label={quiz.selected!==null?`${p.name}: ${i===question.correct?'acertou':'errou'}`:p.name} style={{background:'transparent'}}><FriendEmblem friend={p}/>{quiz.selected!==null&&<span className='opinion-verdict'>{i===question.correct?<Check size={11}/>:<X size={11}/>}</span>}</i>)}</span>}{quiz.selected!==null&&i===question.correct&&<Check size={17}/>}</button>)}</div>
     {quiz.friendIds&&quiz.selected===null&&quiz.draft!==null&&<div className='journey-opinion-picker'><fieldset><legend>Quem escolheu?</legend>{quiz.players.map(p=><button key={p.id} style={{'--opinion-color':warmFriendColor(p.color)}} aria-label={`${p.name}: ${question.options[quiz.draft]}`} aria-pressed={quiz.votes?.[p.id]===quiz.draft} onClick={()=>onVote(p.id)}><FriendEmblem friend={p}/>{p.name}</button>)}</fieldset><button className='journey-primary' onClick={()=>onConfirm(answerTime())}>Confirmar resposta</button></div>}
    </div>
    {quiz.selected!==null&&<div className={'journey-feedback'+(quiz.selected===question.correct?' is-correct':'')} key={quiz.index} role='status'><b>{quiz.friendIds?'Escolhas reveladas':quiz.selected===question.correct?<><Sparkles size={19}/>{praiseFor(quiz.level,quiz.index)}</>:'Agora você já sabe.'}</b>{quiz.friendIds&&<><span className='group-answer-result'>Resposta do grupo: {quiz.selected===question.correct?'correta':'incorreta'}</span><ul className='opinion-outcomes' aria-label='Resultado das escolhas'>{outcomes.map(p=><li key={p.id} data-result={p.status}><FriendEmblem friend={p}/><span>{p.name}</span><b>{p.status==='unanswered'?'Sem escolha':p.status==='correct'?<><Check size={14}/>Acertou</>:<><X size={14}/>Errou</>}</b></li>)}</ul></>}<p>{question.explanation}</p>{question.source&&<details className='journey-source'><summary>Fonte</summary><a href={question.source} target='_blank' rel='noreferrer'>{question.sourceName} ↗</a></details>}<button className='journey-primary' onClick={onNext}>{quiz.index===quiz.answers.length-1?'Concluir':'Continuar'}<ArrowRight size={16}/></button></div>}
   </>}
  </section>
 </div>,document.body);
}

export default function Journey({progress,onChange,account,onAccountChange,onBusy}){
 const owner=progress||migrateJourney(null);
 const [quiz,setQuiz]=useState(null),[selectedLevel,setSelectedLevel]=useState(null),[feedback,setFeedback]=useState(0),[participants,setParticipants]=useState([]),[choosing,setChoosing]=useState(false),[managing,setManaging]=useState(false),[unlock,setUnlock]=useState(null),[advance,setAdvance]=useState(null),[clock,setClock]=useState(()=>new Date()),[loading,setLoading]=useState(false),[loadError,setLoadError]=useState('');
 const [reward,setReward]=useState(null);
 const entering=useRef(false),completion=useRef(false),busyCallback=useRef(onBusy);
 busyCallback.current=onBusy;
 const data=owner,mode=data.mode,personal=mode==='personal',done=data[mode],level=done+1;
 const daily=dailyStatus(owner,clock),playable=!personal||daily.canPlay,edition=dailyEdition(level),nodes=visibleLevels(done);
 const selected=selectedLevel===`${mode}:${level}`,challengeLevel=personal?data.role+1:level;
 const roster=(account?.localFriends||[]).filter(f=>participants.includes(f.id));
 useEffect(()=>{busyCallback.current?.(Boolean(quiz)||choosing);return()=>busyCallback.current?.(false)},[Boolean(quiz),choosing]);
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
 function select(n){if(n!==level||!playable||quiz)return;setSelectedLevel(`${mode}:${n}`);setFeedback(v=>v+1);cue('button')}
 async function launch(n,players){
  if(n!==level||!selected||!playable||entering.current||quiz||(!personal&&players.length<2))return;
  entering.current=true;setLoading(true);setLoadError('');
  try{await loadQuestionCorpus()}catch{setLoadError('Não foi possível preparar as perguntas. Tente novamente.');setLoading(false);entering.current=false;return}
  setLoading(false);completion.current=false;cue('question');setChoosing(false);
  setQuiz({previousXP:data.xp||0,level:n,index:0,answers:questionsFor(n,{difficultyLevel:challengeLevel,mode,round:n}),selected:null,score:0,challengeLevel,finished:false,entering:true,playerId:'self',playerName:account?.displayName||'Você',draft:null,votes:{},opinionResults:{},...(personal?{}:{players,friendIds:players.filter(p=>p.id!=='self').map(p=>p.id),matchId:uid()})});
 }
 function begin(n=level){if(personal)launch(n,[]);else{setManaging(false);setChoosing(true)}}
 function closeQuiz(){entering.current=false;setQuiz(null);if(quiz?.finished){setAdvance(level);setReward({id:Date.now(),xp:quiz.xp,from:quiz.previousXP});}}
 function answer(i,ms){cue('button');setQuiz(q=>!q||q.entering||q.selected!==null||q.finished?q:q.friendIds?{...q,draft:i}:{...q,selected:i,score:q.score+(i===q.answers[q.index].correct?1:0),performance:answerPerformance(q.performance,i===q.answers[q.index].correct,ms)})}
 function vote(id){cue('button');setQuiz(q=>!q||q.selected!==null||q.draft===null?q:{...q,votes:recordVote(q.votes,id,q.draft,q.players.map(p=>p.id))})}
 function confirmAnswer(ms){cue('button');setQuiz(q=>{const next=confirmGroupAnswer(q);return next===q?q:{...next,performance:answerPerformance(q.performance,q.draft===q.answers[q.index].correct,ms)}})}
 function next(){
  if(!quiz||quiz.selected===null||quiz.finished||completion.current)return;
  if(quiz.index===quiz.answers.length-1){
   completion.current=true;cue('complete');
   const ranking=quiz.friendIds?groupRanking(completeGroupRound(account,quiz.matchId,quiz.level,quiz.score,quiz.friendIds)):null;
   if(quiz.friendIds)onAccountChange?.(d=>{const next=completeGroupRound(d,quiz.matchId,quiz.level,quiz.score,quiz.friendIds);return next===d?d:{...next,journey:completePerformance(d.journey,next.journey,quiz)}});
   else onChange(d=>completePerformance(d,completeJourney(d,mode,quiz.level,quiz.score),quiz));
   setQuiz(q=>({...q,finished:true,stars:starsFor(q.score,q.answers.length),xp:earnedXP(q.score,q.challengeLevel,q.answers.length),...(q.friendIds?{ranking}:{})}));
  }else{cue('question');setQuiz(q=>({...q,index:q.index+1,selected:null,draft:null,votes:{}}))}
 }
 let pathHeight=0;
 const positions=nodes.map((n,i)=>{const height=n===level&&selected?280:planetIsVisible(n,done,playable)?220:86,result={n,x:180+(Math.sin(i*1.12)-Math.sin((level-nodes[0])*1.12))*55,y:pathHeight+68,height};pathHeight+=height;return result});
 const path='M '+positions.map(p=>`${p.x},${p.y}`).join(' L ');
 return <section className={'journey-page'+(quiz?' is-playing':'')} style={personal?{'--journey-tint':weeklyColor(level),'--journey-tint-ink':weeklyColor(level),'--journey-trail':weeklyColor(level)}:undefined}>
  <JourneyMotion/>
  <header className='journey-heading'><h1>Descubra pelo caminho.</h1><JourneyProgress progress={owner} reward={reward}/></header>
  <div className='journey-switch' aria-label='Escolher modo'><button aria-pressed={personal} onClick={()=>{onChange(d=>({...enrollDaily(d),mode:'personal'}))}}><UserRound size={17}/><span>Modo Pessoal</span></button><button aria-pressed={!personal} onClick={()=>onChange(d=>({...d,mode:'role'}))}><Users size={18}/><span>Modo Rolê</span></button></div>
  {personal?<div className='journey-daily-card' role='status'><h2>{playable?edition.title:'Por hoje, você chegou lá.'}</h2>{!playable&&<p className='journey-next-date'>Próximo dia: {new Date(dailyLevelDate(owner,level,clock)+'T12:00:00').toLocaleDateString('pt-BR')}</p>}</div>
  :null}
  {choosing&&<Dialog title={managing?'Amigos':'Quem vem para o Rolê?'} onClose={()=>setChoosing(false)} className='journey-players-dialog'>
  {managing?<><button className='quiet-button' onClick={()=>setManaging(false)}>Voltar à partida</button><LocalFriends compact data={account} onChange={onAccountChange}/></>:<>
   <div className='journey-participants'><p>Você</p>{(account?.localFriends||[]).map(f=><label key={f.id}><input type='checkbox' checked={participants.includes(f.id)} onChange={()=>setParticipants(ids=>ids.includes(f.id)?ids.filter(id=>id!==f.id):[...ids,f.id])}/><FriendEmblem friend={f}/><span>{f.name}</span></label>)}</div>
   {!account?.localFriends?.length&&<p>Adicione um amigo para começar.</p>}
   <button className='button secondary' onClick={()=>setManaging(true)}><Users size={16}/>Adicionar ou editar amigos</button>
   <button className='journey-primary' disabled={!roster.length||loading} onClick={()=>launch(level,[{id:'self',name:account?.displayName||'Você',color:account?.appearance?.auraColor||'#b79be8'},...roster.map(f=>({id:f.id,name:f.name,color:f.color,emblem:f.emblem}))])}>{loading?'Preparando…':'Começar o Rolê'}</button>
  </>}
  </Dialog>}
  {loadError&&<p role='alert'>{loadError}</p>}
  <div className='journey-world' key={`${mode}-${Math.floor(done/7)}`}>
   <div className='journey-path' aria-label={personal?'Caminho dos seus dias':'Trecho do seu caminho'}>
    <svg className='journey-trail' style={{height:pathHeight}} viewBox={`0 0 360 ${pathHeight}`} preserveAspectRatio='none' aria-hidden='true'><defs><linearGradient id='trailGradient' x1='0' y1='0' x2='0' y2='1'><stop stopColor='currentColor' stopOpacity='.6'/><stop offset='1' stopColor='currentColor' stopOpacity='.16'/></linearGradient></defs><path d={path} fill='none' stroke='url(#trailGradient)' strokeWidth='2' strokeDasharray='2 9' strokeLinecap='round'/></svg>
    {positions.map(({n,x,height},i)=>{const complete=n<=done,current=n===level,unlocked=current&&playable,opening=unlocked&&unlock===n;return <div className={'journey-stop'+(advance===n?' journey-advanced':'')} key={n} style={{'--stop-x':`${x/360*100}%`,'--stop-index':i,...(personal?{'--journey-tint':weeklyColor(n),'--journey-tint-ink':weeklyColor(n)}:{}),height}}><div className='journey-stop-content'>

     <button disabled={!unlocked} className={`journey-node ${complete?'complete':unlocked?'current':'locked'}${opening?' journey-unlocking':''}`} aria-label={`${personal?'Dia':'Nível'} ${n}, ${complete?'concluído':unlocked?'selecionar':'a descobrir'}`} aria-expanded={current?selected:undefined} data-feedback={current?feedback:undefined} onClick={()=>select(n)}>{planetIsVisible(n,done,playable)?<JourneyPlanet level={n} reveal={opening||(!personal&&current&&advance!==null)}/>:<Lock size={18}/>}</button>
     <span className='journey-node-caption'>{personal?'Dia':'Nível'} {n}{planetIsVisible(n,done,playable)&&<strong className='journey-planet-name'>{planetFor(n).name}</strong>}{personal&&<small>{new Date(dailyLevelDate(owner,n,clock)+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})}</small>}</span>
     {current&&selected&&playable&&<div className='journey-level-launch'><button className='journey-start-action' disabled={loading} onClick={()=>begin(n)}>{loading?'Preparando…':`Entrar no ${personal?'dia':'nível'} ${n}`}</button></div>}
    </div></div>})}
    <div className='journey-horizon' aria-hidden='true'><ChevronDown size={16}/></div>
   </div>
  </div>
  {quiz&&<Quiz quiz={quiz} onVote={vote} onConfirm={confirmAnswer} onClose={closeQuiz} onAnswer={answer} onNext={next} onReady={readyQuiz} onCue={cue} mode={mode}/>}
 </section>;
}
