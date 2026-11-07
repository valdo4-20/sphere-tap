let context,last=0;
export function levelFeedback({sound=true,reduced=false,kind="button"}={}){
 if(Date.now()-last<120)return;last=Date.now();
 if(!reduced){try{navigator.vibrate?.(kind==='complete'?[10,40,10]:8)}catch{}}
 if(!sound)return;
 try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;context||=new Audio();
 const play=()=>{if(context.state!=='running')return;const tones=kind==='complete'?[523,659,784]:kind==='question'?[440,554]:[520];const t=context.currentTime;tones.forEach((hz,i)=>{const start=t+i*.075,g=context.createGain(),o=context.createOscillator();g.gain.setValueAtTime(0,start);g.gain.linearRampToValueAtTime(kind==='complete'?.026:.025,start+.008);g.gain.exponentialRampToValueAtTime(.0001,start+.18);g.connect(context.destination);o.type='sine';o.frequency.setValueAtTime(hz,start);if(kind==='button')o.frequency.exponentialRampToValueAtTime(390,start+.15);o.connect(g);o.start(start);o.stop(start+.19);o.onended=()=>{o.disconnect();g.disconnect()}})};
 if(context.state==='suspended')void context.resume().then(play).catch(()=>{});else play();
 }catch{}
}
