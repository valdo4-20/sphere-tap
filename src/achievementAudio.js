let context;
export function prepareAchievementAudio(){
 try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;context||=new Audio();if(context.state==="suspended")void context.resume().catch(()=>{});}catch{}
}
export function playAchievementSound(){
 if(!context||context.state!=="running")return false;
 const start=context.currentTime;
 [523.25,659.25,783.99].forEach((frequency,i)=>{
  const envelope=context.createGain();envelope.gain.setValueAtTime(0,start+i*.13);envelope.gain.linearRampToValueAtTime(.045,start+i*.13+.018);envelope.gain.exponentialRampToValueAtTime(.0001,start+i*.13+.8);envelope.connect(context.destination);
  const fundamental=context.createOscillator();fundamental.type="sine";fundamental.frequency.value=frequency;fundamental.connect(envelope);fundamental.start(start+i*.13);fundamental.stop(start+i*.13+.82);
 });
 return true;
}
