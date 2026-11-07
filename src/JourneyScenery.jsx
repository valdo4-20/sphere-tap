import React from 'react';
// Independent scenery shader: never reads or changes AURA state, material or canvas.
export function SceneryShader(){return <div className='journey-scenery-shader' aria-hidden='true'/>}
export default function WorldDecor(){return <div className='journey-world-decor' aria-hidden='true'>{Array.from({length:10},(_,i)=><div key={i} className={`world-cluster ${i%2?'right':'left'}`} style={{top:`${i*9+3}%`,'--delay':`${-i*1.3}s`}}><span className='world-note' style={{color:['#ad92ee','#6fc9c5','#d7a46a','#e29ab8'][i%4]}}>{i%2?'♫':'♪'}</span><i className='world-spark'/><i className='world-spark second'/></div>)}</div>}
