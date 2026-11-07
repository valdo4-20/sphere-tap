import React from 'react';
import {Sparkles,ArrowUpRight} from 'lucide-react';
import './journeyEntry.css';
export default function JourneyEntry({onOpen}){return <button className='journey-entry' onClick={()=>{onOpen();window.scrollTo({top:0,behavior:'instant'})}}><span className='journey-entry-symbol'><Sparkles size={23}/></span><span><strong>Jornada</strong><small>Uma nova descoberta espera por você.</small></span><ArrowUpRight size={17}/></button>}
