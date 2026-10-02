(()=>{"use strict";
const oid=new URLSearchParams(location.search).get("object")||"default",P=`atemir_entity_${oid}_`;
const txt=e=>(e?.textContent||"").replace(/\s+/g," ").trim();
const num=v=>parseFloat(String(v??0).replace(",","."))||0;
const norm=v=>String(v||"").trim().toUpperCase().replace(/\s+/g,"");
const db=k=>{try{return window.atemirDesktop?.dbGetSync?.(k)}catch{return null}};
function taskFor(type,code){const idx=db(P+"taskIndex")||[];for(const x of idx){const t=db(P+"task_"+x.id);if(t&&String(t.type||"")===String(type||"")&&String(t.code||"")===String(code||""))return t}return null}
function bomRow(t,mark){if(!t)return null;const bom=db(P+"bom_"+t.id)||[];return bom.find(r=>norm(r.mark)===norm(mark))||null}
function labelInput(root,label){const l=[...root.querySelectorAll("label")].find(x=>txt(x)===label);if(!l)return null;let n=l.nextElementSibling;if(n?.matches?.("input,select"))return n;return l.parentElement?.querySelector?.("input,select")||null}
function repairVolume(root){
 const labels=[...root.querySelectorAll("label")];if(!labels.some(x=>txt(x)==="Объём 1 ед."))return;
 const selects=[...root.querySelectorAll("select")];
 const type=labelInput(root,"Вид работ")||labelInput(root,"Вид работ")||selects[0];
 const code=labelInput(root,"Шифр")||selects[1];
 const markSel=labels.find(x=>txt(x)==="Марка")?.parentElement?.querySelector("select")||selects.find(s=>[...s.options].some(o=>/по проекту|смонт/i.test(o.textContent||"")));
 const vol=labelInput(root,"Объём 1 ед.");if(!type||!code||!markSel||!vol)return;
 const mark=String(markSel.value||markSel.options?.[markSel.selectedIndex]?.text||"").split(/[·•]/)[0].trim();if(!mark||/без марки/i.test(mark))return;
 const t=taskFor(type.value,code.value),r=bomRow(t,mark);if(!t||!r)return;
 let raw=num(r.weight1??r.weight??r.unitWeight??r.weightUnit??0),unit=String(t.unit||"").trim().toLowerCase();
 // BOM for metal structures is imported in kg. Daily reports/invoices work in tonnes.
 let value=(unit==="тн"||unit==="т"||unit==="тонн"||unit==="тонна")?raw/1000:raw;
 if(!Number.isFinite(value))return;
 if(Math.abs(num(vol.value)-value)>1e-12){vol.value=String(value).replace(".",",");vol.dispatchEvent(new Event("input",{bubbles:true}));vol.dispatchEvent(new Event("change",{bubbles:true}))}
}
function repairAll(){document.querySelectorAll("#view form,#view .card,#view [class*='edit'],#view [class*='work']").forEach(repairVolume)}
function isDailyNav(b){return /ежедневн.*отч[её]т/i.test(txt(b))}
function hasDailyRows(){return !!document.querySelector("#view [data-report-row119]")}
function hasAdd(){return [...document.querySelectorAll("#view button")].some(b=>/добавить.*отч[её]т|новый отч[её]т/i.test(txt(b)))}
function recoverDailyButton(){if(!hasDailyRows()||hasAdd())return;sessionStorage.setItem("atemir-reopen-daily-v271","1");location.reload()}
function reopenAfterReload(){if(sessionStorage.getItem("atemir-reopen-daily-v271")!=="1")return;sessionStorage.removeItem("atemir-reopen-daily-v271");let tries=0,t=setInterval(()=>{tries++;const b=[...document.querySelectorAll("#nav button")].find(isDailyNav);if(b){clearInterval(t);b.click()}else if(tries>30)clearInterval(t)},100)}
document.addEventListener("change",e=>{if(e.target?.matches?.("#view select"))setTimeout(repairAll,0)},true);
document.addEventListener("click",e=>{const b=e.target.closest?.("#nav button");if(b&&isDailyNav(b))setTimeout(recoverDailyButton,120)},true);
let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;repairAll()})}).observe(document.getElementById("view")||document.body,{childList:true,subtree:true});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",reopenAfterReload);else reopenAfterReload();
})();