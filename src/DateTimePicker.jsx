import React,{useState} from 'react';
import DatePicker from './DatePicker';
export default function DateTimePicker({defaultValue='',value,onChange,name,min,max,required,type,...props}){
 const [local,setLocal]=useState(defaultValue),chosen=value??local,date=chosen.slice(0,10),time=chosen.slice(11,16)||'12:00';
 function change(next){setLocal(next);onChange?.({target:{value:next,name}})}
 return <span className='tap-datetime'><input type='datetime-local' className='date-validity-input' name={name} value={chosen} min={min} max={max} required={required} onChange={()=>{}} tabIndex={-1} aria-label='Data e horário selecionados'/><DatePicker {...props} required={required} min={min?.slice(0,10)} max={max?.slice(0,10)} value={date} onChange={e=>change(e.target.value+'T'+time)}/><input type='time' aria-label='Horário' required={required} value={time} onChange={e=>change((date||max?.slice(0,10))+'T'+e.target.value)}/></span>;
}
