(()=>{"use strict";
const section=document.body.dataset.section||'home';
const map={reports:'works',bom:'bom',invoices:'invoices',tasks:'tasks',progress:'progress',dynamics:'dynamics',deadlines:'deadlines',scheme:'schemeLab'};
const target=map[section];
window.__atemirStandaloneSection=section;
window.__atemirStandaloneTarget=target||'home';
function findLegacy(){if(!target)return null;return [...document.querySelectorAll('[data-v]')].find(x=>x.dataset.v===target)||null}
function select(){if(!target)return;let tries=0;const run=()=>{tries++;const b=findLegacy();if(b){b.click();const h=document.getElementById('pageTitle');if(h)h.textContent=document.body.dataset.title||b.textContent.trim();return}if(tries<80)setTimeout(run,25)};run()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',select);else setTimeout(select,0);
})();