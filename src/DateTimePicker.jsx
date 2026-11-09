import React,{useState} from 'react';
import {dateTimeParts,dateTimeLimits,joinDateTime} from './entryDateTime.js';
import './dateTimePicker.css';
export default function DateTimePicker({defaultValue='',value,onChange,name,min,max,required,type,disabled,id,...props}){
 const [local,setLocal]=useState(()=>dateTimeParts(defaultValue));
 const parts=value===undefined?local:dateTimeParts(value),limits=dateTimeLimits(parts.date,min,max);
 function change(field,next){const updated={...parts,[field]:next};setLocal(updated);onChange?.({target:{value:joinDateTime(updated),name},currentTarget:{value:joinDateTime(updated),name}})}
 return <div className='tap-datetime native-datetime'>
  <input type='hidden' name={name} value={joinDateTime(parts)} disabled={disabled}/>
  <label><span>Data</span><input {...props} id={id} type='date' aria-label='Data' value={parts.date} min={limits.minDate} max={limits.maxDate} required={required} disabled={disabled} onChange={e=>change('date',e.target.value)}/></label>
  <label><span>Horário</span><input type='time' aria-label='Horário' value={parts.time} min={limits.minTime} max={limits.maxTime} required={required} disabled={disabled} step='60' onChange={e=>change('time',e.target.value)}/></label>
 </div>;
}
