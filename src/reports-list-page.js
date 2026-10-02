(()=>{"use strict";
const q=new URLSearchParams(location.search),oid=q.get('object')||'default';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dmy=v=>{const p=String(v||'').slice(0,10).split('-');return p.length===3?`${p[2]}.${p[1]}.${p[0]}`:String(v||'—')};
const num=v=>{const n=Number(String(v??0).replace(',','.'));return Number.isFinite(n)?n:0};
const fmt=v=>num(v).toLocaleString('ru-RU',{maximumFractionDigits:3});
const url=(file,extra={})=>{const p=new URLSearchParams({object:oid,...extra});return file+'?'+p.toString()};
function people(r){return (r.workers||[]).reduce((s,x)=>s+num(x.qty??x.count),0)}
function machines(r){return (r.equipment||[]).reduce((s,x)=>s+num(x.qty??x.count),0)}
function photos(r){return (r.photos||r.reportPhotos||[]).filter(Boolean).length}
function weather(r){const w=r.weather||{};let t=w.temp??w.temperature??'—',kind=w.condition||w.type||w.precip||'';return `${esc(t)}${t==='—'||String(t).includes('°')?'':'°C'}${kind?`<small>${esc(kind)}</small>`:''}`}
function work(r){const items=r.items||r.works||[];if(!items.length)return '<span class="reportsEmptyWork">Работы не указаны</span>';let groups=new Map();for(const x of items){let k=[x.type||x.workType||'Работы',x.code||x.cipher||''].filter(Boolean).join(' · '),u=x.unit||x.measure||'',v=num(x.total??x.volume??x.qty);let g=groups.get(k)||{v:0,u};g.v+=v;if(!g.u)g.u=u;groups.set(k,g)}return [...groups].map(([k,g])=>`<div><b>${esc(k)}</b>${g.v?` — ${fmt(g.v)} ${esc(g.u)}`:''}</div>`).join('')}
function openNew(){location.assign(url('report.html',{mode:'new'}))}
function openReport(id,mode='view'){location.assign(url('report.html',{report:id,...(mode==='edit'?{mode:'edit'}:{})}))}
function render(){const view=document.getElementById('view');if(!view||!window.atemirReportsData)return;const list=window.atemirReportsData.list().slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));document.getElementById('pageTitle').textContent='Ежедневные отчёты';document.getElementById('pageSub').textContent=list.length?`Отчётов: ${list.length}`:'';view.innerHTML=`<div class="reportsPage286"><div class="reportsToolbar286"><button type="button" class="reportsNew286">+ Новый отчёт</button></div><div class="reportsRows286">${list.length?list.map(r=>`<article class="reportsRow286" data-report-id="${esc(r.id)}"><div class="reportsDate286">${dmy(r.date)}</div><div class="reportsMetric286"><b>${people(r)}</b><small>чел.</small></div><div class="reportsMetric286"><b>${machines(r)}</b><small>ед. техники</small></div><div class="reportsMetric286"><b>${photos(r)}</b><small>фото</small></div><div class="reportsWeather286">${weather(r)}</div><div class="reportsWork286">${work(r)}</div><div class="reportsActions286"><button type="button" data-act="copy" title="Копировать">⧉</button><button type="button" data-act="edit" title="Редактировать">✎</button><button type="button" data-act="delete" title="Удалить">×</button></div></article>`).join(''):'<div class="reportsNone286">Пока нет отчётов</div>'}</div></div>`;
view.querySelector('.reportsNew286')?.addEventListener('click',openNew);
view.querySelectorAll('.reportsRow286').forEach(row=>row.addEventListener('click',e=>{if(!e.target.closest('button'))openReport(row.dataset.reportId)}));
view.querySelectorAll('[data-act="edit"]').forEach(b=>b.addEventListener('click',e=>openReport(e.currentTarget.closest('.reportsRow286').dataset.reportId,'edit')));
}
function boot(){render();window.addEventListener('atemir:reports-data-ready',render)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();