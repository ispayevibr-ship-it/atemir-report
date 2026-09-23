(()=>{"use strict";
const id=new URLSearchParams(location.search).get("object")||"default", objects=JSON.parse(localStorage.getItem("atemir-company-objects-v1")||"[]"), obj=objects.find(x=>String(x.id)===String(id))||{};
const KEY="atemir_v9__object_"+id, legacyKey="atemir_v9";
const blank=()=>({version:72,base:{objectName:obj.name||"",address:obj.address||"",client:obj.client||""},reportDate:"",weather:{location:"",temp:"",wind:"",precip:""},reportPhotos:[],actedDays:[],penalties:[],workTypes:[],tasks:[],deadlines:[],workDays:[],invoices:[],workers:[],responsibles:[{role:"",fio:"",collapsed:false}],equipment:[]});
let d;try{d=JSON.parse(localStorage.getItem(KEY)||"null")||blank()}catch(e){d=blank()}
["actedDays","penalties","workTypes","tasks","deadlines","workDays","invoices","workers","responsibles","equipment","reportPhotos"].forEach(k=>{if(!Array.isArray(d[k]))d[k]=blank()[k]});
const sections=[["home","Сводка"],["works","Выполненные работы"],["invoices","Поставки / накладные"],["tasks","Проект / объёмы"],["deadlines","Сроки"],["acted","Актированные дни"],["workers","Рабочие"],["responsibles","Ответственные"],["equipment","Техника"],["penalties","Штрафы"],["photos","Фотоотчёт"]];
let active="home", saveTimer;
const $=s=>document.querySelector(s), esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function save(){localStorage.setItem(KEY,JSON.stringify({...d,reportPhotos:[]}));$("#saveState").textContent="Сохранено";clearTimeout(saveTimer)}
function dirty(){ $("#saveState").textContent="Сохраняем…";clearTimeout(saveTimer);saveTimer=setTimeout(save,250)}
function field(label,path,type="text"){let v=path.reduce((a,k)=>a?.[k],d)??"";return `<div><label>${label}</label><input data-path="${path.join(".")}" type="${type}" value="${esc(v)}"></div>`}
function card(title,body){return `<div class="card"><h2>${title}</h2>${body}</div>`}
function list(key,title,make,fields){let a=d[key];return `<div class="toolbar"><button class="primary" data-add="${key}">+ Добавить</button></div>${a.length?a.map((x,i)=>`<div class="card"><div class="rowhead"><b>${title} ${i+1}</b><button class="danger" data-del="${key}:${i}">Удалить</button></div><div class="grid">${fields.map(f=>`<div><label>${f[0]}</label><input data-item="${key}:${i}:${f[1]}" type="${f[2]||"text"}" value="${esc(x[f[1]]??"")}"></div>`).join("")}</div></div>`).join(""):`<div class="empty">Записей пока нет</div>`}
function render(){
 $("#objTitle").textContent=obj.name||d.base.objectName||"Объект";$("#pageTitle").textContent=sections.find(x=>x[0]===active)[1];$("#pageSub").textContent=obj.name||"";
 document.querySelectorAll("nav button").forEach(b=>b.classList.toggle("on",b.dataset.v===active));
 let h="";
 if(active==="home")h=card("Объект",`<div class="grid g3">${field("Наименование",["base","objectName"])}${field("Адрес",["base","address"])}${field("Заказчик",["base","client"])}${field("Дата отчёта",["reportDate"],"date")}${field("Температура, °C",["weather","temp"],"number")}${field("Ветер, м/с",["weather","wind"],"number")}</div>`)+card("Сводка",`<div class="stat"><div>Рабочих<b>${d.workers.length}</b></div><div>Техники<b>${d.equipment.length}</b></div><div>Дней работ<b>${d.workDays.length}</b></div><div>Штрафов<b>${d.penalties.length}</b></div></div>`);
 if(active==="works")h=list("workDays","День",()=>({date:"",items:[],collapsed:false}),[["Дата","date","date"]]);
 if(active==="invoices")h=list("invoices","Накладная",()=>({date:"",number:"",items:[],collapsed:false}),[["Дата","date","date"],["Номер","number"]]);
 if(active==="tasks")h=list("tasks","Позиция",()=>({type:"",code:"",volume:"",unit:"тн",collapsed:false}),[["Вид работы","type"],["Шифр","code"],["Объём","volume","number"],["Ед.","unit"]]);
 if(active==="deadlines")h=list("deadlines","Срок",()=>({type:"",code:"",start:"",date:"",collapsed:false}),[["Вид работы","type"],["Шифр","code"],["Начало","start","date"],["Окончание","date","date"]]);
 if(active==="acted")h=list("actedDays","Запись",()=>({date:"",reason:"",value:"",from:"",to:"",collapsed:false}),[["Дата","date","date"],["Причина","reason"],["Значение","value"],["С","from","time"],["До","to","time"]]);
 if(active==="workers")h=list("workers","Работник",()=>({fio:"",role:"",qty:"",collapsed:false}),[["Ф.И.О.","fio"],["Должность","role"],["Количество","qty","number"]]);
 if(active==="responsibles")h=list("responsibles","Ответственный",()=>({role:"",fio:"",collapsed:false}),[["Роль","role"],["Ф.И.О.","fio"]]);
 if(active==="equipment")h=list("equipment","Техника",()=>({type:"",custom:"",qty:1,collapsed:false}),[["Тип","type"],["Своё наименование","custom"],["Количество","qty","number"]]);
 if(active==="penalties")h=list("penalties","Штраф",()=>({date:"",amount:"",responsible:"",reason:"",collapsed:false}),[["Дата","date","date"],["Сумма, тг","amount","number"],["Ответственный","responsible"],["Причина","reason"]]);
 if(active==="photos")h=card("Фотоотчёт",'<div class="muted">Фото из существующего отчёта сохранены отдельно и не удаляются. Редактор фото будет перенесён следующим модулем без изменения формата.</div>');
 $("#view").innerHTML=h;
}
$("#nav").innerHTML=sections.map(x=>`<button data-v="${x[0]}">${x[1]}</button>`).join("");
$("#nav").onclick=e=>{let b=e.target.closest("[data-v]");if(b){active=b.dataset.v;render()}};
$("#view").addEventListener("input",e=>{let p=e.target.dataset.path;if(p){let ks=p.split("."),o=d;while(ks.length>1)o=o[ks.shift()];o[ks[0]]=e.target.value;dirty()}let q=e.target.dataset.item;if(q){let[k,i,f]=q.split(":");d[k][+i][f]=e.target.value;dirty()}});
$("#view").addEventListener("click",e=>{let a=e.target.dataset.add;if(a){const makers={workDays:()=>({date:"",items:[],collapsed:false}),invoices:()=>({date:"",number:"",items:[],collapsed:false}),tasks:()=>({type:"",code:"",volume:"",unit:"тн",collapsed:false}),deadlines:()=>({type:"",code:"",start:"",date:"",collapsed:false}),actedDays:()=>({date:"",reason:"",value:"",from:"",to:"",collapsed:false}),workers:()=>({fio:"",role:"",qty:"",collapsed:false}),responsibles:()=>({role:"",fio:"",collapsed:false}),equipment:()=>({type:"",custom:"",qty:1,collapsed:false}),penalties:()=>({date:"",amount:"",responsible:"",reason:"",collapsed:false})};d[a].unshift(makers[a]());dirty();render()}let q=e.target.dataset.del;if(q){let[k,i]=q.split(":");d[k].splice(+i,1);dirty();render()}});
function openLegacy(print){save();localStorage.setItem(legacyKey,JSON.stringify(d));location.href="legacy-report.html?object="+encodeURIComponent(id)+(print?"&print=1":"")}
$("#htmlExport").onclick=()=>openLegacy(false);$("#pdfExport").onclick=()=>openLegacy(true);
addEventListener("beforeunload",save);render();
})();