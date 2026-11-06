// Adaptado dos filtros de fitness.ts do Sphere UI Kit. Não faz ajuste a ruas.
export const validPoint=p=>p&&Number.isFinite(p.latitude)&&Math.abs(p.latitude)<=90&&Number.isFinite(p.longitude)&&Math.abs(p.longitude)<=180&&Number.isFinite(p.accuracy)&&p.accuracy>=0&&p.accuracy<=40&&Number.isFinite(p.timestamp)&&p.timestamp>0;
export function distanceBetween(a,b){const r=n=>n*Math.PI/180;const h=Math.sin(r(b.latitude-a.latitude)/2)**2+Math.cos(r(a.latitude))*Math.cos(r(b.latitude))*Math.sin(r(b.longitude-a.longitude)/2)**2;return 6371000*2*Math.atan2(Math.sqrt(h),Math.sqrt(Math.max(0,1-h)));}
export function acceptPoint(previous,p){if(!validPoint(p))return false;if(!previous)return true;const seconds=(p.timestamp-previous.timestamp)/1000,d=distanceBetween(previous,p);return seconds>0&&d>=Math.max(5,Math.min(15,(p.accuracy+previous.accuracy)*.35))&&d/seconds<=3;}
export function routeDistance(points){return points.reduce((n,p,i)=>n+(i&&p.segment===points[i-1].segment?distanceBetween(points[i-1],p):0),0);}
export function validWalk(w){return w&&typeof w.id==='string'&&Number.isFinite(w.startedAt)&&Number.isFinite(w.endedAt)&&w.endedAt>=w.startedAt&&Number.isFinite(w.seconds)&&w.seconds>=0&&w.seconds<604800&&Number.isFinite(w.stride)&&w.stride>=.3&&w.stride<=1.5&&Array.isArray(w.points)&&w.points.length<=15000&&w.points.every(p=>validPoint(p)&&Number.isInteger(p.segment)&&p.segment>=0);}
export const walkingDistance=n=>n>=1000?(n/1000).toFixed(2).replace('.',',')+' km':Math.round(n)+' m';
export const walkingTime=n=>{n=Math.max(0,Math.floor(n));return [Math.floor(n/3600),Math.floor(n/60)%60,n%60].map(v=>String(v).padStart(2,'0')).join(':')};
export function walkingPace(m,s){return m>=50?walkingTime(s/(m/1000)).slice(3)+' /km':'—';}
