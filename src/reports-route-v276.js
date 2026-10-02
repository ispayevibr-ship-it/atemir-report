(()=>{"use strict";
const oid=new URLSearchParams(location.search).get('object')||'default',P=`atemir_entity_${oid}_`;
const db=k=>{try{return window.atemirDesktop?.dbGetSync?.(k)}catch{return null}};
const text=e=>(e?.textContent||'').replace(/\s+/g,' ').trim();
function idx(){const x=db(P+'reportIndex');return Array.isArray(x)?x:[]}
function reportIdByDate(date){if(!date)return null;const iso=/^(\d{2})\.(\d{2})\.(\d{4})$/.exec(date);const d=iso?`${iso[3]}-${iso[2]}-${iso[1]}`:date;const a=idx();const x=a.find(r=>String(r.date||'').slice(0,10)===d);return x?.id||null}
function reportIdFrom(el){const row=el?.closest?.('[data-report-row119]');if(row){const n=Number(row.dataset.reportRow119),a=idx();if(Number.isInteger(n)&&a[n]?.id)return a[n].id;const dm=text(row).match(/\b\d{2}\.\d{2}\.\d{4}\b/);const by=reportIdByDate(dm?.[0]);if(by)return by}const root=el?.closest?.('#view')||document.getElementById('view');const h=text(root).match(/Отч[её]т за\s+(\d{2}\.\d{2}\.\d{4})/i);return reportIdByDate(h?.[1])||window.__atemirCurrentReportId||null}
function set(mode,id){if(id)window.__atemirCurrentReportId=id;window.atemirSetRoute?.({mode,reportId:id||null})}
function infer(){const v=document.getElementById('view');if(!v)return;const t=text(v);if(/(?:новый|добавить) отч[её]т/i.test(t)&&(/сохранить отч[её]т/i.test(t)||v.querySelector('input[type="date"]'))){set('new');return}const detail=/ЕЖЕДНЕВНЫЙ ОТЧ[ЕЁ]Т\s*№|Отч[её]т за\s+\d{2}\.\d{2}\.\d{4}/i.test(t);if(detail){const id=reportIdFrom(v);if(id){const editing=/Редактирование выполненной работы|Сохранить отч[её]т/i.test(t);set(editing?'edit':'view',id);return}}set('list')}
function click(e){const b=e.target.closest?.('button');if(!b)return;const t=text(b);if(/(?:новый|добавить).*отч[её]т/i.test(t)){set('new');return}if(/^редактировать$/i.test(t)){const id=reportIdFrom(b);if(id)set('edit',id);return}if(/^(?:←\s*)?(?:ко )?всем отч[её]там$/i.test(t)){set('list');return}const row=b.closest?.('[data-report-row119]');if(row&&!/копир|удал/i.test(t)){const id=reportIdFrom(row);if(id)set('view',id)}}
function rowClicks(e){if(e.target.closest?.('button'))return;const row=e.target.closest?.('[data-report-row119]');if(!row)return;const id=reportIdFrom(row);if(id)set('view',id)}
let queued=false;function scan(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;infer()})}
function boot(){document.addEventListener('click',click,true);document.addEventListener('click',rowClicks,true);const v=document.getElementById('view');if(v)new MutationObserver(scan).observe(v,{childList:true,subtree:true});setTimeout(infer,120)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();