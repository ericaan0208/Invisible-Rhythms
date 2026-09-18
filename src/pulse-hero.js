import {gsap} from 'gsap';
export const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export const smooth=v=>{v=clamp(v);return v*v*(3-2*v);};
export const displacement=t=>Math.sin(Math.PI*t);

export function heroMarkup(){return `<section id="opening" class="pulse-run" aria-label="The page has a pulse"><div class="pulse-stage">
 <div class="hero-art" aria-hidden="true"><div class="navy-crop"><div class="navy-response"></div></div><div class="orb-layout"><div class="orb-scroll"><div class="orb-breath"></div></div></div></div>
 <div class="hero-intro"><h1><span class="title-line line-one">INVISIBLE</span><span class="title-line line-two">RHYTHMS</span></h1><p>Some rhythms are felt.<br>Others need a closer look.</p></div>
 <div class="motion-record" aria-label="Illustrative motion, vertical displacement over four example seconds"><div class="record-label"><span>Vertical displacement</span><span>Illustrative motion</span></div><svg class="motion-svg" role="img" aria-label="An illustrative vertical displacement record with equally spaced time samples"></svg><p class="sample-label">Equal time steps · 0.5 s apart</p></div>
 <div class="hero-explanation" aria-live="off"><h2>A repeating change leaves a pattern.</h2><p>Follow the orange marker. Each point holds its vertical position at an equal step in example time.</p></div>
 <div class="hero-footer"><a href="#recording" class="continue-link">Scroll to explore <span aria-hidden="true">↓</span></a><span class="hero-phase" hidden>Illustrative motion · not a physiological recording</span></div>
 </div></section><section class="static-motion" aria-labelledby="static-motion-title"><div class="static-motion-figure"><div class="record-label"><span>Vertical displacement</span><span>Illustrative motion</span></div><svg role="img" aria-label="Equally spaced observations of a marker's illustrative vertical displacement"></svg><p>Equal time steps · 0.5 s apart</p></div><div class="reading-copy"><h2 id="static-motion-title">A repeating change leaves a pattern.</h2><p>These points record a marker’s vertical position at equal steps in example time. Now look at a different kind of record: EEG. This motion is an illustration, not a physiological measurement.</p></div></section>`;}

function pathMarkup(width,height){
 const left=10,right=width-12,top=24,bottom=height-36,mid=(top+bottom)/2,amplitude=(bottom-top)*.34;
 const x=t=>left+t/4*(right-left),y=t=>mid-displacement(t)*amplitude;
 const d=Array.from({length:161},(_,i)=>{const t=i/40;return `${i?'L':'M'}${x(t).toFixed(2)},${y(t).toFixed(2)}`;}).join('');
 return {left,right,mid,amplitude,x,y,markup:`<path class="motion-baseline" d="M${left},${mid}H${right}"/><path class="motion-line" d="${d}"/>${Array.from({length:9},(_,i)=>`<circle class="motion-sample" data-time="${i*.5}" cx="${x(i*.5)}" cy="${y(i*.5)}" r="7"/>`).join('')}${[0,1,2,3,4].map(t=>`<text class="motion-axis" x="${x(t)}" y="${height-5}" text-anchor="${t===0?'start':t===4?'end':'middle'}">${t}${t===4?' s':''}</text>`).join('')}`};
}

export function mountHero(root){
 const run=root.querySelector('.pulse-run'),stage=root.querySelector('.pulse-stage'),orb=root.querySelector('.orb-scroll'),breath=root.querySelector('.orb-breath');
 const intro=root.querySelector('.hero-intro'),lines=[...root.querySelectorAll('.title-line')],arc=root.querySelector('.navy-response');
 const record=root.querySelector('.motion-record'),svg=record.querySelector('svg'),explain=root.querySelector('.hero-explanation'),phase=root.querySelector('.hero-phase');
 const staticSvg=root.querySelector('.static-motion svg');
 let metrics,plot,timeline,progress=0,linear=false,played=false,phaseIndex=-1;
 const idle={amount:0};let carry=0,carryStart=0,carryDistance=0;
 function resize(){
  const r=stage.getBoundingClientRect(),v=svg.getBoundingClientRect();
  metrics={width:r.width,height:r.height,baseX:r.width*(r.width<=760?.60:.68),baseY:r.height*(r.width<=760?.39:.43),diameter:root.querySelector('.orb-layout').clientWidth,plotX:v.left-r.left,plotY:v.top-r.top};
  plot=pathMarkup(svg.clientWidth,svg.clientHeight);svg.setAttribute('viewBox',`0 0 ${svg.clientWidth} ${svg.clientHeight}`);svg.innerHTML=plot.markup;
  if(staticSvg.clientWidth){const p=pathMarkup(staticSvg.clientWidth,staticSvg.clientHeight);staticSvg.setAttribute('viewBox',`0 0 ${staticSvg.clientWidth} ${staticSvg.clientHeight}`);staticSvg.innerHTML=p.markup;}
  render(progress);
 }
 function stopIdle(p=progress){if(!timeline)return;timeline.kill();timeline=null;carry=idle.amount;carryStart=p;carryDistance=0;idle.amount=0;}
 function render(p){
  if(!metrics)return;progress=clamp(p);stage.dataset.progress=progress.toFixed(4);
  const small=metrics.width<=760;
  const transition=smooth((p-.38)/.23),travel=smooth((p-.56)/.32),time=travel*4;
  carryDistance=Math.max(carryDistance,Math.abs(p-carryStart));const resting=idle.amount+carry*(1-smooth(carryDistance/.065));
  const beat=p<.15?.018*Math.sin(p/.15*Math.PI):p<.40?.12*Math.pow(Math.sin(Math.PI*(p-.15)/.25),2):0;
  const envelope=linear?0:(resting*.12+beat)*(1-transition);
  const targetX=metrics.plotX+plot.x(time),targetY=metrics.plotY+plot.y(time);
  const scale=1-transition*(1-28/metrics.diameter);
  orb.style.transform=`translate(${(targetX-metrics.baseX)*transition}px,${(targetY-metrics.baseY)*transition}px) scale(${scale})`;
  breath.style.transform=`scale(${1+envelope})`;
  lines.forEach((line,i)=>line.style.transform=`translateX(${envelope*(small?55:110)*(i===0?-1:1)}px)`);
  arc.parentElement.style.opacity=1-transition;
  arc.style.transform=`translate(${envelope*(small?70:140)}px,${-envelope*65}px)`;
  const titleOpacity=1-smooth((p-.34)/.10);intro.style.opacity=titleOpacity;intro.style.visibility=titleOpacity?'visible':'hidden';intro.inert=titleOpacity===0;
  const group=p<.43?0:p<.85?1:2;
  if(group!==phaseIndex){phaseIndex=group;stage.dataset.phase=['opening','pattern','handoff'][group];explain.querySelector('h2').textContent=group===2?'Now look at a different kind of record: EEG.':'A repeating change leaves a pattern.';explain.querySelector('p').textContent=group===2?'This line records an illustrative marker’s motion. EEG records electrical voltage differences. The appearance may be similar; the measurement is different.':'Follow the orange marker. Each point holds its vertical position at an equal step in example time.';}
  explain.style.opacity=group?1:0;explain.style.visibility=group?'visible':'hidden';explain.setAttribute('aria-hidden',String(!group));
  record.style.opacity=smooth((p-.46)/.10);record.style.visibility=p>.46?'visible':'hidden';record.setAttribute('aria-hidden',String(p<=.46));
  const reveal=p<.64?0:travel;svg.querySelector('.motion-line').style.clipPath=`inset(0 ${100*(1-reveal)}% 0 0)`;
  svg.querySelectorAll('.motion-sample').forEach(dot=>dot.style.opacity=Number(dot.dataset.time)<=time+.001&&p>.54?'1':'0');
  svg.querySelectorAll('.motion-axis,.motion-baseline').forEach(el=>el.style.opacity=p>.65?'1':'0');
  record.querySelector('.sample-label').style.visibility=p>.65?'visible':'hidden';
  phase.hidden=group===0;root.querySelector('.continue-link').firstChild.textContent='Scroll to explore ';
  stage.dataset.envelope=envelope.toFixed(4);
 }
 function seek(p){if(p>.0001)stopIdle(p);render(p);}
 function setLinear(value){linear=value;if(value){stopIdle();carry=0;render(0);}resize();}
 function welcome(){if(played||linear||scrollY>2)return;played=true;timeline=gsap.timeline({onUpdate:()=>render(progress),onComplete:()=>{timeline=null;idle.amount=0;render(progress);}});timeline.to(idle,{amount:1,duration:.15,ease:'power2.out'},.35).to(idle,{amount:0,duration:.65,ease:'power2.out'}).to(idle,{amount:1,duration:.15,ease:'power2.out'},1.95).to(idle,{amount:0,duration:.65,ease:'power2.out'});}
 return {run,stage,resize,seek,setLinear,welcome,stopIdle,destroy(){timeline?.kill();},get progress(){return progress;}};
}
