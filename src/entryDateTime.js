// Local date/time strings deliberately carry no UTC suffix.
export function dateTimeParts(value=''){
 return {date:value.slice(0,10),time:value.slice(11,16)};
}
export function dateTimeLimits(date,min,max){
 return {minDate:min?.slice(0,10),maxDate:max?.slice(0,10),minTime:date&&date===min?.slice(0,10)?min.slice(11,16):undefined,maxTime:date&&date===max?.slice(0,10)?max.slice(11,16):undefined};
}
export function joinDateTime({date,time}){return date&&time?`${date}T${time}`:''}
