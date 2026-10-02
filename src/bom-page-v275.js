(()=>{"use strict";
const oid=new URLSearchParams(location.search).get('object')||'default',P=`atemir_entity_${oid}_`;
const db=k=>{try{return window.atemirDesktop?.dbGetSync?.(k)}catch{return null}};
function legacyBomButton(){return [...document.querySelectorAll('[data-v]')].find(x=>x.dataset.v==='bom')||null}
function start(){let n=0;const run=()=>{n++;const b=legacyBomButton();if(b){b.click();waitRows();return}if(n<120)setTimeout(run,25)};run()}
function waitRows(){let n=0;const run=()=>{n++;if(document.getElementById('bomRows')){window.dispatchEvent(new Event('atemir:bom-ready'));return}if(n<120)setTimeout(run,25)};run()}
window.atemirBomPage={objectId:oid,prefix:P,db,start};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else setTimeout(start,0);
})();