import {createTracePainter} from './live-trace.js';
import {clamp,smooth} from './pulse-hero.js';
export const motion={handoffStart:.76,handoffSpan:.24,captionIn:.14,captionOut:.60};
const mix=(a,b,t)=>a+(b-a)*t;
const rect=(el,origin)=>{const r=el.getBoundingClientRect();return {x:r.left-origin.left,y:r.top-origin.top,width:r.width,height:r.height};};
const blend=(a,b,t)=>Object.fromEntries(Object.keys(a).map(k=>[k,mix(a[k],b[k],t)]));
const box=(el,r)=>{el.style.transform=`translate(${r.x}px,${r.y}px)`;el.style.width=`${r.width}px`;el.style.height=`${r.height}px`;};
export function mountContinuity(stage,lessons,data){
 const event=data.events.find(e=>Math.abs(e.start-3.875)<.01),backdrop=document.createElement('div');backdrop.className='discovery-field';backdrop.setAttribute('aria-hidden','true');stage.prepend(backdrop);
 function clone(selector,cls,prefix){const el=stage.querySelector(selector).cloneNode(true);el.classList.add(cls);el.querySelectorAll('[id]').forEach(n=>{n.id=prefix+n.id;});el.querySelectorAll('svg').forEach(n=>n.innerHTML='');el.querySelectorAll('[data-window-for]').forEach(n=>n.removeAttribute('data-window-for'));stage.append(el);el.setAttribute('aria-hidden','true');return el;}
 const power=clone('[data-lesson=power] .power-visual','persistent-measurement','shared-'),packet=clone('[data-lesson=spindle] .packet-visual','persistent-packet','shared-');
 power.querySelector('.input-step')?.remove();
 const signalSvg=power.querySelector('.context-track svg'),powerSvg=power.querySelector('.derived-track svg'),overviewSvg=packet.querySelector('.event-overview svg'),focusSvg=packet.querySelector('.packet-focus svg');
 const rawSvg=signalSvg.cloneNode(false);rawSvg.id='shared-power-input';rawSvg.classList.add('raw-context');rawSvg.setAttribute('aria-label','Unfiltered simulated EEG-like input before band selection');signalSvg.parentElement.append(rawSvg);const paintRaw=createTracePainter(rawSvg);
 const paintSignal=createTracePainter(signalSvg),paintPower=createTracePainter(powerSvg),paintOverview=createTracePainter(overviewSvg),paintFocus=createTracePainter(focusSvg);
 let geometry=[],lastPosition=0,lastWindow=2,linear=true;
 function measure(isLinear){linear=isLinear;geometry=[];if(linear){power.hidden=true;packet.hidden=true;backdrop.style.opacity=0;return;}const origin=stage.getBoundingClientRect();for(let i=3;i<=7;i++){const el=lessons[i],group=el.querySelector(i<5?'.packet-visual':'.power-visual'),r=rect(group,origin);geometry[i]={box:r,contextHeight:i>=5?group.querySelector('.context-track').getBoundingClientRect().height:0,svgs:[...group.querySelectorAll(i<5?'svg':'.context-track svg,.derived-track svg')].map(s=>{const sr=s.getBoundingClientRect();return {width:sr.width,height:sr.height};})};}render(lastPosition,lastWindow);}
 function render(position,windowSeconds){lastPosition=position;lastWindow=windowSeconds;if(linear)return;
  const index=Math.floor(position),fraction=position-index,t=smooth((fraction-motion.handoffStart)/motion.handoffSpan);
  backdrop.style.opacity=position<7?smooth((position-6.76)/.24):1-smooth((position-7.76)/.24);
  const showPacket=position>=2.76&&position<5,showPower=position>=4.76&&position<8;
  power.hidden=!showPower;packet.hidden=!showPacket;
  for(const [el,shown] of [[power,showPower],[packet,showPacket]])el.setAttribute('aria-hidden',String(!shown));
  if(showPacket&&geometry[3]){
   const k=position<4?3:4,r=geometry[k];box(packet,r.box);packet.style.opacity=position<3?smooth((position-2.76)/.24):position>4.76?1-smooth((position-4.76)/.24):1;
   const z=position<3?0:smooth((position-3)/.55),start=3.4+.25*z,duration=2-.6*z,whole=smooth((position-3.76)/.24);
   paintOverview(data.sigma,{...r.svgs[0],event,color:'var(--sigma)'});paintFocus(data.sigma,{...r.svgs[1],start,duration,event:whole>0?event:null,eventOpacity:.18*whole,color:'var(--sigma)'});
   const mark=packet.querySelector('.measure-bracket'),a=mix(4.24,3.875,whole),len=mix(1/13,1,whole);mark.style.setProperty('--measure-left',`${(a-start)/duration*100}%`);mark.style.setProperty('--measure-width',`${len/duration*100}%`);mark.querySelector('span').style.opacity=whole>0&&whole<1?'0':'1';mark.querySelector('span').textContent=whole<.5?'≈77 ms / cycle':'1.0 s / this event';packet.querySelector('.plot-context').firstChild.textContent=whole<.5?'13 Hz simulated carrier':'Illustrative event detection';packet.querySelector('.plot-context span').textContent=`${start.toFixed(2)}–${(start+duration).toFixed(2)} s`;
  }
  if(showPower&&geometry[5]){
   const a=clamp(index,5,7),b=clamp(a+1,5,7),u=index<5?0:t,ga=geometry[a],gb=geometry[b],r=blend(ga.box,gb.box,u);box(power,r);
   power.style.opacity=position<5?smooth((position-4.76)/.24):position>7.76?1-smooth((position-7.76)/.24):1;
   const duration=position<6?2:position<7?windowSeconds:180,bandReveal=smooth((position-5.12)/.18),powerReveal=smooth((position-5.3)/.2),extra=(1-powerReveal)*Math.max(0,ga.svgs[1].height-100);power.querySelector('.context-track').style.height=`${mix(ga.contextHeight,gb.contextHeight,u)+extra}px`;
   rawSvg.style.opacity=1-bandReveal;signalSvg.style.opacity=bandReveal;power.querySelector('.derived-track').style.opacity=powerReveal;power.querySelector('.analysis-operation').style.opacity=powerReveal;power.querySelector('.context-track .plot-label span').textContent=bandReveal<.5?'Simulated EEG-like input · unfiltered':'Filtered sigma signal · 10–16 Hz';rawSvg.style.height=`${ga.svgs[0].height+extra}px`;if(bandReveal<1)paintRaw(data.raw,{...ga.svgs[0],height:ga.svgs[0].height+extra,duration:2,color:'var(--ir-paper)'});
   paintSignal(data.sigma,{...blend(ga.svgs[0],gb.svgs[0],u),height:mix(ga.svgs[0].height,gb.svgs[0].height,u)+extra,duration,color:'var(--sigma)'});paintPower(data.power,{...blend(ga.svgs[1],gb.svgs[1],u),height:mix(ga.svgs[1].height,gb.svgs[1].height,u)-extra,duration,color:'var(--power)',area:true});
   power.querySelector('.window-line').style.opacity=position>=6&&position<7?'0':'1';power.querySelector('output').textContent=`${Number(duration.toFixed(1))} seconds in view`;
  }
 }
 return {measure,render,signalSvg,powerSvg,focusSvg,destroy(){power.remove();packet.remove();backdrop.remove();}};
}
