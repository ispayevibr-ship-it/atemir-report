(()=>{"use strict";
const q=new URLSearchParams(location.search),oid=q.get('object')||'default';
const pages=[['object.html','Обзор','⌂'],['reports.html','Ежедневные отчёты','▣'],['bom.html','Ведомость / марки','▤'],['invoices.html','Накладные','⇩'],['tasks.html','Виды работ / проекты','◇'],['progress.html','Готовность','◔'],['dynamics.html','Динамика','⌁'],['deadlines.html','Контроль сроков','◷'],['scheme.html','Схема','◇']];
const current=(location.pathname.split('/').pop()||'object.html').toLowerCase();
function nav(){const n=document.getElementById('nav');if(!n)return;n.innerHTML=pages.map(([file,title,icon])=>`<button type="button" class="${current===file?'on':''}" data-page="${file}"><span class="navIcon552">${icon}</span>${title}</button>`).join('');n.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>{const file=b.dataset.page;if(file===current)return;location.href=file+'?object='+encodeURIComponent(oid)})}
function brand(){let cp={};try{cp=window.atemirDesktop?.dbGetSync?.('atemir-company-profile-v1')||{}}catch{}const b=document.getElementById('companyBrand641');if(!b)return;b.textContent='';if(cp.logo){const i=document.createElement('img');i.src=cp.logo;i.alt='Логотип компании';b.appendChild(i);b.classList.add('hasLogo716')}else b.textContent=cp.name||'ТОО «А-Темир Строй»'}
function boot(){nav();brand()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();