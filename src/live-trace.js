import {project} from './signal.js';
const NS='http://www.w3.org/2000/svg';
/** Presentation-only renderer. Geometry is supplied by the layout pass, never read during scrolling. */
export function createTracePainter(svg){
 const node=(tag,cls)=>{const el=document.createElementNS(NS,tag);el.setAttribute('class',cls);svg.append(el);return el;};
 const baseline=node('path','plot-baseline'),shade=node('rect','event-shade'),fill=node('path','power-fill'),line=node('path','signal-path'),axes=Array.from({length:5},()=>node('text','axis-label'));
 let previous='',previousSeries;
 return function paint(series,{width,height,start=3.4,duration=2,color='var(--sigma)',event=null,area=false,eventOpacity=.18}={}){
  width=Math.max(60,width);height=Math.max(68,height);const key=[width.toFixed(1),height.toFixed(1),start.toFixed(4),duration.toFixed(3),series.id||series.name,area,!!event].join(':');
  line.setAttribute('stroke',color);fill.setAttribute('fill',color);shade.style.opacity=event?eventOpacity:0;
  if(previous===key&&previousSeries===series)return;previous=key;previousSeries=series;
  const left=4,w=width-8,top=12,h=height-42,[lo,hi]=series.displayRange,y=v=>top+(hi-v)/(hi-lo)*h;
  const result=project(series,start,duration,Math.floor(w),h);
  const d=result.points.map((p,i)=>`${i?'L':'M'}${(left+p.x).toFixed(2)},${y(p.value).toFixed(2)}`).join('');
  svg.setAttribute('viewBox',`0 0 ${width} ${height}`);line.setAttribute('d',d);baseline.setAttribute('d',`M4,${y(0)}H${width-4}`);
  fill.setAttribute('d',area&&result.points.length?`${d}L${left+result.points.at(-1).x},${y(0)}L4,${y(0)}Z`:'');fill.style.opacity='.10';
  if(event){shade.setAttribute('x',4+Math.max(0,event.start-start)/duration*w);shade.setAttribute('width',Math.max(0,Math.min(start+duration,event.end)-Math.max(start,event.start))/duration*w);shade.setAttribute('y',top);shade.setAttribute('height',h);}
  const count=width<300?2:4;axes.forEach((el,i)=>{el.style.display=i<=count?'':'none';el.setAttribute('x',4+w*i/count);el.setAttribute('y',height-5);el.setAttribute('text-anchor',i===0?'start':i===count?'end':'middle');el.textContent=`${(start+duration*i/count).toFixed(duration<2?2:1)}${i===count?' s':''}`;});
  svg.dataset.start=start;svg.dataset.duration=duration;svg.dataset.samples=series.values.length;
 };
}
