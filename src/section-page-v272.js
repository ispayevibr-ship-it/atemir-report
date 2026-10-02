(()=>{"use strict";
const q=new URLSearchParams(location.search),section=document.body.dataset.section||'home';
window.__atemirStandaloneSection=section;
function select(){const map={reports:'works',bom:'bom',invoices:'invoices',tasks:'tasks',progress:'progress',dynamics:'dynamics',deadlines:'deadlines',scheme:'schemeLab'},target=map[section];if(!target)return;let tries=0;const run=()=>{tries++;const b=[...document.querySelectorAll('#nav [data-v]')].find(x=>x.dataset.v===target);if(b){b.click();document.getElementById('pageTitle').textContent=document.body.dataset.title||b.textContent.trim();return}if(tries<40)setTimeout(run,25)};run()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',select);else select();
})();