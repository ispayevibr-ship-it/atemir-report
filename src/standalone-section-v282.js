(()=>{"use strict";
const section=document.body.dataset.section||'home';
const map={tasks:'tasks',progress:'progress',dynamics:'dynamics',deadlines:'deadlines',scheme:'schemeLab'};
const target=map[section];
if(!target)return;
window.__atemirStandaloneSection=section;
window.__atemirStandaloneTarget=target;
function activate(){const buttons=[...document.querySelectorAll('[data-v]')],b=buttons.find(x=>x.dataset.v===target);if(!b)return false;b.click();const h=document.getElementById('pageTitle');if(h)h.textContent=document.body.dataset.title||b.textContent.trim();return true}
function boot(){let n=0;const tick=()=>{if(activate())return;if(++n<120)setTimeout(tick,25)};tick()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();