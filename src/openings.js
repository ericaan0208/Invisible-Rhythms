import {gsap} from 'gsap';
import {buildRecord} from './signal.js';
import {drawTrace,svgMarkup} from './plot.js';

export function windowMarkup(id='opening') {
  return `<div class="observation" data-window="${id}">
    <div class="observation-heading"><p class="eyebrow">A study in attention</p><p class="window-invitation">Pull the edge.<br>See more time.</p></div>
    <div class="window-stage">
      <div class="time-glimpse"><span class="window-number">01</span><span class="window-unit">second</span><span class="window-caption">in view</span></div>
      <div class="record-window"><span class="window-edge edge-left" aria-hidden="true"></span>
        <div class="record-trace">${svgMarkup(`${id}-trace`,'Synthetic EEG-like record, fixed start at 4 seconds',152)}</div>
        <span class="window-edge edge-right" aria-hidden="true"><span class="edge-grip">↔</span></span>
      </div>
      <label class="sr-only" for="${id}-range">Observation window in seconds</label>
      <input id="${id}-range" class="window-drag" type="range" min="0" max="100" step="1" value="29" aria-valuetext="1 second in view" />
    </div>
    <div class="window-tools"><button class="text-button" data-window-step="-1" aria-label="Show less time">− Less time</button><span class="mono window-duration">4.0–5.0 s of the same record</span><button class="text-button" data-window-step="1" aria-label="Show more time">More time +</button></div>
    <div class="window-understanding"><p class="window-thought">One second reveals a few cycles.<br>A longer view reveals their changing organization.</p><p class="micro">Synthetic demonstration · arbitrary units<br><span class="aggregate-label">Voltage trace · fixed record start</span></p></div>
  </div>`;
}

export function mountWindow(element,{initial=1,onChange=()=>{},reduce=()=>false}={}) {
  const record=buildRecord();const range=element.querySelector('.window-drag');
  const frame=element.querySelector('.record-window'),number=element.querySelector('.window-number');
  let duration=initial,queued=false,raf=0;
  const logmin=Math.log(.25),span=Math.log(120)-logmin;
  const fraction=d=>(Math.log(d)-logmin)/span;
  function render(){
    queued=false;const pct=fraction(duration);
    const ww=30+70*pct;frame.style.width=`${ww}%`;
    element.style.setProperty('--edge-position',`${(100+ww)/2}%`);
    number.textContent=duration<1?duration.toFixed(2):duration<10?duration.toFixed(1).replace('.0',''):Math.round(duration).toString().padStart(2,'0');
    element.querySelector('.window-unit').textContent=duration<=1?'second':'seconds';
    element.querySelector('.window-duration').textContent=`4.0–${(4+duration).toFixed(1)} s of the same record`;
    element.querySelector('.aggregate-label').textContent=duration>12?'Voltage range per display column · not power':'Voltage trace · fixed record start';
    range.value=Math.round(pct*100);range.setAttribute('aria-valuetext',`${duration<1?duration.toFixed(2):duration.toFixed(1)} seconds in view`);
    drawTrace(element.querySelector('svg'),record.raw,{start:4,duration,showAxes:true,range:record.raw.displayRange,ticks:2,color:'var(--accent)'});
    element.dataset.duration=duration.toFixed(3);onChange(duration);
  }
  function update(value){duration=Math.min(120,Math.max(.25,value));if(!queued){queued=true;raf=requestAnimationFrame(render);}}
  const input=()=>update(Math.exp(logmin+Number(range.value)/100*span));
  range.addEventListener('input',input);
  element.querySelectorAll('[data-window-step]').forEach(b=>b.addEventListener('click',()=>update(duration*(Number(b.dataset.windowStep)>0?2:.5))));
  const resize=new ResizeObserver(()=>update(duration));resize.observe(element);
  range.addEventListener('pointerdown',()=>element.classList.add('is-manipulating'));
  for(const event of ['pointerup','pointercancel','lostpointercapture','blur'])range.addEventListener(event,()=>element.classList.remove('is-manipulating'));
  render();
  return {get duration(){return duration;},setDuration:update,destroy(){resize.disconnect();cancelAnimationFrame(raf);range.removeEventListener('input',input);}};
}

export function layersMarkup(id='layers') {
  return `<div class="layer-study"><p class="eyebrow">One record. Different questions.</p><h2>Separate<br>what you see.</h2><div class="layer-stack">
  <div class="study-layer" data-layer="0"><span>01 / Electrical record · a.u.</span>${svgMarkup(`${id}-raw`,'Synthetic voltage record',110)}</div>
  <div class="study-layer" data-layer="1"><span>02 / Filtered 10–16 Hz · a.u.</span>${svgMarkup(`${id}-sigma`,'Band-pass filtered synthetic record',110)}</div>
  <div class="study-layer" data-layer="2"><span>03 / Calculated power · a.u.²</span>${svgMarkup(`${id}-power`,'Calculated mean-square sigma power',110)}</div></div>
  <button class="solid-button" data-separate>Separate the readings ↗</button><p class="micro">Same 4–12 s interval in every row. Synthetic demonstration.<br>Filtering and power calculation are explicit analysis steps.</p></div>`;
}
export function mountLayers(element,{reduce=()=>false}={}) {
  let separated=false; const record=buildRecord();const layers=element.querySelectorAll('.study-layer');
  function draw(){['raw','sigma','power'].forEach((key,i)=>drawTrace(layers[i].querySelector('svg'),record[key],{start:4,duration:8,showAxes:false,range:record[key].displayRange}));}
  function toggle(){separated=!separated; element.classList.toggle('separated',separated);gsap.to(layers,{y:i=>separated?i*115:i*12,x:i=>separated?0:i*14,rotation:i=>separated?0:i*-2,duration:reduce()?0:.65,ease:'power3.inOut',overwrite:true});element.querySelector('[data-separate]').textContent=separated?'Bring the readings together ↙':'Separate the readings ↗';element.querySelector('[data-separate]').setAttribute('aria-expanded',String(separated));}
  element.querySelector('[data-separate]').addEventListener('click',toggle);draw();const ro=new ResizeObserver(draw);ro.observe(element);
  return{destroy(){ro.disconnect();gsap.killTweensOf(layers);}};
}
