import './style.css';
import {scenes} from './scenes.js';
import {createField, drawMiniatures} from './visual.js';
import {initEvidence} from './evidence-ui.js';
import {papers} from './evidence-data.js';

history.scrollRestoration='manual';
const app = document.querySelector('#app');
app.innerHTML = `
<a class="skip-link" href="#eeg">Skip to the science</a>
<header class="site-header">
  <a class="wordmark" href="#top" aria-label="Invisible Rhythms, beginning"><svg viewBox="0 0 34 24" aria-hidden="true"><path d="M0 12h6l4-9 5 19 6-20 5 15 3-5h5"/></svg><span>INVISIBLE<br>RHYTHMS</span></a>
  <span class="header-caption">NEURAL OSCILLATIONS ACROSS TIMESCALES</span>
  <nav aria-label="Site controls"><button id="reading-toggle" aria-pressed="false">Reading view</button><button class="evidence-launch" data-evidence="all">Evidence <span>↗</span></button></nav>
</header>
<main>
  <section class="hero" id="top" aria-labelledby="hero-title">
    <div class="hero-sticky">
      <p class="hero-kicker">EEG, SLEEP SPINDLES & INFRASLOW MODULATION</p>
      <h1 id="hero-title" class="hero-title"><span>INVISIBLE</span><span>RHYTHMS</span></h1>
      <canvas id="hero-canvas" aria-hidden="true"></canvas>
      <div class="hero-title-contrast" aria-hidden="true"><div class="hero-title"><span>INVISIBLE</span><span>RHYTHMS</span></div></div>
      <div class="hero-bottom"><p>From EEG signals to sigma power.<br>Neural rhythms across timescales.</p><a href="#eeg" class="begin-link">Explore the signals <span>↓</span></a><span class="hero-provenance">VISUAL STUDY FROM A<br>SIMULATED SIGNAL</span></div>
      <div class="hero-line" aria-hidden="true"></div>
    </div>
  </section>
  <section class="journey" aria-label="A guided journey from EEG to infraslow sigma power">
    <div class="science-stage" data-theme="mineral">
      <div class="stage-topline"><span id="stage-chapter">${scenes[0].eyebrow}</span><span class="data-status">SIMULATED DATA <i></i></span></div>
      <div class="heading-window"><h2 id="stage-word">${scenes[0].word}</h2></div>
      <canvas id="science-canvas" role="img" aria-label="EEG-like signal over two seconds; simulated data"></canvas>
      <div class="stage-note" id="stage-note"></div>
      <div class="stage-caption"><div><h3 id="stage-title"></h3><p id="stage-description"></p><button class="text-link" id="stage-evidence" data-evidence="eeg">The evidence & method <span>↗</span></button></div><div class="stage-metric"><strong id="metric"></strong><span id="metric-unit"></span></div></div>
      <div class="window-control" hidden><div class="window-control-heading"><label for="time-window">Observation window <output id="window-output">2 s</output></label><button id="resume" hidden>Resume scroll ↺</button></div><input id="time-window" type="range" min="0" max="1000" value="0" aria-label="Observation window in seconds"><div class="window-presets">${[2,10,60,180].map(n=>`<button data-window="${n}">${n} s</button>`).join('')}</div></div>
      <nav class="chapter-rail" aria-label="Chapters">${scenes.map((s,i)=>`<a href="#${s.id}" data-chapter="${i}" aria-label="0${i+1} ${s.eyebrow.split(' / ')[1]}"><span>0${i+1}</span><b>${s.eyebrow.split(' / ')[1]}</b></a>`).join('')}<a href="#sources" class="rail-sources" aria-label="Sources"><span>↗</span><b>Sources</b></a></nav>
    </div>
    <div class="journey-steps">${scenes.map(s=>`<section class="journey-step" id="${s.id}" aria-label="${s.title}"><div class="reading-content"><span class="reading-number">${s.eyebrow}</span><h2>${s.word}</h2><p>${s.description}</p><canvas data-reading="${s.id}" role="img" aria-label="${s.note}"></canvas><p class="reading-note">${s.note}. Simulated data.</p><button class="text-link" data-evidence="${s.evidence}">Evidence, methods & original papers ↗</button></div></section>`).join('')}</div>
  </section>
  <section class="closing" id="sources">
    <div class="closing-label"><span>RESEARCH SOURCES & METHODOLOGY</span><span>08 / Evidence</span></div>
    <h2>Evidence &<br><em>methods</em></h2>
    <div class="closing-intro"><p>Scientific context for<br>the simulated signals.</p><div><p>Read the original studies, review the signal-processing methods, and examine the limits of the evidence.</p><button class="solid-button" data-evidence="all">Open evidence & methods <span>↗</span></button></div></div>
    <div class="source-preview" aria-label="Selected research sources"></div>
    <div class="closing-return"><a href="#top">Back to introduction <span>↑</span></a><span>EEG · SPINDLES · SIGMA POWER</span></div>
  </section>
</main>
<footer><span>INVISIBLE RHYTHMS</span><p>An interactive introduction to neural oscillations. All plotted signals are simulated teaching data.</p><button data-evidence="all">Sources & methods ↗</button></footer>`;

const evidence = initEvidence();
const paperValues = Object.values(papers);
const chosen = paperValues.filter(p=>/Lecci|L.z.r|Fernandez|L.thi/i.test(`${p.authors} ${p.title}`)).slice(0,4);
document.querySelector('.source-preview').innerHTML = (chosen.length ? chosen : paperValues.slice(0,4)).map((p,i)=>`<a class="source-row" href="${p.originalUrl}" target="_blank" rel="noopener noreferrer"><span>0${i+1}</span><span>${p.title}</span><span>${p.year || ''}</span><span>↗</span></a>`).join('');
const hero = document.querySelector('.hero');
const sticky = document.querySelector('.hero-sticky');
const stage = document.querySelector('.science-stage');
const steps = [...document.querySelectorAll('.journey-step')];
const rail = [...document.querySelectorAll('[data-chapter]')];
const field = createField(document.querySelector('#science-canvas'));
const heroField = createField(document.querySelector('#hero-canvas'));
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let reading = reduced.matches || innerHeight<540;
let current = -1;
let manualWindow = null;
let pointer = {x:.62,y:.5,active:false};
let bounds = [];
let height = innerHeight;
let frame = 0;
let heroEnd = 1;
let visibleHero = true;
let currentProgress = 0;
const clamp = (v,a=0,b=1)=>Math.min(b,Math.max(a,v));

function measure() {
  height = innerHeight;
  const toggle=document.querySelector('#reading-toggle');toggle.disabled=height<540;toggle.textContent=height<540?'Reading view':reading?'Guided view':'Reading view';
  bounds = steps.map(el=>({top:el.getBoundingClientRect().top+scrollY,height:el.offsetHeight}));
  heroEnd = hero.offsetHeight;
  field.resize(); heroField.resize();
  if(reading) drawMiniatures();
  schedule();
}
function setScene(index) {
  if(index===current) return;
  current=index;
  const s=scenes[index];
  stage.dataset.theme=s.theme;
  stage.dataset.scene=s.id;
  for(const [id,text] of Object.entries({'stage-chapter':s.eyebrow,'stage-word':s.word,'stage-title':s.title,'stage-description':s.description,'stage-note':s.note,'metric':s.metric,'metric-unit':s.unit})) document.getElementById(id).textContent=text;
  document.querySelector('#stage-evidence').dataset.evidence=s.evidence;
  document.querySelector('#science-canvas').setAttribute('aria-label',`${s.title} ${s.description} Simulated data.`);
  rail.forEach((a,i)=>{a.classList.toggle('active',i===index);if(i===index)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});
  document.querySelector('.window-control').hidden = s.id!=='window';
  document.querySelector('.heading-window').classList.remove('arrived');
  requestAnimationFrame(()=>document.querySelector('.heading-window').classList.add('arrived'));
}
function render() {
  frame=0;
  visibleHero = scrollY < heroEnd;
  document.body.classList.toggle('over-hero',scrollY<heroEnd-height*.2);
  document.body.classList.toggle('over-closing',document.querySelector('.closing').getBoundingClientRect().top<height*.25);
  if(visibleHero){
    const p=reading||reduced.matches?0:clamp(scrollY/Math.max(1,heroEnd-height));
    sticky.style.setProperty('--travel',p);
    const lens=heroField.hero({progress:p,pointer:reading||reduced.matches?{x:.62,y:.5,active:false}:pointer,reduced:reduced.matches||reading});
    if(lens){
      sticky.style.setProperty('--focus-x',`${lens.x}px`);
      sticky.style.setProperty('--focus-y',`${lens.y}px`);
      sticky.style.setProperty('--focus-radius',`${lens.radius}px`);
    }
  }
  if(reading || !bounds.length)return;
  const pos=scrollY+height*.26;
  let index=0;
  bounds.forEach((b,i)=>{if(pos>=b.top) index=i;});
  setScene(index);
  currentProgress=clamp((pos-bounds[index].top)/(bounds[index].height*.78));
  const scene = scenes[index].id;
  const windowSeconds=manualWindow ?? 2*Math.pow(90,clamp((currentProgress-.08)/.8));
  if(scene==='window') {
    document.querySelector('#time-window').setAttribute('aria-valuetext',`${windowSeconds.toFixed(1)} seconds`);
    document.querySelector('#window-output').value=`${windowSeconds<10?windowSeconds.toFixed(1):Math.round(windowSeconds)} s`;
    document.querySelector('#metric').textContent=windowSeconds<10?windowSeconds.toFixed(1):Math.round(windowSeconds);
    document.querySelector('#metric-unit').textContent='seconds / observation window';
    if(manualWindow===null) document.querySelector('#time-window').value=Math.log(windowSeconds/2)/Math.log(90)*1000;
    document.querySelector('#resume').hidden=manualWindow===null;
    document.querySelectorAll('[data-window]').forEach(b=>b.classList.toggle('selected',Math.abs(+b.dataset.window-windowSeconds)<.2));
  }
  field.draw({scene,progress:currentProgress,windowSeconds,theme:scenes[index].theme,reduced:reduced.matches,pointer});
}
function schedule(){if(!frame)frame=requestAnimationFrame(render);}
addEventListener('scroll',schedule,{passive:true});
addEventListener('resize',()=>{if(innerHeight<540&&!reading){const target=currentLocation();setReading(true);requestAnimationFrame(()=>document.getElementById(target)?.scrollIntoView({behavior:'instant'}));}else measure();});
new ResizeObserver(measure).observe(stage);
function moveHeroPointer(e){const r=sticky.getBoundingClientRect();pointer={x:clamp((e.clientX-r.left)/r.width),y:clamp((e.clientY-r.top)/r.height),active:true};schedule();}
sticky.addEventListener('pointermove',moveHeroPointer);
sticky.addEventListener('pointerleave',()=>{pointer.active=false;schedule();});
stage.addEventListener('pointermove',e=>{const r=stage.getBoundingClientRect();pointer={x:clamp((e.clientX-r.left)/r.width),y:clamp((e.clientY-r.top)/r.height),active:!e.target.closest('a,button,input')};schedule();});
stage.addEventListener('pointerleave',()=>{pointer.active=false;schedule();});
sticky.addEventListener('pointerdown',e=>{if(e.target.closest('a,button'))return;moveHeroPointer(e);});
document.querySelector('#time-window').addEventListener('input',e=>{manualWindow=2*Math.pow(90,+e.target.value/1000);schedule();});
document.querySelectorAll('[data-window]').forEach(button=>button.addEventListener('click',()=>{manualWindow=+button.dataset.window;document.querySelector('#time-window').value=Math.log(manualWindow/2)/Math.log(90)*1000;schedule();}));
document.querySelector('#resume').addEventListener('click',()=>{manualWindow=null;schedule();});
function setReading(value){reading=value||innerHeight<540;document.body.classList.toggle('reading',reading);const toggle=document.querySelector('#reading-toggle');toggle.setAttribute('aria-pressed',String(reading));toggle.disabled=innerHeight<540;toggle.textContent=innerHeight<540?'Reading view':reading?'Guided view':'Reading view';toggle.title=innerHeight<540?'Use a taller window for the guided view':'';measure();}
function currentLocation(){
  if(document.querySelector('.closing').getBoundingClientRect().top<innerHeight*.5)return 'sources';
  if(hero.getBoundingClientRect().bottom>innerHeight*.5)return 'top';
  if(!reading)return scenes[Math.max(0,current)].id;
  let target=scenes[0].id;
  steps.forEach(el=>{if(el.getBoundingClientRect().top<=innerHeight*.45)target=el.id;});
  return target;
}
document.querySelector('#reading-toggle').addEventListener('click',()=>{const target=currentLocation();setReading(!reading);history.replaceState(null,'',`#${target}`);document.getElementById(target).scrollIntoView({behavior:'instant',block:'start'});});
reduced.addEventListener('change',()=>setReading(reduced.matches));
document.addEventListener('click',e=>{
  const a=e.target.closest('a[href^="#"]');
  if(!a)return;
  const el=document.querySelector(a.getAttribute('href'));
  if(!el)return;
  e.preventDefault();history.pushState(null,'',a.getAttribute('href'));el.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});
});
setReading(reading);
const restoreLocation=()=>{measure();requestAnimationFrame(()=>{document.querySelector(location.hash||'#top')?.scrollIntoView({behavior:'instant'});schedule();});};
Promise.all([document.fonts.ready,new Promise(resolve=>document.readyState==='complete'?resolve():addEventListener('load',resolve,{once:true}))]).then(restoreLocation);
addEventListener('popstate',()=>{document.querySelector(location.hash||'#top')?.scrollIntoView({behavior:'instant'});});
