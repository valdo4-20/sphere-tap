precision highp float;
varying vec2 uv;
uniform sampler2D logo;
uniform float time;
uniform float amount;
uniform float aspect;
uniform float iconMode;

float boxDistance(vec2 v){
 vec2 q=abs(v)-vec2(.323-.132);
 return length(max(q,0.))+min(max(q.x,q.y),0.)-.132;
}

// Each impact launches a wave packet. Its front travels outward while the
// envelope decays. This is an analytic optical approximation, not a fluid solver.
vec2 impact(vec2 position,vec2 origin,float start,float strength){
 float dt=time-start;
 if(dt<=0.)return vec2(0.);
 vec2 delta=(position-origin)*vec2(1.,1.12);
 float r=length(delta);
 vec2 normal=delta/max(r,.001);
 float onset=1.-exp(-dt*24.);
 float decay=exp(-dt*1.65);
 float front=exp(-pow((r-.48*dt)/.25,2.));
 float ringing=sin(35.*r-22.*dt);
 float returnWave=sin(20.*r-13.*dt)*exp(-dt*.9)*.22;
 return normal*strength*onset*decay*(front*ringing+returnWave)*.052;
}

vec2 oilSlope(vec2 position){
 vec2 slope=impact(position,vec2(-.25,.24),.18,1.);
 slope+=impact(position,vec2(.28,-.16),.92,.76);
 slope+=impact(position,vec2(-.17,.12),1.68,1.08);
 slope+=impact(position,vec2(.22,.18),2.52,.64);
 return slope*amount;
}

void main(){
 vec2 p=vec2(uv.x,1.-uv.y);
 vec2 q=p-.5;
 float fit=iconMode>.5?.58:1.;
 q.x*=max(fit,aspect/1.846);
 q.y*=max(1.,1.846/aspect*fit);
 p=q+.5;
 vec2 position=(p-.5)*vec2(1.846,1.);
 float distance=boxDistance(position);
 vec2 slope=oilSlope(position);
 float rimField=exp(-pow(distance*24.,2.));
 float liquidWeight=iconMode>.5?(.24+.9*rimField):1.;
 vec2 displacement=slope*vec2(1./1.846,1.)*liquidWeight;
 vec3 color=vec3(0.);
 vec3 weights=vec3(0.);
 for(int i=0;i<9;i++){
  float wavelength=float(i)/8.;
  vec2 sampleAt=p+displacement*(.65+wavelength*.85);
  vec3 spectral=clamp(vec3(1.5-abs(wavelength*4.-3.),1.5-abs(wavelength*4.-2.),1.5-abs(wavelength*4.-1.)),0.,1.);
  color+=texture2D(logo,clamp(sampleAt,0.,1.)).rgb*spectral;
  weights+=spectral;
 }
 color/=max(weights,vec3(.001));
 if(iconMode>.5){
  // Keep the logo legible; dispersion lives mainly near the app's glass rim.
  vec3 clear=texture2D(logo,clamp(p+displacement,0.,1.)).rgb;
  color=mix(clear,color,rimField*.7);
  float angle=atan(position.y,position.x);
  float energy=min(1.,length(slope)*22.);
  float bentDistance=distance+dot(slope,normalize(position+vec2(.0001)))*.38;
  float patchA=pow(max(0.,cos(angle+2.35+slope.x*12.)),14.);
  float patchB=pow(max(0.,cos(angle-.72+slope.y*12.)),16.);
  float patches=patchA+patchB;
  float edge=exp(-pow(bentDistance*320.,2.));
  float outer=exp(-pow((bentDistance-.008)*220.,2.));
  float inner=exp(-pow((bentDistance+.025)*170.,2.));
  float pool=exp(-pow((bentDistance+.033+dot(slope,vec2(.6,.8)))*37.,2.))*patches;
  vec3 oil=mix(vec3(.015,.24,1.),vec3(1.,.38,.035),smoothstep(-.04,.008,bentDistance+slope.x));
  color+=edge*vec3(.52,.59,.72)*(.13+.8*patches);
  color+=outer*vec3(.55,.64,.76)*(.06+.35*patches);
  color+=inner*vec3(.16,.24,.46)*patches*.6;
  color+=pool*oil*(.4+energy*.65);
  float glint=pow(max(0.,cos(angle+1.6+slope.x*8.)),22.)*exp(-pow((bentDistance+.004)*260.,2.));
  color+=glint*vec3(.75,.85,1.)*.8;
 }
 gl_FragColor=vec4(color,1.);
}
