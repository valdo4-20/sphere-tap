import React,{useEffect,useRef} from 'react';
const rgb=hex=>(hex.match(/[0-9a-f]{2}/gi)||['b7','be','ca']).map(n=>parseInt(n,16));
const mix=(a,b,t)=>a.map((v,i)=>Math.round(v+(b[i]-v)*t));
const reflect=n=>1-Math.abs(((n%2)+2)%2-1);
export default function AuraWaves({color,pulse,pulseColor,enabled=true}){
 const ref=useRef(null),redraw=useRef(null),inputs=useRef({color,pulseColor}),pulses=useRef([]),sequence=useRef(0),previous=useRef(pulse);
 inputs.current={color,pulseColor};
 useEffect(()=>{
  if(previous.current===pulse)return;
  previous.current=pulse;
  if(!enabled||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  pulses.current=[...pulses.current,{id:++sequence.current,startedAt:performance.now(),color:inputs.current.pulseColor||inputs.current.color}];
 },[pulse,enabled]);
 useEffect(()=>{
  const canvas=ref.current,ctx=canvas.getContext('2d'),q=matchMedia('(prefers-reduced-motion: reduce)');if(!ctx)return;let frame=0,last=0,w=0,h=0;
  function resize(){const scale=Math.min(1,960/Math.max(innerWidth,innerHeight));w=canvas.width=Math.round(innerWidth*scale);h=canvas.height=Math.round(innerHeight*scale);draw(performance.now(),true)}
  function glow(x,y,r,c,a){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${c},${a})`);g.addColorStop(.35,`rgba(${c},${a*.7})`);g.addColorStop(.72,`rgba(${c},${a*.2})`);g.addColorStop(1,`rgba(${c},0)`);ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2)}
  function draw(now,force=false){if(!force&&now-last<(q.matches?1000:42))return;last=now;ctx.clearRect(0,0,w,h);if(!enabled)return;const light=document.documentElement.dataset.theme==='light',t=q.matches?0:now/1000,base=rgb(inputs.current.color),cool=mix(base,[84,110,199],.3),warm=mix(base,[209,126,146],.3),r=Math.min(w,h)*.83,breath=q.matches?1:1+Math.sin(t*.8)*.055,alpha=light?.3:.48;
   ctx.globalCompositeOperation='source-over';glow(reflect(t*.072+.18)*w,-r*.26,r*breath,base,alpha);glow(w+r*.18,reflect(t*.061+.5)*h,r*1.18*breath,cool,alpha*.88);glow(reflect(t*.067+1.1)*w,h+r*.21,r*breath,warm,alpha*.82);glow(-r*.2,reflect(t*.058+1.4)*h,r*1.1*breath,base,alpha*.92);glow(reflect(t*.035+.64)*w,reflect(t*.048+.2)*h,r*.62,cool,alpha*.42);
   ctx.globalCompositeOperation='destination-out';ctx.save();ctx.translate(w/2,h*.47);ctx.scale(1,h/w);const aperture=ctx.createRadialGradient(0,0,w*.03,0,0,w*.42);aperture.addColorStop(0,'rgba(0,0,0,.8)');aperture.addColorStop(.65,'rgba(0,0,0,.52)');aperture.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=aperture;ctx.fillRect(-w,-w,w*2,w*2);ctx.restore();ctx.globalCompositeOperation='source-over';
   if(!q.matches){
    pulses.current=pulses.current.filter(p=>now-p.startedAt<1500);
    for(const pulse of pulses.current){
     const age=(now-pulse.startedAt)/1000,phase=age/1.5,fade=Math.sin(Math.PI*phase),c=rgb(pulse.color),x=w*.5,y=h*.46,radius=Math.min(w,h)*(.16+phase*.52);
     glow(x,y,radius,c,fade*.34);
     glow(x-radius*.2,y+radius*.12,radius*.58,mix(c,[255,255,255],.16),fade*.2);
     glow(x+radius*.25,y-radius*.1,radius*.48,c,fade*.18);
    }
   }
  }
  function tick(now){frame=0;if(document.hidden||!enabled||q.matches)return;draw(now);frame=requestAnimationFrame(tick)}
  function resume(){cancelAnimationFrame(frame);frame=0;if(document.hidden)return;if(!enabled||q.matches)pulses.current=[];last=0;draw(performance.now(),true);if(enabled&&!q.matches)frame=requestAnimationFrame(tick)}
  redraw.current=()=>draw(performance.now(),true);
  resize();resume();window.addEventListener('resize',resize,{passive:true});document.addEventListener('visibilitychange',resume);q.addEventListener('change',resume);
  return()=>{redraw.current=null;cancelAnimationFrame(frame);window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',resume);q.removeEventListener('change',resume)};
 },[enabled]);
 useEffect(()=>{redraw.current?.();},[color,pulseColor]);
 return <canvas className='aura-fluid-waves' ref={ref} aria-hidden='true'/>;
}
