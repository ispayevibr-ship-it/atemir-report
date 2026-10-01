(()=>{"use strict";
const PAGE_SIZE=15;
let currentPage=1;
const view=document.getElementById("view");
if(!view)return;
let scheduled=false;
let observer=null;
function observe(){observer.observe(view,{childList:true,subtree:true});}
function setVisible(row,visible){
  row.hidden=!visible;
  if(visible)row.style.removeProperty("display");
  else row.style.setProperty("display","none","important");
}
function applyPagination(){
  if(observer)observer.disconnect();
  try{
    const rows=[...view.querySelectorAll("[data-report-row119]")];
    let pager=view.querySelector("[data-daily-pager230]");
    if(!rows.length){pager?.remove();currentPage=1;return;}
    const pages=Math.max(1,Math.ceil(rows.length/PAGE_SIZE));
    currentPage=Math.min(Math.max(1,currentPage),pages);
    const start=(currentPage-1)*PAGE_SIZE,end=start+PAGE_SIZE;
    rows.forEach((row,i)=>setVisible(row,i>=start&&i<end));
    if(pages<=1){pager?.remove();return;}
    if(!pager){pager=document.createElement("div");pager.dataset.dailyPager230="1";view.appendChild(pager);}
    pager.style.cssText="display:flex;justify-content:center;align-items:center;gap:8px;flex-wrap:wrap;margin:22px 0 10px;padding:4px 0";
    const base='border:1px solid #cfdbe5;border-radius:8px;height:40px;min-width:40px;padding:0 13px;font:600 14px/1 Arial,sans-serif;cursor:pointer;transition:background .16s,border-color .16s,color .16s,box-shadow .16s;box-shadow:0 1px 2px rgba(15,45,70,.05);';
    const normal=base+'background:#fff;color:#17324a;';
    const active=base+'background:#1695cf;border-color:#1695cf;color:#fff;box-shadow:0 3px 8px rgba(22,149,207,.22);';
    const nav=base+'background:#fff;color:#177ca8;padding:0 17px;';
    const disabled=base+'background:#f4f7f9;border-color:#e0e7ec;color:#a9b4bd;cursor:default;box-shadow:none;padding:0 17px;';
    pager.innerHTML='<button data-page230="'+Math.max(1,currentPage-1)+'" style="'+(currentPage===1?disabled:nav)+'"'+(currentPage===1?' disabled':'')+'>← Назад</button>'+Array.from({length:pages},(_,i)=>i+1).map(p=>'<button data-page230="'+p+'" style="'+(p===currentPage?active:normal)+'" aria-current="'+(p===currentPage?'page':'false')+'">'+p+'</button>').join("")+'<button data-page230="'+Math.min(pages,currentPage+1)+'" style="'+(currentPage===pages?disabled:nav)+'"'+(currentPage===pages?' disabled':'')+'>Вперёд →</button>';
    pager.querySelectorAll("[data-page230]").forEach(b=>{
      if(!b.disabled){b.onmouseenter=()=>{if(b.getAttribute("aria-current")!=="page"){b.style.background="#eef8fc";b.style.borderColor="#9bcfe5";}};b.onmouseleave=()=>{if(b.getAttribute("aria-current")!=="page"){b.style.background="#fff";b.style.borderColor="#cfdbe5";}};}
      b.onclick=()=>{if(b.disabled)return;currentPage=+b.dataset.page230||1;applyPagination();view.querySelector("[data-report-row119]:not([hidden])")?.scrollIntoView({block:"start",behavior:"smooth"});};
    });
  }finally{observe();}
}
function schedulePagination(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;applyPagination();});}
observer=new MutationObserver(schedulePagination);
observe();
applyPagination();
})();