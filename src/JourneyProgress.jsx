import React from 'react';
import {Star} from 'lucide-react';
import {playerProgress,starRankFor} from './journeyProgression.js';
export default function JourneyProgress({progress}){
 const xp=progress.xp||0,stars=progress.stars||0,player=playerProgress(xp),rank=starRankFor(stars);
 return <section className={'journey-personal-progress star-class-'+rank.id} data-star-rank={rank.id} style={{'--star-color':rank.color}} aria-label='Seu progresso na Jornada'>
  <div className='journey-progress-numbers'><span className='journey-progress-star' aria-label={`${stars} estrelas, classe ${rank.name}`}><Star key={rank.id} size={26} fill='currentColor'/><b>{stars}</b></span><strong>Nível {player.level}</strong><span>{xp} XP</span></div>
  <progress aria-label='XP para o próximo nível' value={player.current} max={player.required} aria-valuetext={`${player.current} de ${player.required} XP para o nível ${player.level+1}`}/>
 </section>;
}
