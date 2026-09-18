import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {buildRecord} from './signal.js';
import {drawTrace,drawSpectrum,svgMarkup} from './plot.js';
import {sources} from './content.js';
import {introEvidence,introCopy} from './intro-evidence.js';
import {headIllustration} from './head-illustration.js';
import {laterScenes} from './journey-scenes.js';
import {methodMarkup} from './teaching-methods.js';

gsap.registerPlugin(ScrollTrigger);
const data=buildRecord();
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const trace=(id,label)=>svgMarkup(id,label);
const plotLabel=(name,unit='a.u.')=>`<div class="plot-label"><span>${name}</span><span>${unit}</span></div>`;
const anatomyInline=(state)=>`<div class="inline-head" data-head-state="${state}">${headIllustration(`inline-${state}`)}</div>`;
const bracket=(label,left,width,kind='blue')=>`<div class="measurement-overlay"><div class="measure-bracket ${kind}" style="--measure-left:${left}%;--measure-width:${width}%"><span>${label}</span></div></div>`;

export const scenes=[
  {id:'person',chapter:'Start with a person',title:'What is happening when you seem still?',copy:'There is more to stillness than meets the eye. Scroll to look inside the head, see how an electrical recording is made, and follow the patterns it can reveal.',note:'Simplified illustration · no live measurements',source:'intro',visual:()=>`${anatomyInline(0)}<div class="entry-invitation"><span class="scroll-arrow" aria-hidden="true">↓</span><span>Scroll to look inside</span></div>`},
  {id:'brain',chapter:'Inside the head',title:'A setting for electrical activity',copy:introCopy.S1,note:'Schematic anatomy · not an activity map',source:'intro',visual:()=>`${anatomyInline(1)}<div class="anatomy-label"><span></span>The brain, shown schematically</div>`},
  {id:'recording',chapter:'Making a recording',title:'Observe from the scalp',copy:introCopy.S2,note:'Schematic electrode positions · simulated waking example',source:'intro',visual:()=>`${anatomyInline(2)}<div class="recording-chart">${plotLabel('EEG: voltage over time')}${trace('recording-trace','Simulated waking EEG example, record time 4 to 5 seconds')}<span class="recording-label">Simulated recording example</span></div>`},
  {id:'alpha',chapter:'A repeating cycle',title:'One cycle. Then another.',copy:'This simulated alpha example uses a 10 Hz carrier: about ten cycles each second. Posterior alpha is prominent during relaxed, eyes-closed wakefulness. Real EEG contains more than one pattern.',note:'Simulated waking example · alpha band convention: 8–13 Hz',source:'alpha',visual:()=>`<div class="main-chart alpha-chart">${plotLabel('Alpha · eyes-closed wake')}${bracket('≈100 ms / cycle',20,10)}${trace('alpha-main','Simulated alpha example, 4 to 5 seconds, with one approximate 100 millisecond cycle marked')}<div class="plot-context">1 second in view <span id="alpha-time">Record time 4.00 s</span></div></div>`,extra:'<button class="quiet-button" id="play-trace">Play trace · 0.1×</button><button class="quiet-button step-button" id="step-trace">Step 0.1 s</button>'}
];

scenes.push(...laterScenes({trace,plotLabel,bracket}));

export function mountJourney(app){
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  const needsLinearLayout=()=>media.matches||innerHeight<680||innerWidth<360||(innerWidth<760&&innerHeight<800);
  const state={active:0,position:0,reading:false,manualReading:false,reduced:media.matches,sourceOpen:false,alphaTime:4,playing:false};
  let trigger,stepSize=600,travel=0,raf=0,lastTime=0,resizeTimer,focusBefore;
  let stops=[],totalStops=0,headLayout={width:1280,height:580};
  const renderedWindows=new Map();
  let renderedFocus='';
  const markedEvent=data.events.find(e=>Math.abs(e.start-3.875)<.01);
  const evidence={...sources,intro:introEvidence,power:{...sources.spindle,title:'A separate power measurement',summary:'For this demonstration, the filtered signal is squared and averaged over 0.5 seconds. Subsequent low-pass filtering and resampling retain a power time course. This is a calculated measurement of the same simulated record.'}};
  app.innerHTML=`<a class="skip-link" href="#alpha">Skip to the EEG example</a>
    <header class="site-header"><a class="brand" href="#person"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M3 17h6l3-9 5 16 4-13 3 6h5"/></svg><h1>Invisible Rhythms</h1></a><nav aria-label="Reading controls"><button id="reading-mode" aria-pressed="false">Read step by step</button><button id="chapters-toggle" aria-expanded="false" aria-controls="chapters-menu">Chapters <span aria-hidden="true">⌄</span></button></nav><div id="chapters-menu" hidden>${scenes.map(s=>`<a href="#${s.id}">${s.chapter}</a>`).join('')}</div></header>
    <main><div class="story-run" id="journey"><div class="story-stage" data-scene="person"><div class="anatomy-holder" aria-hidden="true">${headIllustration('shared')}</div>${scenes.map((s,i)=>`<article class="lesson ${i===0?'is-active':''}" data-index="${i}" data-lesson="${s.id}" aria-labelledby="title-${s.id}" ${i?'aria-hidden="true" inert':''}><figure class="scene-visual">${s.visual()}</figure><div class="scene-caption"><h2 id="title-${s.id}" tabindex="-1">${s.title}</h2><p>${s.copy}</p><div class="caption-foot"><span class="scene-note">${s.note}</span><div class="caption-actions">${s.extra||''}<button class="evidence-button" data-source="${s.source}">Why this view? <span aria-hidden="true">↗</span></button></div></div></div></article>`).join('')}<div class="stage-navigation"><button id="previous-scene" aria-label="Previous explanation">←</button><span class="current-chapter">${scenes[0].chapter}</span><span class="scroll-guidance">Scroll to continue ↓</span><button id="next-scene" aria-label="Next explanation">→</button><div class="journey-progress"><span></span></div></div></div>${scenes.map((s,i)=>`<div class="scene-anchor" id="${s.id}" data-anchor="${i}" aria-hidden="true"></div>`).join('')}</div><section class="journey-end"><h2>One record. Different questions.</h2><p>You followed a recording from electrical cycles to a brief event, then to a derived power measurement over a longer interval. The measurement and its observation window shape what you can see.</p><div class="end-actions"><a class="primary-button" href="#person">Revisit the explanation ↑</a><button class="secondary-button" data-source="atlas">Explore the time reference ↗</button></div><p class="future-context">The wider project also considers heart, breathing, sleep and daily timing. Those experiences remain outside this guided explanation.</p></section></main>
    <dialog id="evidence-dialog" aria-labelledby="evidence-title"><div class="dialog-toolbar"><span>Evidence & methods</span><button class="dialog-close" aria-label="Close evidence">Close ×</button></div><div id="evidence-content"></div></dialog>`;
  const stage=app.querySelector('.story-stage'),run=app.querySelector('.story-run'),lessons=[...app.querySelectorAll('.lesson')];
  const holder=app.querySelector('.anatomy-holder'),head=holder.querySelector('svg');
  head.setAttribute('viewBox','110 45 455 610');
  app.querySelectorAll('.inline-head:not([data-head-state="2"]) svg').forEach(svg=>svg.setAttribute('viewBox','110 45 455 610'));
  const parts=Object.fromEntries(['surface','brain','scalp','electrodes','leads'].map(k=>[k,head.querySelector(`[data-anatomy="${k}"]`)]));
  const capHeight=()=>parseFloat(getComputedStyle(stage).getPropertyValue('--caption-height'))||208;
  function setActive(index){
    index=clamp(index,0,scenes.length-1);state.active=index;stage.dataset.scene=scenes[index].id;
    lessons.forEach((el,i)=>{const active=state.reading||i===index;el.classList.toggle('is-active',active);el.setAttribute('aria-hidden',String(!active));el.inert=!active;});
    app.querySelector('.current-chapter').textContent=scenes[index].chapter;
    app.querySelector('#previous-scene').disabled=index===0;app.querySelector('#next-scene').disabled=index===scenes.length-1;
    app.querySelector('.scroll-guidance').textContent=index===scenes.length-1?'Scroll for the summary ↓':index===0?'Scroll to look inside ↓':'Scroll to continue ↓';
    app.querySelector('.journey-progress span').style.width=`${(index+1)/scenes.length*100}%`;
    if(index!==3)stopPlayback();
    if(index>=4){redrawScene(index);gsap.set(holder,{autoAlpha:0});}
  }
  function renderHead(position){
    const reveal=smooth(position),measurement=smooth(position-1),toWave=smooth(position-2);
    const compact=innerWidth<760, w=headLayout.width;
    const visualHeight=headLayout.height;
    const headHeight=Math.min(visualHeight-30,600);
    const targetX=compact?-w*.13:-w*.28,targetY=compact?-visualHeight*.28:0;
    holder.style.width=`${headHeight*455/610}px`;holder.style.height=`${headHeight}px`;
    holder.style.top=`${visualHeight/2}px`;
    gsap.set(holder,{xPercent:-50,yPercent:-50,x:targetX*measurement-w*.10*toWave,y:targetY*measurement-visualHeight*.2*toWave,scale:1-(compact?.53:.37)*measurement-.4*toWave,autoAlpha:1-smooth((position-2.04)/.44),transformOrigin:'50% 50%'});
    gsap.set(parts.surface,{opacity:1-.86*reveal+.86*measurement});
    gsap.set(parts.brain,{opacity:reveal*(1-measurement)});
    gsap.set(parts.electrodes,{opacity:measurement});gsap.set(parts.leads,{opacity:measurement*(1-toWave)});
  }
  function render(position){
    if(state.sourceOpen)return;
    state.position=clamp(position,0,scenes.length-1);
    const index=clamp(Math.floor(position+.48),0,scenes.length-1);
    if(index!==state.active)setActive(index);
    if(!state.reading){if(position<3)renderHead(state.position);else gsap.set(holder,{autoAlpha:0});const path=app.querySelector('#recording-trace .signal-path');if(path)path.style.clipPath=`inset(0 ${100*(1-smooth((position-1.5)*2.1))}% 0 0)`;renderTeaching(position);}
  }
  function plot(id,series,start,duration,opts={}){
    const svg=app.querySelector(`#${id}`);if(!svg)return;
    drawTrace(svg,series,{start,duration,range:series.displayRange,ticks:4,...opts});
    const axes=[...svg.querySelectorAll('.axis-label')];axes.forEach((axis,i)=>{const t=start+duration*i/(axes.length-1);axis.textContent=`${duration<2?t.toFixed(2):t.toFixed(1)}${i===axes.length-1?' s':''}`;});
  }
  function drawPower(id,duration,force=false){
    duration=Math.round(duration*100)/100;
    if(!force&&renderedWindows.get(id)===duration)return;
    renderedWindows.set(id,duration);
    plot(`${id}-signal`,data.sigma,3.4,duration,{color:'var(--sigma)'});
    plot(`${id}-power`,data.power,3.4,duration,{color:'var(--power)',fill:true});
    const output=app.querySelector(`[data-window-for="${id}"]`);if(output)output.textContent=`${Number(duration.toFixed(1))} seconds in view`;
  }
  function drawSpindleFocus(start,duration,force=false){
    const key=`${start.toFixed(4)}:${duration.toFixed(4)}`;
    if(force||key!==renderedFocus){plot('spindle-focus',data.sigma,start,duration,{color:'var(--sigma)',ticks:2});renderedFocus=key;}
    const lesson=app.querySelector('[data-lesson="spindle"]'),marker=lesson.querySelector('.measure-bracket');
    marker.style.setProperty('--measure-left',`${(4.24-start)/duration*100}%`);marker.style.setProperty('--measure-width',`${1/13/duration*100}%`);
    lesson.querySelector('.zoom-connector').style.clipPath=`polygon(${(start-3.4)/2*100}% 0,${(start+duration-3.4)/2*100}% 0,100% 100%,0 100%)`;
    lesson.querySelector('.plot-context span').textContent=`${start.toFixed(2)}–${(start+duration).toFixed(2)} s`;
  }
  function redrawScene(index){
    if(index===4){plot('comparison-alpha',data.alpha,3.4,2,{color:'var(--recording)',ticks:2});plot('comparison-sigma',data.sigma,3.4,2,{color:'var(--sigma)',ticks:2,events:[markedEvent]});}
    if(index===5||index===6){const id=index===5?'spindle':'event';plot(`${id}-overview`,data.sigma,3.4,2,{color:'var(--sigma)',events:[markedEvent],ticks:2});if(index===5)drawSpindleFocus(3.65,1.4,true);else plot(`${id}-focus`,data.sigma,3.65,1.4,{color:'var(--sigma)',events:[markedEvent],ticks:2});}
    if(index>=7&&index<=10)drawPower(scenes[index].id,[2,8,30,120][index-7],true);
    if(index===11){plot('scale-cycle',data.sigma,4.24,1/13,{color:'var(--sigma)',showAxes:false});plot('scale-event',data.sigma,3.875,1,{color:'var(--sigma)',showAxes:false});plot('scale-modulation',data.power,3.4,120,{color:'var(--power)',showAxes:false,fill:true});}
  }
  function renderTeaching(position){
    const index=state.active;
    if(index===4){const t=smooth((position-3.6)*2.5);app.querySelector('.comparison-visual .teal').style.clipPath=`inset(0 ${100*(1-t)}% 0 0)`;}
    if(index===5){
      const t=smooth((position-4.48)/.52),start=3.4+.25*t,duration=2-.6*t;
      drawSpindleFocus(start,duration);
    }
    if(index>=8&&index<=10){const windows=[2,8,30,120],t=smooth((position-(index-.48))/.48);drawPower(scenes[index].id,Math.exp(Math.log(windows[index-8])+(Math.log(windows[index-7])-Math.log(windows[index-8]))*t));}
    if(index===11)app.querySelectorAll('.scale-example').forEach((el,i)=>{const t=smooth((position-(10.3+i*.22))/.22);gsap.set(el,{autoAlpha:t,y:30*(1-t)});});
  }
  function redraw(){
    plot('recording-trace',data.alpha,4,1,{color:'var(--recording)',ticks:2});
    plot('alpha-main',data.alpha,4,1,{color:'var(--recording)',cursor:state.alphaTime});
    for(let i=4;i<scenes.length;i++)redrawScene(i);
  }
  function renderAlpha(){plot('alpha-main',data.alpha,4,1,{color:'var(--recording)',cursor:state.alphaTime});app.querySelector('#alpha-time').textContent=`Record time ${state.alphaTime.toFixed(2)} s`;} 
  function stopPlayback(){state.playing=false;cancelAnimationFrame(raf);lastTime=0;const b=app.querySelector('#play-trace');if(b){b.textContent=state.reduced?'Playback off · reduced motion':'Play trace · 0.1×';b.disabled=state.reduced;}}
  function tick(now){if(!state.playing||state.sourceOpen||document.hidden||state.reduced)return stopPlayback();if(lastTime)state.alphaTime+=Math.min(now-lastTime,100)*.0001;lastTime=now;if(state.alphaTime>=5){state.alphaTime=5;stopPlayback();}renderAlpha();if(state.playing)raf=requestAnimationFrame(tick);}
  app.querySelector('#play-trace').addEventListener('click',()=>{if(state.playing)return stopPlayback();if(state.alphaTime>=5)state.alphaTime=4;state.playing=true;app.querySelector('#play-trace').textContent='Pause playback Ⅱ';raf=requestAnimationFrame(tick);});
  app.querySelector('#step-trace').addEventListener('click',()=>{stopPlayback();state.alphaTime=state.alphaTime>=4.99?4:state.alphaTime+.1;renderAlpha();});
  function setReadingLayout(){
    state.reading=state.manualReading||needsLinearLayout();
    document.body.classList.toggle('reading-layout',state.reading);
    app.querySelector('#reading-mode').setAttribute('aria-pressed',String(state.reading));
    app.querySelector('#reading-mode').textContent=state.reading?'Step-by-step view':'Read step by step';
    app.querySelector('#reading-mode').disabled=needsLinearLayout();
    trigger?.kill();
    stepSize=Math.max(460,Math.min(700,innerHeight*.72));stops=[];let stop=0;scenes.forEach(s=>{stops.push(stop);stop+=s.hold||1;});totalStops=stops.at(-1)+1.0;travel=totalStops*stepSize;
    run.style.height=state.reading?'auto':`${travel+innerHeight-64}px`;
    app.querySelectorAll('.scene-anchor').forEach((el,i)=>{el.style.top=`${stops[i]*stepSize}px`;});
    lessons.forEach((el,i)=>{el.id=state.reading?`${scenes[i].id}-reading`:'';});
    setActive(state.active);
    if(!state.reading){trigger=ScrollTrigger.create({trigger:run,start:'top 64px',end:()=>`+=${travel}`,onUpdate:self=>{const unit=self.progress*totalStops;let index=stops.findLastIndex(value=>value<=unit);index=Math.max(0,index);const span=(stops[index+1]??totalStops)-stops[index];render(index+(unit-stops[index])/span);}});}
    headLayout={width:stage.clientWidth,height:stage.clientHeight-capHeight()-48};
    renderedWindows.clear();renderedFocus='';redraw();render(state.position);
    if(state.reading){app.querySelectorAll('.recording-chart,.comparison-visual .teal').forEach(el=>el.style.clipPath='none');gsap.set('.scale-example',{clearProps:'all'});}
    ScrollTrigger.refresh();
  }
  function goTo(id,{historyMode='push',focus=false}={}){
    const index=scenes.findIndex(s=>s.id===id);if(index<0)return;
    if(historyMode==='push')history.pushState(null,'',`#${id}`);
    const y=state.reading?lessons[index].getBoundingClientRect().top+scrollY-78:run.getBoundingClientRect().top+scrollY-64+stops[index]*stepSize;
    scrollTo({top:y,behavior:'instant'});setActive(index);render(index);if(focus)lessons[index].querySelector('h2').focus({preventScroll:true});
  }
  app.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();goTo(a.hash.slice(1),{focus:true});closeChapters();}));
  app.querySelector('#previous-scene').addEventListener('click',()=>goTo(scenes[Math.max(0,state.active-1)].id));
  app.querySelector('#next-scene').addEventListener('click',()=>goTo(scenes[Math.min(scenes.length-1,state.active+1)].id));
  const chapters=app.querySelector('#chapters-menu'),chapterButton=app.querySelector('#chapters-toggle');
  function closeChapters(){chapters.hidden=true;chapterButton.setAttribute('aria-expanded','false');}
  chapterButton.addEventListener('click',()=>{chapters.hidden=!chapters.hidden;chapterButton.setAttribute('aria-expanded',String(!chapters.hidden));});
  app.addEventListener('keydown',e=>{if(e.key==='Escape'&&!chapters.hidden){closeChapters();chapterButton.focus();}});
  app.querySelector('#reading-mode').addEventListener('click',()=>{const id=scenes[state.active].id;state.manualReading=!state.manualReading;setReadingLayout();goTo(id,{historyMode:'none'});});
  const dialog=app.querySelector('#evidence-dialog');
  function showEvidence(key){
    const info=evidence[key];focusBefore=document.activeElement;state.sourceOpen=true;stopPlayback();
    app.querySelector('#evidence-content').innerHTML=`<h2 id="evidence-title">${escape(info.title)}</h2><p class="evidence-summary">${escape(info.summary)}</p><p class="evidence-caveat">${escape(info.caveat)}</p>${methodMarkup(key,data)}${info.papers.map(p=>`<article class="paper"><h3>${escape(p.title)}</h3><p>${escape(p.citationLabel||p.year)} · ${escape(p.population)}<br>${escape(p.depth)}</p><a href="${escape(p.url)}" target="_blank" rel="noopener noreferrer">Read the published source ↗</a></article>`).join('')}<p class="source-context">Sources open deliberately in another tab. This explanation stays here when you return.</p>`;
    app.querySelectorAll('#evidence-content details').forEach(details=>details.addEventListener('toggle',()=>{if(details.open){const svg=details.querySelector('#method-spectrum');if(svg)drawSpectrum(svg,data.spectrum);}}));
    document.body.style.overflow='hidden';dialog.showModal();dialog.querySelector('.dialog-close').focus();
  }
  app.querySelectorAll('[data-source]').forEach(b=>b.addEventListener('click',()=>showEvidence(b.dataset.source)));
  dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const elements=[...dialog.querySelectorAll('button:not([disabled]),a[href],summary')].filter(el=>el.getClientRects().length);if((e.shiftKey&&document.activeElement===elements[0])||(!e.shiftKey&&document.activeElement===elements.at(-1))){e.preventDefault();(e.shiftKey?elements.at(-1):elements[0]).focus();}});
  dialog.addEventListener('close',()=>{state.sourceOpen=false;document.body.style.overflow='';focusBefore?.focus({preventScroll:true});});
  const onPop=()=>goTo(location.hash.slice(1)||'person',{historyMode:'none'});
  const onVisibility=()=>{if(document.hidden)stopPlayback();};
  const onResize=()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{const id=scenes[state.active].id;setReadingLayout();goTo(id,{historyMode:'none'});},160);};
  const onReduced=e=>{const id=scenes[state.active].id;state.reduced=e.matches;stopPlayback();setReadingLayout();goTo(id,{historyMode:'none'});};
  const alphaObserver=new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)stopPlayback();});alphaObserver.observe(app.querySelector('[data-lesson="alpha"]'));
  const readingObserver=new IntersectionObserver(()=>{
    if(!state.reading||state.sourceOpen)return;
    let index=state.active,visible=0;
    lessons.forEach((lesson,i)=>{const r=lesson.getBoundingClientRect(),amount=Math.max(0,Math.min(r.bottom,innerHeight)-Math.max(r.top,64));if(amount>visible){visible=amount;index=i;}});
    if(visible&&index!==state.active){state.position=index;setActive(index);}
  },{threshold:[0,.1,.25,.5,.75,1]});lessons.forEach(lesson=>readingObserver.observe(lesson));
  addEventListener('popstate',onPop);addEventListener('resize',onResize);document.addEventListener('visibilitychange',onVisibility);media.addEventListener('change',onReduced);
  setReadingLayout();stopPlayback();requestAnimationFrame(()=>{redraw();if(location.hash)onPop();});
  return()=>{alphaObserver.disconnect();readingObserver.disconnect();trigger?.kill();stopPlayback();clearTimeout(resizeTimer);removeEventListener('resize',onResize);removeEventListener('popstate',onPop);document.removeEventListener('visibilitychange',onVisibility);media.removeEventListener('change',onReduced);};
}
