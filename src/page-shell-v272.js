(()=>{"use strict";
const q=new URLSearchParams(location.search),oid=q.get('object')||'default';
const OBJECTS_KEY='atemir-company-objects-v1';
function publicObjectId277(){
 if(oid==='default')return oid;
 try{
  let list=window.atemirDesktop?.dbGetSync?.(OBJECTS_KEY);if(!Array.isArray(list))list=[];
  let changed=false,max=0;
  for(const o of list){let n=Number(o?.routeId);if(Number.isInteger(n)&&n>max)max=n}
  for(const o of list){if(!Number.isInteger(Number(o?.routeId))||Number(o.routeId)<1){o.routeId=++max;changed=true}}
  if(changed)window.atemirDesktop?.dbSet?.(OBJECTS_KEY,list).catch?.(e=>console.error('Object route ID save',e));
  const current=list.find(o=>String(o?.id)===String(oid)||String(o?.routeId)===String(oid));
  return current?.routeId||oid
 }catch(e){console.error('Object route ID',e);return oid}
}
const routeOid=publicObjectId277();
const pages=[['object.html','Обзор','⌂'],['reports.html','Ежедневные отчёты','▣'],['bom.html','Ведомость / марки','▤'],['invoices.html','Накладные','⇩'],['tasks.html','Виды работ / проекты','◇'],['progress.html','Готовность','◔'],['dynamics.html','Динамика','⌁'],['deadlines.html','Контроль сроков','◷'],['scheme.html','Схема','◇']];
const current=(location.pathname.split('/').pop()||'object.html').toLowerCase();
function nav(){const n=document.getElementById('nav');if(!n)return;let legacy=document.getElementById('legacyNav272');if(!legacy){legacy=document.createElement('div');legacy.id='legacyNav272';legacy.hidden=true;while(n.firstChild)legacy.appendChild(n.firstChild);n.parentNode.insertBefore(legacy,n.nextSibling)}n.innerHTML=pages.map(([file,title,icon])=>`<button type="button" class="${current===file?'on':''}" data-page="${file}"><span class="navIcon552">${icon}</span>${title}</button>`).join('');n.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>{const file=b.dataset.page;if(file===current)return;location.href=file+'?object='+encodeURIComponent(oid)})}
function brand(){let cp={};try{cp=window.atemirDesktop?.dbGetSync?.('atemir-company-profile-v1')||{}}catch{}const b=document.getElementById('companyBrand641');if(!b)return;b.textContent='';if(cp.logo){const i=document.createElement('img');i.src=cp.logo;i.alt='Логотип компании';b.appendChild(i);b.classList.add('hasLogo716')}else b.textContent=cp.name||'ТОО «А-Темир Строй»'}
function route(){let base='/objects/'+encodeURIComponent(routeOid),r=base;const sec=document.body.dataset.section||'';if(current==='reports.html'||sec==='reports')r=base+'/reports';else if(current==='bom.html'||sec==='bom')r=base+'/marks';else if(current==='invoices.html'||sec==='invoices')r=base+'/deliveries';else if(current==='tasks.html'||sec==='tasks')r=base+'/work-types';else if(current==='progress.html'||sec==='progress')r=base+'/progress';else if(current==='dynamics.html'||sec==='dynamics')r=base+'/dynamics';else if(current==='deadlines.html'||sec==='deadlines')r=base+'/schedule';else if(current==='scheme.html'||sec==='scheme')r=base+'/scheme';
 const mode=window.__atemirRouteState||{};if(sec==='reports'&&mode.mode==='new')r=base+'/reports/new';else if(sec==='reports'&&mode.reportId)r=base+'/reports/'+encodeURIComponent(mode.reportId)+(mode.mode==='edit'?'/edit':'');else if(sec==='invoices'&&mode.invoiceId)r=base+'/deliveries/'+encodeURIComponent(mode.invoiceId)+(mode.mode==='edit'?'/edit':'');
 let el=document.getElementById('appRoute274');if(!el){el=document.createElement('div');el.id='appRoute274';el.style.cssText='position:fixed;left:0;right:0;bottom:0;z-index:9998;height:25px;display:flex;align-items:center;padding:0 14px 0 274px;box-sizing:border-box;background:rgba(15,23,42,.94);color:#94a3b8;border-top:1px solid rgba(148,163,184,.18);font:11px/1.2 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.01em;pointer-events:none';document.body.appendChild(el);document.body.style.paddingBottom='25px'}el.textContent=r;return r}
window.atemirSetRoute=function(state){window.__atemirRouteState=state||{};return route()};
window.atemirObjectRouteId=routeOid;
function boot(){nav();brand();route();setTimeout(route,100)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();