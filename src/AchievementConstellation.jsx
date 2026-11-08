import React,{useEffect,useRef,useState} from 'react';
import {LockKeyhole,Sparkles,Leaf,Wind,Flower2,Heart,Shield,Compass,Mountain,Moon,Sun,Gem,Trees} from 'lucide-react';
import MedalArtwork from './MedalArtwork';
import {rarities} from './rarities';
import './rewardDesign.css';
export function rewardPositions(count){return Array.from({length:count},(_,i)=>{const inner=i<4,r=inner?78:143,a=(inner?i*Math.PI/2:(i-4)*Math.PI/4)-Math.PI/2;return {x:180+Math.cos(a)*r,y:180+Math.sin(a)*r}})}
export default function AchievementConstellation({medals,onSelect,page=0}){
 const CoreIcon=[Sparkles,Leaf,Wind,Flower2,Heart,Shield,Compass,Mountain,Moon,Sun,Gem,Trees][page%12];
 const ref=useRef(null),[visible,setVisible]=useState(false),positions=rewardPositions(medals.length);
 useEffect(()=>{const observer=new IntersectionObserver(entries=>setVisible(entries.some(e=>e.isIntersecting)),{threshold:.05});observer.observe(ref.current);return()=>observer.disconnect()},[]);
 return <div ref={ref} className={'reward-constellation'+(visible?' is-visible':'')} role='group' aria-label='Constelação de conquistas'>
 <svg className='reward-links' viewBox='0 0 360 360' aria-hidden='true'><circle cx='180' cy='180' r='143'/><circle cx='180' cy='180' r='78'/>{positions.map((p,i)=><path key={medals[i].id} className={medals[i].earnedAt?'lit':''} d={`M180 180 L${p.x} ${p.y}`} style={{'--reward-color':rarities[medals[i].rarity].color}}/>)}</svg>
 <div className='reward-core' aria-hidden='true'><CoreIcon size={20}/><b>{medals.filter(a=>a.earnedAt).length}</b></div>
 {medals.map((a,i)=><button key={a.id} className={'reward-node '+(a.earnedAt?'earned':a.current?'growing':'locked')} style={{left:positions[i].x/3.6+'%',top:positions[i].y/3.6+'%','--reward-color':rarities[a.rarity].color,'--reward-delay':i*.035+'s'}} onClick={()=>onSelect(a.id)} aria-label={`${a.title}, ${a.earnedAt?'conquistada':`${a.current} de ${a.total}`}`}><span className='reward-progress-ring' style={{'--progress':Math.min(100,a.current/a.total*100)+'%'}}/><MedalArtwork id={a.id} title='' locked={!a.earnedAt}/>{!a.earnedAt&&<LockKeyhole className='reward-lock' size={11}/>}</button>)}
 </div>
}
