import {projectTrace,sampleAt,normalize,selection,cycle,traces} from './science/model.js';

const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=v=>{v=clamp(v);return v*v*(3-2*v);};
const lerp=(a,b,t)=>a+(b-a)*t;
const themes={mineral:{ink:'#17231f',line:'#62746a',accent:'#635677',faint:'#c3cbc3'},night:{ink:'#e2e7df',line:'#87958d',accent:'#c4b4d6',faint:'#38463f'},violet:{ink:'#20252d',line:'#626171',accent:'#534465',faint:'#aaa8b8'}};

export function createField(canvas){
  const ctx=canvas.getContext('2d');
  let w=0,h=0,dpr=1;
  function resize(){
    const r=canvas.getBoundingClientRect();w=r.width;h=r.height;dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  function text(str,x,y,{size=12,color='#17231f',align='left',alpha=1,font='monospace'}={}){
    ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle=color;ctx.font=`${size}px ${font}`;ctx.textAlign=align;ctx.fillText(str,x,y);ctx.restore();
  }
  function line(x1,y1,x2,y2,color,alpha=1,width=1){ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.restore();}
  function plot(key,start,duration,rect,{color,alpha=1,axis=true,label='',reveal=1,lineWidth=1.6,shade=null}={}){
    if(rect.width<=0||rect.height<=0)return;
    const c=color||'#17231f';
    if(shade){
      const a=clamp((shade[0]-start)/duration),b=clamp((shade[1]-start)/duration);
      ctx.fillStyle=c;ctx.globalAlpha=.07;ctx.fillRect(rect.x+a*rect.width,rect.y,(b-a)*rect.width,rect.height);ctx.globalAlpha=1;
      line(rect.x+a*rect.width,rect.y-9,rect.x+a*rect.width,rect.y+rect.height+2,c,.5);
      line(rect.x+b*rect.width,rect.y-9,rect.x+b*rect.width,rect.y+rect.height+2,c,.5);
    }
    const points=projectTrace(key,{start,duration,width:rect.width,height:rect.height}).points;
    ctx.save();ctx.beginPath();ctx.rect(rect.x-2,rect.y-3,rect.width*reveal+4,rect.height+6);ctx.clip();
    ctx.strokeStyle=c;ctx.lineWidth=lineWidth;ctx.globalAlpha=alpha;ctx.lineJoin='round';ctx.beginPath();
    points.forEach((p,i)=>i?ctx.lineTo(rect.x+p.x,rect.y+p.y):ctx.moveTo(rect.x+p.x,rect.y+p.y));ctx.stroke();ctx.restore();
    const zero=rect.y+4+(1-normalize(key,0))*Math.max(1,rect.height-8);
    line(rect.x,zero,rect.x+rect.width,zero,c,.13);
    if(label)text(label,rect.x,rect.y-15,{color:c,size:w<600?10:12});
    if(axis){
      const y=rect.y+rect.height+17;
      line(rect.x,y,rect.x+rect.width,y,c,.25);
      for(let i=0;i<=4;i++){
        const t=start+duration*i/4,x=rect.x+rect.width*i/4;
        line(x,y-3,x,y+3,c,.4);
        const dp=2;
        text(`${t.toFixed(dp)}${i===4?' s':''}`,x,y+20,{color:c,size:w<600?10:11,align:i===0?'left':i===4?'right':'center'});
      }
    }
  }
  function bracket(x1,x2,y,label,color){
    line(x1,y,x2,y,color,.9);line(x1,y-5,x1,y+5,color,.9);line(x2,y-5,x2,y+5,color,.9);
    text(label,(x1+x2)/2,y-10,{color,size:w<600?10:12,align:'center'});
  }
  function hero({progress=0,pointer={x:.62,y:.5,active:false},reduced=false}){
    ctx.clearRect(0,0,w,h);
    if(!w||!h)return;
    const unfold=smooth(progress),cx=w*.57,cy=h*.55;
    const scale=Math.min(w*.39,h*.4);
    // Repeated contours are an uncalibrated visual study of the same simulated
    // event. Axes only appear when the narrative enters the measurement scene.
    function contourPass(color,alpha,sharp=false){
      ctx.save();ctx.strokeStyle=color;ctx.lineWidth=sharp?1.2:.85;ctx.globalAlpha=alpha;ctx.filter=sharp?'none':'blur(1.6px)';ctx.beginPath();
      for(let row=0;row<42;row++){
        const offset=(row-20.5)/21;
        for(let j=0;j<=340;j++){
          const u=j/340,theta=u*Math.PI*2;
          const a=sampleAt('sigma',3.65+u*1.4);
          const r=scale*(.60+.10*offset+.12*a);
          const fold=Math.sin(theta*2+.32)*scale*.24;
          const rx=cx+Math.cos(theta)*r*1.65;
          const ry=cy+Math.sin(theta)*r*.59+fold+offset*scale*.28;
          const tx=u*w*1.06-w*.03;
          const ty=cy+a*scale*.55+offset*scale*.065;
          const x=lerp(rx,tx,unfold),y=lerp(ry,ty,unfold);
          if(j===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
        }
      }
      ctx.stroke();ctx.restore();
    }
    contourPass('#b5c9b9',.35+unfold*.25);
    // Match the title mask: a clear centre feathers into the blurred field.
    const lens={x:(pointer.active?pointer.x:.62)*w,y:(pointer.active?pointer.y:.5)*h,radius:Math.min(w*.21,h*.27,280)};
    const focus=ctx.createRadialGradient(lens.x,lens.y,0,lens.x,lens.y,lens.radius);
    for(const [stop,alpha] of [[0,1],[.55,1],[.72,.75],[.9,.25],[1,0]]){
      focus.addColorStop(stop,`rgba(236,238,227,${alpha})`);
    }
    contourPass(focus,.93,true);
    return lens;
  }
  function draw({scene='eeg',progress=0,windowSeconds=2,theme='mineral',reduced=false,mini=false,pointer=null}={}){
    ctx.clearRect(0,0,w,h);if(!w||!h)return;
    const c=themes[theme]||themes.mineral;
    const mobile=w<700;
    const left=mini?20:mobile?24:w*.055,right=mini?20:mobile?24:w*.055;
    const plotWidth=w-left-right;
    const top=mini?65:mobile?h*.335:h*.365;
    const areaH=mini?h-120:mobile?h*.245:h*.24;
    const rect={x:left,y:top,width:plotWidth,height:areaH};
    const p=reduced?.85:progress;
    if(scene==='eeg'){
      plot('raw',3.4,2,rect,{color:c.ink,label:'EEG-LIKE INPUT  /  a.u.',reveal:lerp(.38,1,smooth(p/.65))});
      if(!mini){const x=w-right-134,y=top-45;line(x,y,x+110,y,c.ink,.35);[x,x+110].forEach(px=>{ctx.beginPath();ctx.arc(px,y,4,0,Math.PI*2);ctx.fillStyle=c.ink;ctx.fill();});text('+',x,y-13,{color:c.ink});text('−',x+110,y-13,{color:c.ink});}
    }else if(scene==='alpha'){
      plot('alpha',0,1,rect,{color:c.ink,label:'ALPHA  /  EYES-CLOSED WAKEFULNESS  /  a.u.'});
      bracket(left+plotWidth*.4,left+plotWidth*.5,top-10,'≈100 ms',c.accent);
    }else if(scene==='sigma'){
      const ph=areaH*.36,gap=areaH*.26;
      plot('alpha',0,2,{...rect,height:ph},{color:c.ink,label:'ALPHA  /  WAKE  /  a.u.  /  starts 0 s',axis:false});
      plot('sigma',3.4,2,{...rect,y:top+ph+gap,height:ph},{color:c.accent,label:'SIGMA  /  NREM  /  a.u.  /  starts 3.4 s',axis:false,shade:[selection.start,selection.end]});
      line(left,top+areaH+6,left+plotWidth,top+areaH+6,c.ink,.25);
      [0,.5,1,1.5,2].forEach((t,i)=>text(`${t}${i===4?' s elapsed':''}`,left+plotWidth*i/4,top+areaH+24,{color:c.ink,size:11,align:i===4?'right':i===0?'left':'center'}));
    }else if(scene==='spindle'){
      const zoom=smooth((p-.12)/.58);
      const start=lerp(selection.overviewStart,selection.detailStart,zoom),duration=lerp(2,1.4,zoom);
      const overviewW=Math.min(220,plotWidth*.29),overviewH=30;
      if(!mini)plot('sigma',3.4,2,{x:left+plotWidth-overviewW,y:top-66,width:overviewW,height:overviewH},{color:c.line,axis:false,shade:[selection.start,selection.end],lineWidth:1});
      plot('sigma',start,duration,rect,{color:c.ink,label:'FILTERED SIGMA  /  SAME SELECTED EVENT  /  a.u.',shade:[selection.start,selection.end]});
      const bx=t=>left+(t-start)/duration*plotWidth;
      if(p<.58&&!mini)bracket(bx(4.24),bx(4.24+cycle.sigmaSeconds),top+14,'≈77 ms',c.accent);
      else bracket(bx(selection.start),bx(selection.end),mini?top-36:top+areaH+60,'1.0 s / whole event',c.accent);
    }else if(scene==='power'){
      const settle=mini?1:smooth(p/.4);
      const ph=lerp(areaH,areaH*.34,settle),gap=areaH*.25;
      plot('sigma',3.65,1.4,{...rect,height:ph},{color:c.ink,label:'SIGMA SIGNAL  /  a.u.',axis:false});
      plot('power',3.65,1.4,{...rect,y:top+areaH*.59,height:areaH*.34},{color:c.accent,label:settle>.5?'CALCULATED POWER  /  a.u.²':'',alpha:settle,reveal:mini?1:smooth((p-.1)/.6)});
      if(!mobile&&!mini&&settle>.6)text('SQUARE → LOCAL MEAN → SMOOTH',left+plotWidth,top+ph+gap-15,{color:c.line,size:11,align:'right'});
    }else if(scene==='window'||scene==='slow'){
      const dur=scene==='slow'?180:windowSeconds;
      const ph=areaH*.24,gap=areaH*.19;
      plot('sigma',selection.detailStart,dur,{...rect,height:ph},{color:c.line,label:'SIGMA SIGNAL  /  a.u.',axis:false,lineWidth:1});
      plot('power',selection.detailStart,dur,{...rect,y:top+ph+gap,height:areaH*.5},{color:c.ink,label:'SIGMA POWER  /  a.u.²',lineWidth:1.8});
      if(scene==='slow'&&!mobile&&!mini){text('SLOWER VARIATION IN A DERIVED QUANTITY',left+plotWidth,top-17,{color:c.accent,size:11,align:'right'});}
    }
    if(pointer?.active&&!mini&&pointer.y>.335&&pointer.y<.68){
      const px=clamp(pointer.x*w,left,left+plotWidth),ratio=(px-left)/plotWidth;
      let key='sigma',start=3.65,duration=1.4;
      if(scene==='eeg'){key='raw';start=3.4;duration=2;}
      if(scene==='alpha'){key='alpha';start=0;duration=1;}
      if(scene==='sigma'){key=pointer.y*h<top+areaH*.5?'alpha':'sigma';start=key==='alpha'?0:3.4;duration=2;}
      if(scene==='spindle'){const z=smooth((p-.12)/.58);start=lerp(3.4,3.65,z);duration=lerp(2,1.4,z);}
      if(scene==='power')key=pointer.y*h>top+areaH*.45?'power':'sigma';
      if(scene==='window'||scene==='slow'){start=selection.detailStart;duration=scene==='slow'?180:windowSeconds;key=pointer.y*h>top+areaH*.3?'power':'sigma';}
      const time=start+ratio*duration,value=sampleAt(key,time);
      ctx.save();ctx.fillStyle=c.accent;ctx.globalAlpha=.07;ctx.fillRect(px-24,top,48,areaH);ctx.restore();
      line(px,top-4,px,top+areaH+4,c.accent,.65);
      const label=`${time.toFixed(3)} s  /  ${key.toUpperCase()} ${value.toFixed(3)} ${traces[key].unit}`;
      text(label,left+plotWidth,top+areaH+57,{color:c.ink,size:mobile?8:10,align:'right'});
    }
  }
  resize();
  return {resize,draw,hero};
}

export function drawMiniatures(){
  document.querySelectorAll('[data-reading]').forEach(canvas=>{
    const field=createField(canvas);
    field.draw({scene:canvas.dataset.reading,progress:1,windowSeconds:180,mini:true,theme:'mineral'});
  });
}
