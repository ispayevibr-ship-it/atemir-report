(()=>{"use strict";
const oid=new URLSearchParams(location.search).get('object')||'default',P=`atemir_entity_${oid}_`;
const db=k=>{try{return window.atemirDesktop?.dbGetSync?.(k)}catch{return null}};
let last='';
function reportRows(){return [...document.querySelectorAll('[data-report-row119]')]}
function reportIndex(){return db(P+'reportIndex')||[]}
function idForRow(row){const i=+row.dataset.reportRow119,idx=reportIndex();return idx[i]?.id||null}
function set(s){window.atemirSetRoute?.(s);last=JSON.stringify(s||{})}
function infer(){const view=document.getElementById('view');if(!view)return;const txt=(view.textContent||'').toLowerCase();if(/новый отч[её]т|добавить отч[её]т/.test(txt)&&(/сохранить/.test(txt)||view.querySelector('input[type="date"]'))){set({mode:'new'});return}const edit=/редактир/.test(txt)&&/сохранить/.test(txt);const detail=/удалить|копировать/.test(txt)&&/выполненн/.test(txt);if((edit||detail)&&window.__atemirCurrentReportId){set({mode:edit?'edit':'view',reportId:window.__atemirCurrentReportId});return}set({mode:'list'})}
function bindRows(){for(const r of reportRows()){if(r.dataset.route276)return;r.dataset.route276='1';r.addEventListener('click',()=>{const id=idForRow(r);if(id)window.__atemirCurrentReportId=id},{capture:true})}}
function bindButtons(){const view=document.getElementById('view');if(!view)return;for(const b of view.querySelectorAll('button')){if(b.dataset.route276)return;const t=(b.textContent||'').trim().toLowerCase();if(/добавить отч[её]т|новый отч[её]т/.test(t)){b.dataset.route276='1';b.addEventListener('click',()=>set({mode:'new'}),true)}else if(/редактир/.test(t)){b.dataset.route276='1';b.addEventListener('click',()=>window.__atemirCurrentReportId&&set({mode:'edit',reportId:window.__atemirCurrentReportId}),true)}}}
function scan(){bindRows();bindButtons();infer()}
function boot(){set({mode:'list'});const v=document.getElementById('view');if(v)new MutationObserver(()=>requestAnimationFrame(scan)).observe(v,{childList:true,subtree:true});setTimeout(scan,100)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();