import { project } from './signal.js';

export function drawTrace(svg, series, {start=4, duration=4, color='currentColor', range, events=[], cursor=null, ticks=4, showAxes=true, fill=false}={}) {
  const width = Math.max(60, svg.clientWidth || 900), height = Math.max(68, svg.clientHeight || Number(svg.dataset.height || 180));
  const left=4, right=4, top=12, bottom=showAxes?30:8;
  const w=width-left-right,h=height-top-bottom;
  ticks=Math.min(ticks,w<180?1:w<280?2:ticks);
  const result=project(series,start,duration,Math.floor(w),h);
  let lo=range?.[0]??result.min, hi=range?.[1]??result.max;
  if(hi-lo<1e-8){lo-=1;hi+=1;}
  const y=v=>top+(hi-v)/(hi-lo)*h;
  const points=result.points;
  let d='';
  if(points.length) {
    // Preserve within-column extrema; never stretch or decimate a bitmap.
    d=points.map((p,i)=>`${i?'L':'M'}${(left+p.x).toFixed(2)},${y(p.value).toFixed(2)}`).join('');
  }
  const lines=[];
  if(lo<0&&hi>0) lines.push(`<path class="plot-baseline" d="M${left},${y(0)}H${width-right}"/>`);
  for(const event of events) {
    const a=event.start??event.startTime,b=event.end??event.endTime;
    if(b<start||a>start+duration)continue;
    const x=left+Math.max(0,a-start)/duration*w, ww=(Math.min(start+duration,b)-Math.max(start,a))/duration*w;
    lines.push(`<rect class="event-shade" x="${x}" y="${top}" width="${ww}" height="${h}"/>`);
  }
  if(fill&&points.length)lines.push(`<path d="${d}L${left+points.at(-1).x},${y(lo)}L${left},${y(lo)}Z" fill="${color}" opacity=".08"/>`);
  lines.push(`<path class="signal-path" d="${d}" stroke="${color}"/>`);
  if(cursor!==null&&cursor>=start&&cursor<=start+duration)lines.push(`<path class="plot-cursor" d="M${left+(cursor-start)/duration*w},${top}V${top+h}"/>`);
  if(showAxes)for(let i=0;i<=ticks;i++){
    const x=left+w*i/ticks,t=start+duration*i/ticks;
    const label=duration<2?t.toFixed(2):duration<10?t.toFixed(1):t.toFixed(0);
    lines.push(`<text class="axis-label" x="${x}" y="${height-5}" text-anchor="${i===0?'start':i===ticks?'end':'middle'}">${label}${i===ticks?' s':''}</text>`);
  }
  svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
  svg.innerHTML=lines.join('');
  svg.dataset.start=start;svg.dataset.duration=duration;svg.dataset.samples=series.values.length;
  return result;
}

export function drawSpectrum(svg, spectrum) {
  const bins=spectrum.bins??spectrum;
  const values=Array.isArray(bins)?bins:[];
  const w=svg.clientWidth||800,h=Math.max(90,svg.clientHeight||170),pad=12,bottom=30;
  const visible=values.filter(b=>(b.frequency??b.hz)>0&&(b.frequency??b.hz)<=.06);
  const max=Math.max(1e-12,...visible.map(b=>b.power??b.psd??b.value));
  svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
  let d=visible.map((b,i)=>`${i?'L':'M'}${pad+(b.frequency??b.hz)/.06*(w-2*pad)},${h-bottom-(b.power??b.psd??b.value)/max*(h-bottom-12)}`).join('');
  const frequencyTicks=w<500?[0,.02,.04,.06]:[0,.01,.02,.03,.04,.05,.06];
  svg.innerHTML=`<rect x="${pad+.01/.06*(w-2*pad)}" y="8" width="${.03/.06*(w-2*pad)}" height="${h-bottom-8}" fill="currentColor" opacity=".05"/><path class="signal-path" d="${d}" stroke="currentColor"/>`+frequencyTicks.map((v,i)=>`<text class="axis-label" x="${pad+v/.06*(w-2*pad)}" y="${h-6}" text-anchor="${i===0?'start':i===frequencyTicks.length-1?'end':'middle'}">${v.toFixed(2)}${i===frequencyTicks.length-1?' Hz':''}</text>`).join('');
}

export function svgMarkup(id,label,height=180){return `<svg id="${id}" class="trace" role="img" aria-label="${label}" data-height="${height}" preserveAspectRatio="none"></svg>`;}
