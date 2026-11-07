import React,{useEffect,useRef} from 'react';
// Independent scenery shader: never reads or changes AURA state, material or canvas.
export function SceneryShader(){
 const ref=useRef(null);
 useEffect(()=>{
  const canvas=ref.current,gl=canvas.getContext('webgl',{alpha:true,antialias:false,powerPreference:'low-power'});if(!gl)return;
  const vertex='attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const fragment=`precision mediump float;uniform vec2 resolution;uniform float time;uniform float light;
  float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);}
  void main(){vec2 uv=gl_FragCoord.xy/resolution;vec2 p=uv*vec2(resolution.x/resolution.y,1.);float t=time*.035;
  float n=noise(p*3.+vec2(t,-t));float f=noise(p*7.+n+t);float ribbon=pow(max(0.,1.-abs(uv.x-.5-sin(uv.y*5.+t)*.22)*3.),5.);
  vec3 c=mix(vec3(.39,.65,.95),vec3(.77,.42,.84),f);float alpha=(n*.025+f*.022+ribbon*.055)*(1.-light*.35);gl_FragColor=vec4(c*alpha,alpha);}`;
  const compile=(type,source)=>{const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){gl.deleteShader(shader);return null}return shader};
  const vs=compile(gl.VERTEX_SHADER,vertex),fs=compile(gl.FRAGMENT_SHADER,fragment);if(!vs||!fs)return;const program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))return;
  gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const loc=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
  const time=gl.getUniformLocation(program,'time'),resolution=gl.getUniformLocation(program,'resolution'),light=gl.getUniformLocation(program,'light');
  let frame=0,last=0,visible=true;const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const resize=()=>{canvas.width=Math.min(innerWidth,960);canvas.height=Math.min(innerHeight,1100);gl.viewport(0,0,canvas.width,canvas.height)};resize();
  function draw(now){if(!visible)return;if(now-last>65){last=now;gl.uniform2f(resolution,canvas.width,canvas.height);gl.uniform1f(time,reduced.matches?0:now/1000);gl.uniform1f(light,document.documentElement.dataset.theme==='light'?1:0);gl.drawArrays(gl.TRIANGLES,0,6)}if(!reduced.matches)frame=requestAnimationFrame(draw)}
  function start(){cancelAnimationFrame(frame);last=-100;draw(performance.now())}const visibility=()=>{visible=!document.hidden;if(visible)start();else cancelAnimationFrame(frame)};start();
  document.addEventListener('visibilitychange',visibility);window.addEventListener('resize',resize);reduced.addEventListener('change',start);
  return()=>{cancelAnimationFrame(frame);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('resize',resize);reduced.removeEventListener('change',start);gl.deleteBuffer(buffer);gl.deleteProgram(program);gl.deleteShader(vs);gl.deleteShader(fs)};
 },[]);
 return <canvas className='journey-scenery-shader' ref={ref} aria-hidden='true'/>;
}
export default function WorldDecor(){return <div className='journey-world-decor' aria-hidden='true'>{Array.from({length:10},(_,i)=><div key={i} className={`world-cluster ${i%2?'right':'left'}`} style={{top:`${i*9+3}%`,'--delay':`${-i*1.3}s`}}><span className='world-note' style={{color:['#ad92ee','#6fc9c5','#d7a46a','#e29ab8'][i%4]}}>{i%2?'♫':'♪'}</span><i className='world-spark'/><i className='world-spark second'/></div>)}</div>}
