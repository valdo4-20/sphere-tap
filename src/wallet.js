import {dayKey,shiftDay,observation} from './model.js';
// Integer cents keep receipts separate from consumption cost and saved-money estimates.
export function cashFlow(data,start='0000-01-01',end='9999-12-31',basis=data.preferences?.walletBasis||'purchases'){
 const inRange=v=>v.date>=start&&v.date<end;
 const purchases=(data.purchases||[]).filter(inRange),entries=data.entries.filter(e=>inRange({date:dayKey(new Date(e.time))}));
 const unknown=basis==='consumption'?entries.filter(e=>e.cost==null).length:0;
 const spent=basis==='consumption'?entries.reduce((n,e)=>n+(e.cost==null?0:Math.round(e.cost*100)),0):purchases.reduce((n,p)=>n+Math.round(p.amount*100),0);
 const received=(data.receipts||[]).filter(inRange).reduce((n,r)=>n+Math.round(r.amount*100),0);
 return {spent,received,unknown,net:unknown?null:spent-received};
}
export function tapSequence(data,today=dayKey()){
 const dates=new Set(data.entries.map(e=>dayKey(new Date(e.time))).filter(k=>k<=today));
 let key=dates.has(today)?today:shiftDay(today,-1),current=0;
 while(dates.has(key)){current++;key=shiftDay(key,-1)}
 return current;
}
export function estimatedSavings(data,today=dayKey()){
 const ref=data.walletReference;if(!ref)return null;
 let days=0,excluded=0,actual=0;
 for(let k=ref.start;k<=today;k=shiftDay(k,1)){
  const o=observation(data,k);if(data.days[k]?.confirmed!==true||!o.known||o.entries.some(e=>e.cost==null)){excluded++;continue}
  days++;actual+=o.entries.reduce((n,e)=>n+Math.round(e.cost*100),0);
 }
 return {days,excluded,actual,reference:Math.round(ref.dailyCost*100)*days,difference:Math.round(ref.dailyCost*100)*days-actual};
}
