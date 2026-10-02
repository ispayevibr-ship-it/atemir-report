(()=>{"use strict";
const STYLE='dailyNav256Style';
function css(){if(document.getElementById(STYLE))return;let s=document.createElement('style');s.id=STYLE;s.textContent=`
body.dailyEdit256{padding-bottom:78px!important}
body.dailyEdit256 button.dailySave256{position:fixed!important;right:28px!important;bottom:22px!important;z-index:9000!important;width:262px!important;height:46px!important;margin:0!important;border-radius:7px!important;box-shadow:0 8px 24px rgba(18,63,91,.22)!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;visibility:visible!important;opacity:1!important}
.dailyBack256{height:42px!important;padding:0 16px!important;border:1px solid #bfd4df!important;border-radius:7px!important;background:#fff!important;color:#24627f!important;font-weight:700!important;cursor:pointer!important;white-space:nowrap!important}
.dailyBack256:hover{background:#eef7fb!important}
@media(max-width:800px){body.dailyEdit256 button.dailySave256{right:14px!important;bottom:14px!important;width:220px!important}}
`;document.head.appendChild(s)}
const text=e=>(e?.textContent||'').replace(/\s+/g,' ').trim();
function buttons(){return [...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null)}
function goReports(){
 let b=buttons().find(x=>/ежедневн.*отч[её]т/i.test(text(x))&&!/копировать|сохранить/i.test(text(x)));
 if(b){b.click();return}
 let n=[...document.querySelectorAll('#nav button')].find(x=>/отч[её]т/i.test(text(x)));if(n)n.click()
}
function sync(){css();
 let save=[...document.querySelectorAll('button')].find(b=>/^сохранить отч[её]т$/i.test(text(b)));
 document.body.classList.toggle('dailyEdit256',!!save);
 document.querySelectorAll('.dailySave256').forEach(x=>x.classList.remove('dailySave256'));
 if(save)save.classList.add('dailySave256');
 let detail=[...document.querySelectorAll('*')].some(e=>e.children.length===0&&/ежедневный отч[её]т\s*№/i.test(text(e)));
 if(detail&&!document.querySelector('.dailyBack256')){
   let edit=[...document.querySelectorAll('button')].find(b=>/^редактировать$/i.test(text(b)));
   if(edit){let b=document.createElement('button');b.type='button';b.className='dailyBack256';b.textContent='← Все отчёты';b.onclick=goReports;edit.parentElement.insertBefore(b,edit.parentElement.firstChild)}
 }
}
let pending=false;const obs=new MutationObserver(()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;sync()})});
function boot(){sync();let v=document.getElementById('view')||document.body;obs.observe(v,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();