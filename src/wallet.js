import {dayKey,shiftDay,observation} from './model.js';
export function estimatedSavings(data,today=dayKey()){
 const ref=data.walletReference;if(!ref)return null;
 let days=0,excluded=0,actual=0;
 for(let k=ref.start;k<=today;k=shiftDay(k,1)){
  const o=observation(data,k);if(data.days[k]?.confirmed!==true||!o.known||o.entries.some(e=>e.cost==null)){excluded++;continue}
  days++;actual+=o.entries.reduce((n,e)=>n+Math.round(e.cost*100),0);
 }
 return {days,excluded,actual,reference:Math.round(ref.dailyCost*100)*days,difference:Math.round(ref.dailyCost*100)*days-actual};
}
