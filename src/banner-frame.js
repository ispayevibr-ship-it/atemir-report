/* Non-destructive banner framing. Coordinates are relative to image overflow. */
(function(root){
 'use strict';
 const clamp=(v,min,max,fallback)=>Number.isFinite(Number(v))?Math.max(min,Math.min(max,Number(v))):fallback;
 function normalize(value){const v=value||{};return {x:clamp(v.x,0,100,50),y:clamp(v.y,0,100,50),zoom:clamp(v.zoom,1,3,1),ratio:clamp(v.ratio,0.001,1000,1)}}
 function geometry(value,aspect){const v=normalize(value);return {width:Math.max(1,v.ratio/aspect)*v.zoom,height:Math.max(1,aspect/v.ratio)*v.zoom,x:v.x,y:v.y}}
 function style(value,aspect){if(!value)return 'background-size:cover;background-position:50% 50%;background-repeat:no-repeat;';const g=geometry(value,aspect);return 'background-size:'+g.width*100+'% '+g.height*100+'%;background-position:'+g.x+'% '+g.y+'%;background-repeat:no-repeat;'}
 function mount(frame,input,source,value,aspect,onChange,onBusy){
  let crop=normalize(value),src=source,sequence=0,drag=null;
  frame.style.cssText+=';position:relative;touch-action:none;cursor:grab;user-select:none;';
  frame.tabIndex=0;frame.setAttribute('role','img');frame.setAttribute('aria-label','Кадр фотографии. Перемещайте мышкой или стрелками клавиатуры.');
  const controls=document.createElement('div');controls.style.cssText='display:flex;gap:12px;align-items:center;margin:8px 0 16px;font-size:12px;color:#536777';
  const label=document.createElement('label');label.textContent='Масштаб';label.style.margin='0';
  const slider=document.createElement('input');slider.type='range';slider.min='1';slider.max='3';slider.step='.01';slider.value=crop.zoom;slider.style.cssText='width:140px;margin:0';slider.setAttribute('aria-label','Масштаб фотографии');
  const hint=document.createElement('span');hint.textContent='Перетащите фото внутри рамки';controls.append(label,slider,hint);frame.after(controls);
  function paint(){frame.innerHTML='';frame.style.backgroundImage=src?'url('+JSON.stringify(src)+')':'none';frame.style.backgroundSize='';frame.style.cssText+=';'+style(crop,aspect);slider.disabled=!src;slider.value=crop.zoom;if(!src)frame.textContent='Выберите фотографию';}
  function changed(){paint();onChange(src,{...crop})}
  function inspect(data){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im.naturalWidth/im.naturalHeight);im.onerror=()=>reject(new Error('Файл не является поддерживаемым изображением'));im.src=data})}
  paint();
  if(src&&!value)inspect(src).then(ratio=>{if(!sequence&&frame.isConnected){crop.ratio=ratio;changed()}}).catch(()=>{});
  input.onchange=async()=>{const file=input.files?.[0];if(!file)return;const token=++sequence;onBusy(true);try{const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(file)});const ratio=await inspect(data);if(token!==sequence||!frame.isConnected)return;src=data;crop=normalize({ratio});changed()}catch(error){if(token===sequence){console.error('Banner upload',error);alert('Не удалось открыть изображение. Выберите другой файл.')}}finally{if(token===sequence)onBusy(false);input.value=''}};
  slider.oninput=()=>{crop.zoom=Number(slider.value);changed()};
  frame.onpointerdown=e=>{if(!src||e.button!==0)return;e.preventDefault();const rect=frame.getBoundingClientRect(),g=geometry(crop,aspect);drag={id:e.pointerId,x:e.clientX,y:e.clientY,crop:{...crop},dx:rect.width*(g.width-1),dy:rect.height*(g.height-1)};frame.setPointerCapture(e.pointerId);frame.style.cursor='grabbing'};
  frame.onpointermove=e=>{if(!drag||drag.id!==e.pointerId)return;crop.x=drag.dx>0?clamp(drag.crop.x-(e.clientX-drag.x)/drag.dx*100,0,100,50):50;crop.y=drag.dy>0?clamp(drag.crop.y-(e.clientY-drag.y)/drag.dy*100,0,100,50):50;changed()};
  frame.onpointerup=frame.onpointercancel=frame.onlostpointercapture=()=>{drag=null;frame.style.cursor='grab'};
  frame.onkeydown=e=>{const offsets={ArrowLeft:[-2,0],ArrowRight:[2,0],ArrowUp:[0,-2],ArrowDown:[0,2]};if(!src||!offsets[e.key])return;e.preventDefault();crop.x=clamp(crop.x+offsets[e.key][0],0,100,50);crop.y=clamp(crop.y+offsets[e.key][1],0,100,50);changed()};
 }
 root.BannerFrame={normalize,geometry,style,mount};
 if(typeof module!=='undefined')module.exports=root.BannerFrame;
})(typeof window==='undefined'?globalThis:window);
