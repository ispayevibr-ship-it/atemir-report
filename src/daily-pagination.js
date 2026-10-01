(()=>{"use strict";
const PAGE_SIZE=15;
let currentPage=1;
function applyPagination(){
  const view=document.getElementById("view");
  if(!view)return;
  const rows=[...view.querySelectorAll("[data-report-row119]")];
  let pager=view.querySelector("[data-daily-pager230]");
  if(!rows.length){pager?.remove();currentPage=1;return;}
  const pages=Math.max(1,Math.ceil(rows.length/PAGE_SIZE));
  currentPage=Math.min(Math.max(1,currentPage),pages);
  rows.forEach((row,i)=>{row.style.display=(i>=(currentPage-1)*PAGE_SIZE&&i<currentPage*PAGE_SIZE)?"":"none";});
  if(pages<=1){pager?.remove();return;}
  if(!pager){pager=document.createElement("div");pager.dataset.dailyPager230="1";pager.style.cssText="display:flex;justify-content:center;align-items:center;gap:6px;flex-wrap:wrap;margin:16px 0 4px";view.appendChild(pager);}
  pager.innerHTML='<button class="white" data-page230="'+Math.max(1,currentPage-1)+'"'+(currentPage===1?' disabled':'')+'>← Назад</button>'+Array.from({length:pages},(_,i)=>i+1).map(p=>'<button class="'+(p===currentPage?'primary':'white')+'" data-page230="'+p+'">'+p+'</button>').join("")+'<button class="white" data-page230="'+Math.min(pages,currentPage+1)+'"'+(currentPage===pages?' disabled':'')+'>Вперёд →</button>';
  pager.querySelectorAll("[data-page230]").forEach(b=>b.onclick=()=>{currentPage=+b.dataset.page230||1;applyPagination();document.querySelector("[data-report-row119]")?.scrollIntoView({block:"start",behavior:"smooth"});});
}
const view=document.getElementById("view");
if(view){new MutationObserver(()=>queueMicrotask(applyPagination)).observe(view,{childList:true,subtree:true});applyPagination();}
})();