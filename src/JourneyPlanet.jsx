import React,{memo,useEffect,useMemo,useRef,useState} from 'react';
import {planetSVG,planetFor} from './journeyPlanets';
import './journeyPlanets.css';
export default memo(function JourneyPlanet({level,reveal=false}){
 const ref=useRef(null),[visible,setVisible]=useState(false),svg=useMemo(()=>planetSVG(level),[level]),world=planetFor(level);
 useEffect(()=>{const el=ref.current,observer=new IntersectionObserver(entries=>setVisible(entries.some(e=>e.isIntersecting)),{rootMargin:'50px'});observer.observe(el);return()=>observer.disconnect()},[]);
 return <span ref={ref} className={`journey-planet${visible?' in-view':''}${reveal?' planet-reveal':''}`} data-planet-level={level} data-biome={world.kind} aria-hidden='true'><span className='planet-halo'/><span className='planet-art' dangerouslySetInnerHTML={{__html:svg}}/><span className='planet-reveal-rays'/></span>;
});
