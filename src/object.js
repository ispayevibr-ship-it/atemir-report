
(function(){
  const params=new URLSearchParams(location.search), id=params.get("object")||"default";
  const objects=JSON.parse(localStorage.getItem("atemir-company-objects-v1")||"[]");
  const current=objects.find(o=>String(o.id)===String(id));
  window.ATEMIR_OBJECT_ID=id;
  window.ATEMIR_OBJECT=current||null;
  const nativeGet=Storage.prototype.getItem, nativeSet=Storage.prototype.setItem, nativeRemove=Storage.prototype.removeItem;
  const reportKeys=new Set(["atemir_v9","atemir_view188","atemir_manage190"]);
  const key=k=>reportKeys.has(String(k))?String(k)+"__object_"+id:k;
  Storage.prototype.getItem=function(k){return nativeGet.call(this,key(k))};
  Storage.prototype.setItem=function(k,v){return nativeSet.call(this,key(k),v)};
  Storage.prototype.removeItem=function(k){return nativeRemove.call(this,key(k))};
  addEventListener("DOMContentLoaded",()=>{
    const bar=document.createElement("div");
    bar.id="objectNavBar";
    bar.style.cssText="position:sticky;top:0;z-index:99999;background:#082b4b;color:white;padding:8px 14px;display:flex;align-items:center;gap:10px;font:700 12px Arial";
    const back=document.createElement("button"); back.textContent="← Все объекты"; back.style.cssText="background:#f4b41a;border:0;border-radius:6px;padding:7px 10px;font-weight:700;cursor:pointer"; back.onclick=()=>location.href="index.html";
    const name=document.createElement("span"); name.textContent=current?current.name:"Объект";
    bar.append(back,name); document.body.prepend(bar);
  });
})();


;


function clearReport(){
 if(!confirm("Уверены, что хотите очистить отчёт?\n\nСоветуем сохраниться перед этим."))return;
 try{localStorage.removeItem("atemir_v9")}catch(e){}
 reportDate="";weather={temp:"",wind:"",precip:""};
 actedDays=[];penalties=[];workTypes=[];tasks=[];deadlines=[];workDays=[];invoices=[];workers=[];responsibles=[];equipment=[];
 try{
  const ids=["object","address","client"];
  ids.forEach(id=>{let el=document.getElementById(id);if(el)el.value=""});
 }catch(e){}
 try{
  document.querySelectorAll("input,textarea").forEach(el=>{
   if(el.type!=="button"&&el.type!=="submit"&&el.type!=="file")el.value="";
  });
  document.querySelectorAll("select").forEach(el=>el.selectedIndex=0);
 }catch(e){}
 try{
  renderWorkTypes();renderTasks();renderDeadlines();renderWorkDays();renderInvoices();renderWorkers();renderResponsibles();renderEquipment();renderActed();renderPenalties();
 }catch(e){}
 try{update()}catch(e){}
 try{localStorage.removeItem("atemir_v9")}catch(e){}
 alert("Отчёт очищен.");
}

const UNITS=["тн","м²","м³","кг","шт","м","компл."],ROLES=["Начальник участка","Производитель работ","Мастер","Инженер ПТО"],EQUIP=["Автокран 25 т","Автокран 50 т","Манипулятор","Автовышка","Телескопический погрузчик","Фронтальный погрузчик","КамАЗ","Сварочный аппарат","Компрессор","Генератор","Другое"];
let workTypes=[],tasks=[],deadlines=[],workDays=[],invoices=[],workers=[],responsibles=[{role:"",fio:"",collapsed:false}],equipment=[];let reportDate="",weather={location:"",temp:"",wind:"",precip:""},reportPhotos=[],actedDays=[],penalties=[];
const $=id=>document.getElementById(id),esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])),num=v=>parseFloat(String(v).replace(",","."))||0,fmt=v=>(Math.round(v*1000)/1000).toLocaleString("ru-RU",{maximumFractionDigits:3}),df=s=>s?s.split("-").reverse().join("."):"—",opts=(a,v)=>a.map(x=>`<option ${x===v?"selected":""}>${esc(x)}</option>`).join("");
function typeNames(){return workTypes.map(x=>x.name).filter(Boolean)} function codes(){return [...new Set(tasks.map(x=>x.code.trim()).filter(Boolean))]}
function allUnits(){return [...new Set([...UNITS,...tasks.map(t=>t.unit).filter(Boolean)])]}
function unitInput(value,cls="unit",customLabel="Своя..."){let custom=value&&!UNITS.includes(value);return `<select class="${cls}">${opts(UNITS,custom?"":value)}<option value="__custom__"${custom?" selected":""}>${customLabel}</option></select>`}
function sel(arr,val,placeholder="— выберите —",cls=""){return `<select class="${cls}"><option value="">${placeholder}</option>${opts(arr,val)}</select>`} function total(q,p){return num(q)*num(p)}
function addWorkType(x={}){workTypes.push({name:x.name||""});renderAllInputs();update()}
function renderWorkTypes(){let b=$("workTypes");b.innerHTML="";workTypes.forEach((x,i)=>{let e=document.createElement("div");e.className="card";e.innerHTML=`<div class="head"><b>Вид работ ${i+1}</b><button class="red small">Удалить</button></div><div class="detail"><label>Наименование</label><input value="${esc(x.name)}" placeholder="Введите наименование вида работ"></div>`;b.appendChild(e);e.querySelector("button").onclick=()=>{workTypes.splice(i,1);renderAllInputs();update()};e.querySelector("input").oninput=v=>{x.name=v.target.value;update()}})}
function addTask(x={}){tasks.push({type:x.type||"",code:x.code||"",volume:x.volume||"",unit:x.unit||"тн",date:x.date||"",collapsed:false});renderTasks();renderDependent();update()}
function renderTasks(){let b=$("tasks");b.innerHTML="";tasks.forEach((x,i)=>{let e=document.createElement("div");e.className="card"+(x.collapsed?" collapsed":"");e.innerHTML=`<div class="head"><b>Задача ${i+1}</b><div class="ra"><button class="white small toggle">${x.collapsed?"Развернуть":"Свернуть"}</button><button class="red small del">Удалить</button></div></div><div class="summary compact-summary"><span>${esc(x.type||"—")} — ${esc(x.code||"—")} — ${fmt(num(x.volume))} ${esc(x.unit||"")}</span></div><div class="detail"><div class="g3"><div><label>Вид работы</label>${sel(typeNames(),x.type)}</div><div><label>Шифр</label><input class="code" value="${esc(x.code)}" placeholder="Введите шифр"></div><div><label>Объём по проекту</label><input class="vol" type="number" step="any" value="${x.volume}"></div><div><label>Ед. измерения</label>${unitInput(x.unit)}<div class="customUnitWrap" style="margin-top:4px;${x.unit&&!UNITS.includes(x.unit)?"":"display:none"}"><input class="customUnit" value="${x.unit&&!UNITS.includes(x.unit)?esc(x.unit):""}" placeholder="Введите свою ед. измерения"></div></div></div></div>`;b.appendChild(e);e.querySelector(".toggle").onclick=()=>{x.collapsed=!x.collapsed;renderTasks()};e.querySelector(".del").onclick=()=>{tasks.splice(i,1);renderTasks();renderDependent();update()};let s=e.querySelector(".detail select");s.onchange=v=>{x.type=v.target.value;update()};e.querySelector(".code").oninput=v=>{x.code=v.target.value;update()};e.querySelector(".code").onchange=()=>renderDependent();e.querySelector(".vol").oninput=v=>{x.volume=v.target.value;update()};e.querySelector(".unit").onchange=v=>{let wrap=e.querySelector(".customUnitWrap"),inp=e.querySelector(".customUnit");if(v.target.value==="__custom__"){wrap.style.display="block";x.unit=inp.value.trim();inp.focus()}else{wrap.style.display="none";x.unit=v.target.value;renderDependent();update()}};e.querySelector(".customUnit").oninput=v=>{x.unit=v.target.value.trim();update()};e.querySelector(".customUnit").onchange=v=>{if(v.target.value.trim()){x.unit=v.target.value.trim();renderDependent();update()}}})}

function renderWorkCalendar(){let target=$("rMultiCalendar");if(!target)return;let workDates=workDays.filter(d=>d.date&&d.items&&d.items.some(x=>total(x.qty,x.per)>0)).map(d=>d.date),actDates=actedDays.filter(x=>x.date).map(x=>x.date),all=[...workDates,...actDates];if(!all.length){target.innerHTML='<span class="muted">Календарь появится после добавления выполненных работ или актированных дней.</span>';return}let first=workDates.length?[...workDates].sort()[0]:[...all].sort()[0],lastCandidates=[...all];if(reportDate)lastCandidates.push(reportDate);let last=lastCandidates.sort().slice(-1)[0],sy=+first.slice(0,4),sm=+first.slice(5,7)-1,ey=+last.slice(0,4),em=+last.slice(5,7)-1,workSet=new Set(workDates),actSet=new Set(actDates),names=["Пн","Вт","Ср","Чт","Пт","Сб","Вс"],months=["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"],html=[];for(let y=sy,m=sm;y<ey||y===ey&&m<=em;){let firstDay=new Date(y,m,1),days=new Date(y,m+1,0).getDate(),offset=(firstDay.getDay()+6)%7,cells=names.map(n=>`<div class="calHead">${n}</div>`);for(let i=0;i<offset;i++)cells.push('<div class="calDay empty"></div>');for(let d=1;d<=days;d++){let ds=`${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`,w=workSet.has(ds),a=actSet.has(ds),cl=w&&a?"both":w?"work":a?"acted":"";cells.push(`<div class="calDay ${cl}" title="${w?"Выполнялись работы":""}${w&&a?" / ":""}${a?"Актированный день":""}"><b>${d}</b></div>`)}html.push(`<div class="monthCard"><div class="monthTitle">${months[m]} ${y}</div><div class="workCalendar">${cells.join("")}</div></div>`);m++;if(m>11){m=0;y++}}target.innerHTML=html.join("")}
function addActedDay(x={}){actedDays.unshift({date:x.date||"",reason:x.reason||"Ветер",value:x.value||"",from:x.from||"",to:x.to||"",collapsed:x.collapsed===false?false:true});renderActedDays();update()}
function renderActedDays(){let b=$("actedDays");if(!b)return;b.innerHTML="";actedDays.slice().sort((a,b)=>{if(!a.date&&b.date)return -1;if(a.date&&!b.date)return 1;return (b.date||"").localeCompare(a.date||"")}).forEach(x=>{let oi=actedDays.indexOf(x),e=document.createElement("div");e.className="card"+(x.collapsed?" collapsed":"");let timeText=(x.from||x.to)?`${x.from||"—"}–${x.to||"—"}`:"Время не указано";e.innerHTML=`<div class="head"><b>${x.date?df(x.date):"Актированный день"} — ${timeText}</b><div class="ra"><button class="white small atoggle">${x.collapsed?"Развернуть":"Свернуть"}</button><button class="red small adel">Удалить</button></div></div><div class="summary compact-summary actedSummary"><span class="adateLine">${x.date?df(x.date):"Дата не указана"}</span><span class="adetailLine">${esc(x.reason||"Причина не указана")}${x.value!==""?" — "+esc(x.value)+(x.reason==="Ветер"?" м/с":x.reason==="Холод"?" °C":""):""} · ${timeText}</span></div><div class="detail"><div class="g3"><div><label>Дата</label><input class="adate" type="date" value="${x.date}"></div><div><label>Причина</label><select class="areason">${opts(["Холод","Ветер","Осадки","Другая"],x.reason)}</select></div><div><label>Значение</label><div class="unitField"><input class="avalue" type="number" step="any" value="${esc(x.value)}" placeholder="0"><span class="aunit">${x.reason==="Ветер"?"м/с":x.reason==="Холод"?"°C":""}</span></div></div><div><label>С</label><input class="afrom" type="time" value="${x.from}"></div><div><label>По</label><input class="ato" type="time" value="${x.to}"></div></div></div>`;b.appendChild(e);e.querySelector(".atoggle").onclick=()=>{x.collapsed=!x.collapsed;renderActedDays()};e.querySelector(".adel").onclick=()=>{actedDays.splice(oi,1);renderActedDays();update()};e.querySelector(".adate").onchange=v=>{x.date=v.target.value;renderActedDays();update()};e.querySelector(".areason").onchange=v=>{x.reason=v.target.value;let u=e.querySelector(".aunit");u.textContent=x.reason==="Ветер"?"м/с":x.reason==="Холод"?"°C":"";update()};e.querySelector(".avalue").oninput=v=>{x.value=v.target.value;update()};e.querySelector(".afrom").onchange=v=>{x.from=v.target.value;renderActedDays();update()};e.querySelector(".ato").onchange=v=>{x.to=v.target.value;renderActedDays();update()}})}
function bindReportInfo(){let d=$("reportDateInput"),t=$("weatherTemp"),w=$("weatherWind"),p=$("weatherPrecip");if(!d)return;setTimeout(()=>{if(window.renderReportPhotos223)window.renderReportPhotos223()},0);d.value=reportDate;t.value=weather.temp;w.value=weather.wind;p.value=weather.precip;d.oninput=d.onchange=v=>{reportDate=v.target.value;update()};t.oninput=v=>{weather.temp=v.target.value;update()};w.oninput=v=>{weather.wind=v.target.value;update()};p.oninput=v=>{weather.precip=v.target.value;update()}}

function addPenalty(x={}){penalties.forEach(a=>a.collapsed=true);penalties.unshift({date:x.date||"",amount:x.amount||"",responsible:x.responsible||"",reason:x.reason||"",collapsed:false});renderPenalties();update()}
function renderPenalties(){let b=$("penalties");if(!b)return;b.innerHTML="";penalties.slice().sort((a,b)=>{if(!a.date&&b.date)return -1;if(a.date&&!b.date)return 1;return (b.date||"").localeCompare(a.date||"")}).forEach(x=>{let oi=penalties.indexOf(x),e=document.createElement("div");e.className="card"+(x.collapsed?" collapsed":"");e.innerHTML=`<div class="head"><b>${x.date?df(x.date):"Штраф"}${x.amount!==""?" — "+fmt(num(x.amount))+" тг":""}</b><div class="ra"><button class="white small ptoggle">${x.collapsed?"Развернуть":"Свернуть"}</button><button class="red small pdel">Удалить</button></div></div><div class="summary compact-summary penaltyCompact"><span class="pdate">${x.date?df(x.date):"Дата не указана"}</span><span class="pdetail">${x.amount!==""?fmt(num(x.amount))+" тг":"Сумма не указана"}${x.responsible?" · "+esc(x.responsible):""}</span></div><div class="detail"><div class="g2"><div><label>Дата штрафа</label><input class="pdateinput" type="date" value="${x.date||""}"></div><div><label>Сумма, тг</label><input class="pamount" type="number" step="any" min="0" value="${x.amount||""}"></div><div><label>Ответственный (подписавший)</label><input class="presp" value="${esc(x.responsible||"")}" placeholder="Ф.И.О."></div><div><label>За что штраф</label><input class="preason" value="${esc(x.reason||"")}" placeholder="Краткое описание"></div></div></div>`;b.appendChild(e);e.querySelector(".ptoggle").onclick=()=>{x.collapsed=!x.collapsed;renderPenalties()};e.querySelector(".pdel").onclick=()=>{penalties.splice(oi,1);renderPenalties();update()};e.querySelector(".pdateinput").onchange=v=>{x.date=v.target.value;renderPenalties();update()};e.querySelector(".pamount").oninput=v=>{x.amount=v.target.value;update()};e.querySelector(".presp").oninput=v=>{x.responsible=v.target.value;update()};e.querySelector(".preason").oninput=v=>{x.reason=v.target.value;update()}})}
function addDeadline(x={}){deadlines.push({type:x.type||"",code:x.code||"",start:x.start||"",date:x.date||"",collapsed:false});renderDeadlines();update()}
function renderDeadlines(){let b=$("deadlines");b.innerHTML="";deadlines.forEach((x,i)=>{let e=document.createElement("div");e.className="card"+(x.collapsed?" collapsed":"");e.innerHTML=`<div class="head"><b>Срок ${i+1}</b><div class="ra"><button class="white small toggle">${x.collapsed?"Развернуть":"Свернуть"}</button><button class="red small del">Удалить</button></div></div><div class="summary compact-summary"><span>${esc(x.type||"—")} — ${esc(x.code||"—")} — ${x.start?df(x.start)+" → ":""}${df(x.date)}</span></div><div class="detail"><div class="g2"><div><label>Вид работы</label>${sel(typeNames(),x.type)}</div><div><label>Шифр</label>${sel(codes(),x.code)}</div><div><label>Дата начала</label><input class="dstart" type="date" value="${x.start||""}"></div><div><label>Дата окончания</label><input class="dend" type="date" value="${x.date}"></div></div></div>`;b.appendChild(e);e.querySelector(".toggle").onclick=()=>{x.collapsed=!x.collapsed;renderDeadlines()};e.querySelector(".del").onclick=()=>{deadlines.splice(i,1);renderDeadlines();update()};let ds=e.querySelectorAll("select");ds[0].onchange=v=>{x.type=v.target.value;update()};ds[1].onchange=v=>{x.code=v.target.value;update()};e.querySelector(".dstart").oninput=v=>{x.start=v.target.value;update()};e.querySelector(".dend").oninput=v=>{x.date=v.target.value;update()}})}
function addWorkDay(x={}){workDays.unshift({date:x.date||"",items:x.items||[],collapsed:false});renderWorkDays();update()}
function addWorkItem(di,x={}){workDays.forEach(day=>(day.items||[]).forEach(w=>w.photos=[]));workDays[di].items.push({type:x.type||"",code:x.code||"",name:x.name||"",mark:x.mark||"",axis:x.axis||"",level:x.level||"",qty:x.qty||"",unit:x.unit||"тн",per:x.per||""});renderWorkDays();update()}
function compressPhoto(file){return new Promise((resolve,reject)=>{let fr=new FileReader();fr.onerror=reject;fr.onload=()=>{let im=new Image();im.onerror=reject;im.onload=()=>{let max=1100,scale=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement("canvas");c.width=Math.round(im.width*scale);c.height=Math.round(im.height*scale);c.getContext("2d").drawImage(im,0,0,c.width,c.height);resolve(c.toDataURL("image/jpeg",.68))};im.src=fr.result};fr.readAsDataURL(file)})}
function photoSrc(url){return String(url||"").trim()}
function openReportPhoto(src){let o=document.createElement("div");o.className="photoLightbox";o.innerHTML=`<button class="photoClose">×</button><img src="${src}" alt="Фото выполненных работ">`;o.onclick=e=>{if(e.target===o||e.target.classList.contains("photoClose"))o.remove()};document.body.appendChild(o)}
function renderWorkDays(){let b=$("works");b.innerHTML="";[...workDays].map((d,di)=>({d,di})).sort((a,b)=>{if(!a.d.date&&b.d.date)return -1;if(a.d.date&&!b.d.date)return 1;return (b.d.date||"").localeCompare(a.d.date||"")}).forEach(({d,di})=>{let grouped={};d.items.forEach(x=>{let k=(x.type||"—")+"|||"+(x.code||"—")+"|||"+(x.unit||"");grouped[k]=(grouped[k]||0)+total(x.qty,x.per)});let shortLines=Object.entries(grouped).map(([k,v])=>{let [tp,cd,u]=k.split("|||");return `${esc(tp)} — ${esc(cd)} — ${fmt(v)} ${esc(u)}`}).join("<br>")||"—";let e=document.createElement("div");e.className="card"+(d.collapsed?" collapsed":"");e.innerHTML=`<div class="head"><b>${d.date?df(d.date):"Дата выполнения"}</b><div class="ra"><button class="white small toggle">${d.collapsed?"Развернуть":"Свернуть"}</button><button class="red small del">Удалить</button></div></div><div class="summary compact-summary"><span>${shortLines}</span></div><div class="detail"><label>Дата выполнения</label><input class="daydate" type="date" value="${d.date}"><div class="items"></div><button class="blue small add">+ Добавить работу</button></div>`;b.appendChild(e);e.querySelector(".toggle").onclick=()=>{d.collapsed=!d.collapsed;renderWorkDays()};e.querySelector(".del").onclick=()=>{workDays.splice(di,1);renderWorkDays();update()};e.querySelector(".daydate").oninput=v=>{d.date=v.target.value;update()};e.querySelector(".add").onclick=()=>addWorkItem(di);let ib=e.querySelector(".items");d.items.forEach((x,j)=>{let latestWorkDay=[...workDays].sort((a,b)=>{if(!a.date&&b.date)return -1;if(a.date&&!b.date)return 1;return (b.date||"").localeCompare(a.date||"")})[0];let isLatestWork=(d===latestWorkDay&&j===d.items.length-1);let it=document.createElement("div");it.className="item";it.innerHTML=`<div class="head"><b>Работа ${j+1}</b><div class="ra"><button class="white small copy">Копировать</button><button class="red small rm">Удалить</button></div></div><div class="g3"><div><label>Вид работы</label>${sel(typeNames(),x.type,"— выберите —","workTypeSel")}</div><div><label>Шифр</label><div class="codesel">${sel(codes(),x.code,"— выберите —","workCodeSel")}</div></div><div><label>Наименование</label><input class="name" value="${esc(x.name||'')}"></div><div><label>Марка</label><input class="mark" value="${esc(x.mark)}"></div><div><label>Ось</label><input class="workAxis172" value="${esc(x.axis||'')}" placeholder="А/2 или А/2–В/2"></div><div><label>Отметка</label><input class="workLevel172" value="${esc(x.level||'')}" placeholder="+0.000"></div><div><label>Количество</label><input class="qty" type="number" step="any" value="${x.qty}"></div><div><label>Ед. измерения</label>${unitInput(x.unit,"unit","Другая")}<div class="workCustomUnitWrap" style="margin-top:4px;${x.unit&&!UNITS.includes(x.unit)?"":"display:none"}"><input class="workCustomUnit" value="${x.unit&&!UNITS.includes(x.unit)?esc(x.unit):""}" placeholder="Введите другую ед. измерения"></div></div><div><label>Объём 1 единицы</label><input class="per" type="number" step="any" value="${x.per}"></div><div><label>Общий объём</label><input class="sum" readonly value="${fmt(total(x.qty,x.per))}"></div></div>${isLatestWork?`<div class="photoEditor"><div class="photoEditorHead"><b>Фотографии</b><span>${(x.photos||[]).length}/9</span></div><div class="photoThumbs">${(x.photos||[]).map((p,pi)=>`<div class="photoThumb"><img src="${p}" alt="Фото"><button type="button" class="photoRemove" data-pi="${pi}" title="Удалить фото" aria-label="Удалить фото"><span>🗑</span></button></div>`).join("")}</div><label class="photoAddBtn">Загрузить до 9 фото<input class="photoInput" type="file" accept="image/*" multiple hidden></label><div class="photoHint">Фото можно загружать только к последней добавленной выполненной работе. Новая загрузка заменяет предыдущие.</div></div>`:""}`;ib.appendChild(it);x.photos=Array.isArray(x.photos)?x.photos:[];if(isLatestWork){it.querySelectorAll(".photoRemove").forEach(btn=>btn.onclick=()=>{x.photos.splice(Number(btn.dataset.pi),1);renderWorkDays();update();autoSaveLocal()});let photoInput=it.querySelector(".photoInput");if(photoInput)photoInput.onchange=async ev=>{let files=[...ev.target.files].slice(0,9),fresh=[];for(const f of files){try{fresh.push(await compressPhoto(f))}catch(e){}}x.photos=fresh;renderWorkDays();update();autoSaveLocal()}};it.querySelector(".copy").onclick=()=>{d.items.splice(j+1,0,JSON.parse(JSON.stringify(x)));renderWorkDays();update()};it.querySelector(".rm").onclick=()=>{d.items.splice(j,1);renderWorkDays();update()};it.querySelector(".workTypeSel").onchange=v=>{x.type=v.target.value;update()};it.querySelector(".workCodeSel").onchange=v=>{x.code=v.target.value;let t=tasks.find(q=>q.code===x.code);if(t){x.type=t.type||"";x.unit=t.unit;it.querySelector(".unit").value=x.unit}update()};it.querySelector(".name").oninput=v=>{x.name=v.target.value;update()};it.querySelector(".mark").oninput=v=>{x.mark=v.target.value;update()};it.querySelector(".workAxis172").oninput=v=>{x.axis=v.target.value;update()};it.querySelector(".workLevel172").oninput=v=>{x.level=v.target.value;update()};it.querySelector(".qty").oninput=v=>{x.qty=v.target.value;it.querySelector(".sum").value=fmt(total(x.qty,x.per));update()};it.querySelector(".unit").onchange=v=>{let wrap=it.querySelector(".workCustomUnitWrap"),inp=it.querySelector(".workCustomUnit");if(v.target.value==="__custom__"){wrap.style.display="block";x.unit=inp.value.trim();inp.focus()}else{wrap.style.display="none";x.unit=v.target.value;update()}};it.querySelector(".workCustomUnit").oninput=v=>{x.unit=v.target.value.trim();update()};it.querySelector(".per").oninput=v=>{x.per=v.target.value;it.querySelector(".sum").value=fmt(total(x.qty,x.per));update()}})})}
function addInvoice(x={}){invoices.unshift({date:x.date||"",no:x.no||"",items:x.items||[],collapsed:false});renderInvoices();update()}
function addInvItem(ii,x={}){invoices[ii].items.push({type:x.type||"",code:x.code||"",name:x.name||"",mark:x.mark||"",qty:x.qty||"",unit:x.unit||"тн",per:x.per||"",collapsed:false});renderInvoices();update()}
function renderInvoices(){let b=$("invoices");b.innerHTML="";invoices.forEach((inv,ii)=>{let box=document.createElement("div");box.className="invoice"+(inv.collapsed?" invoiceCollapsed":"");box.innerHTML=`<div class="invoiceTop"><div class="head"><b>${inv.date?df(inv.date):"Накладная"}${inv.no?" — № "+esc(inv.no):""}</b><div class="ra"><button class="white small invtoggle">${inv.collapsed?"Развернуть":"Свернуть"}</button><button class="red small invdel">Удалить накладную</button></div></div><div class="invSummary">${inv.date?df(inv.date):"—"} — № ${esc(inv.no||"—")}<div class="invProjectSummary">${(()=>{let g={};inv.items.forEach(q=>{let c=q.code||"Без шифра",u=q.unit||"";let k=c+"|||"+u;g[k]=(g[k]||0)+total(q.qty,q.per)});return Object.entries(g).map(([k,v])=>{let [c,u]=k.split("|||");return `<div><b>${esc(c)}</b> — ${fmt(v)}${u?" "+esc(u):""}</div>`}).join("")||"—"})()}</div></div><div class="invFields"><div class="g2"><div><label>Дата накладной</label><input class="invdate" type="date" value="${inv.date}"></div><div><label>№ накладной</label><input class="invno" value="${esc(inv.no)}"></div></div></div></div><div class="invoiceBody"><div class="items"></div><button class="blue small add">+ Добавить позицию</button></div>`;b.appendChild(box);box.querySelector(".invtoggle").onclick=()=>{inv.collapsed=!inv.collapsed;renderInvoices()};box.querySelector(".invdate").oninput=v=>{inv.date=v.target.value;update()};box.querySelector(".invno").oninput=v=>{inv.no=v.target.value;update()};box.querySelector(".invdel").onclick=()=>{invoices.splice(ii,1);renderInvoices();update()};box.querySelector(".add").onclick=()=>addInvItem(ii);let ib=box.querySelector(".items");inv.items.forEach((x,j)=>{let it=document.createElement("div");it.className="item"+(x.collapsed?" collapsed":"");it.innerHTML=`<div class="head"><b>Позиция ${j+1}</b><div class="ra"><button class="white small toggle">${x.collapsed?"Развернуть":"Свернуть"}</button><button class="white small copy">Копировать</button><button class="red small rm">Удалить</button></div></div><div class="summary"><span>${esc(x.code||"—")}</span><span>${esc(x.name||"—")}</span><span>${fmt(total(x.qty,x.per))} ${esc(x.unit)}</span></div><div class="detail"><div class="g3"><div><label>Шифр</label>${sel(codes(),x.code,"— выберите —","invCodeSel")}</div><div><label>Наименование</label><input class="iname" value="${esc(x.name||"")}"></div><div><label>Марка</label><input class="imark" value="${esc(x.mark||"")}"></div><div><label>Количество</label><input class="qty" type="number" step="any" value="${x.qty}"></div><div><label>Ед. измерения</label>${unitInput(x.unit)}</div><div><label>Объём 1 единицы</label><input class="per" type="number" step="any" value="${x.per}"></div><div><label>Общий объём</label><input class="sum" readonly value="${fmt(total(x.qty,x.per))}"></div></div></div>`;ib.appendChild(it);it.querySelector(".toggle").onclick=()=>{x.collapsed=!x.collapsed;renderInvoices()};it.querySelector(".copy").onclick=()=>{inv.items.splice(j+1,0,JSON.parse(JSON.stringify(x)));renderInvoices();update()};it.querySelector(".rm").onclick=()=>{inv.items.splice(j,1);renderInvoices();update()};it.querySelector(".invCodeSel").onchange=v=>{x.code=v.target.value;let t=tasks.find(q=>q.code===x.code&&q.type===x.type)||tasks.find(q=>q.code===x.code);if(t){x.unit=t.unit;it.querySelector(".unit").value=x.unit}update()};it.querySelector(".iname").oninput=v=>{x.name=v.target.value;update()};it.querySelector(".imark").oninput=v=>{x.mark=v.target.value;update()};it.querySelector(".qty").oninput=v=>{x.qty=v.target.value;it.querySelector(".sum").value=fmt(total(x.qty,x.per));update()};it.querySelector(".unit").onchange=v=>{x.unit=v.target.value;update()};it.querySelector(".per").oninput=v=>{x.per=v.target.value;it.querySelector(".sum").value=fmt(total(x.qty,x.per));update()}})})}
function addWorker(x={}){workers.push({name:x.name||"",qty:x.qty||1});renderWorkers();update()}
function renderWorkers(){let b=$("workers");b.innerHTML="";workers.forEach((x,i)=>{let e=document.createElement("div");e.className="card";e.innerHTML=`<div class="head"><b>Работники</b><button class="red small">Удалить</button></div><div class="g2"><div><label>Должность / профессия</label><input class="wname" value="${esc(x.name)}" list="workerRoles" placeholder="Введите или выберите предложенную должность"></div><div><label>Количество, чел.</label><input class="wqty" type="number" min="1" step="1" value="${x.qty}"></div></div>`;b.appendChild(e);e.querySelector("button").onclick=()=>{workers.splice(i,1);renderWorkers();update()};e.querySelector(".wname").oninput=v=>{x.name=v.target.value;update()};e.querySelector(".wqty").oninput=v=>{x.qty=v.target.value;update()}})}
function addResponsible(x={}){responsibles.push({role:x.role||"",fio:x.fio||"",collapsed:false});renderResp();update()}
function renderResp(){let b=$("responsibles");b.innerHTML="";responsibles.forEach((x,i)=>{let e=document.createElement("div");e.className="card"+(x.collapsed?" collapsed":"");e.innerHTML=`<div class="head"><b>Ответственное лицо № ${i+1}</b><div class="ra"><button class="white small toggle">${x.collapsed?"Развернуть":"Свернуть"}</button><button class="red small del">Удалить</button></div></div><div class="detail"><div class="g2"><div><label>Должность</label><input class="rrole" value="${esc(x.role)}" list="responsibleRoles" placeholder="Введите или выберите предложенную должность"></div><div><label>ФИО</label><input class="rfio" value="${esc(x.fio)}" placeholder="Введите ФИО"></div></div></div>`;b.appendChild(e);e.querySelector(".toggle").onclick=()=>{x.collapsed=!x.collapsed;renderResp()};e.querySelector(".del").onclick=()=>{responsibles.splice(i,1);renderResp();update()};e.querySelector(".rrole").oninput=v=>{x.role=v.target.value;update()};e.querySelector(".rfio").oninput=v=>{x.fio=v.target.value;update()}})}
function addEquipment(x={}){equipment.push({type:x.type||EQUIP[0],custom:x.custom||"",qty:x.qty||1});renderEquip();update()} function renderEquip(){let b=$("equipment");b.innerHTML="";equipment.forEach((x,i)=>{let e=document.createElement("div");e.className="card";e.innerHTML=`<div class="head"><b>Техника</b><button class="red small">Удалить</button></div><div class="g3"><div><label>Наименование</label><select>${opts(EQUIP,x.type)}</select></div><div><label>Свое наименование</label><input value="${esc(x.custom)}"></div><div><label>Количество</label><input type="number" min="1" value="${x.qty}"></div></div>`;b.appendChild(e);e.querySelector("button").onclick=()=>{equipment.splice(i,1);renderEquip();update()};let a=e.querySelectorAll("select,input");a[0].onchange=v=>{x.type=v.target.value;update()};a[1].oninput=v=>{x.custom=v.target.value;update()};a[2].oninput=v=>{x.qty=v.target.value;update()}})}
function delivered(type,code){
 let z=0;
 invoices.forEach(inv=>(inv.items||[]).forEach(x=>{
   if((x.code||"")===code && (!(x.type||"") || (x.type||"")===type)){
     z+=total(x.qty,x.per)
   }
 }));
 return z
} function done(type,code){return workDays.flatMap(x=>x.items).filter(x=>x.type===type&&x.code===code).reduce((s,x)=>s+total(x.qty,x.per),0)}
function update(){let rReportInfoEl=$("rReportInfo"),rActedEl=$("rActed");rObject.textContent=objectName.value||"Объект";rAddress.textContent=address.value||"";let rClientEl=$("rClient");if(rClientEl)rClientEl.innerHTML=client.value?`<b>Заказчик: ${esc(client.value)}</b>`:"";let progressGroups={};tasks.forEach(t=>{let k=(t.type||"")+"|||"+(t.code||"");if(!progressGroups[k])progressGroups[k]={type:t.type||"",code:t.code||"",volume:0,units:[]};progressGroups[k].volume+=num(t.volume);if(t.unit&&!progressGroups[k].units.includes(t.unit))progressGroups[k].units.push(t.unit)});rProgress.innerHTML=Object.values(progressGroups).map(t=>{let p=t.volume,d=delivered(t.type,t.code),c=done(t.type,t.code),u=t.units.join(", ");return `<tr><td>${esc(t.type||"—")}</td><td>${esc(t.code||"—")}</td><td class="num">${fmt(p)}</td><td class="num">${d?fmt(d):"—"}</td><td class="num">${fmt(c)}</td><td class="num">${fmt(p-c)}</td><td>${esc(u||"—")}</td></tr>`}).join("")||'<tr><td colspan="7">—</td></tr>';
(()=>{
 let valid=workDays.filter(d=>d.date&&d.items&&d.items.length);
 if(!valid.length){rCharts.innerHTML='<span class="muted">Добавьте выполненные работы с датами.</span>';return}
 let lastDate=valid.map(d=>d.date).sort().pop(), ym=(window.dynamicsMonth105||lastDate.slice(0,7));
 let yy=+ym.slice(0,4), mm=+ym.slice(5,7), days=new Date(yy,mm,0).getDate();
 let groups=[...new Map(valid.filter(d=>d.date.slice(0,7)===ym).flatMap(d=>d.items)
   .filter(x=>x.type||x.code)
   .map(x=>[((x.type||"—")+"|||"+(x.code||"—")+"|||"+(x.unit||"")),
     {type:x.type||"—",code:x.code||"—",unit:x.unit||"",daily:{}}])).values()];
 groups.forEach(g=>{
   valid.filter(d=>d.date.slice(0,7)===ym).forEach(d=>{
     let v=(d.items||[]).filter(x=>(x.type||"—")===g.type&&(x.code||"—")===g.code&&(x.unit||"")===g.unit)
       .reduce((z,x)=>z+total(x.qty,x.per),0);
     if(v)g.daily[d.date]=(g.daily[d.date]||0)+v;
   });
 });
 let monthName=new Date(yy,mm-1,1).toLocaleDateString("ru-RU",{month:"long",year:"numeric"});
 rCharts.innerHTML=groups.map((g,gi)=>{
   let chartDays=days;
   try{
     if(reportDate&&reportDate.slice(0,7)===ym){
       chartDays=Math.max(1,Math.min(days,+reportDate.slice(8,10)||days));
     }else{
       let monthWorkDays=valid.filter(d=>d.date.slice(0,7)===ym).map(d=>+d.date.slice(8,10)||0);
       if(monthWorkDays.length)chartDays=Math.max(...monthWorkDays);
     }
   }catch(e){}
   let vals=Array.from({length:chartDays},(_,i)=>{
     let day=i+1,date=ym+"-"+String(day).padStart(2,"0");
     return {day,date,v:g.daily[date]||0};
   }),mx=Math.max(...vals.map(x=>x.v),1);
   return `<div class="chartCard dayChart">
     <div class="chartTitle">${esc(g.type)} · ${esc(g.code)}</div>
     <div class="chartMode">${monthName}${g.unit?" · "+esc(g.unit):""} · до даты отчёта</div>
     <div class="vchart dayVchart">${vals.map((x,i)=>`<div class="vcol dayVcol" title="${String(x.day).padStart(2,"0")}.${String(mm).padStart(2,"0")}.${yy}: ${fmt(x.v)} ${esc(g.unit)}">
       <div class="vval">${x.v?fmt(x.v):""}</div>
       <div class="vbar c${i%6}" style="height:${x.v?Math.max(3,x.v/mx*100):0}%"></div>
       <div class="vlab">${String(x.day).padStart(2,"0")}.${String(mm).padStart(2,"0")}</div>
     </div>`).join("")}</div>
   </div>`;
 }).join("")||'<span class="muted">В выбранном месяце нет выполненных работ.</span>';
 [0,60,180,400].forEach(function(ms){
   setTimeout(function(){
     document.querySelectorAll("#rCharts .dayVchart").forEach(function(el){
       el.scrollLeft=Math.max(0,el.scrollWidth-el.clientWidth);
     });
   },ms);
 });
})();if(rReportInfoEl)rReportInfoEl.innerHTML=`<div class="reportMeta"><div class="reportDateBox"><span>Дата составления</span><b>${reportDate?df(reportDate):"—"}</b></div><div class="weatherBox"><span>Погода</span><div><b>Температура:</b> ${weather.temp!==""?esc(weather.temp)+" °C":"—"} &nbsp; <b>Ветер:</b> ${weather.wind!==""?esc(weather.wind)+" м/с":"—"} &nbsp; <b>Осадки:</b> ${esc(weather.precip||"—")}</div></div></div>${reportPhotos.length?`<h2 class="photoReportTitle226">Фотоотчет</h2><div class="reportPhotos">${reportPhotos.map((p,i)=>`<img src="${photoSrc(p)}" alt="Фото отчёта ${i+1}" onclick="openReportPhoto(this.src)" onerror="this.style.opacity='.25'">`).join("")}</div>`:""}`;if(rActedEl){let valid=actedDays.filter(x=>x.date).slice().sort((a,b)=>{if(!a.date&&b.date)return -1;if(a.date&&!b.date)return 1;return (b.date||"").localeCompare(a.date||"")}),mg={};valid.forEach(x=>{let m=x.date.slice(0,7);(mg[m]||(mg[m]=[])).push(x)});let months=Object.keys(mg).sort().reverse(),latest=months[0]||"";let mn=["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];rActedEl.innerHTML=months.map(m=>{let a=mg[m],yy=+m.slice(0,4),mm=+m.slice(5,7),days=new Date(yy,mm,0).getDate(),title=mn[mm-1]+" "+yy,rows=a.map(x=>`<tr><td>${df(x.date)}</td><td>${esc(x.reason||"—")}</td><td>${x.value!==""?esc(x.value)+(x.reason==="Ветер"?" м/с":x.reason==="Холод"?" °C":""):"—"}</td><td>${x.from||"—"}–${x.to||"—"}</td></tr>`).join("");return `<details class="actedMonth ${m===latest?"latest":""}" ${m===latest?"open":""}><summary><div class="amTitle">${title}</div><div class="amMeta">Актированных дней: <b>${a.length}</b> из ${days} дней в месяце</div></summary><div class="amDetail"><table><thead><tr><th>Дата</th><th>Причина</th><th>Значение</th><th>Время актирования</th></tr></thead><tbody>${rows}</tbody></table></div></details>`}).join("")||'<span class="muted">Актированные дни не добавлены.</span>';}
rDeadlines.innerHTML=deadlines.map(x=>`<tr><td>${esc(x.type||"—")}</td><td>${esc(x.code||"—")}</td><td>${df(x.start)}</td><td>${df(x.date)}</td></tr>`).join("")||'<tr><td colspan="4">—</td></tr>';(()=>{let now=new Date(),today=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;rLag.innerHTML=deadlines.map(dl=>{let t=tasks.find(q=>q.code===dl.code&&(q.type===dl.type||!dl.type))||tasks.find(q=>q.code===dl.code);if(!t||!dl.date||!dl.start)return "";let st=new Date(dl.start+"T12:00:00"),en=new Date(dl.date+"T12:00:00"),td=new Date(today+"T12:00:00");let totalDays=Math.max(1,Math.floor((en-st)/86400000)+1),daily=num(t.volume)/totalDays;let elapsed=td<st?0:td>en?totalDays:Math.floor((td-st)/86400000)+1;let expected=Math.min(num(t.volume),daily*elapsed),actual=done(t.type,t.code),behind=Math.max(0,expected-actual),ahead=Math.max(0,actual-expected),isBehind=behind>0.0001,max=Math.max(num(t.volume),expected,actual,1),pct=Math.min(100,actual/max*100);return `<div class="lagCard"><div class="chartTitle">${esc(t.type||dl.type||"Работа")} · ${esc(dl.code)} · ${df(dl.start)}–${df(dl.date)}</div><div class="lagText">План: ${fmt(num(t.volume))} ${esc(t.unit)} за ${totalDays} календ. дн. = <b>${fmt(daily)} ${esc(t.unit)}/день</b>. На сегодня, ${df(today)}, плановый объём: <b>${fmt(expected)} ${esc(t.unit)}</b>.</div><div class="lagLine"><div class="lagFill ${isBehind?"behind":""}" style="width:${pct}%"></div></div><div class="${isBehind?"behindText":"okText"}">${isBehind?"Отставание: "+fmt(behind)+" "+esc(t.unit):ahead>0?"Опережение: "+fmt(ahead)+" "+esc(t.unit):"По плану"} · Факт: ${fmt(actual)} ${esc(t.unit)}</div></div>`}).join("")})();(()=>{let now=new Date(),today=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;rWorks.innerHTML=[...workDays].filter(d=>d.date&&d.items&&d.items.length).sort((a,b)=>{if(!a.date&&b.date)return -1;if(a.date&&!b.date)return 1;return (b.date||"").localeCompare(a.date||"")}).map(d=>{let groups={};d.items.forEach(x=>{let k=(x.type||"—")+"|||"+(x.code||"—")+"|||"+(x.unit||"");groups[k]=(groups[k]||0)+total(x.qty,x.per)});let summary=Object.entries(groups).map(([k,v])=>{let [tp,cd,u]=k.split("|||");return `<div class="rwLine"><b>${esc(tp)}</b> — ${fmt(v)} ${esc(u)}<br><span class="muted">Проект — ${esc(cd)}</span></div>`}).join("");let rows=d.items.map(x=>`<tr><td>${esc(x.type||"—")}</td><td>${esc(x.name||"—")}</td><td>${esc(x.mark||"—")}</td><td>${esc(x.axis||"—")}</td><td>${esc(x.level||"—")}</td><td class="num">${fmt(num(x.qty))}</td><td>${esc(x.unit)}</td><td class="num">${fmt(num(x.per))}</td><td class="num">${fmt(total(x.qty,x.per))}</td></tr>`).join("");let photos=(d.items||[]).flatMap(x=>(Array.isArray(x.photos)?x.photos:[]).filter(p=>typeof p==="string"&&p).map(p=>({src:p,label:x.type||x.name||"Выполненная работа"})));let latestPhotoDate=[...workDays].map(z=>z.date||"").filter(Boolean).sort().pop()||"";let gallery="";let isToday=d.date===today;return `<details class="reportWorkDay ${isToday?"today":""}" ${isToday?"open":""}><summary><div class="rwDate"><span class="workDayNo">${workDays.filter(q=>q.date&&q.items&&q.items.length).sort((a,b)=>{if(!a.date&&b.date)return -1;if(a.date&&!b.date)return 1;return (b.date||"").localeCompare(a.date||"")}).findIndex(q=>q===d)+1}</span> Дата выполнения: ${df(d.date)}</div>${summary}</summary><div class="rwDetail"><table><thead><tr><th>Вид работ</th><th>Позиция</th><th>Марка / поз.</th><th>Ось</th><th>Отметка</th><th class="num">Кол-во</th><th>Ед. изм.</th><th class="num">Объём ед.</th><th class="num">Итого</th></tr></thead><tbody>${rows}</tbody></table></div></details>${gallery}`}).join("")||'<span class="muted">Выполненные работы не добавлены.</span>'})();let sortedInv=invoices.slice().filter(inv=>inv&&(inv.date||inv.no||(Array.isArray(inv.items)&&inv.items.length))).sort((a,b)=>{if(!a.date&&b.date)return -1;if(a.date&&!b.date)return 1;return (b.date||"").localeCompare(a.date||"")}),latestInv=sortedInv[0]||null;
rInvoices.innerHTML=sortedInv.map(inv=>{inv.items=Array.isArray(inv.items)?inv.items:[];let volGroups={};inv.items.forEach(x=>{let task=tasks.find(t=>t.code===x.code),label=(x.type||(task&&task.type)||x.name||x.code||"Позиция"),u=x.unit||((task&&task.unit)||"");let k=String(label)+"|||"+String(u);volGroups[k]=(volGroups[k]||0)+total(x.qty,x.per)});let volumeText=Object.entries(volGroups).map(([k,v])=>{let parts=String(k).split("|||"),label=parts[0]||"Позиция",u=parts[1]||"";return `<span class="invoiceVol"><b>${esc(String(label))}</b>: ${fmt(v)}${u?" "+esc(String(u)):""}</span>`}).join("");let rows=inv.items.map(x=>`<tr><td>${esc(x.code||"—")}</td><td>${esc(x.name||"—")}</td><td>${esc(x.mark||"—")}</td><td class="num">${fmt(num(x.qty))}</td><td>${esc(x.unit||"—")}</td><td class="num">${fmt(num(x.per))}</td><td class="num">${fmt(total(x.qty,x.per))}</td></tr>`).join(""),isLatest=inv===latestInv;return `<details class="reportInvoice ${isLatest?"latest":""}" ${isLatest?"open":""}><summary><div class="riTitle">Накладная № ${esc(inv.no||"—")}</div><div class="riMeta">Дата: ${df(inv.date)} · Общий объём: ${volumeText||"<b>—</b>"}</div></summary><div class="riDetail"><table><thead><tr><th>Шифр</th><th>Позиция</th><th>Марка / поз.</th><th class="num">Кол-во</th><th>Ед. изм.</th><th class="num">Объём ед.</th><th class="num">Итого</th></tr></thead><tbody>${rows||'<tr><td colspan="7">—</td></tr>'}</tbody></table></div></details>`}).join("")||'<span class="muted">Накладные не добавлены.</span>';rWorkers.innerHTML=workers.filter(x=>x.name).map(x=>`<tr><td>${esc(x.name)}</td><td class="num">${fmt(num(x.qty))} чел.</td></tr>`).join("")||'<tr><td colspan="2">—</td></tr>';let respTotalEl=$("rRespTotal"),workersTotalEl=$("rWorkersTotal"),equipTotalEl=$("rEquipTotal");if(respTotalEl)respTotalEl.textContent="Всего: "+responsibles.filter(x=>x.name||x.role).length+" чел.";if(workersTotalEl)workersTotalEl.textContent="Всего: "+fmt(workers.reduce((z,x)=>z+num(x.qty),0))+" чел.";if(equipTotalEl)equipTotalEl.textContent="Всего: "+fmt(equipment.reduce((z,x)=>z+num(x.qty),0))+" ед.";rResp.innerHTML=responsibles.filter(x=>x.fio).map(x=>`<tr><td><b>${esc(x.role)}</b></td><td>${esc(x.fio)}</td></tr>`).join("")||'<tr><td>—</td></tr>';rEquip.innerHTML=equipment.map(x=>`<tr><td>${esc(x.type==="Другое"?(x.custom||"Другое"):x.type)}</td><td class="num">${fmt(num(x.qty))} шт.</td></tr>`).join("")||'<tr><td>—</td></tr>';let rp=$("rPenalties"),rs=$("rPenaltySummary"),psum=penalties.reduce((z,x)=>z+num(x.amount),0);if(rs)rs.innerHTML=`<div class="penaltyStat"><span>Общая сумма</span><b>${fmt(psum)} тг</b></div><div class="penaltyStat"><span>Количество штрафов</span><b>${penalties.length}</b></div>`;renderWorkCalendar();}
["objectName","address","client"].forEach(id=>$(id).addEventListener("input",update));
function renderDependent(){renderDeadlines();renderWorkDays();renderInvoices()} function renderAllInputs(){renderWorkTypes();renderTasks();renderDependent();renderWorkers();renderResp();renderEquip();renderActedDays();renderPenalties();bindReportInfo();renderWorkCalendar()}
function toggleSection(id,btn){let e=$(id);e.classList.toggle("sectionCollapsed");btn.textContent=e.classList.contains("sectionCollapsed")?"Развернуть":"Свернуть"}
function collectData(){return {version:72,base:{objectName:objectName.value,address:address.value,client:client.value},reportDate,weather,reportPhotos,actedDays,penalties,workTypes,tasks,deadlines,workDays,invoices,workers,responsibles,equipment}}
function applyData(d){objectName.value=d.base?.objectName||"";address.value=d.base?.address||"";client.value=d.base?.client||"";reportDate=d.reportDate||"";weather=d.weather||{location:"",temp:"",wind:"",precip:""};reportPhotos=Array.isArray(d.reportPhotos)?d.reportPhotos:((d.workDays||[]).flatMap(day=>(day.items||[]).flatMap(x=>Array.isArray(x.photos)?x.photos:[])).slice(0,12));actedDays=(d.actedDays||[]).map(x=>({...x,collapsed:true}));penalties=(d.penalties||[]).map(x=>({...x,collapsed:true}));workTypes=d.workTypes||[];tasks=d.tasks||[];deadlines=d.deadlines||[];workDays=(d.workDays||[]).map(day=>({...day,items:(day.items||[]).map(x=>({...x,photos:x.photos||[]}))}));invoices=d.invoices||[];workers=d.workers||[];responsibles=d.responsibles?.length?d.responsibles:[{role:"",fio:"",collapsed:false}];equipment=d.equipment||[];renderAllInputs();update()}
function localData242(){
  const d=collectData();
  d.reportPhotos=[];
  return d;
}
function autoSaveLocal(){
  try{
    localStorage.setItem("atemir_v9",JSON.stringify(localData242()));
  }catch(e){
    try{saveStatus.textContent="Ошибка локального сохранения"}catch(_){}
  }
}
window.addEventListener("beforeunload",autoSaveLocal);
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")autoSaveLocal()});
let saveDirHandle=null;
function saveInteractiveReport(){
 try{
   if(typeof saveLocal==="function")try{saveLocal()}catch(e){}

   const srcReport=document.querySelector(".report");
   const srcNav=document.querySelector("aside.nav188");
   if(!srcReport)throw new Error("Не найден блок отчёта");

   const allowed=["home","progress","works","bom","invoices","people","machines","dynamics","deadlines","acted","penalties"];
   const labels={
     home:"Отчёт",progress:"Сводка объёмов",works:"Выполненные работы",bom:"Ведомость марок",
     invoices:"Поставка",people:"Ответственные / работники",machines:"Машины и механизмы",
     dynamics:"Динамика работ",deadlines:"Сроки выполнения",acted:"Актированные дни",penalties:"Штрафы"
   };

   const report=srcReport.cloneNode(true);
   report.querySelectorAll("button,input,select,textarea,.showMore,.reportToggle").forEach(x=>x.remove());
   report.querySelectorAll(".rsec").forEach(x=>{
     x.style.removeProperty("display");
     x.classList.remove("v188hidden","reportLimitHidden");
   });

   let brandHTML="";
   if(srcNav){
     const brand=srcNav.querySelector(".navBrand207,.navBrand200,.navBrand188,.brand");
     if(brand)brandHTML=brand.outerHTML;
   }

   const menu=allowed.map(v=>`<button type="button" data-view="${v}">${labels[v]}</button>`).join("");

   /* Берём финальные стили текущего отчёта, но НИ ОДНОГО старого скрипта. */
   const styles=[...document.querySelectorAll("style")].map(x=>x.textContent).join("\n");

   const clientScript=`(function(){
     const map={
       home:["reportInfo","progress","peopleMachines","scheme","works","dynamics","deadlines"],
       progress:["progress"],works:["works"],bom:["scheme"],invoices:["invoices"],
       people:["peopleMachines"],machines:["peopleMachines"],dynamics:["dynamics"],
       deadlines:["deadlines"],acted:["acted"],penalties:["penalties"]
     };
     function kind(sec){
       const h=(sec.querySelector("h3")?.textContent||"").toLowerCase();
       if(h.includes("дата отч"))return"reportInfo";
       if(h.includes("сводка"))return"progress";
       if(h.includes("ответствен")||h.includes("работник"))return"peopleMachines";
       if(h.includes("ведомост")||h.includes("статус марок"))return"scheme";
       if(h.includes("выполненн"))return"works";
       if(h.includes("поставк")||h.includes("наклад"))return"invoices";
       if(h.includes("динамик"))return"dynamics";
       if(h.includes("срок"))return"deadlines";
       if(h.includes("актирован"))return"acted";
       if(h.includes("штраф"))return"penalties";
       return"other";
     }
     function show(v){
       const allow=map[v]||map.home;
       document.querySelectorAll(".report .rsec").forEach(sec=>{
         const k=kind(sec);
         sec.style.display=(v==="home"?(allow.includes(k)||k==="other"):allow.includes(k))?"":"none";
       });
       document.querySelectorAll(".cleanNav254 button").forEach(b=>b.classList.toggle("active",b.dataset.view===v));
       window.scrollTo(0,0);
     }
     document.addEventListener("click",e=>{
       const b=e.target.closest(".cleanNav254 button[data-view]");
       if(b)show(b.dataset.view);
     });
     show("home");
   })();`;

   const html=`<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>А-Темир Строй — отчёт</title>

</head><body>
<div class="cleanLayout254">
<aside class="cleanNav254">${brandHTML}<div class="cleanButtons254">${menu}</div></aside>
<main class="cleanMain254">${report.outerHTML}</main>
</div>
<script>${clientScript}<\/script>
</body></html>`;

   const blob=new Blob([html],{type:"text/html;charset=utf-8"});
   const a=document.createElement("a");
   a.href=URL.createObjectURL(blob);
   const d=(typeof reportDate!=="undefined"&&reportDate)||new Date().toISOString().slice(0,10);
   a.download="А-Темир_Строй_отчет_"+d+".html";
   document.body.appendChild(a);a.click();
   setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500);
 }catch(e){alert("Не удалось выгрузить отчёт: "+(e?.message||e))}
}
async function saveAll(){
  const d=collectData(),json=JSON.stringify(d,null,2);
  try{
     localStorage.setItem("atemir_v9",JSON.stringify(localData242()));
     if(window.saveReportPhotos225)window.saveReportPhotos225();
   }catch(e){try{saveStatus.textContent="Ошибка локального сохранения"}catch(_){}}
  const n=new Date(),pad=x=>String(x).padStart(2,"0");
  const fname=`File${n.getFullYear()}-${pad(n.getMonth()+1)}-${pad(n.getDate())}_${pad(n.getHours())}-${pad(n.getMinutes())}-${pad(n.getSeconds())}.json`;
  try{
    if("showDirectoryPicker" in window){
      if(!saveDirHandle) saveDirHandle=await window.showDirectoryPicker({id:"atemir-savefiles",mode:"readwrite"});
      const fh=await saveDirHandle.getFileHandle(fname,{create:true}),w=await fh.createWritable();await w.write(json);await w.close();
      saveStatus.textContent="Сохранено ✓";return;
    }
  }catch(e){if(e.name==="AbortError"){saveStatus.textContent="Сохранение отменено";return}}
  const blob=new Blob([json],{type:"application/json;charset=utf-8"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=fname;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);saveStatus.textContent="Сохранено ✓";
}
function loadAll(){
  try{let raw=localStorage.getItem("atemir_v9");if(!raw)return false;applyData(JSON.parse(raw));saveStatus.textContent="Загружено ✓";return true}catch(e){return false}
}
let autoSaveTimer=null;
document.addEventListener("input",()=>{clearTimeout(autoSaveTimer);autoSaveTimer=setTimeout(autoSaveLocal,250)});
document.addEventListener("change",()=>{clearTimeout(autoSaveTimer);autoSaveTimer=setTimeout(autoSaveLocal,100)});
function loadFromFile(inp){
  const f=inp.files&&inp.files[0];if(!f)return;
  const r=new FileReader();r.onload=()=>{try{const imported=JSON.parse(r.result);
      applyData(imported);
      try{localStorage.setItem("atemir_v9",JSON.stringify(localData242()))}catch(e){}
      if(window.saveReportPhotos225)window.saveReportPhotos225();
      saveStatus.textContent="Загружено и сохранено ✓"}catch(e){alert("Не удалось загрузить файл данных.")}inp.value=""};r.readAsText(f,"utf-8");
}
if(!loadAll()){renderAllInputs();update()}


;


document.addEventListener("DOMContentLoaded", function () {
  [
    ["deadlinesSec","addDeadline"],
    ["worksSec","addWorkDay"],
    ["invoicesSec","addInvoice"],
    ["workersSec","addWorker"],
    ["responsiblesSec","addResponsible"],
    ["equipmentSec","addEquipment"],
    ["actedSec","addActedDay"],
    ["penaltiesSec","addPenalty"]
  ].forEach(function (pair) {
    var sec=document.getElementById(pair[0]);
    if(!sec)return;
    var body=sec.querySelector(".secBody");
    if(!body)return;
    var buttons=sec.getElementsByTagName("button");
    for(var i=0;i<buttons.length;i++){
      var oc=buttons[i].getAttribute("onclick")||"";
      if(oc.indexOf(pair[1])!==-1){
        buttons[i].classList.add("movedAddTop");
        body.insertBefore(buttons[i],body.firstChild);
        break;
      }
    }
  });
});


;


(function(){
 function g82(){
  var box=document.getElementById("rLag");
  if(!box||typeof deadlines==="undefined"||typeof tasks==="undefined"||typeof done!=="function")return;
  var now=new Date(),today=now.getFullYear()+"-"+String(now.getMonth()+1).padStart(2,"0")+"-"+String(now.getDate()).padStart(2,"0");
  box.innerHTML=deadlines.map(function(dl){
   var t=tasks.find(function(q){return q.code===dl.code&&(q.type===dl.type||!dl.type)})||tasks.find(function(q){return q.code===dl.code});
   if(!t||!dl.start||!dl.date)return "";
   var st=new Date(dl.start+"T12:00:00"),en=new Date(dl.date+"T12:00:00"),td=new Date(today+"T12:00:00");
   var days=Math.max(1,Math.floor((en-st)/86400000)+1),elapsed=td<st?0:(td>en?days:Math.floor((td-st)/86400000)+1);
   var pp=Math.max(0,Math.min(100,elapsed/days*100)),vol=num(t.volume),act=done(t.type,t.code),fp=vol?Math.max(0,Math.min(100,act/vol*100)):0,exp=vol*pp/100,delta=act-exp;
   var state=Math.abs(delta)<.0001?"ontime":(delta<0?"behind":"ahead");
   var status=Math.abs(delta)<.0001?"По графику":(delta<0?"Отставание "+fmt(Math.abs(delta))+" "+esc(t.unit||""):"Опережение "+fmt(delta)+" "+esc(t.unit||""));
   return '<div class="g82 '+state+'"><div class="g82h"><div><b>'+esc(t.type||dl.type||"Работа")+'</b><small>'+esc(dl.code||"")+'</small></div><span class="g82s">'+status+'</span></div><div class="g82dates"><span>'+df(dl.start)+'</span><span>Сегодня '+df(today)+'</span><span>'+df(dl.date)+'</span></div><div class="g82track"><div class="g82fact" style="width:'+fp+'%"></div><i class="g82today" style="left:'+pp+'%"></i></div><div class="g82meta"><span><b>План:</b> '+fmt(exp)+' '+esc(t.unit||"")+' · '+Math.round(pp)+'%</span><span><b>Факт:</b> '+fmt(act)+' '+esc(t.unit||"")+' · '+Math.round(fp)+'%</span><span><b>Всего:</b> '+fmt(vol)+' '+esc(t.unit||"")+'</span></div></div>';
  }).join("")||'<span class="muted">Сроки выполнения не добавлены.</span>';
 }
 // Repaint after normal input/change events, after the original handlers have updated the report.
 document.addEventListener("input",function(){setTimeout(g82,0)});
 document.addEventListener("change",function(){setTimeout(g82,0)});
 document.addEventListener("click",function(){setTimeout(g82,0)});
 setTimeout(g82,50);
})();


;


(function(){
 var sections=[
  {id:"rWorks",show:"Показать все выполненные работы",hide:"Скрыть выполненные работы"},
  {id:"rInvoices",show:"Показать все накладные",hide:"Скрыть накладные"},
  {id:"rActed",show:"Показать все актированные дни",hide:"Скрыть актированные дни"}
 ];
 var expanded={};
 function applyLimit(cfg){
  var box=document.getElementById(cfg.id); if(!box)return;
  var old=box.querySelector(":scope > .reportShowAllBtn"); if(old)old.remove();
  var kids=Array.from(box.children).filter(function(el){return !el.classList.contains("reportShowAllBtn")&&(cfg.id!=="rWorks"||el.classList.contains("reportWorkDay"))});
  kids.forEach(function(el){el.classList.remove("reportLimitHidden")});
  var currentView="";
  try{currentView=localStorage.getItem("atemir_view188")||"home"}catch(e){}
  var limit=((currentView==="works"&&cfg.id==="rWorks")||(currentView==="invoices"&&cfg.id==="rInvoices"))?10:3;
  if(kids.length<=limit)return;
  var isOpen=!!expanded[cfg.id];
  if(!isOpen)kids.slice(limit).forEach(function(el){el.classList.add("reportLimitHidden")});
  var btn=document.createElement("button");
  btn.type="button"; btn.className="reportShowAllBtn";
  btn.textContent=isOpen?cfg.hide:(cfg.show+" ("+kids.length+")");
  btn.addEventListener("click",function(e){
   e.stopPropagation();
   expanded[cfg.id]=!expanded[cfg.id];
   applyLimit(cfg);
   if(!expanded[cfg.id]){
    var sec=box.closest(".rsec");
    if(sec)sec.scrollIntoView({behavior:"smooth",block:"start"});
   }
  });
  box.appendChild(btn);
 }
 function applyAll(){sections.forEach(applyLimit)}
 setTimeout(applyAll,80);
 document.addEventListener("input",function(){setTimeout(applyAll,0)});
 document.addEventListener("change",function(){setTimeout(applyAll,0)});
 document.addEventListener("click",function(e){
  if(e.target.closest(".reportShowAllBtn"))return;
  setTimeout(applyAll,0);
 });
})();


;


(function(){
 var expanded=false;
 function applyDynamicsLimit(){
  var box=document.getElementById("rCharts"); if(!box)return;
  var old=box.querySelector(":scope > .dynShowAllBtn"); if(old)old.remove();
  var kids=Array.from(box.children).filter(function(el){return !el.classList.contains("dynShowAllBtn")});
  kids.forEach(function(el){el.classList.remove("dynLimitHidden")});
  if(kids.length<=2)return;
  if(!expanded)kids.slice(2).forEach(function(el){el.classList.add("dynLimitHidden")});
  var btn=document.createElement("button");
  btn.type="button";btn.className="dynShowAllBtn";
  btn.textContent=expanded?"Скрыть динамику":"Показать всю динамику по всем работам ("+kids.length+")";
  btn.addEventListener("click",function(e){
   e.stopPropagation();expanded=!expanded;applyDynamicsLimit();
   if(!expanded){var sec=box.closest(".rsec");if(sec)sec.scrollIntoView({behavior:"smooth",block:"start"})}
  });
  box.appendChild(btn);
 }
 setTimeout(applyDynamicsLimit,100);
 document.addEventListener("input",function(){setTimeout(applyDynamicsLimit,0)});
 document.addEventListener("change",function(){setTimeout(applyDynamicsLimit,0)});
 document.addEventListener("click",function(e){if(e.target.closest(".dynShowAllBtn"))return;setTimeout(applyDynamicsLimit,0)});
})();


;


(function(){
 function exportLabel87(){
  var buttons=Array.from(document.querySelectorAll("button"));
  var b=buttons.find(function(x){
   var oc=x.getAttribute("onclick")||"";
   return oc.indexOf("saveInteractiveReport")!==-1;
  });
  if(!b)return;
  var d="";
  try{
   d=(typeof reportDate!=="undefined"&&reportDate)||"";
   if(!d){var el=document.getElementById("reportDate");if(el)d=el.value||""}
  }catch(e){}
  var shown=d;
  if(d&&/^\d{4}-\d{2}-\d{2}$/.test(d)){
   var p=d.split("-");shown=p[2]+"."+p[1]+"."+p[0];
  }
  b.textContent="Выгрузить отчет за "+(shown||"ДАТА");
 }
 setTimeout(exportLabel87,50);
 document.addEventListener("input",function(e){
  if((e.target&&e.target.id==="reportDate")||e.target&&e.target.type==="date")setTimeout(exportLabel87,0);
 });
 document.addEventListener("change",function(){setTimeout(exportLabel87,0)});
})();


;


(function(){
 function paintInvoiceSection92(){
  var sec=document.getElementById("invoicesSec"); if(!sec)return;
  sec.classList.toggle("sectionOpen92",!sec.classList.contains("sectionCollapsed"));
 }
 setTimeout(paintInvoiceSection92,50);
 document.addEventListener("click",function(e){
  if(e.target.closest("#invoicesSec"))setTimeout(paintInvoiceSection92,0);
 });
})();


;


(function(){
 function paintAllSections93(){
  document.querySelectorAll(".sec").forEach(function(sec){
   sec.classList.toggle("sectionOpen93",!sec.classList.contains("sectionCollapsed"));
  });
 }
 setTimeout(paintAllSections93,60);
 document.addEventListener("click",function(){setTimeout(paintAllSections93,0)});
})();


;


(function(){
 function scrollDynamicsToToday104(){
   document.querySelectorAll(".dayVchart.__disabled104").forEach(function(el){
     el.scrollLeft=el.scrollWidth;
   });
 }
 setTimeout(scrollDynamicsToToday104,120);
 document.addEventListener("input",function(){setTimeout(scrollDynamicsToToday104,0)});
 document.addEventListener("change",function(){setTimeout(scrollDynamicsToToday104,0)});
})();


;


(function(){
 function monthLabel105(ym){
   var p=ym.split("-"),d=new Date(+p[0],+p[1]-1,1);
   var t=d.toLocaleDateString("ru-RU",{month:"long",year:"numeric"});
   return t.charAt(0).toUpperCase()+t.slice(1);
 }
 function activeMonths105(){
   if(typeof workDays==="undefined")return [];
   return [...new Set(workDays.filter(function(d){return d.date&&d.items&&d.items.length}).map(function(d){return d.date.slice(0,7)}))].sort().reverse();
 }
 function renderPicker105(){
   var charts=document.getElementById("rCharts"); if(!charts)return;
   var sec=charts.closest(".rsec"); if(!sec)return;
   var old=sec.querySelector(".dynMonthPicker105"); if(old)old.remove();
   var months=activeMonths105(); if(!months.length)return;
   if(!window.dynamicsMonth105||months.indexOf(window.dynamicsMonth105)<0)window.dynamicsMonth105=months[0];
   var wrap=document.createElement("div");wrap.className="dynMonthPicker105";
   var opts=months.map(function(m){return '<option value="'+m+'" '+(m===window.dynamicsMonth105?'selected':'')+'>'+monthLabel105(m)+'</option>'}).join("");
   wrap.innerHTML='<label>Показать за месяц:</label><select>'+opts+'</select>';
   wrap.querySelector("select").addEventListener("change",function(e){
      window.dynamicsMonth105=e.target.value;
      try{update()}catch(err){}
      setTimeout(function(){renderPicker105();if(window.positionDynamics138)window.positionDynamics138()},0);
   });
   charts.parentNode.insertBefore(wrap,charts);
 }
 setTimeout(renderPicker105,150);
 document.addEventListener("input",function(){setTimeout(renderPicker105,20)});
 document.addEventListener("change",function(e){if(!e.target.closest(".dynMonthPicker105"))setTimeout(renderPicker105,20)});
})();


;


(function(){
 function df106(v){
   if(!v)return "—";
   var p=String(v).split("-");
   return p.length===3?p[2]+"."+p[1]+"."+p[0]:v;
 }
 function updateDateCollapsed106(){
   var heads=document.querySelectorAll(".secHead h2");
   heads.forEach(function(h){
     var sec=h.closest(".sec"); if(!sec)return;
     var dateField=sec.querySelector("#reportDate, input[type='date']");
     if(!dateField || h.textContent.indexOf("Дата отч")!==0)return;
     h.childNodes[0].nodeValue="Дата отчёта ";
     var head=h.closest(".secHead"); if(!head)return;
     var info=head.querySelector(".dateCollapsed106");
     if(!info){
       info=document.createElement("div");
       info.className="dateCollapsed106";
       var btn=head.querySelector("button");
       if(btn)head.insertBefore(info,btn); else head.appendChild(info);
     }
     var el=document.getElementById("reportDate");
     var val=(typeof reportDate!=="undefined"&&reportDate)|| (el&&el.value)||"";
     info.textContent="Дата отчёта — "+df106(val);
     info.style.display=sec.classList.contains("sectionCollapsed")?"block":"none";
   });
 }
 setTimeout(updateDateCollapsed106,100);
 document.addEventListener("input",function(){setTimeout(updateDateCollapsed106,0)});
 document.addEventListener("change",function(){setTimeout(updateDateCollapsed106,0)});
 document.addEventListener("click",function(){setTimeout(updateDateCollapsed106,20)});
})();


;


(function(){
 function n110(v){var x=parseFloat(String(v==null?"":v).replace(",", "."));return isFinite(x)?x:0}
 function f110(v){try{return fmt(v)}catch(e){return (Math.round(v*100)/100).toLocaleString("ru-RU")}}
 function esc110(v){try{return esc(v)}catch(e){return String(v||"")}}
 function paintDeadlineSupply110(){
   var gantt=document.getElementById("rLag");
   if(!gantt || typeof deadlines==="undefined" || typeof invoices==="undefined" || typeof workDays==="undefined")return;
   var old=document.getElementById("deadlineSupply110"); if(old)old.remove();

   var active=(deadlines||[]).filter(function(d){return d.type||d.code});
   if(!active.length)return;

   var rows=active.map(function(d){
     var type=d.type||"", code=d.code||"";
     var task=(typeof tasks!=="undefined"?(tasks||[]):[]).find(function(t){return (t.type||"")===type&&(t.code||"")===code});
     var unit=(task&&task.unit)||d.unit||"";
     var supplied=0,mounted=0,hasSupply=false;

     (invoices||[]).forEach(function(inv){
       (inv.items||[]).forEach(function(x){
         if((x.code||"")===code && (!(x.type||"") || (x.type||"")===type)){
           hasSupply=true;
           var sv=0;
           try{sv=total(x.qty,x.per)}catch(e){}
           if(!sv)sv=n110(x.total||x.volume||x.qty||x.value);
           supplied+=sv;
         }
       });
     });
     if(!hasSupply && task){
       var projectVolume=0;
       try{projectVolume=total(task.qty,task.per)}catch(e){}
       if(!projectVolume){
         projectVolume=n110(task.total||task.volume||task.qty||task.value);
       }
       supplied=projectVolume;
     }
     (workDays||[]).forEach(function(day){
       (day.items||[]).forEach(function(x){
         if((x.type||"")===type&&(x.code||"")===code){
           var mv=0;
           try{mv=total(x.qty,x.per)}catch(e){}
           if(!mv)mv=n110(x.total||x.volume||x.qty||x.value);
           mounted+=mv;
         }
       });
     });
     return {type:type,code:code,unit:unit,supplied:supplied,mounted:mounted,fromProject:!hasSupply};
   });

   var box=document.createElement("div");
   box.id="deadlineSupply110"; box.className="deadlineSupply110";
   box.innerHTML='<div class="dsTitle">Поставка и монтаж на текущую дату</div>'+
     rows.map(function(r){
       var remain=r.supplied-r.mounted;
       return '<div style="margin-top:7px"><div style="font-size:10px;margin-bottom:4px"><b>'+esc110(r.type||"Работа")+'</b>'+
         (r.code?' · '+esc110(r.code):'')+'</div><div class="dsGrid">'+
         '<div class="dsBox"><span>'+(r.fromProject?'Объём по проекту':'Поставлено по накладным')+'</span><b>'+f110(r.supplied)+(r.unit?' '+esc110(r.unit):'')+'</b></div>'+
         '<div class="dsBox"><span>Смонтировано</span><b>'+f110(r.mounted)+(r.unit?' '+esc110(r.unit):'')+'</b></div>'+
         '<div class="dsBox"><span>'+(r.fromProject?'Остаток по проекту':'Остаток поставленного к монтажу')+'</span><b>'+f110(remain)+(r.unit?' '+esc110(r.unit):'')+'</b></div>'+
         '</div></div>';
     }).join("");
   gantt.parentNode.insertBefore(box,gantt);
 }
 setTimeout(paintDeadlineSupply110,180);
 document.addEventListener("input",function(){setTimeout(paintDeadlineSupply110,20)});
 document.addEventListener("change",function(){setTimeout(paintDeadlineSupply110,20)});
 document.addEventListener("click",function(){setTimeout(paintDeadlineSupply110,40)});
})();


;


(function(){
 function toast119(){
   var t=document.getElementById("saveToast119");
   if(!t){
     t=document.createElement("div");
     t.id="saveToast119";t.className="saveToast119";t.textContent="ОТЧЁТ СОХРАНЁН";
     document.body.appendChild(t);
   }
   clearTimeout(window._saveToastTimer119);
   t.classList.add("show");
   window._saveToastTimer119=setTimeout(function(){t.classList.remove("show")},1600);
 }
 function hook119(){
   document.querySelectorAll("button").forEach(function(b){
     var oc=b.getAttribute("onclick")||"";
     var tx=(b.textContent||"").toLowerCase();
     if(b.dataset.toast119)return;
     if(oc.indexOf("saveAll")!==-1 || (tx.indexOf("сохран")!==-1 && oc.indexOf("saveInteractiveReport")===-1)){
       b.dataset.toast119="1";
       b.addEventListener("click",function(){setTimeout(toast119,250)});     }
   });
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",hook119);else hook119();
 document.addEventListener("click",function(){setTimeout(hook119,0)});
})();


;


(function(){
 function showSaveToast120(){
   var t=document.getElementById("saveToast119");
   if(!t){
     t=document.createElement("div");
     t.id="saveToast119";
     t.className="saveToast119";
     t.textContent="ОТЧЁТ СОХРАНЁН";
     document.body.appendChild(t);
   }
   clearTimeout(window._saveToastTimer120);
   t.classList.remove("show");
   void t.offsetWidth;
   t.classList.add("show");
   window._saveToastTimer120=setTimeout(function(){t.classList.remove("show")},1600);
 }
 document.addEventListener("click",function(e){
   var b=e.target.closest&&e.target.closest("button");
   if(!b)return;
   var oc=b.getAttribute("onclick")||"";
   var tx=(b.textContent||"").toLowerCase();
   if(oc.indexOf("saveAll")!==-1 || (tx.indexOf("сохран")!==-1 && oc.indexOf("saveInteractiveReport")===-1)){
     showSaveToast120();
   }
 },true);
})();


;


(function(){
 function esc129(v){return String(v==null?"":v).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
 function build129(){
   var table=document.querySelector(".report .progressTable");
   if(!table)return;
   var old=document.querySelector(".mobileProgress129");
   if(!old){
     old=document.createElement("div");old.className="mobileProgress129";
     table.parentNode.insertBefore(old,table.nextSibling);
   }
   var rows=Array.from(table.querySelectorAll("tbody tr"));
   old.innerHTML=rows.map(function(tr){
     var td=tr.querySelectorAll("td");
     if(td.length<7)return "";
     return '<div class="mpCard129">'+
       '<div class="mpHead129">'+esc129(td[0].textContent.trim())+'</div>'+
       '<div class="mpCode129"><b>Шифр:</b> '+esc129(td[1].textContent.trim())+'</div>'+
       '<div class="mpGrid129">'+
         '<div class="mpCell129"><span class="mpLabel129">ПО ПРОЕКТУ</span><span class="mpValue129">'+esc129(td[2].textContent.trim())+'</span></div>'+
         '<div class="mpCell129"><span class="mpLabel129">ПОСТАВЛЕНО</span><span class="mpValue129">'+esc129(td[3].textContent.trim())+'</span></div>'+
         '<div class="mpCell129"><span class="mpLabel129">СМОНТИРОВАНО</span><span class="mpValue129">'+esc129(td[4].textContent.trim())+'</span></div>'+
         '<div class="mpCell129"><span class="mpLabel129">ОСТАТОК</span><span class="mpValue129">'+esc129(td[5].textContent.trim())+'</span></div>'+
       '</div>'+
       '<div class="mpUnit129">Единица измерения: <b>'+esc129(td[6].textContent.trim())+'</b></div>'+
     '</div>';
   }).join("");
 }
 function schedule129(){setTimeout(build129,20)}
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",schedule129);else schedule129();
 document.addEventListener("input",schedule129);
 document.addEventListener("change",schedule129);
 document.addEventListener("click",schedule129);
})();


;


(function(){
 function mobileGantt130(){
   var g=document.getElementById("rLag"); if(!g)return;
   var old=document.getElementById("mobileGanttHint130");
   if(!old){
     old=document.createElement("div");
     old.id="mobileGanttHint130";
     old.innerHTML="<b>График выполнения сроков</b><span>План / факт на текущую дату</span>";
     g.parentNode.insertBefore(old,g);
   }
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mobileGantt130);
 else mobileGantt130();
})();


;


(function(){
 function dynLatest136(){
   document.querySelectorAll("#rCharts .dayVchart.__disabled136").forEach(function(el){
     el.scrollLeft=Math.max(0,el.scrollWidth-el.clientWidth);
   });
 }
 function run136(){setTimeout(dynLatest136,80);setTimeout(dynLatest136,260)}
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run136);else run136();
 document.addEventListener("change",run136);
})();


;


(function(){
 function positionDynamics138(){
   var ym="";
   try{ym=window.dynamicsMonth105||""}catch(e){}
   var rd="";
   try{rd=reportDate||""}catch(e){}

   document.querySelectorAll("#rCharts .dayVchart").forEach(function(el){
     var cols=Array.from(el.querySelectorAll(".dayVcol"));
     if(!cols.length)return;

     var endIdx=cols.length-1;

     /* For the report month, the right edge is exactly the report date.
        Example: report 21.09 => viewport 15.09–21.09. */
     if(rd && ym && rd.slice(0,7)===ym){
       var day=parseInt(rd.slice(8,10),10);
       if(day>0) endIdx=Math.min(cols.length-1,day-1);
     }else if(ym){
       /* For another selected month, end at the last day that actually has work,
          not automatically at the 30th/31st. */
       var lastWorkDay=0;
       try{
         workDays.forEach(function(d){
           if(d.date && d.date.slice(0,7)===ym && d.items && d.items.length){
             lastWorkDay=Math.max(lastWorkDay,parseInt(d.date.slice(8,10),10)||0);
           }
         });
       }catch(e){}
       if(lastWorkDay)endIdx=Math.min(cols.length-1,lastWorkDay-1);
     }

     var startIdx=Math.max(0,endIdx-6);
     var target=cols[startIdx];
     if(target){
       el.scrollLeft=Math.max(0,target.offsetLeft-el.offsetLeft);
     }
   });
 }
 window.positionDynamics138=positionDynamics138;

 function run138(){
   setTimeout(positionDynamics138,40);
   setTimeout(positionDynamics138,180);
   setTimeout(positionDynamics138,420);
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run138);else run138();

 document.addEventListener("change",function(e){
   if(e.target && (e.target.matches(".dynMonthPicker105 select") || e.target.id==="reportDate")){
     run138();
   }
 });
})();


;


(function(){
 function getYM139(){
   try{
     var p=document.querySelector(".dynMonthPicker105 select");
     if(p&&p.value)return p.value;
   }catch(e){}
   try{if(window.dynamicsMonth105)return window.dynamicsMonth105}catch(e){}
   try{if(reportDate)return reportDate.slice(0,7)}catch(e){}
   return "";
 }
 function position139(){
   var ym=getYM139(), rd="";
   try{rd=reportDate||""}catch(e){}
   document.querySelectorAll("#rCharts .dayVchart").forEach(function(el){
     var cols=Array.from(el.querySelectorAll(".dayVcol"));
     if(!cols.length)return;

     var endIdx=cols.length-1;
     if(rd && ym && rd.slice(0,7)===ym){
       var d=parseInt(rd.slice(8,10),10);
       if(d>0)endIdx=Math.min(cols.length-1,d-1);
     }else{
       var last=0;
       try{
         workDays.forEach(function(w){
           if(w.date&&w.date.slice(0,7)===ym&&(w.items||[]).length){
             last=Math.max(last,parseInt(w.date.slice(8,10),10)||0);
           }
         });
       }catch(e){}
       if(last)endIdx=Math.min(cols.length-1,last-1);
     }

     var startIdx=Math.max(0,endIdx-6);
     var cell=cols[startIdx];
     if(!cell)return;

     /* Direct horizontal scroll; works on phone and desktop. */
     var left=cell.offsetLeft;
     el.scrollLeft=Math.max(0,left-4);
   });
 }
 window.positionDynamics139=position139;

 function run139(){
   [60,180,450,900].forEach(function(ms){setTimeout(position139,ms)});
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run139);else run139();
 window.addEventListener("load",run139);
 window.addEventListener("resize",function(){setTimeout(position139,120)});
 document.addEventListener("change",function(e){
   if(e.target&&(e.target.matches(".dynMonthPicker105 select")||e.target.id==="reportDate"))run139();
 });
})();


;


(function(){
 function num140(v){
   return parseFloat(String(v||"").replace(/\s/g,"").replace(",", "."))||0;
 }
 function fmt140(v){
   if(v>=100)return Math.ceil(v);
   if(v>=10)return Math.ceil(v*10)/10;
   return Math.ceil(v*100)/100;
 }
 function buildScale140(){
   document.querySelectorAll("#rCharts .dayVchart").forEach(function(chart){
     var old=chart.querySelector(".dynScale140"); if(old)old.remove();
     var vals=Array.from(chart.querySelectorAll(".vval")).map(function(x){return num140(x.textContent)});
     var mx=Math.max.apply(null,vals.concat([1]));
     /* Round scale maximum upward so the top line is a clean useful number. */
     var step;
     if(mx<=10)step=2;
     else if(mx<=50)step=10;
     else if(mx<=100)step=20;
     else step=Math.pow(10,Math.floor(Math.log10(mx)));
     var top=Math.ceil(mx/step)*step;
     var q=top/4;

     var scale=document.createElement("div");
     scale.className="dynScale140";
     scale.innerHTML=
       '<div class="dynUnit140">объём</div>'+
       '<span class="s100">'+fmt140(top)+'</span>'+
       '<span class="s75">'+fmt140(top-q)+'</span>'+
       '<span class="s50">'+fmt140(top-2*q)+'</span>'+
       '<span class="s25">'+fmt140(top-3*q)+'</span>'+
       '<span class="s0">0</span>';
     chart.appendChild(scale);
   });
 }
 function run140(){setTimeout(buildScale140,80);setTimeout(buildScale140,300)}
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run140);else run140();
 document.addEventListener("change",run140);
})();


;


(function(){
 function n148(v){return parseFloat(String(v||"").replace(/\s/g,"").replace(",","."))||0}
 function f148(v){
   if(Math.abs(v-Math.round(v))<.001)return String(Math.round(v));
   return String(Math.round(v*10)/10).replace(".",",");
 }
 function build148(root){
   (root||document).querySelectorAll("#rCharts .chartCard.dayChart").forEach(function(card){
     var old=card.querySelector(":scope > .scale148"); if(old)old.remove();
     var vals=Array.from(card.querySelectorAll(".dayVchart .vval")).map(function(x){return n148(x.textContent)});
     var mx=Math.max.apply(null,vals.concat([1]));
     var pow=Math.pow(10,Math.floor(Math.log10(mx)));
     var step=pow;
     if(mx/pow<=2)step=pow/2;
     else if(mx/pow<=5)step=pow;
     else step=pow*2;
     var top=Math.ceil(mx/step)*step, q=top/4;
     var d=document.createElement("div");d.className="scale148";
     d.innerHTML='<b>объём</b><span class="s4">'+f148(top)+'</span><span class="s3">'+f148(top-q)+'</span><span class="s2">'+f148(top/2)+'</span><span class="s1">'+f148(q)+'</span><span class="s0">0</span>';
     card.appendChild(d);
   });
 }
 window.buildScale148=build148;
 function run(){setTimeout(function(){build148(document)},100);setTimeout(function(){build148(document)},350)}
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run);else run();
 document.addEventListener("change",run);
})();


;


(function(){
 function setText150(btn, total, hidden){
   if(!btn)return;
   var base=btn.dataset.base150;
   if(!base){
     base=(btn.textContent||"").trim().replace(/\s*\(\d+(?:\s*\/\s*\d+)?\)\s*$/,"");
     btn.dataset.base150=base;
   }
   var isHide=/скрыть/i.test(btn.textContent||"");
   var label=isHide ? base.replace(/Показать все/i,"Скрыть") : base.replace(/Скрыть/i,"Показать все");
   btn.textContent=label+" ("+total+")";
   if(!isHide && hidden>0) btn.title="Скрыто: "+hidden+" из "+total;
 }
 function update150_DISABLED(root){
   root=root||document;

   var works=root.querySelectorAll("#rWorks .reportWorkWrap, #rWorks .reportWorkDay");
   var wb=root.querySelector("#rWorks .reportShowAllBtn, #rWorks button");
   if(wb && /выполненн/i.test(wb.textContent||"")){
     var unique=root.querySelectorAll("#rWorks .reportWorkWrap").length || root.querySelectorAll("#rWorks .reportWorkDay").length;
     setText150(wb,unique,Math.max(0,unique-3));
   }

   var inv=root.querySelectorAll("#rInvoices details.reportInvoice").length;
   Array.from(root.querySelectorAll("#rInvoices button")).forEach(function(b){
     if(/накладн/i.test(b.textContent||"")) setText150(b,inv,Math.max(0,inv-3));
   });

   var act=root.querySelectorAll("#rActed details.actedMonth").length;
   Array.from(root.querySelectorAll("#rActed button")).forEach(function(b){
     if(/актирован/i.test(b.textContent||"")) setText150(b,act,Math.max(0,act-3));
   });

   var charts=root.querySelectorAll("#rCharts .chartCard, #rCharts .dayDynCard").length;
   Array.from(root.querySelectorAll("#rCharts button")).forEach(function(b){
     if(/график|динамик/i.test(b.textContent||"")) setText150(b,charts,Math.max(0,charts-2));
   });
 }
 window.updateCounters150=function(){};
 function run150(){setTimeout(function(){update150(document)},80);setTimeout(function(){update150(document)},300)}
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run150);else run150();
 document.addEventListener("click",function(){setTimeout(function(){update150(document)},30)});
 document.addEventListener("change",run150);
})();


;


(function(){
 function put151(btn,n){
   if(!btn)return;
   var t=(btn.textContent||"").replace(/\s*\(\d+\)\s*$/,"").trim();
   btn.textContent=t+" ("+n+")";
 }
 function counters151(root){
   root=root||document;
   var wc=0,ic=0,ac=0;
   try{wc=(workDays||[]).filter(function(d){return (d.items||[]).length>0}).length}catch(e){}
   try{ic=(invoices||[]).filter(function(x){return (x.items||[]).length>0}).length}catch(e){}
   try{var m={};(actedDays||[]).forEach(function(x){if(x.date)m[x.date.slice(0,7)]=1});ac=Object.keys(m).length}catch(e){}
   Array.from(root.querySelectorAll("#rWorks button")).forEach(function(b){if(/выполненн/i.test(b.textContent||""))put151(b,wc)});
   Array.from(root.querySelectorAll("#rInvoices button")).forEach(function(b){if(/накладн/i.test(b.textContent||""))put151(b,ic)});
   Array.from(root.querySelectorAll("#rActed button")).forEach(function(b){if(/актирован/i.test(b.textContent||""))put151(b,ac)});
   var cc=root.querySelectorAll("#rCharts .chartCard,#rCharts .dayDynCard").length;
   Array.from(root.querySelectorAll("#rCharts button")).forEach(function(b){if(/график|динамик/i.test(b.textContent||""))put151(b,cc)});
 }
 window.counters151=counters151;
 function run151(){setTimeout(function(){counters151(document)},100);setTimeout(function(){counters151(document)},350)}
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run151);else run151();
 document.addEventListener("click",function(){setTimeout(function(){counters151(document)},50)});
 document.addEventListener("change",run151);
})();


;


(function(){
 const KEY="atemir_scheme155";
 let st={drawingName:"",drawingType:"",drawingData:"",bomName:"",bom:[],filter:"all"};
 try{st=Object.assign(st,JSON.parse(localStorage.getItem(KEY)||"{}"))}catch(e){}
 function save(){try{localStorage.setItem(KEY,JSON.stringify(st))}catch(e){}}
 function norm(v){return String(v||"").trim().toUpperCase().replace(/[–—−]/g,"-").replace(/\s+/g,"").replace(/^K(?=\d)/,"К")}
 function mounted(){
   let m={};
   try{(workDays||[]).forEach(d=>(d.items||[]).forEach(x=>{
     let parts=String(x.mark||"").split(/[,;\/\s]+/).map(norm).filter(Boolean);
     let q=Number(x.qty)||1;
     parts.forEach(z=>{if(z)m[z]=(m[z]||0)+(parts.length>1?1:q)})
   }))}catch(e){}
   return m
 }
 function parseBom(text){
   let rows=[],seen={};
   String(text||"").split(/\r?\n/).forEach(line=>{
     line=line.trim();if(!line)return;
     let p=line.split(/[;\t,]+/).map(x=>x.trim()).filter(Boolean);
     let mark="",qty=1;
     for(let i=0;i<p.length;i++){
       let z=norm(p[i]);
       if(/^[А-ЯA-Z]{0,4}\d+(?:[А-ЯA-Z]+)?(?:-\d+)?$/.test(z)&&!mark)mark=z;
     }
     for(let i=p.length-1;i>=0;i--){
       let n=Number(String(p[i]).replace(",","."));
       if(Number.isFinite(n)&&n>0){qty=n;break}
     }
     if(mark){if(seen[mark])seen[mark].qty+=qty;else{seen[mark]={mark,qty};rows.push(seen[mark])}}
   });
   return rows
 }
 function fileData(file,cb){let r=new FileReader();r.onload=()=>cb(r.result);r.readAsDataURL(file)}
 function render(){
   let sec=document.getElementById("schemeReport155"),dv=document.getElementById("schemeDrawingView155"),bv=document.getElementById("schemeBomView155");
   if(!sec||!dv||!bv)return;
   sec.style.display="";
   let di=document.getElementById("schemeDrawingInfo155"),bi=document.getElementById("schemeBomInfo155");
   if(di){di.textContent=st.drawingName?("Загружено: "+st.drawingName):"Чертёж не загружен";di.classList.toggle("ok",!!st.drawingName)}
   if(bi){bi.textContent=st.bom.length?("Загружено: "+st.bomName+" • позиций: "+st.bom.length):"Ведомость не загружена";bi.classList.toggle("ok",!!st.bom.length)}
   /* v167: вместо просмотра чертежа используется сетка осей */
   let md=mounted(),total=0,done=0;
   st.bom.forEach(x=>{total+=Number(x.qty)||0;done+=Math.min(Number(x.qty)||0,md[x.mark]||0)});
   let left=Math.max(0,total-done),pct=total?Math.round(done/total*100):0;
   let a=document.getElementById("schemeTotal155"),b=document.getElementById("schemeDone155"),c=document.getElementById("schemeLeft155"),p=document.getElementById("schemePct155");
   if(a)a.textContent=total;if(b)b.textContent=done;if(c)c.textContent=left;if(p)p.textContent=total?("• "+pct+"%"):"";
   bv.innerHTML=st.bom.filter(x=>st.filter==="all"||(st.filter==="done"?(md[x.mark]||0)>=x.qty:(md[x.mark]||0)<x.qty)).map(x=>{
     let d=Math.min(x.qty,md[x.mark]||0),ok=d>=x.qty;
     return '<div class="schemePos155 '+(ok?"done":"")+'"><b>'+x.mark+'</b><small>'+d+' / '+x.qty+' шт.'+(ok?" • смонтировано":"")+'</small></div>'
   }).join("")||'<div class="schemeInfo155">Нет позиций для отображения</div>';
   document.querySelectorAll(".schemeFilter155 button").forEach(x=>x.classList.toggle("on",x.dataset.f===st.filter));
 }
 function init(){
   let d=document.getElementById("schemeDrawing155"),b=document.getElementById("schemeBom155"),cl=document.getElementById("schemeClear155");
   if(d)d.onchange=e=>{let f=e.target.files[0];if(!f)return;fileData(f,data=>{st.drawingName=f.name;st.drawingType=f.type||(/\.pdf$/i.test(f.name)?"application/pdf":"image/jpeg");st.drawingData=data;save();render()})};
   if(b)b.onchange=e=>{let f=e.target.files[0];if(!f)return;let r=new FileReader();r.onload=()=>{st.bom=parseBom(r.result);st.bomName=f.name;save();render()};r.readAsText(f,"UTF-8")};
   if(cl)cl.onclick=()=>{if(confirm("Очистить загруженный чертёж и ведомость?")){st={drawingName:"",drawingType:"",drawingData:"",bomName:"",bom:[],filter:"all"};save();render()}};
   document.querySelectorAll(".schemeFilter155 button").forEach(x=>x.onclick=()=>{st.filter=x.dataset.f;save();render()});
   render()
 }
 window.renderScheme155=render;
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
 document.addEventListener("input",e=>{if(e.target&&e.target.classList&&e.target.classList.contains("mark"))setTimeout(render,20)});
 document.addEventListener("change",()=>setTimeout(render,30));
})();


;


(function(){
 const KEY="atemir_project_schedules171";
 let store={};try{store=JSON.parse(localStorage.getItem(KEY)||"{}")}catch(e){}
 let active="";
 function N(v){return String(v||"").trim().toUpperCase().replace(/[–—−]/g,"-").replace(/\s+/g,"").replace(/^K(?=\d)/,"К")}
 function E(v){return String(v||"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))}
 function K(t,c){return String(t||"")+"|||"+String(c||"")}
 function fillSelectors(){
   let t=document.getElementById("schemeWorkType171"),c=document.getElementById("schemeCode171");if(!t||!c)return;
   let types=[...new Set((tasks||[]).map(x=>x.type).filter(Boolean))],ot=t.value;
   t.innerHTML=types.map(x=>'<option>'+E(x)+'</option>').join("");if(types.includes(ot))t.value=ot;
   let codes=[...new Set((tasks||[]).filter(x=>x.type===t.value).map(x=>x.code).filter(Boolean))],oc=c.value;
   c.innerHTML=codes.map(x=>'<option>'+E(x)+'</option>').join("");if(codes.includes(oc))c.value=oc;
 }
 function axisOne(v){
   v=N(v);let m=v.match(/^([А-ЯA-Z]+)[\/\\](\d+)$/);if(m)return{l:m[1],n:m[2]};
   m=v.match(/^(\d+)[\/\\]([А-ЯA-Z]+)$/);return m?{l:m[2],n:m[1]}:null
 }
 function axisPair(v){
   let raw=String(v||"").trim().replace(/[—–−]/g,"-");
   let parts=raw.split(/\s*-\s*/).filter(Boolean);
   if(parts.length>=2)return [axisOne(parts[0]),axisOne(parts[1])];
   return [axisOne(raw),null]
 }
 function parse(text){
   let rows=[];String(text||"").replace(/^\uFEFF/,"").split(/\r?\n/).forEach(ln=>{
     if(!ln.trim())return;let a=(ln.includes(";")?ln.split(";"):ln.includes("\t")?ln.split("\t"):ln.split(",")).map(x=>x.trim());
     if(/марка/i.test(a[0]||""))return;
     let mark=N(a[0]);if(!mark)return;
     /* Accept both new 3-column file and old 6-column file. */
     let type=a[1]||"Элемент",qty=1;
     if(a.length>=6)qty=Number(String(a[5]||"1").replace(",","."))||1;
     else qty=Number(String(a[2]||"1").replace(",","."))||1;
     rows.push({mark,type,qty});
   });return rows
 }
 function works(type,code){
   let out=[];try{(workDays||[]).forEach(d=>(d.items||[]).forEach(x=>{
     if(String(x.type||"")!==String(type)||String(x.code||"")!==String(code)||!x.mark||!x.axis)return;
     let pair=axisPair(x.axis);if(!pair[0])return;
     let marks=String(x.mark||"").split(/[,;\s]+/).map(N).filter(Boolean),q=Math.max(1,Number(x.qty)||1);
     marks.forEach(mark=>out.push({mark,type:x.name||"",a1:pair[0],a2:pair[1],level:x.level||"",qty:q,date:d.date||""}))
   }))}catch(e){}return out
 }
 function save(){localStorage.setItem(KEY,JSON.stringify(store))}
 function badges(){let b=document.getElementById("loadedProjects171");if(b)b.innerHTML=Object.values(store).map(x=>'<span>'+E(x.type)+' · '+E(x.code)+' · '+x.rows.length+' марок</span>').join("")}
 function tabs(){let b=document.getElementById("projectTabs171"),ks=Object.keys(store);if(!b)return;if(!active&&ks.length)active=ks[0];b.innerHTML=ks.map(k=>'<button type="button" data-k="'+E(k)+'" class="'+(k===active?'on':'')+'">'+E(store[k].type)+' · '+E(store[k].code)+'</button>').join("");b.querySelectorAll("button").forEach(x=>x.onclick=function(){active=this.dataset.k;render()})}
 function render(){
   fillSelectors();badges();tabs();let host=document.getElementById("schemeDrawingView155"),cnt=document.getElementById("axisCount167");if(!host)return;let pr=store[active];
   if(!pr){host.innerHTML='<div style="min-height:300px;display:flex;align-items:center;justify-content:center;color:#aebbd0;background:#122342">Загрузите ведомость для нужного шифра проекта</div>';if(cnt)cnt.textContent="Ведомость не загружена";return}
   let wr=works(pr.type,pr.code),allowed=new Set(pr.rows.map(r=>N(r.mark)));wr=wr.filter(x=>allowed.has(N(x.mark)));
   if(!wr.length){host.innerHTML='<div style="min-height:300px;display:flex;align-items:center;justify-content:center;text-align:center;padding:20px;color:#aebbd0;background:#122342">Ведомость загружена.<br>Добавьте во «Выполненные работы» марку, ось и отметку — смонтированные элементы появятся здесь.</div>';if(cnt)cnt.textContent=pr.type+" · "+pr.code+" · пока нет выполненных работ с указанной осью";return}
   let ls=[],ns=[];wr.forEach(r=>[r.a1,r.a2].filter(Boolean).forEach(a=>{if(!ls.includes(a.l))ls.push(a.l);if(!ns.includes(a.n))ns.push(a.n)}));
   const ru="АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЭЮЯ";ls.sort((a,b)=>{let ia=ru.indexOf(a),ib=ru.indexOf(b);return (ia<0?999:ia)-(ib<0?999:ib)});ns.sort((a,b)=>(+a)-(+b));
   let cw=70,ch=58,L=58,T=48,W=L+ls.length*cw+28,H=T+ns.length*ch+34,pos=a=>({x:L+ls.indexOf(a.l)*cw+cw/2,y:T+ns.indexOf(a.n)*ch+ch/2});
   let svg='<svg class="axisSvg171" viewBox="0 0 '+W+' '+H+'" xmlns="http://www.w3.org/2000/svg">';
   ls.forEach((l,i)=>{let x=L+i*cw+cw/2;svg+='<text x="'+x+'" y="27" text-anchor="middle" fill="#b8c3d6" font-size="12">'+E(l)+'</text><line x1="'+x+'" y1="'+T+'" x2="'+x+'" y2="'+(H-16)+'" stroke="#263b60"/>'});
   ns.forEach((n,i)=>{let y=T+i*ch+ch/2;svg+='<text x="28" y="'+(y+4)+'" text-anchor="middle" fill="#b8c3d6" font-size="12">'+E(n)+'</text><line x1="'+L+'" y1="'+y+'" x2="'+(W-16)+'" y2="'+y+'" stroke="#263b60"/>'});
   wr.forEach(r=>{let p1=pos(r.a1),p2=r.a2?pos(r.a2):null,typ=N(r.type),info=(r.type||"Элемент")+" · Ось "+(r.a2?(r.a1.l+"/"+r.a1.n+"–"+r.a2.l+"/"+r.a2.n):(r.a1.l+"/"+r.a1.n))+" · "+(r.level||"отметка не указана")+" · "+r.qty+" шт.";
     if(p2){let cl=/СВ|СВЯЗ/.test(typ)?"axisBrace171":"axisBeam171";svg+='<g class="axisMember171" data-mark="'+E(r.mark)+'" data-info="'+E(info)+'"><line class="'+cl+'" x1="'+p1.x+'" y1="'+p1.y+'" x2="'+p2.x+'" y2="'+p2.y+'"/><text class="axisMemberLabel171" x="'+((p1.x+p2.x)/2)+'" y="'+((p1.y+p2.y)/2-7)+'" text-anchor="middle">'+E(r.mark)+'</text></g>'}
     else svg+='<g class="axisMember171" data-mark="'+E(r.mark)+'" data-info="'+E(info)+'"><rect x="'+(p1.x-12)+'" y="'+(p1.y-12)+'" width="24" height="24" rx="2" fill="#ff7655"/><text class="axisMemberLabel171" x="'+p1.x+'" y="'+(p1.y-17)+'" text-anchor="middle">'+E(r.mark)+'</text></g>';
   });
   svg+='</svg>';host.innerHTML=svg;host.querySelectorAll(".axisMember171").forEach(g=>g.onclick=function(){let t=document.getElementById("axisTip167");if(t)t.innerHTML='<b>'+this.dataset.mark+'</b> · '+this.dataset.info});
   let total=wr.reduce((a,x)=>a+x.qty,0);if(cnt)cnt.textContent=pr.type+" · "+pr.code+" · показано смонтировано: "+total+" шт.";
 }
 function bind(){
   fillSelectors();let t=document.getElementById("schemeWorkType171"),c=document.getElementById("schemeCode171"),f=document.getElementById("schemeSchedule171"),inf=document.getElementById("schemeScheduleInfo171");
   if(t)t.onchange=()=>{fillSelectors();if(t.value&&c.value)active=K(t.value,c.value);render()};if(c)c.onchange=()=>{if(t.value&&c.value)active=K(t.value,c.value);render()};
   if(f)f.onchange=function(){let file=this.files&&this.files[0];if(!file||!t.value||!c.value)return;let rd=new FileReader();rd.onload=()=>{let rows=parse(rd.result);if(!rows.length){inf.textContent="Не удалось прочитать ведомость. Нужны колонки Марка;Тип элемента;Количество.";inf.classList.remove("ok");return}let k=K(t.value,c.value);store[k]={type:t.value,code:c.value,name:file.name,rows};active=k;save();inf.textContent="Загружено: "+file.name+" · "+rows.length+" марок · "+t.value+" · "+c.value;inf.classList.add("ok");render()};rd.readAsText(file,"UTF-8")};
   document.addEventListener("input",e=>{if(e.target&&["mark","workAxis172","workLevel172"].some(z=>e.target.classList&&e.target.classList.contains(z)))setTimeout(render,30)});
   document.addEventListener("change",e=>{if(e.target!==f&&e.target!==t&&e.target!==c)setTimeout(render,30)});render()
 }
 window.renderProjectScheme171=render;if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bind);else bind();
})();


;


(function(){
  function E(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
  function N(s){return String(s||"").trim().toUpperCase().replace(/^K(?=\d)/,"К").replace(/^B(?=\d)/,"В")}
  function n(v){return parseFloat(String(v??"").replace(/\s/g,"").replace(",","."))||0}
  function same(a,b){return String(a||"").trim()===String(b||"").trim()}
  function taskFor(type,code){return (tasks||[]).find(t=>same(t.type,type)&&same(t.code,code))||(tasks||[]).find(t=>same(t.code,code))}
  function normalizeBomRow(r){
    let mark=N(r.mark), name=String(r.name||"").trim(), qty=n(r.qty), w1=n(r.weight1), wt=n(r.weightTotal);
    if(!qty && w1 && wt) qty=Math.round((wt/w1)*1000)/1000;
    if(!wt && qty && w1) wt=qty*w1;
    return {mark,name,qty,weight1:w1,weightTotal:wt}
  }
  function findHeaderIndex(row, names){
    let vals=row.map(v=>String(v||"").toLowerCase().replace(/ё/g,"е").replace(/\s+/g," ").trim());
    for(let i=0;i<vals.length;i++) if(names.some(x=>vals[i].includes(x))) return i;
    return -1;
  }
  function rowsToBom(rows){
    rows=(rows||[]).filter(r=>r.some(v=>String(v||"").trim()));
    let hi=rows.findIndex(r=>r.some(v=>/марка/i.test(String(v||""))));
    if(hi<0) hi=0;
    let h=rows[hi]||[];
    let im=findHeaderIndex(h,["марка"]);
    let iname=findHeaderIndex(h,["наименование"]);
    let iq=findHeaderIndex(h,["кол-во","количество","кол."]);
    let iw1=findHeaderIndex(h,["вес 1","масса 1","вес ед","масса ед","вес, кг 1"]);
    let iwt=findHeaderIndex(h,["общий вес","масса всего","вес всего","всего, кг","вес в кг все"]);
    if(im<0) im=0;
    let out=[];
    for(let k=hi+1;k<rows.length;k++){
      let r=rows[k], mark=N(r[im]); if(!mark || /^(итого|всего)$/i.test(mark)) continue;
      let x=normalizeBomRow({mark,name:iname>=0?r[iname]:"",qty:iq>=0?r[iq]:"",weight1:iw1>=0?r[iw1]:"",weightTotal:iwt>=0?r[iwt]:""});
      if(x.mark && (x.name||x.qty||x.weight1||x.weightTotal)) out.push(x);
    }
    return out;
  }
  function parseDelimited(text){
    text=String(text||"").replace(/^\uFEFF/,"");
    let lines=text.split(/\r?\n/).filter(x=>x.trim());
    let sep=lines.some(x=>x.includes(";"))?";":lines.some(x=>x.includes("\t"))?"\t":",";
    return rowsToBom(lines.map(x=>x.split(sep).map(v=>v.trim().replace(/^"|"$/g,""))));
  }
  async function inflateRaw(u8){
    let ds=new DecompressionStream("deflate-raw");
    let ab=await new Response(new Blob([u8]).stream().pipeThrough(ds)).arrayBuffer();
    return new Uint8Array(ab);
  }
  async function unzipXlsx(ab){
    let u=new Uint8Array(ab), dv=new DataView(ab), sig=0x06054b50, e=-1;
    for(let i=u.length-22;i>=Math.max(0,u.length-65558);i--){if(dv.getUint32(i,true)===sig){e=i;break}}
    if(e<0) throw new Error("ZIP");
    let count=dv.getUint16(e+10,true), cd=dv.getUint32(e+16,true), p=cd, files={};
    for(let z=0;z<count;z++){
      if(dv.getUint32(p,true)!==0x02014b50) break;
      let method=dv.getUint16(p+10,true), cs=dv.getUint32(p+20,true), fn=dv.getUint16(p+28,true), ex=dv.getUint16(p+30,true), cm=dv.getUint16(p+32,true), off=dv.getUint32(p+42,true);
      let name=new TextDecoder().decode(u.slice(p+46,p+46+fn));
      let lfn=dv.getUint16(off+26,true), lex=dv.getUint16(off+28,true), st=off+30+lfn+lex, data=u.slice(st,st+cs);
      if(method===8)data=await inflateRaw(data); else if(method!==0){p+=46+fn+ex+cm;continue}
      files[name]=new TextDecoder("utf-8").decode(data); p+=46+fn+ex+cm;
    }
    return files;
  }
  function xmlText(x){let d=document.createElement("textarea");d.innerHTML=String(x||"").replace(/<[^>]+>/g,"");return d.value}
  async function parseXlsx(file){
    let files=await unzipXlsx(await file.arrayBuffer()), ss=[];
    if(files["xl/sharedStrings.xml"]){
      let doc=new DOMParser().parseFromString(files["xl/sharedStrings.xml"],"application/xml");
      ss=[...doc.querySelectorAll("si")].map(si=>[...si.querySelectorAll("t")].map(t=>t.textContent).join(""));
    }
    let sheet=files["xl/worksheets/sheet1.xml"]||Object.entries(files).find(([k])=>/^xl\/worksheets\/sheet\d+\.xml$/.test(k))?.[1];
    if(!sheet) throw new Error("SHEET");
    let doc=new DOMParser().parseFromString(sheet,"application/xml"), rows=[];
    [...doc.querySelectorAll("row")].forEach(row=>{
      let arr=[];
      [...row.querySelectorAll("c")].forEach(c=>{
        let ref=c.getAttribute("r")||"", col=(ref.match(/[A-Z]+/)||["A"])[0], ci=0;
        for(let ch of col)ci=ci*26+ch.charCodeAt(0)-64;ci--;
        let typ=c.getAttribute("t"), v=c.querySelector("v")?.textContent??"", val=typ==="s"?(ss[+v]??""):typ==="inlineStr"?(c.querySelector("is")?.textContent??""):v;
        arr[ci]=val;
      }); rows.push(arr);
    });
    return rowsToBom(rows);
  }
  async function readBom(file){
    if(/\.xlsx$/i.test(file.name)) return parseXlsx(file);
    return parseDelimited(await file.text());
  }
  function usedQty(type,code,mark,exclude){
    let z=0;(workDays||[]).forEach(d=>(d.items||[]).forEach(x=>{if(x!==exclude&&same(x.type,type)&&same(x.code,code)&&N(x.mark)===N(mark))z+=n(x.qty)}));return z
  }
  function remaining(type,code,mark,exclude){
    let t=taskFor(type,code), r=(t?.bom||[]).find(q=>N(q.mark)===N(mark));return Math.max(0,n(r?.qty)-usedQty(type,code,mark,exclude))
  }
  function unitAndPer(task,row){
    let unit=task?.unit||"тн", w=n(row?.weight1);
    if(unit==="тн") return {unit,per:w/1000};
    if(unit==="кг") return {unit,per:w};
    return {unit,per:w};
  }
  function markOptions(task,x){
    let rows=task?.bom||[];
    return '<option value="">— выберите марку —</option>'+rows.map(r=>{
      let rem=remaining(task.type,task.code,r.mark,x), selected=N(x.mark)===N(r.mark)?" selected":"";
      return '<option value="'+E(r.mark)+'"'+selected+(rem<=0&&!selected?" disabled":"")+'>'+E(r.mark)+' — '+E(r.name||"без наименования")+' · остаток '+fmt(rem)+' шт.</option>'
    }).join("")
  }
  function setFromMark(x, task, mark, card){
    let r=(task?.bom||[]).find(q=>N(q.mark)===N(mark)); if(!r)return;
    x.mark=r.mark;x.name=r.name;let up=unitAndPer(task,r);x.unit=up.unit;x.per=up.per;
    let nm=card.querySelector(".name"),pe=card.querySelector(".per"),un=card.querySelector(".unit"),sm=card.querySelector(".sum");
    if(nm)nm.value=x.name;if(pe)pe.value=x.per;if(un)un.value=x.unit;if(sm)sm.value=fmt(total(x.qty,x.per));
  }
  window.addTask=function(x={}){
    tasks.push({type:x.type||"",code:x.code||"",volume:x.volume||"",unit:x.unit||"тн",date:x.date||"",collapsed:false,
      axisMin:x.axisMin||"",axisMax:x.axisMax||"",levelMin:x.levelMin||"",levelMax:x.levelMax||"",bom:Array.isArray(x.bom)?x.bom:[],bomName:x.bomName||""});
    renderTasks();renderDependent();update()
  };
  window.renderTasks=function(){
    let b=$("tasks");b.innerHTML="";
    tasks.forEach((x,i)=>{
      x.bom=Array.isArray(x.bom)?x.bom:[];
      let e=document.createElement("div");e.className="card"+(x.collapsed?" collapsed":"");
      let totalQty=x.bom.reduce((a,r)=>a+n(r.qty),0), totalW=x.bom.reduce((a,r)=>a+n(r.weightTotal||n(r.qty)*n(r.weight1)),0);
      e.innerHTML=`<div class="head"><b>Задача ${i+1}</b><div class="ra"><button class="white small toggle">${x.collapsed?"Развернуть":"Свернуть"}</button><button class="red small del">Удалить</button></div></div>
      <div class="summary compact-summary"><span>${E(x.type||"—")} — ${E(x.code||"—")} — ${fmt(num(x.volume))} ${E(x.unit||"")}${x.bom.length?" · ведомость "+x.bom.length+" марок":""}</span></div>
      <div class="detail">
       <div class="g3">
        <div><label>Вид работы</label>${sel(typeNames(),x.type)}</div>
        <div><label>Шифр</label><input class="code" value="${E(x.code)}" placeholder="Введите шифр"></div>
        <div><label>Объём по проекту</label><input class="vol" type="number" step="any" value="${x.volume}"></div>
        <div><label>Ед. измерения</label>${unitInput(x.unit)}<div class="customUnitWrap" style="margin-top:4px;${x.unit&&!UNITS.includes(x.unit)?"":"display:none"}"><input class="customUnit" value="${x.unit&&!UNITS.includes(x.unit)?E(x.unit):""}" placeholder="Введите свою ед. измерения"></div></div>
       </div>
       <div class="taskLimits173"><b>Границы монтажной схемы</b><div class="g4" style="margin-top:8px">
        <div><label>Ось от</label><input class="axisMin173" value="${E(x.axisMin)}" placeholder="А/1"></div>
        <div><label>Ось до</label><input class="axisMax173" value="${E(x.axisMax)}" placeholder="П/28"></div>
        <div><label>Мин. отметка</label><input class="levelMin173" value="${E(x.levelMin)}" placeholder="+0.000"></div>
        <div><label>Макс. отметка</label><input class="levelMax173" value="${E(x.levelMax)}" placeholder="+12.000"></div>
       </div></div>
       <div class="taskBom173">
        <div class="taskBomTop173"><b>Ведомость элементов</b><label class="blue small taskBomBtn173">Загрузить ведомость<input class="taskBomFile173" type="file" accept=".xlsx,.csv,.txt,text/csv"></label>${x.bom.length?'<button type="button" class="white small clearBom173">Очистить</button>':""}</div>
        <div class="taskBomHint173">Excel/CSV: <b>Марка | Наименование | Количество | Вес 1 ед. | Общий вес</b>. Допускается ведомость без «Количество» — оно будет рассчитано как «Общий вес ÷ Вес 1 ед.». Для Excel используется первый лист.</div>
        <div class="taskBomStatus173 ${x.bom.length?"ok":""}">${x.bom.length?E(x.bomName||"Ведомость")+" · "+x.bom.length+" марок · "+fmt(totalQty)+" шт. · "+fmt(totalW)+" кг":"Ведомость ещё не загружена"}</div>
       </div>
      </div>`;
      b.appendChild(e);
      e.querySelector(".toggle").onclick=()=>{x.collapsed=!x.collapsed;renderTasks()};
      e.querySelector(".del").onclick=()=>{tasks.splice(i,1);renderTasks();renderDependent();update()};
      let typeSel=e.querySelector(".detail select");typeSel.onchange=v=>{x.type=v.target.value;renderDependent();update()};
      e.querySelector(".code").oninput=v=>{x.code=v.target.value;update()};e.querySelector(".code").onchange=()=>renderDependent();
      e.querySelector(".vol").oninput=v=>{x.volume=v.target.value;update()};
      e.querySelector(".unit").onchange=v=>{let wrap=e.querySelector(".customUnitWrap"),inp=e.querySelector(".customUnit");if(v.target.value==="__custom__"){wrap.style.display="block";x.unit=inp.value.trim();inp.focus()}else{wrap.style.display="none";x.unit=v.target.value;renderDependent();update()}};
      e.querySelector(".customUnit").oninput=v=>{x.unit=v.target.value.trim();update()};
      [[".axisMin173","axisMin"],[".axisMax173","axisMax"],[".levelMin173","levelMin"],[".levelMax173","levelMax"]].forEach(([q,k])=>e.querySelector(q).oninput=v=>{x[k]=v.target.value;update()});
      let fi=e.querySelector(".taskBomFile173");fi.onchange=async ev=>{
        let f=ev.target.files?.[0];if(!f)return;let st=e.querySelector(".taskBomStatus173");st.textContent="Читаю ведомость…";
        try{let bom=await readBom(f);if(!bom.length)throw new Error("EMPTY");x.bom=bom;x.bomName=f.name;st.textContent="Загружено: "+bom.length+" марок";st.classList.add("ok");renderTasks();renderDependent();update();autoSaveLocal?.()}
        catch(err){st.textContent="Не удалось прочитать ведомость. Проверьте заголовки: Марка, Наименование, Количество, Вес 1 ед., Общий вес."}
      };
      let cl=e.querySelector(".clearBom173");if(cl)cl.onclick=()=>{x.bom=[];x.bomName="";renderTasks();renderDependent();update()}
    })
  };
  window.addWorkItem=function(di,x={}){
    workDays.forEach(day=>(day.items||[]).forEach(w=>w.photos=[]));
    workDays[di].items.push({type:x.type||"",code:x.code||"",name:x.name||"",mark:x.mark||"",axis:x.axis||"",level:x.level||"",qty:x.qty||"",unit:x.unit||"тн",per:x.per||"",photos:x.photos||[]});
    renderWorkDays();update()
  };
  window.renderWorkDays=function(){
    let b=$("works");b.innerHTML="";
    [...workDays].map((d,di)=>({d,di})).sort((a,b)=>{if(!a.d.date&&b.d.date)return -1;if(a.d.date&&!b.d.date)return 1;return (b.d.date||"").localeCompare(a.d.date||"")}).forEach(({d,di})=>{
      let grouped={};d.items.forEach(x=>{let k=(x.type||"—")+"|||"+(x.code||"—")+"|||"+(x.unit||"");grouped[k]=(grouped[k]||0)+total(x.qty,x.per)});
      let shortLines=Object.entries(grouped).map(([k,v])=>{let [tp,cd,u]=k.split("|||");return `${E(tp)} — ${E(cd)} — ${fmt(v)} ${E(u)}`}).join("<br>")||"—";
      let e=document.createElement("div");e.className="card"+(d.collapsed?" collapsed":"");
      e.innerHTML=`<div class="head"><b>${d.date?df(d.date):"Дата выполнения"}</b><div class="ra"><button class="white small toggle">${d.collapsed?"Развернуть":"Свернуть"}</button><button class="red small del">Удалить</button></div></div><div class="summary compact-summary"><span>${shortLines}</span></div><div class="detail"><label>Дата выполнения</label><input class="daydate" type="date" value="${d.date}"><div class="items"></div><button class="blue small add">+ Добавить работу</button></div>`;
      b.appendChild(e);e.querySelector(".toggle").onclick=()=>{d.collapsed=!d.collapsed;renderWorkDays()};e.querySelector(".del").onclick=()=>{workDays.splice(di,1);renderWorkDays();update()};e.querySelector(".daydate").oninput=v=>{d.date=v.target.value;update()};e.querySelector(".add").onclick=()=>addWorkItem(di);
      let ib=e.querySelector(".items");
      d.items.forEach((x,j)=>{
        let latestWorkDay=[...workDays].sort((a,b)=>{if(!a.date&&b.date)return -1;if(a.date&&!b.date)return 1;return (b.date||"").localeCompare(a.date||"")})[0],isLatestWork=(d===latestWorkDay&&j===d.items.length-1);
        let task=taskFor(x.type,x.code), rem=x.mark?remaining(x.type,x.code,x.mark,x):0;
        let it=document.createElement("div");it.className="item";
        it.innerHTML=`<div class="head"><b>Работа ${j+1}</b><div class="ra"><button class="white small copy">Копировать</button><button class="red small rm">Удалить</button></div></div>
        <div class="g3">
         <div><label>Вид работы</label>${sel(typeNames(),x.type,"— выберите —","workTypeSel")}</div>
         <div><label>Шифр</label><div class="codesel">${sel((tasks||[]).filter(t=>!x.type||same(t.type,x.type)).map(t=>t.code).filter(Boolean),x.code,"— выберите —","workCodeSel")}</div></div>
         <div><label>Марка</label><select class="workMarkSel173">${task?.bom?.length?markOptions(task,x):'<option value="">Сначала загрузите ведомость в задаче</option>'}</select><div class="remain173">${x.mark?'Остаток по ведомости: <b>'+fmt(rem)+' шт.</b>':"Выберите марку"}</div></div>
         <div><label>Наименование</label><input class="name workAuto173" readonly value="${E(x.name||"")}"></div>
         <div><label>Вес 1 ед.</label><input class="per workAuto173" readonly type="number" step="any" value="${x.per}"></div>
         <div><label>Ед. измерения</label><input class="unitReadonly173 workAuto173" readonly value="${E(x.unit||task?.unit||"")}"></div>
         <div><label>Ось</label><input class="workAxis172" value="${E(x.axis||"")}" placeholder="${E(task?.axisMin||"А/1")} – ${E(task?.axisMax||"П/28")}"></div>
         <div><label>Отметка</label><input class="workLevel172" value="${E(x.level||"")}" placeholder="${E(task?.levelMin||"+0.000")} … ${E(task?.levelMax||"+12.000")}"></div>
         <div><label>Количество <span style="font-weight:400;color:#667">(${x.mark?"остаток "+fmt(rem)+" шт.":"выберите марку"})</span></label><input class="qty" type="number" min="0" step="1" max="${rem+n(x.qty)}" value="${x.qty}"></div>
         <div><label>Общий вес / объём</label><input class="sum workAuto173" readonly value="${fmt(total(x.qty,x.per))}"></div>
        </div>
        ${isLatestWork?`<div class="photoEditor"><div class="photoEditorHead"><b>Фотографии</b><span>${(x.photos||[]).length}/9</span></div><div class="photoThumbs">${(x.photos||[]).map((p,pi)=>`<div class="photoThumb"><img src="${p}" alt="Фото"><button type="button" class="photoRemove" data-pi="${pi}" title="Удалить фото"><span>🗑</span></button></div>`).join("")}</div><label class="photoAddBtn">Загрузить до 9 фото<input class="photoInput" type="file" accept="image/*" multiple hidden></label></div>`:""}`;
        ib.appendChild(it);x.photos=Array.isArray(x.photos)?x.photos:[];
        if(isLatestWork){it.querySelectorAll(".photoRemove").forEach(btn=>btn.onclick=()=>{x.photos.splice(Number(btn.dataset.pi),1);renderWorkDays();update()});let pi=it.querySelector(".photoInput");if(pi)pi.onchange=async ev=>{let fs=[...ev.target.files].slice(0,9),fresh=[];for(const f of fs){try{fresh.push(await compressPhoto(f))}catch(e){}}x.photos=fresh;renderWorkDays();update()}}
        it.querySelector(".copy").onclick=()=>{d.items.splice(j+1,0,JSON.parse(JSON.stringify(x)));renderWorkDays();update()};
        it.querySelector(".rm").onclick=()=>{d.items.splice(j,1);renderWorkDays();update()};
        it.querySelector(".workTypeSel").onchange=v=>{x.type=v.target.value;x.code="";x.mark="";x.name="";x.per="";renderWorkDays();update()};
        it.querySelector(".workCodeSel").onchange=v=>{x.code=v.target.value;let t=taskFor(x.type,x.code);if(t){x.type=t.type||x.type;x.unit=t.unit||x.unit}x.mark="";x.name="";x.per="";renderWorkDays();update()};
        it.querySelector(".workMarkSel173").onchange=v=>{let t=taskFor(x.type,x.code);setFromMark(x,t,v.target.value,it);renderWorkDays();update()};
        it.querySelector(".workAxis172").oninput=v=>{x.axis=v.target.value;update()};
        it.querySelector(".workLevel172").oninput=v=>{x.level=v.target.value;update()};
        it.querySelector(".qty").oninput=v=>{let max=remaining(x.type,x.code,x.mark,x)+n(x.qty),q=Math.min(n(v.target.value),max);x.qty=q;v.target.value=q;it.querySelector(".sum").value=fmt(total(x.qty,x.per));update()}
      })
    })
  };
  function rerenderScheme173(){
    let host=document.getElementById("schemeDrawingView155"), cnt=document.getElementById("axisCount167");if(!host)return;
    let all=[];(workDays||[]).forEach(d=>(d.items||[]).forEach(x=>{if(!x.axis||!x.mark)return;let t=taskFor(x.type,x.code);if(!t?.bom?.some(r=>N(r.mark)===N(x.mark)))return;all.push({...x,date:d.date||""})}));
    if(!all.length){host.innerHTML='<div style="min-height:300px;display:flex;align-items:center;justify-content:center;text-align:center;padding:20px;color:#aebbd0;background:#122342">Загрузите ведомость в задаче, затем в «Выполненных работах» выберите марку и укажите ось.</div>';if(cnt)cnt.textContent="Нет элементов с указанной осью";return}
    let letters=[],nums=[],parseOne=v=>{let m=String(v||"").trim().toUpperCase().match(/^([А-ЯA-Z]+)\s*[\/\\]\s*(\d+)$/);return m?{l:m[1],n:m[2]}:null};
    let parsed=[];all.forEach(x=>{let ps=String(x.axis).replace(/[—–−]/g,"-").split(/\s*-\s*/),a=parseOne(ps[0]),b=parseOne(ps[1]);if(!a)return;[a,b].filter(Boolean).forEach(z=>{if(!letters.includes(z.l))letters.push(z.l);if(!nums.includes(z.n))nums.push(z.n)});parsed.push({x,a,b})});
    const ru="АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЭЮЯ";letters.sort((a,b)=>ru.indexOf(a)-ru.indexOf(b));nums.sort((a,b)=>+a-+b);
    let cw=72,ch=58,L=58,T=46,W=L+letters.length*cw+28,H=T+nums.length*ch+34,pos=a=>({x:L+letters.indexOf(a.l)*cw+cw/2,y:T+nums.indexOf(a.n)*ch+ch/2});
    let svg=`<svg class="axisSvg171" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
    letters.forEach((l,i)=>{let x=L+i*cw+cw/2;svg+=`<text x="${x}" y="26" text-anchor="middle" fill="#b8c3d6" font-size="12">${E(l)}</text><line x1="${x}" y1="${T}" x2="${x}" y2="${H-16}" stroke="#263b60"/>`});
    nums.forEach((q,i)=>{let y=T+i*ch+ch/2;svg+=`<text x="28" y="${y+4}" text-anchor="middle" fill="#b8c3d6" font-size="12">${E(q)}</text><line x1="${L}" y1="${y}" x2="${W-16}" y2="${y}" stroke="#263b60"/>`});
    parsed.forEach(({x,a,b})=>{let p=pos(a);if(b){let q=pos(b);svg+=`<line class="axisBeam171" x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}"/><text class="axisMemberLabel171" x="${(p.x+q.x)/2}" y="${(p.y+q.y)/2-7}" text-anchor="middle">${E(x.mark)}</text>`}else svg+=`<rect x="${p.x-12}" y="${p.y-12}" width="24" height="24" rx="2" fill="#ff7655"/><text class="axisMemberLabel171" x="${p.x}" y="${p.y-17}" text-anchor="middle">${E(x.mark)}</text>`});
    host.innerHTML=svg+"</svg>";if(cnt)cnt.textContent="Показано выполненных элементов: "+parsed.reduce((a,r)=>a+n(r.x.qty),0)+" шт."
  }
  window.renderProjectScheme171=rerenderScheme173;
  let oldUpdate=window.update;window.update=function(){oldUpdate.apply(this,arguments);setTimeout(rerenderScheme173,0)};
  document.addEventListener("DOMContentLoaded",()=>{setTimeout(()=>{renderTasks();renderWorkDays();rerenderScheme173()},50)});
})();


;


(function(){
 let filter182="all", expanded182=false;
 function N182(v){return String(v||"").trim().toUpperCase().replace(/^K(?=\d)/,"К").replace(/\s+/g,"")}
 function num182(v){let x=Number(String(v??"").replace(",","."));return Number.isFinite(x)?x:0}
 function fmt182(v){let x=num182(v);return Number.isInteger(x)?String(x):String(Math.round(x*100)/100).replace(".",",")}
 function esc182(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
 function task182(){
   try{return (tasks||[]).find(t=>Array.isArray(t.bom)&&t.bom.length)||null}catch(e){return null}
 }
 function done182(t,mark){
   let z=0;
   try{(workDays||[]).forEach(d=>(d.items||[]).forEach(x=>{
     if(String(x.type||"")===String(t.type||"")&&String(x.code||"")===String(t.code||"")&&N182(x.mark)===N182(mark))z+=num182(x.qty)
   }))}catch(e){}
   return z
 }
 function render182(){
   let sec=document.getElementById("schemeReport155"), host=document.getElementById("schemeBomView155");
   if(!sec||!host)return;
   let t=task182();
   if(!t){sec.style.display="none";return}
   const activeView182=(document.querySelector(".nav188 button.active[data-view]")||{}).dataset?.view||"home";
   if(activeView182==="home" || activeView182==="bom"){
     sec.style.removeProperty("display");
   }else{
     sec.style.setProperty("display","none","important");
   }
   let rows=(t.bom||[]).map(r=>{
     let q=num182(r.qty),d=Math.min(q,done182(t,r.mark)),state=(q>0&&d>=q)?"done":d>0?"partial":"left";
     return {r,q,d,state}
   });
   let total=rows.reduce((a,x)=>a+x.q,0), done=rows.reduce((a,x)=>a+x.d,0), left=Math.max(0,total-done);
   let A=document.getElementById("schemeTotal155"),B=document.getElementById("schemeDone155"),C=document.getElementById("schemeLeft155"),P=document.getElementById("schemePct155"),cnt=document.getElementById("axisCount167");
   if(A)A.textContent=fmt182(total); if(B)B.textContent=fmt182(done); if(C)C.textContent=fmt182(left); if(P)P.textContent="• "+(total?Math.round(done/total*100):0)+"%";
   if(cnt)cnt.textContent=(t.type||"")+" · "+(t.code||"")+" · "+rows.filter(x=>x.state==="done").length+" выполнено";
   let h=sec.querySelector("h3");if(h)h.childNodes[0].nodeValue="Статус марок по ведомости ";

   document.querySelectorAll("#schemeReport155 .schemeFilter155 button").forEach(b=>{
     b.textContent=b.dataset.f==="all"?"Все":b.dataset.f==="done"?"Смонтированные":"Оставшиеся";
     b.classList.toggle("on",b.dataset.f===filter182);
     b.onclick=e=>{e.preventDefault();filter182=b.dataset.f||"all";expanded182=false;render182()}
   });

   let filtered=rows.filter(x=>filter182==="all" || (filter182==="done"?x.state==="done":x.state!=="done"));
   let limit=window.matchMedia("(max-width:760px)").matches?10:48;
   let visible=(filter182==="all"&&!expanded182)?filtered.slice(0,limit):filtered;
   host.innerHTML=visible.map(x=>{
     let tail=x.state==="done"?" · смонтировано":x.state==="partial"?" · в работе":"";
     return '<div class="bomCard182 '+x.state+'"><b>'+esc182(x.r.mark)+'</b><div class="bomName182">'+esc182(x.r.name||"")+'</div><div class="bomMeta182">'+fmt182(x.d)+' / '+fmt182(x.q)+' шт.'+tail+'</div></div>'
   }).join("");
   if(filter182==="all"&&filtered.length>limit){
     let b=document.createElement("button");b.type="button";b.className="bomMore182";
     b.textContent=expanded182?"Скрыть марки":"Показать все марки";
     b.onclick=e=>{e.preventDefault();expanded182=!expanded182;render182()};
     host.appendChild(b);
   }
 }
 window.renderProjectScheme171=render182;
 window.renderScheme155=render182;
 let oldUpdate182=window.update;
 window.update=function(){oldUpdate182.apply(this,arguments);setTimeout(render182,10)};
 document.addEventListener("DOMContentLoaded",()=>setTimeout(render182,180));
 window.addEventListener("resize",()=>setTimeout(render182,80));
})();


;


(function(){
 const monthNames183=["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
 const dow183=["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];
 function dates183(){
   let set=new Set();
   try{(actedDays||[]).forEach(x=>{
     let d=typeof x==="string"?x:(x.date||x.day||"");
     if(d)set.add(String(d).slice(0,10));
   })}catch(e){}
   return set
 }
 function month183(y,m,set){
   let first=new Date(y,m,1),days=new Date(y,m+1,0).getDate(),start=(first.getDay()+6)%7;
   let h='<div class="calendarMonth183"><div class="calTitle">'+monthNames183[m]+' '+y+'</div><div class="calGrid">';
   dow183.forEach(d=>h+='<div class="calDow">'+d+'</div>');
   for(let i=0;i<start;i++)h+='<div class="calDay empty"></div>';
   for(let d=1;d<=days;d++){
     let iso=y+'-'+String(m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
     h+='<div class="calDay '+(set.has(iso)?'acted':'')+'">'+d+'</div>';
   }
   return h+'</div></div>'
 }
 function calendar183(){
   let host=document.getElementById("actedCalendar")||document.getElementById("rActedCalendar")||document.querySelector(".actedCalendar");
   if(!host)return;
   let rd;
   try{rd=(typeof reportDate!=="undefined"&&reportDate)?new Date(reportDate+"T12:00:00"):new Date()}catch(e){rd=new Date()}
   if(isNaN(rd))rd=new Date();
   let set=dates183(), arr=[];
   /* текущий месяц + два предыдущих, слева направо */
   for(let k=2;k>=0;k--){let d=new Date(rd.getFullYear(),rd.getMonth()-k,1);arr.push(month183(d.getFullYear(),d.getMonth(),set))}
   host.innerHTML='<div class="calendarMonths183">'+arr.join("")+'</div>';
 }
 function cleanTitles183(){
   document.querySelectorAll("#schemeReport155 h1,#schemeReport155 h2,#schemeReport155 h3,#schemeReport155 p,#schemeReport155 div").forEach(el=>{
     let t=(el.textContent||"").trim();
     if(t==="Монтажная схема по ведомости проекта"||t==="Нажмите на квадрат, чтобы увидеть информацию по позиции.")el.style.display="none";
   });
 }
 document.addEventListener("DOMContentLoaded",()=>setTimeout(()=>{cleanTitles183();calendar183()},220));
 document.addEventListener("change",()=>setTimeout(calendar183,80));
 let oldUpdate183=window.update;
 window.update=function(){oldUpdate183.apply(this,arguments);setTimeout(()=>{cleanTitles183();calendar183()},30)};
})();


;


(function(){
 function remove184(){
   let sec=document.getElementById("schemeReport155"); if(!sec)return;
   [...sec.querySelectorAll("*")].forEach(el=>{
     let t=(el.textContent||"").trim();
     if(
       t==="Монтажная схема по ведомости проекта" ||
       t==="Нажмите на квадрат, чтобы увидеть информацию по позиции." ||
       /пока нет выполненных работ с указанной осью/i.test(t)
     ){
       if(!el.querySelector(".statusGrid175") && !el.querySelector("#schemeBomView155")) el.style.display="none";
     }
   });
 }
 document.addEventListener("DOMContentLoaded",()=>setTimeout(remove184,250));
 const mo=new MutationObserver(()=>setTimeout(remove184,0));
 document.addEventListener("DOMContentLoaded",()=>{let s=document.getElementById("schemeReport155");if(s)mo.observe(s,{childList:true,subtree:true,characterData:true})});
})();


;


(function(){
 function hide185(){
   const sec=document.getElementById("schemeReport155"); if(!sec)return;
   sec.querySelectorAll("*").forEach(el=>{
     if(el.children.length) return;
     const t=(el.textContent||"").trim();
     if(/^[^·\n]+·\s*[^·\n]+(?:\s*·.*)?$/.test(t) &&
        (/КМД|КМ|АР|КЖ|ТХ/i.test(t) || /монтаж/i.test(t))){
       el.style.setProperty("display","none","important");
     }
   });
 }
 document.addEventListener("DOMContentLoaded",()=>setTimeout(hide185,250));
 const mo=new MutationObserver(()=>setTimeout(hide185,0));
 document.addEventListener("DOMContentLoaded",()=>{
   const sec=document.getElementById("schemeReport155");
   if(sec)mo.observe(sec,{childList:true,subtree:true,characterData:true});
 });
})();


;


(function(){
  /*
   * ВАЖНО: не чистим массив сроков.
   * Левая часть должна хранить введённые пользователем даты.
   * Старые/лишние графики справа будем убирать только визуально после рендера,
   * когда можно однозначно сопоставить их с текущими задачами.
   */
  window.v187DeadlinesPreserveSource = true;
})();


;


(function(){
 const views188=[
  ["home","⌂","Отчёт"],
  ["manage","⚙","Меню управления"],
  ["progress","▤","Сводка объёмов"],
  ["works","✓","Выполненные работы"],
  ["bom","▦","Ведомость марок"],
  ["invoices","⇩","Поставка"],
  ["people","♙","Ответственные / работники"],
  ["machines","⚒","Машины и механизмы"],
  ["dynamics","↗","Динамика работ"],
  ["deadlines","◷","Сроки выполнения"],
  ["acted","▣","Актированные дни"],
  ["penalties","!","Штрафы"]
 ];
 function titleOf188(sec){let h=sec.querySelector("h3");return h?(h.textContent||"").trim().toLowerCase():""}
 function classify188(sec){
   let t=titleOf188(sec);
   if(sec.querySelector&&sec.querySelector("#rReportInfo"))return"reportInfo";
   if(sec.id==="schemeReport155"||t.includes("статус марок"))return"bom";
   if(t.includes("сводка объ"))return"progress";
   if(t.includes("выполненные работы"))return"works";
   if(t.includes("поставка"))return"invoices";
   if(t.includes("динамика"))return"dynamics";
   if(t.includes("сроки выполнения"))return"deadlines";
   if(t.includes("актированные"))return"acted";
   if(t.includes("штраф"))return"penalties";
   if(sec.classList.contains("peopleMech"))return"peopleMachines";
   return"other";
 }
 function show188(view){
   const lay=document.querySelector(".layout"),panel=document.querySelector(".panel"),preview=document.querySelector(".preview");
   if(!lay||!panel||!preview)return;
   lay.classList.toggle("mode-manage188",view==="manage");
   document.querySelectorAll(".nav188 button").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
   let vt=document.querySelector(".viewTitle188 b"); if(vt){let x=views188.find(v=>v[0]===view);vt.textContent=x?x[2]:"Отчёт"}
   if(view==="manage")return;
   preview.querySelectorAll(".report .rsec").forEach(sec=>{
     let c=classify188(sec),show=false;
     if(view==="home")show=["reportInfo","progress","works","dynamics","deadlines","peopleMachines"].includes(c);
     else if(view==="people")show=c==="peopleMachines";
     else if(view==="machines")show=c==="peopleMachines";
     else show=c===view;
     sec.classList.toggle("v188hidden",!show);
     /* Статус марок разрешён только в общем Отчёте и Ведомости марок */
     if(sec.id==="schemeReport155"){
       if(view==="home" || view==="bom") sec.style.removeProperty("display");
       else sec.style.setProperty("display","none","important");
     }
   });
   try{localStorage.setItem("atemir_view188",view)}catch(e){}
   window.scrollTo({top:0,behavior:"instant"});
 }
 function init188(){
   const lay=document.querySelector(".layout"),panel=document.querySelector(".panel"),preview=document.querySelector(".preview");
   if(!lay||!panel||!preview||document.querySelector(".nav188"))return;
   const nav=document.createElement("aside");nav.className="nav188";
   const brand207=document.createElement("div");brand207.className="navBrand207";
   brand207.innerHTML='<img src="data:image/webp;base64,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" alt="А-Темир Строй">';
   nav.appendChild(brand207);
   nav.innerHTML='<div class="navBrand188"><b>А-Темир Строй</b><span>Накопительный отчёт</span></div>'+
     views188.map(v=>'<button type="button" data-view="'+v[0]+'"><span class="ico188">'+v[1]+'</span><span>'+v[2]+'</span></button>').join("");
   const ws=document.createElement("div");ws.className="workspace188";
   const title=document.createElement("div");title.className="viewTitle188";title.innerHTML='<b>Отчёт</b><span>Просмотр отчёта</span>';
   lay.insertBefore(nav,lay.firstChild);lay.insertBefore(ws,panel);ws.appendChild(title);ws.appendChild(panel);ws.appendChild(preview);
   nav.addEventListener("click",e=>{let b=e.target.closest("button[data-view]");if(b)show188(b.dataset.view)});
   let start="home";try{let x=localStorage.getItem("atemir_view188");if(views188.some(v=>v[0]===x))start=x}catch(e){}
   show188(start);
 }
 document.addEventListener("DOMContentLoaded",()=>setTimeout(init188,180));
})();


;


(function(){
 const labels189={
  home:"Отчёт",manage:"Меню управления",progress:"Сводка объёмов",works:"Выполненные работы",
  bom:"Ведомость марок",invoices:"Поставка по накладным",people:"Ответственные и работники",
  machines:"Машины и механизмы",dynamics:"Динамика выполненных работ",deadlines:"Сроки выполнения",
  acted:"Актированные дни",penalties:"Штрафы"
 };
 function addTop189(){
   if(document.querySelector(".topbar188"))return;
   let t=document.createElement("header");t.className="topbar188";
   t.innerHTML='<div class="topBrand188"><div class="topLogo188">A</div><div><b>А-Темир Строй</b><small>Накопительный отчёт</small></div></div><div class="topMeta188"><b id="topObj189">Отчёт по объекту</b><br><span id="topDate189"></span></div>';
   document.body.insertBefore(t,document.body.firstChild);
 }
 function syncTop189(){
   let obj="";
   for(const id of ["objName","objectName","projectName"]){let e=document.getElementById(id);if(e&&e.value){obj=e.value;break}}
   if(!obj){let e=document.querySelector(".objName,.objectName");if(e)obj=e.value||e.textContent||""}
   let a=document.getElementById("topObj189");if(a)a.textContent=obj||"Накопительный отчёт";
   let d=document.getElementById("topDate189");
   if(d){let e=document.querySelector('input[type="date"]');d.textContent=e&&e.value?e.value:""}
 }
 function current189(){
   let b=document.querySelector(".nav188 button.active");return b?b.dataset.view:"home"
 }
 function postView189(){
   let v=current189();
   document.body.classList.toggle("v189People",v==="people");
   document.body.classList.toggle("v189Machines",v==="machines");
   let title=document.querySelector(".viewTitle188 b");if(title)title.textContent=labels189[v]||"Отчёт";
   let tag=document.querySelector(".viewTitle188 span");if(tag&&v!=="manage")tag.textContent=v==="home"?"Обзор отчёта":"Раздел отчёта";
   syncTop189();
 }
 document.addEventListener("DOMContentLoaded",()=>{
   addTop189();setTimeout(postView189,260);
   document.addEventListener("click",e=>{if(e.target.closest(".nav188 button"))setTimeout(postView189,10)});
   document.addEventListener("change",()=>setTimeout(syncTop189,10));
   document.addEventListener("input",e=>{if(e.target.matches("#objName,#objectName,#projectName,input[type=date]"))syncTop189()});
 });
})();


;


(function(){
 const sections190=[
  ["objectSec","Объект"],["workTypesSec","Виды работ"],["tasksSec","Задачи"],
  ["reportInfoSec","Дата отчёта и погода"],["deadlinesSec","Сроки выполнения"],
  ["worksSec","Выполненные работы"],["invoicesSec","Поставка по накладным"],
  ["workersSec","Работники"],["responsiblesSec","Ответственные лица"],
  ["equipmentSec","Машины и механизмы"],["actedSec","Актированные дни"],["penaltiesSec","Штрафы"]
 ];
 let active190="objectSec";

 function showManage190(id){
   active190=id||active190;
   const panel=document.querySelector(".panel");
   if(!panel)return;
   panel.querySelectorAll(":scope>.sec").forEach(x=>x.classList.toggle("manageActive190",x.id===active190));
   let sec=document.getElementById(active190);
   if(sec){
     sec.classList.remove("sectionCollapsed");
     let body=sec.querySelector(".secBody");if(body)body.style.display="block";
   }
   document.querySelectorAll(".manageSub190 button").forEach(b=>b.classList.toggle("active",b.dataset.sec===active190));
   let name=(sections190.find(x=>x[0]===active190)||[])[1]||"Меню управления";
   let title=document.querySelector(".viewTitle188 b");if(title)title.textContent=name;
   let tag=document.querySelector(".viewTitle188 span");if(tag){tag.textContent="Меню управления";tag.style.fontSize=""}
   try{localStorage.setItem("atemir_manage190",active190)}catch(e){}
 }

 function init190(){
   const nav=document.querySelector(".nav188"),manage=nav&&nav.querySelector('[data-view="manage"]');
   if(!nav||!manage||document.querySelector(".manageSub190"))return;
   manage.innerHTML='<span class="ico188">⚙</span><span>Меню управления</span><span class="manageArrow190">▶</span>';
   const sub=document.createElement("div");sub.className="manageSub190";
   sub.innerHTML=sections190.map(x=>'<button type="button" data-sec="'+x[0]+'">'+x[1]+'</button>').join("");
   manage.insertAdjacentElement("afterend",sub);

   try{let saved=localStorage.getItem("atemir_manage190");if(sections190.some(x=>x[0]===saved))active190=saved}catch(e){}

   manage.addEventListener("click",e=>{
     e.stopPropagation(); e.preventDefault();
     nav.classList.add("manageOpen190");
     /* используем существующий переключатель режима */
     const lay=document.querySelector(".layout");
     if(lay){lay.classList.add("mode-manage188")}
     document.querySelectorAll(".nav188>button[data-view]").forEach(b=>b.classList.toggle("active",b===manage));
     showManage190(active190);
   });

   sub.addEventListener("click",e=>{
     const b=e.target.closest("button[data-sec]");if(!b)return;
     e.stopPropagation();e.preventDefault();
     nav.classList.add("manageOpen190");
     const lay=document.querySelector(".layout");if(lay)lay.classList.add("mode-manage188");
     document.querySelectorAll(".nav188>button[data-view]").forEach(x=>x.classList.toggle("active",x===manage));
     showManage190(b.dataset.sec);
   });

   /* При переходе в обычный просмотр подменю можно оставить раскрытым,
      но панель управления не показывается. */
   nav.addEventListener("click",e=>{
     const b=e.target.closest(":scope>button[data-view]");
     if(b && b.dataset.view!=="manage") setTimeout(()=>{document.body.classList.remove("v190manage")},0);
   });

   if(document.querySelector(".layout.mode-manage188")){
     nav.classList.add("manageOpen190");showManage190(active190);
   }
 }
 document.addEventListener("DOMContentLoaded",()=>setTimeout(init190,320));
})();


;


(function(){
 function init198(){
   const nav=document.querySelector(".nav188"); if(!nav||document.querySelector(".navTools198"))return;
   const tools=document.createElement("div"); tools.className="navTools198";
   tools.innerHTML=
     '<button type="button" data-tool="export"><span class="ico188">⇩</span><span>Выгрузить отчёт</span></button>'+
     '<button type="button" data-tool="print"><span class="ico188">▣</span><span>Печать / PDF</span></button>';
   nav.appendChild(tools);
   tools.addEventListener("click",function(e){
     const b=e.target.closest("button[data-tool]"); if(!b)return;
     if(b.dataset.tool==="export"){ try{saveInteractiveReport()}catch(err){alert("Не удалось выгрузить отчёт: "+err.message)} }
     if(b.dataset.tool==="print")window.print();
   });
 }
 document.addEventListener("DOMContentLoaded",()=>setTimeout(init198,220));
})();


;


(function(){
 const LOGO='data:image/webp;base64,UklGRoxuAABXRUJQVlA4IIBuAAAwXgGdASq8AmMBPkkijkUioiETGi1wKASEsrd9Qkb9vMZXmJHwt60V/tNr/XZ2Yi5fiH+Iz2N/d+Pr6uxzP+fjdbLNPwn+b59/LPj/798Xf3L5+r0LpfMr6av1X+C/Jb5o/9T/pe2P73PcI/Uv9fewX5of19/8n+A95L/jfsx79P7J6gH82/xH/t7GH0Ef3R9Nv9xPhw/q/++/bv2kP/J7AHoAdQv2G/wPpA8uPzP5eedf5L9Y/mv7x+4f+B/+Pwbf6vjL68/8noX/L/wt+7/wP7i/lt83/9bxF+V/+b6hf5B/Qf8h/cv3C/wn7d/Un+B/2PCx2X/P/9D/Pewd7GfVP9b/ef9N/4P858Ln1X/P9Hf4v/U/8X3Av1u/4/5zeup4b/5f/wftV8A39D/wH/I/vH+m/a/6bv6n/xf5v8wPdP+f/4P/rf5P/T/tV9hn8v/rv+8/vn+d//H+f////3+87//+579tv/L7p/7Cf/0vAcRoBDA4jQCGBxGgEMDiNAIYHEaAQwOI0AhgcRoBDAS6wqvpDGXxrN3DWFgOHbXKESsyqwVe5lVgq9zKrBV7mVV4vCMxFCdDwln/qX1aqh75cCrzqq80Up8e47RLKFxLJZo9JJN1SUqoJfFiNVgq9zKrBV7mVWCr3MqsFTP8qJHSdSpy0/q3X6onHCCJsVMv4OT5zdGfHlIJKfpJudDUmRY8O9oVX7i7XHtCUDeG7ma+e65OyJv7rsIlgq9zKrBV7mVWCrvIyJKxIAWHaKvxEVMfb/ZIoi3Si3hjVpcY5viIoTFbFNPlCcP9V/m6UiiJ2KvrzGA4dgIO/9gTrYA7Z5Ti3rpRAoEBMOyqwVe5lVgq9zKrBHnrsmqT+3+UbjSYpOrZWH29M+bCpbBHOQmMyCr01qUWdwq2gZEnbYfgYYmUBaXzowcad/q7ZfPrWfhiulCVDj+0r7Ter0y66v7bHRzh8DdQFXuZVYKvcyqwVe5dD6jPPmgNfCBu6i9nud4AzCJYtmv0Nwr3r6lBNtA04RcwSO7K9srwAFKN/sbpeMmyIiqEE4gEX+Urs0+LBAxL96YMlZLRHW0OVf/Y6hC6M/QR55IzVozRy+ejd8WpMSjUm6ghgcRoBDA4jQCGBw7RJA6HT33lIwItmd9z5gZbAoVaG3IilCpqlXOg6VkdYA5pRatN6CIISNFzZ2HM7eKMYz2VnF5rrA0HvxHeAvcNJMciX7QS/MB9wYfdX2IeykRKzWm/e2jvVblir37AHtYBooQ9/+y8613zVIM7nWwms7MzKrBV7mVWCr3MqrbFXoeoEIJxwd3wNN4OqcEuh4akyQ+oh6hxuuQjxZfr1F3vRZo49QUgk8SQ8HPM1Uo1asxgzafhqdN//cxoAEmfkPfBt57p3xdA0/fGov/6i+wzaRPtD5pnoiJaeDGYPnFCu88fqX3jTcZfonQYECK/DhZFwZsYRLBV7mVWCr3MnFEdf0Np4FZzFZQsftw7fLwO7+czUMjLfGjfGIGo8kcNZe9E7bTkKhGfMec1cHP/+0dWhRdrakqWOtxp2Kx2y8PLjVJwLhm94JrOB4v8NhMtH4J0/Tv6PyO6kdsC1C8P8MpibCd/4r2Gd12HNB9FxJlEqXuuwiWCr3MqsFSNMmJ0NJtBePeEtdsd63M+c9WtVPZb/Hto69P8xXnTw2FzKfLdsExhv0oiuNFNDU/vsEGzgB8dITk2Uld4NSruOEpW6hCyqWrhNdWTBptHzMkuHQn9tzY/+xLo98jFeQwutHg6UHgQrwU1NZoDSYKHbKlPkFBFelueyeN7mVWCowYVhWOX6pkJt0wCxN8eQVUQxZ9t4aMb19LrD2fWOtUw9WzGvJKsGucKgC3DfPfptu+pAsCor/Vusb9EPC+8f9jbkcRsVLWCIhItsc9Pkn5gpoFMxNf3EBdMwbqyuLU4ZjTbED1jOHY9JnncKK2zKWluuyq9zKrBV7aNcidbEiLKSofK8dtFlV2QS0d8cH4f5T80tC0076gNxTj6Bh1dX2yQSR61fiFjtR6l/RNwUs3YYOf35CN/yp1mq1JF5zh/Sl6KUQPf3jcSj+fpwP9W1EgQx8/3Fk4IRfyZnkMXt1V2UQjbQNvNAvsFYfow3SvuzCXDFz1xL59FfG83bFH0gqoFWsLq6iYPzBVmVWCr3MqrxeEZvLBVoAAzahnw1NvfcKOkX8mFepZZiBwnMzduHpMlOp9Ln+6B9077m1Tl+1hRW/8fOCIZ8+bmE4f3GvG1QT03kw9GovwhxgO4Ar/no/vj8c6yaSSXOtoBOgRSh78q2TRFtDTsEQTnggtRrPDkYi0YFT97q97F19/Kp1Z2AesEIYFVsqvcyqwRu1rblUEYAL7Q4uUmI6ylCqLXGlCehLir1Tuax4RpiK+G9yD81TAZcYED57+85UZvXjC6TEfUpfeIGr8sRAq7z64ZzhzOQmqpuMbrMEUmUiVEDCfUJrJRCK9r+ar3N7ePNvml74REoFkXr8w1ogGx7xWKFjdlLMtjeKzKrBV7Z6RXAc72tkkfuK3LR/WOuYdMRJVBM7UcQmRUneo+DiCpVjuWdncXPsoqNmDBJrHNBj6dOIMpsburRYJENDAIRpQCGdfvL0ZOY3r4Bh7GWZQUtzHKrcxMajjVxQk8MqKDONsQtlVz8ry4ZR5Ctw9YDbASpM6BzapnGyHaXFGKsFXuZU8i28y4ZooRCVWFvkIiORKgxORGejoR8pSP6wSnoYh/alh2/WiVLzzuE+v/eItIld/JBFYlaokobjdrssLU0QxAfG2SCaqrncezKRxC3IUc6Ra5PMTUqXzzlW1u0LKR5NxfsX/abJLev2w8UpijRwOBF5iOPh2hMlgg77eaessTEd8xrplB9LddgaxP/+6NLV2tNIUJJF81XQeov/v4xao5tuoYB5JXQ/Vlchmrd9eainZXPzfTJwXfGj0o1Wrfx7dX0oNhJRbYnVQGrpNA0l4EMh5XAcC/A+IzrTR32YMf8sxDYkBEZkD859Z9kkR16aUVplV0/q8njAt3PqUP71y49FSCWIQ008+uyfXnCOuwAXS8ryslsPXNSMog0PasAy/nUAeeKn1ChTv2dfWF5Rrqg+G3engEWTstQNqgDh9SVwKY1F2gbOiiKjiocpp1KDYgspjciZNQXAzGxXzo4ZGVsb1IVnNluQC1YKW/SBOICBDYs6xHYN8nNhtyzxx5TtrmU3lE/4LP2nGIgekvZcgpIaJIWyONZR2uKwZcy3SYQtIsmgIqggdnAHuqMCUxxWc2xUfHGVrQFLGekMrEDuQqCM/hOaV2a/KTyBca9ZB2B4h39cPFd2dw0POPV0KjpP5+rRPlOx6FXrx9CQaGcxU21bM95C2S6bRuoQhYv4c/y4apeTc1B0Y8b3LogOqpHGQPinzVOSZdre40Fok7M/aF+u7T/ewhcs0IOjuxpw7c1VBLNdUdzwmdEriK+efn2l9noE6G4vcArwlOm7QA88AHCm35uLMfgHNwC07NUnRhMRdt7TfFWlxsWngNbXj6v0NUpM3b5Lw+hBOT0sNG5xx/jQcW+0o/11wiOtIVSYnk0oWNfmabAr8v9Xa15hDA4jB94aOEzJvdWz6sOo9ibmR+7sGGC/snXMoKWC7yPDxQAxhQdniTckWZuJTIYydtc59i/d/RcG0cVTdjL+Ufl1x2+5H9gKp6ByUaTU/1uzzZ57hYm2CGFIOI0ALEQ+CPzzINqAjmTiPp9NfeWgEMRUXFG2KCvS3OwAD+/5lgAAAAAAAAbHHQEZSelxwJJiK6NMbRgn8qCsep6+FY+BWsl2jKNkhl9GnGBablwvFA280UnkRdJOaScdV4PsOZulpPgilFdHZZJ32ZDhiqvTcSB6qvT4Rxu6DE7HLSLmBTZFQw/s0a7e7NPhs39/FvnWWrF7vDgyvI8DjAqhAZqcUtPaduLmbRvvKr1NuqSbjyPnM8gLhVnnL70sWwnurvkhV1Oq+B+W7SAroGPAAAAAXlDymDjCSSKg40uFtOHYIXp5YQgR1mkNPIgq+FW8UIR17pzcNol3ojhCQ3lyQS5uGnPIXiCDHWttZI9jWsJlHLIAhl5ZnSswIHeIhIVZVDfgsaJ6EIBaKfFN2JyB6LN4CaPk1U4GFxtPs5zkNkaMgzu9HW7YQKixy3G+aOEWDAOE6AvXpE3LTo2Ai5PDOgfpNP04A0vsm+r6zB4N27NOiYFYYZygQOPtw9YVl5m9vLRiA92gfs03P8QqaZ8ODbG4xeS914qjzXMvDFycK0McjmJnpTYzlXlLCmnasxplulX+2ciFdgYR8YWNrQmQnz0YuA85VWgiGjejrIPzSvvBRlTVNUm36hR3LVl6JUjK9oZpKfQOxiGQzcqtVnvmshYZVldfnlZle7B9McR1Fz18nXT2GpVFL3tbwNjrdklYRjgWdu2uzCb+50r6kiSjl0IdvrF+qfmBZWC04hL+Xu2V1dSxDCa/ejNJkwwgmLbM9zPCTEtPYiy+KvMnXWKAAAABUzIyTW5YzdfNkMC+1Gmm7maNFK6BbFdOQcMlnZ6hticBCCNcSu2RItHd/D9OiCjCTJugjqB3YFawbeOwCOn/OM5UOkc0tEqd1LXMi0TA+q6+OTu8ZVzsG0+jJmsfkqDFk4/uyqQ2EA/F6q55mkYdZwfNVwMMze3VdTLNi+Wh4tfTdoHDqPyrHad9NZbnv33duKX+B30j148djzbV2EyxSoIebc49J0OWAuevxtDg/8MuOQc5kboL72wx03cVUvScI2dP1tEYuGj3UZmSMCqQgRB6qQaJ9XL9svHBSb5E5fGhSqYtviTmsd2mR0OHyLHf4gGeIm4rBM3zGfO4juHVDCiOA2S7jtRx9/J54cyf+qVffW2tjtbOKNTccdHUOVZMh0IsF0MvrfgHBCUzPombiKV9jwYnWlWLyDeSRWXj8AOUKNKwcMBPGFMz9mBaob7lEPxYU9zZNKKqJg11XOXimNfuDSSms2ePtWdE7j1Atx7esPlOM7iGCxa6xYzGAWBrZRBMcK4C6yUREvvrJnODUCOa21Oqz0EpHWLxYZcVUq98FrQqCmCiFogesgh1gXcOtctHUEJnpIOvGnR/tsbxCxu6dT094Tc2QEO+4FyBqu/dq9AtLD0ojQJ+SxPcuufgQB5ff8plFedsiqMN6rQJibeujwquAZsXafHOPZHuzO+Bc+8Phul/i2sgGfz+MUWWjYtmD01TlF/AB7lDcPqPvbkZfUXhsSWhYaIjA3lyYqtXPoHycYJBdnbwNzXQdLRzoKGVWYFW3SoHe7L8UtdVxC/oXCkFl8VFqQAAALvstt4d/E8+ZUmCtqtt+2nY8Ucit+WsmV+qVMC+3U4v/EEQ0dSzd61qz5MUiL2OPmx3o3dsvAVjxE0MT8SBU8b88ZXA0ZE/A0SbnW15c+AhvbM2cCo6tTJrv7Xiqv4aU5Id7p1jF1dAfGmx5ly1I+OOsrw1iVeZI6HFpFRB3JfGICEFj/yRDlg0D7p9/IUv8iHC3jfr6crV8z6h6gfIKXytiRo4WiF8YcC9A4Vt7kexlyula4TBr6FxYrXjwrYJFN7uaCS/oXT/9pslYzMDcjIUhkc9GWorzGoLj6e7yqbeRhHN1AaBjKrK2eoKv+f/bgG7R/luLtlEY3fQOUuU9I6lrn/XZZLoWXZEGT0nXBJeUAbP8H/wHk+kykGBHCL8HjGHuQg5Ew9siN45BaK4jqT8KtDLic1y7qn+W/jUpslsXBbAFgprwuUisQKg09SX00ccivCT66Jljl2uh9rjsvrSfYjGfCn4BqMty9CJFC/oxzsIioFTZNhoEvoSHiNEVXXEJZiYdTaJ6koz6kujA3esfT1pgvdmVlIHENx6QHzcLa7ZeZLj6g+W7Beb8hJpKr/uHpH4LRknIiNdTJw1eDbYJ+CmSqPrLqSkOUpQ2hIi7YglKss11Mwyx1frYtDsRwhdirz93M/ylJc9et3QzLhYYXaI+0PXe1O+mbRxqFrJIo6hJ7gIj+Ud/9Yh8WDcM4S8IJ88DIChzQ4oLuYZsk5MhGvnFCb/suS1hUdamCq51L5UEMeqf7ynOCUS+z0wyfJtduhMayfl0wRfj/qqu9iKFFdzIBZdT3aX8cnygbzHRZzOAhOAILAZB/AIc9zOuxJzxdjpRyP0eGmfX01TzBaeIB8SGwKQyO9he0sOkNhcUX++GxPxiXZBKzAHcd43K+f4EuGduoK5xkQvOUOz6+MVviMBBESqOFmfRY8DQBu24kfG2OsaESfCRuAUOy20JGVQGDZsBZMqtU8FRUdnFesRbeZMkMLWtt8m6Hv9EIgAAAD4PXRVgqCXCMLW/rBuKvcD4lZgnbWKGU84OGfQer9SjG1uZ8uZsHHd1oNnBi+ej3yM3ClWcoSzH4u8HCSUxeb+xNhkOijo4mNjyVx+waXz7QRpfCMBhqT3JSGUTGNltZROSIqBgula4Caz+unDIfKhgDMgq45QhtV7y1JWpDK8MtY0zVUwrMLx7M3kSFZGjQP4Au3MY0wqLZspys1WwMZXnPtwAaU4EPjPXB5BUt4OdBUi4xHtSC99/YTuMuxcTKZjSO9dpWI8UaCODGo8bIvgaE8cpuP374DtS23tnJ9XQ/i06DmKmeHcCZtx6h9h5vJC7TnMNAy0AEDBvvVpjIKMFo5qvz/gQvpjrR88IcOyLwlJHBqvIHHBAWFfBQfv8jTO5Bscrx+mE6UrmPs4nEFyZZyH+vbxBB8gnqdbcEtVSh/XCcRJUtDpCRULfuk51XLEmsgu7XfNF4LSAlE9mc501ry9icynGWrKLcyjAVGjGZFour0WpuSruQr5nIRBB+gqMgKhyt+qe+qfonGdTFjYCbhSvwHnVxnPOWaEQ0PWZD8UODfm48sYtQDFhJ49Ao9EIUm+NZQr5YCWIrba++qc6hzc+QtBO4vrt0mj5SsEqsAk+3FJ6q181F3uvmL5RWUKQlpNjPlulwujyxKSHFflYtAtYMR+NwJK9N3xfv0xwkPM1blG11bNI4FN1E+FvLdJcxcaGhfaHY/KAvU5mFvBJW9ZtQcvAUbIXPscou2Ghanq+lorzR/08vsDhlDT7B5W3plJ32dIuaUtiflN3bzrnenXcc1/DH1ktmygXKWW2GSLB0m0zxJrda7KFziPX6w9kHl7ewkzjEW5x19ZTEAK1ifvwfiqQf/FViCG5vNnaPFccygfRH8FBqYiFxCpAQTSLJJN99BFAB36rmxzv7eBFwNKQAw5xsPqRCbSoyCbNGxGUeLncegAqUPHOzOH+pa8JLAXC4WyKYaSp92IG92ihiNIJNwkIInEvmGTWSNPon+9C/GSrXjPouFjIqueQQ55ImLOXCNweQehe640LKaJdi0chYsbENatlSaEIdx4QXo4kNes5qc+k/6VRn25d+QQ9ycG78gSdOWU2EwLCv7Evqm/A1XBxJ9YJqQjUcnMe32uumKuGZE13QAAAoblE4Qsq0bWezyOOVHxEtw1flW7LrKa4pcO2nmdEO6tyHukziVW7/dIApvw94vkYL2tXEfr8jArcw4zAIBe8IECMJ8Q4x747CG7UiZ3vMuxjzSTNYkh4eM5pSmgg4ZpWUEHm+2f35yjrNKI6yGVcx1JhklScwERy/IAxlUIxxL9n1RqNTHIkSsHexmo/Ti1R8Apnti7tatbCW0MMdHCHONDlg4kxr5kr0SSBvlsY8b2bI5W+xsOW8sGxlXT7rAhFI4s9w+fu7B3kY/5WOfR/DyPVRE5z553OUoKWDO88JN2RGu9gXiP3cC/z9400EKg13jszvfeRfzKTAH/qdg8k7cDLG9UaARu8YOjseIYUKGmEdm5g4vWo91SkXqbnt0FVEQBqkAra/eBuElvMo5xjydEpKaxzA+pXFStrONSB4+j4Roq/I/Xuo/n0uraodBOo4lVMO29M6JncR9VKwGeYUMoxDLF376z4AoBhh4QPqV7HdZTi2k9HR7dCw1HRuT8EGld0dq7RHGzgYXyJkOhKevseeYQNawUejHKQGV3zgOhFqBpTTvse4EvViRz40w7yOKGxmB9dWSR95XMtOo1gNBsyfm0wgIP5ylnJlqtTrLmphs2snhZYEDa37GbRrLl4b/A4DS2tv7njbZ90Sjm6IKrDr+1O/2QLao/PsfE9SANdaJCKoAleCJ9vGed+WLM8byUIH/x19uFhrkmTaX4P8Y0JsI9ZgVOXGkk89TK3qpUql3JziBZokIpL5iKrLyVNHyyZfAMIiCsoRmWacKC2hSZEe/uxATgr0lWod88DnjqXpcClFm3KLfXSuUIH1VtKN5NcvjUAM5NexD4m7kiUuVoPoahoORiKaVJCgy/yoJLs9t95MmEVcqy733+KbFTa0f+ScKB34LJ0W2XTRgDaCuu81022XnnXlAbLGbptyrR3tSLJym6VNiBt0l6IFMC4iSI3YoZhhi/e83BSxQbxGSKLfqcAAckw3gJQHjHypceZFS272gHN3Ngk0VLCM0X1sKBxM38zlRNCUuPsXGMF8kX7Wc8ETRk4oGLAFWLk0/T8w+8Q6TO2lPzVSzZYMYW6uY7LF75D3jvYnVawEgPEj1+8Lr0Z4jFgHGOq2SxksNR4tRlJGKvA+ZAxISXGch4aNaXiDoFSz9c5g+V/m9yl32jTrRkplcTkTE3XW7w/v09JDljMV2nA36mOypNSUoygnyIrBpz5smJEzRXXGvsxO58cR0cAd8+od31fNsp1H1whPfgjYi27QnzfltILg2W6ZtpgxGaG8z8Hko2c0hdhPbdOqPaicSwtYlWfsCF7aJr0mrHstWhGV3qYlo7s+swRlRuHLyWQdtJc1bS6zbYweA0IPfjoN5XP2x7JU4+3o5BPKTkoz8lTRm8Vfvk1/kLq2+vCLZ94AepJbXEr4vvHLFeIZqUqX3CgoLPdw+rI7OBO9ViSixE2i7TJzxb8lwg7mhWZEFskAR382o2/8tVE+vwTZvqpoc5R8bnnuIg+ppnc4i+AMgbN+sPsOnxc8A1N9IU92SJ5IgEnYP03iZorCI+4ZKqP/OrTqjQWr2DMT2GarYbNFJU2xqPHCSvAeEIHLt1I7i+s3XPJwa0yhDHuyk5iNjGSQxX6N6J1Er232xdAk062Jx5B9AROQgOLXFkH1dpa11N1Y43A1WnAbGJttYkHiuMgyf4L9A/AAAAfX9Abhvh6Rm598pVTKFxlfwvds//W8ANrpuAs6p0SgZPDdctbJpM71U6qZRMYwDRKfmiOlc3pIywruXUr9All6i8f86E7/gFXX2oD/ruPFhpYIxzmLAWj5da/EdYrCKU18LysLqn45M1/FVOrcAmrcf3GvBczJ0vBr97U4CVO7Mtjr8OR/JkjBwIBIielMUqiwSP6L+Be6+V0qWDBk1Jy2HndlHEF0hEYq/eLKkGwD6yPnUknFpfPLBmZMisC+AF0XgH8KUnVCHnbWprJpSxUhnDXtu1c4Z6hXQUz9zovX94QmMMmKC0SXkaq6G0C0yVisDFUREHhWVucrUdEhaW+ky8cB/RQv1sZWA2aAx7u96wNQP0XLowj+w0IB1hMPOuLzVTSmqlnCqHZxcxmFABfqVyLRwU04ewhb45YwyCWN9qsKnSM478CIB6lJ5KvpDzXrpwI0kEYVvYLxVdV949v5ggh1vrUOJVTMVduBriCqdtEys8vj92vdRX1Bp/zoRIXix0EkkOFuiUg0NN5ozeZZyPJGjCAPurxD7gcofJMg7LUMTmQuGs8Hi3ViBAxQYKrYCBNvTYxIJJdJXf+LyUsNpXZTSVNJaLzxlKYH4qSaY0pogM/HhLSZTAjPZe8GLhRFtV75ivtnBb9V0vsltyq4gdNJOdyhfQHyTSqDh3X1DlGCmolIlebY8V6F5xATp+aBLkXvdP0mgYU/tQoeBCxsTuX0zp3Pj9U0dWWjVWv+cB/l3FTFOapjXksYOPHTjOXTKo5xuPEWRmvdDzK4jUmQDr54X+L29SDt8NQ/XtNZ7x7MmuaCckwmsUQHAmsYsXeb9gXOGNtMpM6J4/kFQFBBlfE7OtZNjpvRpuydy+nHPudr0HlAhcchvJTjzNX2WkzMBcXAYjGfMxUQQSGzqBHlJBDxSmu9vK+uIl0laHuBTt0qiBaDtz66yCLS+buOEnv2C+JouLASR5zA0Q/KtD8wL8fQ9LNxtHn1VwvDr70Q8d0aU5nHy0IWuUtz6vrD8M2xyMApNE7coG4YsY1Y/GBr7dD31mrzHithsuiLveSt4ozUaQpfn6ZbquNZ8yutXDJLTUD7p84lDu2Zkofhq/B4nFw0uYnuoy3+VmCiIxprExDg9UJlwVtn0D20PjuIu/pxS8FXg0gvS78izZCRh3tOhVBHIpxRUH8QuM10dT2r5BzerolLjvoWyYx6/XqWPbvSlhKwDfAvwoyVpk00DVxKVFuJKY4sUqqCvV68m8oAjSbV0EDvcYzNEPsEWa/pvHn9fPuHP3XcLDb+BjcL0OriVfOUuJCiElbMjAb4xRvLw2a6P2IMOAAFsWkbMcoboaWNfMWPOIgCbmneRnyEolahzJI2/xXV+CE9r+7k+qlvM/qeOh1eE8VINmQSrCcWkNAteaewB2ax9RfjefZgAJ55rx7+dneIYmPKt/34OuZqG7IPBw+uTLz88B7Y9vJHkaZemh0UMnMgGdve1spJ32pOVGRtZTWuSTCSaF3CtVQbZ/IKH/rhP1WWL2FDQ75OowopADDbq9SZrgrvU3oCRdrXlhLeAC++5xGM0xiwz9WOTjVGYTqZXMNPm8gQuWshVuWvN2MWznIYxJ/nwJNArBBde1uO75uxGhFc6BHC2duGBY/BOTVxIy/SPtDcgSCSvvGi7ngdipIqSwAIJaqrWhtm27Zp2lOReIIQQvZpIY5Xse7QcNACy8sKIIZHe5G0vQF1LqqN4w5k5Tj5OOqjwMHoYDlxcjQAA7w0V6/6jMYdkeY2t2S2evF41PLOB6G9lcPnxF947SKpit2NUTLCnQs4uN/Pc6e9HGm5c4B0IhITcQmhhU31uSZWB7Vn0AksWWxwrfkBT3/vRdv55v/Mg7KYTZr4cvjd3dU2aQfd9+0KVPUWcXFu1NgXUa0EQVDgeKg46NwHf/QkWYIcJXGfKZyejTCB7PCPmM6YCaLW9Adbno64qqED5tArkfFijlRkRr5Glk74GpsBvDrKKz5y/koyuBnysJAqknzjnUGZF5Nei1MOSg/iWi0sLRGzDyAgG9h6JBMB4A6H1/PkfdxzK9/A3w/ohKa7v4qr0Pv3P8hixZacFCu4NC+yGo5/vTitmbSgm4qCDRTwYp+e2PiXM0WZ5ujn/n6Ej4OJ6N03YHm04QijmIxi7hLAatkcHy327bgdCBLVIkX3a2ICsO7xb5B8Gi8U87RAfny96PTBdTtYnuSRt942LkW09zx1iJJaFzcPG0qCMfmLWL1e1XJQwsV6wtZFisCufoX3Hj0OxHm7NHivgPeSG6sd+9Jlxpq92MnweemqHihhz7Xyxi4792aOSvYf7GQs2ouc7qZFLM6zzHzZvE3LoRkCPT8KpFmoDE/wQfvQR4yksBIhyPy6xdJE0JTiKVfYbquDapyxWEFH1azZlXXPdusw9ECZAXLYvgC2SplM28oS7IwdE3zxdKfCyZqfwIaP9pgW9T9W/khf4P3U/AHg8WFwdxxTNR1j2kLWjAVCO1vL9nTOSykarXDGB8m1G1B1shp8i90Lc4Frc6HMpW9Qx8U1mUyCaoJSz/ng0NcdyfBxG92mFVW8J8HVcrV7WxFCL27cvbHWdX0zz/7zMsZlDfXLTA87jHk+BN+Hgj5/ngoWpnvHJQD5wB82izIl0wgILNPI4lGIjmxO+AbLzU2LGGBZMQ+1bvTRImKjf7q/Q1YQyjSMutomGaujXl7BIb4Xt64aHqDjCVFPXlrkkatGKlzz7AhE3YW7SrTRdLKuIp/+owtLWlJvSEbfdeh0FOL4YSlURrZKGeEy22pZA5pCGKGBMJNGfZtEegTzbDdpTuFYO1WdJZ86Nb47hL3yp2njF5/HIzJ9FMT8NwVSl/rkdNS0iTxYkXo4NvMr3AZdev8tISgha9pac9TsQziuh/lemUfJdMeeTfufFO/rvRCSDwmrhcQ/XdwMhUiuFUMXVEiQRQf8o+sE0nQE3g5YDeRky1Xci59GKKKZrdbB644Xp/li4hhtnFgSMfXi0TbjFtm9l8uNua2x9CutkJ18o/r1RFIWtpHqICCTAXgWu7bdY/BbpyQaRWKAzfe1yvqoHMyUeWPppcdWWCzT8sl0rWbJW18N3bcDYaN37xoHjfv6rmD1qjMTOcQG79Me9U8G1/Sed4w2LAMw0AV8tzMzaMka6hdxjzdomOydehpJLAlqD44KBFqbmUB4og9wuy2QreFqrlpOJyB2eSlnaZwrgfzRon/vA8EkcJwak230ouTSL6xyq8i7obyM60wGtZcr5Sp+MELzNq0LoQ0AUzgtl3eS/Ab9CY5jKGliEMqYMkpYxAmn9gdgI7ql5oAENRD84C16o8qc1Udq+b0QTkdJoD0HbI4EA5tUn6EFbniu6j33+vENO80/2clYONirfmFl5wo03DYVrDAmRQAjYUjmcGtzwslDQa/kKpsqOxz9Uoj4DS/4xh3RFzkMU6dlQv8sYW0WmHV6st9V9ndE62uaqLeiq7CkM4ygxq6mozWr1iuo58x5R5XeRFXr3dtirsM8n9z8p3GCslQfSIurnlbB4emWQTBJFuEzPNDqXtsOkfzvB+/XiW1fAzQiAQ7uvuXmxdh80vWvvGWMq+JXm7jDrtETmChUeH6uzBKg5AB+ogAA8uiK/trYIOH96DoK6J2OzhyEXXW09jA/nISe41XZgxgQ5S7Y8pCm+HBVUAZhb6PwWuAAFLSFXYUScP9Nsfr06Q7N4nQsSkRIG0hosRSMlFtEMmEsXdTjnjpWnJmGHzlj9ZDohxwr8j3ASjA4t5YZ9xC7uHOy/dHplxKXzaBQANgqYy8SxN/iONqMuUutrP6qUdPHspBmz88fdVlOMLQazrioJqOYiJwdz24kcKimmEwtWadFEnzJiKHp/I8UapiNgG0am6eIL7zwzWfKlV94CjbS2Y0fG2l8Cd00wx0vyNzRMOgmFufoXfXriBwwmpGa4sQc9GeZOTQeEMuNZuirt6wl+kddIVDc5UakgtGwva36YIuU3TYKhtntdZfibAyn85LzA6H4vtm7xqiRnrR/TGXgi4ozoA5ap128TMq0NO0+j/nIlWCosV5tuT6DYGVyFHfLlTkqxEynDH6yqip200teL1uTtNDxeogB6Hl1V/LJTuzAo8NHGDYw7KqGmbgBfKPbHCH1+duBzTeS2fu0DdcQHO3/iwZKoeF1W5u2RDNJDVAmRFXyKOUYiHPndHlOO8R5xhYqSuvRdlKEPiNX0n/Jafz0sFMJ6Q7Q+lR9FARNpDY01lBTE1FEXmbUD835z2fE1r2VKRbtCoNwyXhyO08yHTZ5Ud9t46ZqcIvmA0bNKUvivBWyGg735QfG3YuFuoHWEQxouL4gCvr3+CieHA/ktwD9Uc7xWAeKlNFkoXlNAEnpOj64KBcklWr9IpOxCZGI4rvtmk2J94KiXTVQ8nJY+2w3Mul/AbcTL5tr6ggq+Y5GtUDjEGWnlmRtAzOeS95p4oiEFyHnuV+SfKXU3uEhlBgArr5TMQqYqOPBxjhNMqlBVZkZY7yaJPooyOo17+9YIr3DfcbTIJfdHqr/VbSEC7x7bvA2wvrVZQIx6dsaDjDxIPKAu0Gh3Foqie+yBJBQvKPvh+pfSmL63VN6CqAU+aVtEj7EUWnUn0kl1BDcBE4jNvT00KDVq3nMXBU6S4mSbgx9pK5zSo71ZhiRK7u5mb9LRVf1sUMzQ0rsAsyXgEmCAWkGo//Yjez5yDcgU2RRkxGyUmFIV/b+k7hKjJ6bQML38sWYaZRbAuJeieyY6ZFgIJq/mRan0GuFnpRt/c+3DV8gJsvsdhQeiR8PFREzu5ChH7O4YrmHF1ackQZwEvJFzE9fxAkWWm/5ck2zBQiVU04WgBBJ56NBTEEOuUz/IOmAluxb6WakdEPmoZo1Nx7VkV24Fne+lHZ5dKiFr/AGje2JN2N9cIj5eGY9xulDSJNZ6tYTao/gj7+k/Nh6dkDFhCWBkDlCwka0faa/OPtyN22DNIlz6gD5slTnsdJ4T0HUZOsoPizENzg3Uan0smzoos+rltKDpF6uPlmVqnGnNqLRV1FNMWm+fvhNhKtY6Gq/uKsGNfaxykvMNN2ZhpGPMZfaYrwAWV2Wo5e/uc4GhPNW2p9Z4LgBMXhx7nh2cXMaH2CwXHdbm1JzsjgV7dtpa0zBk1OQqBixM0WN2YNRo5CCEcqTvlwP19Bg77GzEugDMuoJZcefsnvmZSomviqbywhBk7RF/1/NfcicI5+vFKhSLHCnqDnP6YL2KxLzUp+Pz5KcKZ5k3t2c1d9Mt09jCgUqkaibER1R/2/hV3HPV/1ql0eDDdUPxidL4/tooxQqz99yBdLNo4LMFG80pCnMN80rdGqmYaGHJi2m4aCzKlMevuJ8K/tZPULdPQM24t6HaSrS3ot5vzuZKT5RXaYKIUSJsKqZGP5EjYsEDmatK1TV3sGJWtLV30ciGU4/Fork1bePYxmyIjo76RccQloCk8RvbNvNs1agnSmJZm4TJJKx9WMoXXxK+HlSEg4KYIiXB9XwG0klBeMKTeUIC6b5uD8ra3n5B0klMKF1RLigQxS/hY8lMs3BswtgF6AAAAMGn6eHZrX2/Ne2QWO9Ql4u+eSmKZ1Sz7kG2tNLsgZQRk7HfRlI6WbVMeZXHhL+acHMy8AKAxQMj0HS5J9QXb7avdwmLGYhcjInQJcf0T+qHuu6XGz5RqSJ3XFktOWC9wZcziRRjnE2tYWTWoeqXG6K0nL+yov7rxBm34ip8ni3SqiBtMpSP/RexwLWpIdAJPLEfu71J951CuuV8WZGQ1IIFv8xxJUNS9vmiDBpR7AxAw7s1zfnIa81WHH2n/RcVBMg1P2c064HmTn5CaC7K38ciFk6axalxHCYFtsDe+U73tpe65+JmDOMGRUH668puHoBH/Ny5M1zKFIjgPob1HI2Mu/xJQ+AwtEYKQOqED5OXsj2JEuePLCrLHM9EXgA8yI/oRpjXUgQCkaSgd2XZxU5Qisg5bi1HGvQHrXkQS/ERUf0540uJRn2Sh7cn2whdbH3KMUVRS7yNoihyNEKfH/e+Y8cXEwREKbfW7uacP8dIeSE32Oj75csjGcdGx9TNoiN6DOtCWQ3SBGZoVJURCRNCCDBIvK9D8wO3OEmVLxHzM90ddyIb0zpmINON21X8fpWaK2bUQnLqjDQoa223t1/5oK0Xq53qZwLh76fQteZojNSlz7GyQAmwoi5IvlOQ7LH57B2EHktoBSujzLECep1ITKL4F5+tc8d/ZtrGk7j7/IRfkuV4h/ncJCltTloacPch6SVq9FeXtbLoUyc3UiqwVBCmJezyXOynjuU2uL9m7c++uuZUpXmM+RMiEsxLREKMv8lXStPhD5KN4+FVwEDueXq76i1kXQVaW7ZjvTTwZcxtxlcOKteTfJdWsJBIufkm3ruB+YPELviMtUEESUFpkTNY76wUCnXUl6kQ+/qqOMtgIawySZaxEX2tTCF6jF6XHDE8uVx1tglnAn1wAuP5+ccpYeQJVK3LcroRvW4XeSUhhy4b6+rztZkx/R04bezF4mEu9xEQ85UJcja7rTLV539SUle41rjR7XAkgpya3D2wSpEm+Rg9p4WATrpniI4czKrtb4O2JQz+/hj83q76Ahxk/pSrBC0xB8U+wWuz4aG+/j5HwlW7/lTBxRo+EVSx6zqacRic8aC+2xsbD+yNqZADupYurre4EGe4zQuRGQ8kw8rlSkzcF/dE+tcxfx7L0+BdAb1xZ4WTXtzRbJuym9N4yAKa41qKNyP4TqDQHAwUfP1NH8Jeyam3zAQNBa9bB69iJetiHLuUJJXyROjizgTD6y7w+LxDtxD3CCB7T8FrQGBehokO7EIj9KezVQzDg183Iyiy+mlEjWwh8TcCaN7hAKrfKlzseQdF8yPwAsLuEEjXj5CcLJWn2OLuduvPxFCXM7qhiMzfpJQT35Vttvf0MwE/RuSSnGUoimhr6N66OcGjXh3ng4sXpxMcpFIPirKyr54iSmZehjiNes1CSX6rnTdgI/W47NiGBNaoFWXXHm7ttAXi/9rsFD4D1tg/D2PT7Lj7rewWCGRVw2rElcQek7FwZnnxdB9feX8+2FVdy5dAzNcZk+/vDIcbj/pa6yNKCDeIXgW7jXEw/qMlI4ctySDUlThtHkT7o9Cpn05Ic59FS5GXRjNsch8W9Cpkkth+Sgxzr5jsetZLqYR+B9d6LNommlbxMBapevDmS05bh8EsBOF3Ov8LWzJhdZ+nLIeMVEOlwfajtp5jZgFquUkhWoiS8UMxJ+ZmkEj3RIYqaM3mTEf2oe7crGbcIZnFqZphAmzahX3lvNfrLTit+UprDKwdmlcaXAJyV0vWMbhBsyisS3seSzOsyBS97JLjuQOqtog53i7mMdymTGguAwwx0B5dIotd8fbpKKFYzAT/pD3KVdTmIpcgAAS2p5ZwPON4vZ+yYk6UiqIoWfHaRmCLvxOvtpOaqVKQOSsgC42WZhYWQGJevVz2RY+urT3GqonqwIqhapiX6mIVUCRO56uZAkZlJwfo2BjXWgUd7aGAOsniljqdMH6u5X0z/vEF4o/YTsomYQ0evIg/ISVr5g/d54do8KDXnJmUpiDjPBj/UQZNAs9hxkCR6fwi+PrFHmXes+PSB1iANhLo2vlo3w+4LhPDNh+f0GXkEcqtAo7ZBTfICS5lJtNwBctuzzYvAHqInwygpAzFRWHh7zOfXj4n8vXwxXUW0NmgiNddkjF6PAL6j/WuhVKBNtIgLAo7nwPVdz+YOppw4KT3ScNBswGcwuJPTQNeFzQnz4B3wGOuWJhwAe/Thspi8Xh/GnmKSlTwpDed/XhTj1ZJA4fyccfVJ29onm6pPb9gv+MHEBJ6V+nQbyV1K74ycRPlktb+WyEBFs9+emld0qPjSfXWDE7b0pAz3uOhwlNSbUB2yRl6zy+7u8kzhQY26e6MCbaVNZ/pW/JwwCt8or0Emo6bNRxgrvVZMZC17ArqVy+Mc26T9WX5iWsyrYND0QhkB09Syl9ZDwRsDQO8WyXEVj2Rg0gMn/+X/iFZML+/vgqSxtmCdERzm5x60GolidjjzD9HjCF7DvyKBLvkNiFX5dHE6icx877ZslFPAyuO+NhCgM7onaKygoD63Exs7Ho8B3psvoXwtESNEbbggg1EHqsyJkwdk8GKm9J1HerkIw27seTVO9lW7YncNpk8st2G8R0nFvaOij75g9LAmlyY8PilOL81y1IeN3l2rHEjrKHAr6ptf9ElrGclBQQygIgHvadAmKDvaW/QtkvdteNDGzPm4qdplWUKJ17S9Y7wE1wbvo3lKBB6xMsgQQsL74z92jV0WSHpTT8bEuv1tMj03X2IB5pOwU6cysNHsxL1xOdC1r1kAsL65JKYWu4lmVNKC38b34gEHl2CKGLilDL1kpL62JBx+jfeaHgO9w5EfWuWCvF6oMCeeIonN5KWRm66BUNP7snbdfguH2rjPCBtIUhUHeL70q2OWdc1vYd2zT1VVliyD3O4LCzPIr1cvVGdsM6yP+GXXW9jE9yLY6F5AILBH0DNk6Qw1NOL+fm0FXAa/rKT5fuoUiF5wfGfeaOGGfk6iWmiBPSsCx0n/ckxDxf900qLXW2JNW/xndHzzQbz9wugcaWtQPuvxMS8Ytw8zpGMWxUUFsXx9F6nNG80F2Zk82Yw+xyv1lePmKNPAzTCOelbU969edAQASirAA0yvqCOnvDr0GfRuRfaOOiGOQVgNhQT5avOOm18v1ad9ic5chqpC4elBNWGTXQLn45ruM1II7wL959gFf76nT2jhOsrLPufYrMidpJjVjjn1vQ2cnjRbW/bHZy95kV6+l59xlotvnbXRcCY+SkKkXc2LKWWEomBe2qafoIo1gIExTCiys6a4eANYsgk1JfuGlkN862Lp7eyYRuwX6T6d8I0AX22Opc30buBtkDvbVB5V8jLZPziZHAbd+5AGbWrfqDC4QQzVeaX2hxJq5ede1axgCYYm6wguzNTgGhOqfEkT+d2jfG+MxERjWIr+PltaqcK+2lQEu4hnfRxaczg3dkt0i97kVNcat1sJIiLcfym9AtzsTeHzbtzRwC3WNFDN8jygXZZ+uPtC3jxguJ4Z7OcvVbpzhQvjWlnJtz4J4qOEe5RdYn4siVGfqXNXxuBVoqO7wzymfRRNgATU0RsmixNf9uTBE+9B0mgxyhIp8iPuG34ouoYgUMm/Nq2eOS568qmzxxlW9loGpfCF1AcAhiCtw7cIkpM8+eDZcFmtzhKcZHa/cYLoEtlgPm+b1IPrn9zvY3Ayumh8/EqnwEhdpSEs2S3+F6/yE49ZuT11gzd396f2cYX5kPBMyEDJLksGXUIXKdmDYh6OmFHHTICeKQS4HmCXE8rgm/u5UwJVLprl7Us9619cJcWljgGcasuMGVjjBJiiTzGo9j+f/ejawQnvZ2ocmKB6w3Ztdf7didCdLP85srUhotkUC1jZupB6pBbZKspCzaiw5vpUx07yhOQz0ZI9mAFAToWUO+1WrK0mncbVjqDAoFUwS5c6bt8DUyXbL1plx4nHk37IEs6u9EwDbUKhu8fZFIZk1iJYv19DHZesKLN4dUfLL4AZfroBEeSRnrEvvhW4HwcFRRB36JQjyPqb7VkSCLNw45iwvF82CyekRINoA3Q6ZLV0hpB9oVzxnlMs3DFH8GItp6FtbXThPx0gGnUOdsn3YXp6Ka25/McYkPsxDjBkWWSh1qbwIKhVnGAJjXXPwU+wVXvrPm3/RwtNkLiWjBK/ZOau3ai5PQ54tygXLPhGp5BNheJ7Plsl8ydrKIn2qN0Cd9eXHbXhL3ExgucxXf76VzECuON2vJ56tssK/shP3x18Qau6pFLTImgYo8gRbqnd1p8qm7/oN/WuRpd2aG7gZhtNQhoiu07GAQ3ry8yd5v2bJk/Bpc6js+RA7XnkUjFdQrD30lnb1PDdBMFi5K0H7SunDxtxE5YzxLYG9+o1oAFc2wwg0Mmylic+oXyueGv2qRw0DUuPzVS5vms+lTC49HLuwNo+VeFCXjn/kVe52geJNgnCCt+MmmG+BQrIb/xfn5kzL0NpBz3tv3IX9xSl1YyzOHxWKwEVA4REzxY5C0P0ZupzfduHb4Vu7o7an4X3nURbn8DBFgONyrP44ZJtX0qvNsnsyNYcQTakuNY+Kd6Pp3EGNzU109fqgp9HzCM1VbtZZ6w47SErPr7XhG9112H5gUZSK32Hrgyjr1AK+7/y7fGqnBNvsgfqLfX4IwLl+KB7RlZQPdS35TwHMTbc6zXde0iZH0EVXR9Ybqd6VFNgLlbYusXE3LJY5lirFedEYaEr+MkKVX9Cl0P16rW9hC3hRV2EyvKeAMeFO1GdI4DzTYwRjklEOeiXwkpF9pWsmqvbY/zShJrxUDtpeEYtqCbF2ru/RS5eXmD8yDJaM7obqpQUcHiuqA4fz/FL+SiyIySrtw8UMbYBfcF1pIOW9NL+moZunST9woKlDdZw9V7btm0z6Cd1/0BspxZbf6Pr+vTanSztjEAuLXQ762H4sdc0sj9Xl4zM4exa0yjJ/8s3DLslCNyU6J/W3Br8OltB+Mjg6xN9sXn6mrooka9atfg9tluuADWO9eecfDtRxP2sF/YB1cMzSjLpdhmcVYk+FDCQSPX0NGadLjsIZwwXb/v9kFyVKiCqbvxOph8RqRVSu/2CG7HQB6iVKsRrxUkd3Se5KPXkEtbMZuxkuboG360TRjCln31Dc/x9NfYkINKJb+og0x3+nl0Kze8aUk5fe7cakUcmjcvVWmdJaZ9VFC6JBcxGfi0KIkUqh2MPSPRJULve3PX6junM+3oLygUKDvd9QiU/Okb46BdIGEvglSbh8n8cmEo92xf5HhqDKejJKw17DpNa4T5KjUvWI3hHM2wXgFY5qJD6gkYDfR/z8i8e/Gem/+prPEXIY2P/rJbd+3ZVP/LuuUDSzwQoJ5GT/H3mNFHuRniqeb56impu46pJNTcJ9LR0wcKD2Jrf0U3fIPjzccFtSxH64o7OWOtcIWpA9dwfp7FBaEkstZtsGJvqBwlSfBzzU6vjl/FTJvu/lm3I9d+pZCwqtE73EECh7CSAeLSs+ICRHrtal3laE7ockpNrbV9dZa2t1E1xlXaku87BZFv/89S8W5W6OJucGpXsuHpWhZwzWYaoqP3gVA4Nmtv9xs70MH9i0yhAGBzvR6JfMAAuui/e8UYjCqCGqF4fijJtQcVkhumgwmmVwPL1/ACgO+70oX6RWTIFBMrXVWAHcLAT4erPwva0j6uFY58/FPI5aWukKIEECApMYV81E6Fd3M/KkWKWUvIaEFwBYs+2v8x805+A6vS2pBndHX+f7Hn4fMaHchE+4XGiSj/BiLUPEt4mOZJs8dBtcmv5rOs8FFavXi9N2wd8gKoH9bbY0scJ+b9xwMOvHOvOR/HeL8la5h0UnnOyEkM9TvGcLMN3snLB0grVpppmyKE0M9w5w6trFKSPXgcLe97jI2Yub2uhKtrvUcWW1LhGQGBlXx4GPqEy3g0Vv+LX2in+2AVCYAWccNgcN1iPY3UpqBJUYza9PegaTuizQj2LmAR5AOeZbXLYowg29FqCEmQyc1kzl2Ne1EbJZv9nGkLDZFqMW7WnCkt/cg2I74+UH1YntTtWBCA0eYu+AXUZzoM2tD1VzmqC69dFnr0BzGCIWiGVr3XM5pCmJVc9eJ/3CRGFL2s5N9nRn3o5bUJ6QKscHbImdQ08cUB5sBokPCuDoxCqxwKDAL8ONEp+fVrHsJaMtOA30N7s0o6XDDBU+SfPbdNmpu+lY5UWp2YNLm6AwzjIZ61Sz7j+2qvoqoAUvs+3Jgu8wPrd/2ILpwjjTG0ArKem3dHdYi4WQzhtbjXCYXEiMf5+u6Cmdh+PtZnT+UDL22k7uNqf/pva3b5G+U5kuxFMX21vXBdjO3pcm80M1JJc1Bu7Hxzi0lD84IWEWKauFozWsFuZKGs1xKCiRav43ftVFFQWPnEuRxfJEW8wWye991neshK4KHOfP6aTG71oPWv81tHGEcLRv8+AQPAjf0YFyiYWXyIhrBSfnGscNLf2aH+ar3GL7+9TT0sTMYlV/ResiES6fOI8/hUYF+2ZNV5xGM5Yp+0R+qoGOS5agy+85+kOZxqkEDx5j/pwgSinGU/g7MHeOGE7o5zkARJ+l0xfgvWY4VtzLfWgvVJIdoy9h2dBnaLu947K/8/8O7sqySflkTysGSedscKnUGsM3/f6wgOPqeWKtEDILNcuRMjr7AuJ1rajrUAyYrqk8SD7WYsPTqOVaIDo7HLJWWgD4PWEKrslGAiOL8WYriWJNTMYydGg0IgtafDBtf4X7EzFWxEirgExEguk5hZH0QBZkxMZ255izM9yce6GGP4Bg0gn9tubvltzV+3OqmpQby1y2Pl7EK19MO2x2cEdvmRRpva3SivObUj+W5CDYTTrwv37cSn5DorxisfBmnu5jXIAXfvcr8wBgXKKBrDF6pHgmvHW9DNC3dSO8FZXFBGgjW1d4yjB2NIepzqDZyjMvUZTDdY/86iyuKjpsK+/NlgYpifwMv8wQb4hkF/EEVaLRRmJ0+dQqP6lkC+pICLgkohm0QfWrU8IvUG+gy1V/UXkB1LyJXxizD/9lPj3dHfZTNwVZkjl6b7riuzpGD9z5UAMIbBpIssV3RYqjZt+Us7NsxNePcJEuQbkB8oD6bleBVZl+q1ApqDbMJvVFK6JyUeW1+b9nN3+2ROVFCD6qoz4Gcpi7sTaMQevrt6OKkg+PTiUdkXOtlmed6/hLgPdYIuB992hMcDCSM6/7mc9Cq2qbxDfSbDPn2x09qA/yBhbgOgiOkw8rhzPrBhMahua12iQCzKLqO2NHglnNbxKV7qXg81BuKlqT3lQlkdeIj2YkNYam/EqRDNH4zvRk32VQz4nwBpzSEltM6dOg+BPGDKUE0BtwR2Xm17NsbnlEjnYU5dSE+IgtSx9vqmZR1ai2eJ7ekmZ/t7djDXZkeJ77cwo7jOdXCLAB7MLSi1fBTX9YFyraqtShvYenhQIrpK4vYtE1JZ57VonvSDFx4K03d0u+QkVNEvILoaCtiqMHV1Ecdra/7pFcevyQvA7Fu/81AhI342tVSQ2teTUI/MABeKt+JHx68JCKVyZC6SbMdapf+pVZA/L/8p3LdLIdZrfsCXL5Ru2GnGb8E5XHkmz6k6yk214TXE67WAa5ddcA3Ue9snmPSUXC5DQ4SHLluGcmCxkbfPinDsx1uDFeB4OBZhWxpwGGMmnHnx7CZCH6FnFHOQBc77ffZKxhb2Hx3hkwss1CjQBS2oKKVAkrD60ghtv2JCIVPK5ZOEUDAYuCe4Yn5eHEHdolYfAN24xOvegxEJDmorEBYzOVX6jXG5CTCAcOPKHFSSm8QaYfbFdvCdodwZonkKVfUEDamsuRkuK3rcionW/kpyeKAAON4iRRmvGGjBN/OeYb9bVCKi7F730piCDU74Z8l4vv4ATajWP5YljUxrQ9FW75/vh0f1kt2P4nkYLaEbsGsR34egIALvg+EaMS5HXA+4dNk+B281fJTotcgxbUllfRf9VvmkMzuI71bkbI7YjrnslYdKchjCUfAc4/yeYxPyXnHJXJOyM+imqLBTjDG2BIouUR4T7ZjMkfLHkFR1AHVJhD1qSh/SWO+PyEjdSeBXV13v8jgZVcCZgIw2wUG2syXOPoKAL9/ee2z2f2PAGoDNFkC+nOzJTx2I83uc4+U15/Hc7SQoN/rcI/PKI8W9sLUrKyvQ4aAe0lssiRzrl3R+Au+3d2p9fREN/MXucElST3u5EnxnZ0XvQeg4S5LaxUR4qHLbQBe35mitiu6A3f+ialyaDDB4P6qBtT4RgyP6kGnOf6Kk43nfmC/uxjBmQPzursGfMe0DvcPy77jqgY0hOycoaGfVi8ee0fhFFu1RuhbaiJVljz/mYrYUZMgkkzOgtU+mM1Df7PPcDFWvP7SHDQ+F5TeUEE+rNByff4YGNQShw0BitCOfYEyGwqkkm9ePKhvmIKRJaNM99wfh5wY72EZ9NT4jlk0BYFufEruUZNMT3q1DvolPUyyZHtScgiYVBmasoMvWa4LZCvv7ocgCOVYFNRZb1oFf7kGnhz7vZSeuexiptNoJPcxS1GrZvu/9oqPj3GPBRK0R2gEsDW0i5Bo/fjtB7oktBofUHZNRpBebLkev+N1SVlfV3roFS8IVW+ayqRWBq0b8qBrI5IwfSa0w1O34suXZzE8qXYAtlRQyeqga9im1cm4xGXFLvHK5hw41PnevXG92vlK2brj8etAdIMTppNoF8LgUZLpYHwi+/tVIVH04fFEmNTkLcCpU86XcoblDF0vh7hOVmcjxnn5BffMmtw2suve/F8CvKMWAK7DfBy9qj+NOrqtRJIL9Z4GfbF/+1PiOz81P7cjlezr0itNpssYJjsDzqrjPFZeSvkCRUaYV7XzC3fn5dD68z85u4fqwyE2JX7vky6HPnPzzG0KkPhytWw0UEKYWL5yzOJfZWROukbBHf21/IaKDgH7UeMJ86xScTJ0KqZ4z+7eirDRdy3NXAXDihXszrprlpvI5/cMRrUOn27baOCyZKZqlOb+HY4DVEl09dHfKYA7PgzBPCFrKoMTa/6Y6q900A6FkR59lfBana5VT/Pr3N9jhykxDSHDpNPdqd8gSbcktlcRYFQW/A+9gcyS5FN9nBPT96lJHzyB+V46q1ksThcuq9xMXoDeiw8MCD5d/i+gEDrxFLRbuzOQpepqaEJvmi/rZIh59zUU0bg9gC9WhPI7fdBCZ+l56tHSfUXbe44htwy+kPEtLp8PbddklSuIzkbLpeMnesjWeOQDE2bP1/b16gSLOWx8+qMxnhPvjXxaQweyCCHYGnrxm158/NG2f0jdvBiiBftntVecksM420Y7QY6yWv9fGvSKfrpXyRPkf+F8lRHUuPDdZlXiZpRZB10A0c1ho5jathLeDzHj7VmyEgT2OMsIrh1MHl2sfp3RrIFs5LktusxQ7NtlWo1QVCJDrgi3SIEY3obzUa+BCeEztVU5LrSD0kvAoKAsAWYJML7YPDNeUORb6gewPBi4ogxRXclryopOZz42xaxMvBb+OcyJJ1dhrzZGtRFQc7mKogkbG+QFzB/bvG3TepRefVMXBGSfNDDKEyQ6sogRJKfJ1CEzpvuB4YR7xyk+PG/O996lY5L+rnyqwAXdV+AHomk8nbu8KwB+TDfdNyfwPa7s5SZF33VW/fQuPQoGlqYmMF/D+oAGLlkONPV1lIJnerxV+JSyi/Gt0si8FoI37AMzCwUTHYZUk8R9YeaKDM6TcmN6N+fwPrd9lOm/hHof3h9TbiAt9rOlJKP6i3LPnoEOJkcdN0M3F/ZYtvV+v+VP0c9sA3agRK8Stq+Xe06lxQXsau+foc8ZGgpAdNCePP/voDHtbUGOuKiy7h+uG50wcbqWeck4yFEye9lZLcVt1KKnn/SCPOXzLqsGNFOEIhq3KPBbYITGhPBpdM8SKOu8Az0j3/2BtV//WRoQZAOPxU+Jp7G563j/VK1P+oQ9g/DspeofpuBXTiZjVdDaV3dYHGP8iTutIUMgK8cZUz2lPyK3/OkEhHD0M3TwJ71rLodZYt5Q6erbPXDcXkUAt+1eqRWxbWZJjtBY2gbHXWgCcx3W9KsTnnVKF8CdFAzFxnWQD+vcZ9Sc0JO1FbZHNL4fKY8jdQe/RqkNoBo6q1/v7AdGmzfxLxqJL9F1kH6ZI5mHlPV80ndb7I/1S00NnYT7wP4qIv84T7allzngooAzsOTcciVl6USyUbwSL1EfB1y7XONqyndchEBHDHjJWGUjR2LTkGmcx5eQXi1/K8ELTfsY09nf17SROFfVa8HM0werNwrMN0FV/nK8UPo9GrCaDXvFCIcflShs+Yd08BNz11mG3iHpG+jE45LZ+2+vhiAymLbDLuhmRLBx2eomZU6uo5WE7OO+EOza104WW9J+kNu8RminJbP+o9LERd+o+z45uX7c1ZKg2+Mkg68OXG9o1OBWcko+KPl/eKloOw1E0q0QiNGPRlerp7+91xKYoslVYW+TuVpHa9VRiL63uQ95E2JhGZqZx5wk5BAExPRclAziGcchZCEkPA1GH4nF4zM0PDos+6vw/9/6b/IU5VOUmVRrpZ8x+PKX3zv9+imXnNjamkvBDON5eSUMan6mxBjTIORRS0QMPtzUd93HL2dP9PNy/7bwl4cD71/69Vc4I/05+Wg96xULgLeXO1pAkrSEF3vGAhgI8keZ7ryd8ndfKBuKae6WdPDGNH4vuU5sN/tx5o+ZuMlb7x4OwB/4KLO3ja9tPlHULTXowsFw0ltOhwemJqLvTDAyQoDkkTx/diUofjFPVtOSkQR4E+yV6dRFs8oY5oz5PDsa/LaBsauuqhNeY4haNuek2atPKO3eFjAQoPZbXCz5AqcfC2ZOpPshJYmFQVtop++fSB9p18wJsFIHVejz4apRcXC317EfYmoJq9ihqs8uX3F1m7ueD2VhyWy2cL8X4uKCJ5h3qckqO0kke/nwYz5GsTqlhDO4tnCR4og19+PdHpa/S6ZFSnt9YHC0J9FLpeZHM48RgbxdNUKg1ICJRG1h3i7H8NS3u4EspcBK1y3244nzNa4VJHqSsHUap+L1ua1kzn6fMiKAgHTRgZM3K6vDedb4VdlnZH1XSCcE4vpipnLhRRXhBlDYeNzy1jdrhdBHIdQdVGt+ZAsgBoUj+NTjHjTOJ9gdK9f98AbaQRMe04sYugHmVBYLCpbiPAUQ/xYLmIgiNUOo5FTHi6DwaKvn6IkOiX7GeD02YUJCqwObETi6SZjGWfvL/qv0WLPNau9YjIlySLWIG+8tku6Khg/sk6Q439f6xxKHTuthcjtrBG7LcZH7MEbIJ0aQQ1kYkNyxlGzb3yKTfWLaW09y+vJ4nAbLAmxOITWd7j3u2NFdhiUOyoWGk7Q9oCcUNjAJ9AyQlhJY1Z6gXsJEYC6hCrgXs6LsmNzhyoLsc/CkWnGqHhhg3H9ZmAuuj33jxYJRgWmNx08jeJmX7P+0IIuuNAEFQIb762m9t2jfLjKJOVGvXSQe13Gx1rhYQTdt7YCPysTBP4k/yrIXeVh+3njNHLOtC3PXyPOUR3LZsq5+iYjaTpALLXlb9+5khT0OQG1bj9ZkUVxwNjXjp+XN/Cwj22ti/qlyugcPVnc0ri+TGUvLQNCtDpcb3qwSrnQBrBaRbc3vTWkdkArK8AoIHSZLQ7DN+vZXfX0LQgD+45E27/e39+1qPkWuWHKgjGYk22sjwBGBYrD9FhYzvUDmL5+I5pcLcVCRUgMZfhuUpXP/4V49CysZMtAM9/roSMp/x1TFGf+e7+AVcnHzFOKmubEvR0T2SsSUVTft5s8bxNs+Fs/s8fPvvrod4oGr0GHMex6n1NPRflKy3CIkALdCkKHg/yZAXEhOOBYg2arOcAWaMOTyPFbXEYu3CU+UOkT/T4Y/Aq8WF+5aKlSbyCuri3ITPBgQJjeTWJYZOPnKscaATmLJ1s+fWn725m3vmK9W1mJOpe40HmyfsoWqySJhgt3tYT9wDgn5UnbMbrz4K0JVc5hX2aLZjRjNCDs4nerctwZzchRpOC5EoNZ6TJF7RVjxLVz8d9JToaWmHwOC6hVOp8mJ4TOodjrGfPL1IS4uEwgsIfFDb9MKuzCuaCqhubObCxVbtjAxXyFrEYOoRs9LtzsTY1GmqfrUnGhBK7KnreTo4xebKcxOAeRIz7ue+aG5kvOj6Djq6UlyY+U8wc3HnD2cY6ZmoW50n3iW8GS7phStxOSztkTW8OPpkslOhO9rpv1hRBp3J0KWCbcayFHMYTBu3ns63Vmmiu41ammAyFhRdigeSxBZm/QhWGYVtejCAgdMJaNyfMvekkWWoWJx/8HdwfkYPhw1vtkuRYtdUelsq9Q3h+CEELjJpLi1lRgPrG0T6Abg5OtXTOrIxo8RwDrjs+qlJAserfHehPlHeq7ILdxZJ8GgZQVFKMXKMSmgCfkai0QwpkbPVqah2nmwHT5G8tud53YWu6qMLRHA9Q5Q51d/EnUsd91/z0kMAiWXzU2CH0U9UUiFqUebj+4y5NA6ia62NrNcDRfMYBfDp1WrR3NR+QDI03xMk9atR+0jsN1oeEXhAIr4pXo3TuF3TiqqNjTvHhDDZCbiT5s1KjypUsIrLSCf2u6uE/NCnzSsk0CUdPwrQA3xZjrI8t2ewQ/5XUNJm/rvQMkBpQ4+nSJBlZBZ+OxKn7ZZssusGVOf051O0sWbvvyof83DJWQVPf9EeBnEUyV52PPWBZusrPB8MqGKjqmzgqMKknaSGoGoa3cSU49rhOr9HEcKjFqStaH6Yu7yfgQAJxx7CI5eTwCkHLxa0RrIf8l8YO+ZrwrlGASt/VW9WHt+6hzF2jvHmtB4C9QAnuJXF3I0aSGiI3h/3DVVXWNbGMyWs1CUFNrx2lJI9oDNP/Cc5Jhof77Szgf8ZxagFYjjXfyNbgVxvVQnqGvtUf9IdfZhsweX8DicJeNUGLlP6IB/9ZKRbhhp0Ia7E6XU0pATl8ns4aH0nbXljlqqKcRQbtVDyqNwoL67canjXEII7rgtGMFDyWj+aa5Yy5ub12u3L5nIsngnudB7umZLSR1QZoVjcPlotGGuDh8IcDaQ67XQVlXxKSfkOziHMGHm+4S3NUdL84byOBYOPChJwUYE+7b322Eo9zxkPidc0aQ/DglfERJHHFbKntyS3OVwAW7IpUexLCObrq3yA93gy+naWsqKKW8meFmsnqS0C0uvktOODfawN8uKAlaQRXIb8v04PCC2mLAAM+61b5WxWEQpogoPCnedkVEl6uxFz9SWSRHkmt9Ezk7Oqw5X4OVIFjm/vwRIXuBBCRd1veFGToYYDqgTbRHA5aKspDjY/rnvDiNjtqoitOLRmQSp/J5W3PC67iKAw3S0fuBX6VTrLDHuYRl6b4u8i6BE6UolsW035H8CwTSLqL5JTnYcBvBiwEraUofnlIpvega/H6z+i6q+fglFKS/HvJBwA/IVM39hzBF/Zz3ZmnFbKk3lUBcDselMBhlNP4FiUhy38NGxX22BtwZdrfpM4W4zxg78J8+gSETfyDjQ+/zHufI3nnlaOXLakWOVUQoZdmP4m7xERIAMRCMG8oqBmxFYEf4zF63mrLH7/AkBF88oTa1AMURGJ0oeakkLHSE4TdxkKQKFRm2IaxrW+U1tIEyDa3KMoaioMoill3Xse6/+XpqPf7hFaoNm+nhi8OKvQF6b7iZvraCEr3bDgQZVYKLnXRAWWznBHch4tFlVJPsCDMGQaP5grept5SM9GuMVUfgBuJCFQpJ2z/5Ybc5dCP0vpBMEZ3c3f32pwSE7T3syz7arCVUOa90vkLI17f5pR5OQg6w5VhCtWpA2kOG/ZP5XBIo3AFWb+yEj9gy6eGd9s6quQ9IgQa8IpRDdD/GwDYPRF0lYKu4OpEYyGWgMjXOWTinAQLHieOPt3S08iOFIJIn3PDQz0tB1r187OlFAXPKlqOPTObQgB2Io8vOpgd2QQ/p+QAPizn89PYE483CRLSqoHiOdQTEsSggyDOjRsB3F5gKqTRrnn0S1J1Emkbu2r5nn3bWexBwvzbhxyCZeioij/ZK2rbSzHRNCWupsrHlE0Qi9WyY15tnMcpKgFMpGGVL4HUlUBtlVII3+R6qcTBPB/4DAtQjkqMxSBflS4KhdCg6zwAZxtHAbBL+Nj4eJX2ILrcjcfqA/8klNFeBepWl7UVZuGhgyVkkeW637lCVnWSgvSHEmsrbbhRnfVHLHtD+8nVN/dMZT057vvazTbdOX2CcG9D2eFEnGncX72YUTGSsVeHVJlj+3MwaGPy36bFxEe3DJS3WekctkTUUWd4eW6aiKEmcma9vwqd7O/1N2WWMXphlVfImW4Em3Cp6gRe5r1WWdA+/hrwbUgxyuuLOS1nBYcfR5JC6KIYFDEo5hctX+PgCY9N3EVuwzNiAVAoTjlFmMbyvyU+Fvm70POlZ4n4h+iM411/E7l6kp2XVz/DA5Og/TmVGGJrDIVGdSga7ueDZsMZOwjpzFRmWVJKZhcRC3Dp6k9fPD0LjzEAwRzRGy8OjBGSsgaqEqsNS2BvtBDX4ibh4EasOOr/siE8TmaA0qs1E/KXQ3LWeF6J43Bb2M3feJ+CsrNcHQf83G3MvbQNQgQc2GvwFGmZw+S257P4nBPUy2Pf9j8LEn3blyQUNDB7Oz5D4wCsenR31TLMMsmGMshHD05EFhoVwrItS/cQtz35IKt/gbfBnSyYA2/1RoruyCpHe/x8Is9kRMsdmlQ1/12/CLUVOtbyWAxmsk5cBI+Jvrn2GUuI/0nfoovwrcV4pMoDWV2wYFP3xyZNtrIO62UTq7iNsbaxI5jHnQldUJ9oeGNW1iCtvxk3z+CWsy2LojFEBtvr53jAeceRQQQ5IFOqX9JjoOMb2ukPneDA8hJg0Tc+R6bmmm8aiVFGAkaI3F0JCFqk3jY+zL9Isb/bpLYlDBYMbIK4Wfp+R65+QR6ZNVtL1lSsyOY3sYla1j+xW6KyHDPxeq3NDEtHWWt321gMwOICFgt21Hv4uL8Z25DQ8emX6j6X9+yojxn1V4uPY2FeoG0ieF2pzIgRcOyT85THv0q1HTW0lK8uUB9A7idnnJA4LeO4cAc1mgENidcpMbf92JnkhACcMAXRQE0q5KC7OL4lJBNkhS5VCFgBT3x+M0Atw+ei8S3cpW9zfnvNdATujR0Upb02LrxHVh00x3DjxkJxhYGKjqStZeegE/1DwJUNY1+smH9WU/3xu+orGZQbyCfaEU7uy7ZTyYLDPza1FTez/EgmQhYCUj4WzQGDRCJYizrL5TsxMmoXnrEMwKkX75BI93eqmlEJQVSr7Km648n6XqhjXpy+OORjPwZArzFZzcIBhgpQhQgVe1Y8hAElxs9fifE8CwrFPRhUz7lPNu9iEBmLKUV1XP0JQOnd/GoOlXixOIzj0ccTBsK4g/Gjx64YSWaLg/aYaE5mUXJ5BYwHnPRkX9ZoF9LUihOR7yNWlRZrPQjmyt74Yc8K2V9t1xaMDo0o1YmVA/qpzCj5GyC8x/87YgY5JwFf0L4RkolGVIk78IOSUx5PrA6r9V5Hd9XwG2eC1FVHj05lA7ozI4gipgp8gKYUC05BvzY9C+EpyWUfPkiB1KvLvxo0kDKvBe5a77VcatKwJYxYsKaprSVWVcRAQO0/Zflno/0kTcBguAqRGMxdAcnqy3uiGxQSvpE+pQD5KUpTEYC8dr7YHgJFqe7pP4PFM5/gJaW9ZVqxJJHocy+w9EVaBqhK+4DIr8ELpTl2AYvp579eB1WRabOh30q0LEvemQtNDlHFvGbGDvSbgw5NbjHsjFQWhsbjFeuHPxid4/tsylarrNu7tlhasg232toLnfCb+IEUioq8YEPiNpOCDLjWIycaNzhVOJz7osu0gTVIrquDXa+McUBWHp4QeXDdDCMAdW0U+POttkUQEs6cc1mQhOv7ncsi2FzrmK1wnfKRe9hgcu87A1tUdAbNaScbb9F9WlWZEesUyaLVJThaSo866rnIyKbc6wEo4TwpjFLrO6/R4WHhdSOE3z3Mj1VFJ/zqe9ndmMNZ+GhLeEBhMCXOjsWoEZt7SK4+nLHLkJNzYDivURIFdP8WbD/aKpALggY5kPVSPLE8AI0KG4hxxwCzmEXgODoQjsa81CjCAEhThqdcABszuNK2TJ4xwfMB8OviLV9yn+okh11TEfNjoV5flRQq7CyomXCfU7huLoZqZiUJp7D+HQLRUSS+8p7JbnbxBy9spLpIzOCKU6lZ6O981CfwdBxYZSKSOEtp7i3xYSpy1NggGNcmz8cmPO/MwMjh7reQHK3ofsBsPnHDAkdAV2OnbgjgTvj8sFyuXnztvH3L0/8ALaosSLBOs8pr3PferUMqMBRNoqe1WgqJplmywFIWyIM1HFPU1/8l7rRiibMwi1APUQoQ/oJQmBgxMU/JhZqGFK8ccBQ9yB+tLMdbmfRATtYhkTSg+7lGynLEt2mwE3O7jmxkOzDNRG72oDoyFe6qMj1OxEmKd4KCp9q2MLAQ33m0IVBKbU/14M81BNopFju2U7zVJyxAsAxjeT+Dk34dmw23ytkTc62tlGJa11o9t8ftEH+atko54ZTPCG6/zEQeP/mi6RmHc4h54Sl4zQzJQdDJ7S6ZXed24Ola/9qvP2Un+JW9Yl//pkbLHvxFUie/oC9L7c0dwBCnBLQXa1VlCtQV3sH4vVrL15YXTDmIBTQZQl5Rta23yIXuo9b9cyHX2YGlomL0iRobXT1C27AHmJpq2+Z7MAzPbvYBFM9vnQiz9jDhLjjYE3odu9mmEWn+D0v2Ehxa8xAzTzdsxKRLiRMV6vv8S/+fGiuwswBtnPxtMr3aQJCwntZPRcXMYsnQ8sajjv5NPb7MoZQJ8Eq54YaeUcHf+DcFYMlYFHUCqNJhH/W3avpN2RI+sWfkm2z9/AQ/A3XRlzoUks67fpkhiN2eNmiM9G41dH9Q/nRMC15jGBcsk66PsHE8Dp/m5MKVOyTs7zu4qQP+F9yg5KvkekE4rDQyHaKmrY8lm9D32tk/F0eaTIytveP14XEMW1skN2kosHLv6sKu+9O6omdseCMRVF0rUH8Z7ukVdHvLnb8962mhDsCJ82f4rZUe81Pt5jaGL5DVW7t+Nfcd3Ph68nUmhM+QqU3vCt4KPB0edm7gclvA3LHl5zKBkvHfX4Y/v7yrkywyaFzUBEd4YMTpkV4nY3Z4kGK3ukPKBA9e8VYKs3/meWOrty3nS+R+iccWzI/3N14ZxlyXpvBH+Aeiv9cTkyjdI+bVjVnrnjQM7vNRkTqdjMcCx1mgYEa7+4n3P3ysfy/gnCzz2nHh7WRaaYLmiiXfCq3l4jqbbMgSPoGRgVNOCJ/E1ZmjR9qzUp9duezVkBEAASSDeLhNRPqe5uFLE6GoFXPm7PvzRXqrmpFJebo+HGSImBILd7Wk2YsS/qR6alGmj7pfn0enBaD/3Hwb6OHIR0r//pxtHjLlcKDb8ef3DVxGccaJ2mdWb35ZCBHDFe8YUlEAU4HraFpBWxv4RczGoXWyK8y7322TkENr7vRephXiWr+lh4RndoBYJc1gExEREcTtUP5lbt7kv/fm64+x0SVz5sFUZN2qytn43w/GcksTnuIke/EIMT38Ra5ori3hAG0Hiq8D/QqHz8SB6OH/32+PeXtLayeqVOZ4BOy9U1kVLb8sJQ1xvAvEaKQ5UXsu2xS5XYZgr7U6w8xUb0mm8HQBVvJo3IOKxR+x4sm/MehHIIxRiCXMiOjNq7xBsMwPdNRJID+oNs5yFvzzgRlNZ/erYkDIl7hE+pOoNBPMJ50dEp1ZjGqEJO1MpWqaxtqIdhwd2ANj3vglIeuwrcfyROjKV6/9siZFPDNusxu/4SyvycCa0ETaxsVx19Zv2EOiudcp5KPfM4JVWkrmmMmtuQ43msJKEDg8rObgt9o1r4uUBl+vOIcXoZF9dXtT3TzLavSIzLwSsGfids9zPVD5SYwbRF7HujH9DVtA8UG4Adl1aGI1ZoxNl+nlON9m/JnAGUQEIkEui/MjYRzAUAhC1DVLA6ljqrlyHKeZjy0Gog9hB70a/fls+nGtw5yrvOIVnWpO0yYTFL5whNMrSGsZSLU8phHN267tB63V1eEMTnjaCwcQd7BlU3xFomBRq9LTGUNP3yAn/w7qtFSEpccn7eUOaPZVfsgqZNQuxpM6Anls9sOvh+CuJzjD/7cZxv1AJvmNiho7v3i6vgrXv/NJ75GMd6pAzuMRtnAVhFLJa1p7qc83a6rjTnUASQnUy9wlmgcPDWCiN0Lm5Hx1wvVKrmtWHqgu+ZZDKWEtQ+ISzm0thwt9mKvwzGMZacp7r8c9MIYVVs1Zeb3AEv+EoihTu21cJu2sot3eGOpjz6Ivm+rM6yLPY3atE6JuNKGzPICGfUl3Oxr8t07I/BDzV3bSpZ0QiwnvcYS8heBe6xiVgOJKlp/K3qUcQA9ORKVlvydFxJVt9jZKPbsCmVkyDfvwQ9D/VLPJi7KJ89bTMvwuB5KJmGuL4mF4MERe92GJgHLVmon5s06GV5bIMiWJOJltQ76mOjNb83P2kWScw2gjyMaxDGJNIZzIqhUfP+7Oyli8W71AEowyZlGayJSzjIdLcEYBW4BaLoU5PfnrK5W4/ADoudk6WfSQE7GZcCL1qOKDQwQAFMEkmRmJeyFe7AXClTNLMJrkQBsu7pfNRg5MND++ttTBLBq7OtLvI3k72S2krubRv7KT1vepSEibWppOidTZTeqvTLhiCzrVUbVftLqTEjJkXFUznf6dYSiSnKhLeMhDU38Kaz++pq8SF8f/vb95Havnbga8OC8yc6E9nXf6GyUPgOJI3/aBM4ME7Ds4ffoTW2nWUYGJORJlufsTlDcUopsCgYmMhmrdJW1Bhk3LlA6/FwmI0UFuoR+01GVInjdGmoDNol03kXdyzpvXyTS9fbi33kSaObF/fAJk/tNikdmM7yn4Zkt/ESwrLcJ0WhFG4sfyq5U1a1i7cszKsaOOW65HyiSW88NANBO3XuLxMWXIujalYG9VUBjZf/UpyHQhoJQyOxg4Sf6xm17omMi2uN3DkVl/YbmZYh/HO4Xl27FUZpkyH/CuW/SoZ8caDeNyvUF9Su909zmE6qD+9kwh8YGN3TDxJ/GdqJ0WyeGsdNUqnXwBvmIapN6uBSCBccU+Q6KeifUyj3WpGYj+qtMXdhJiI6jS7N4s2GnD5+1vwjwmoPMRPFzTgYP1Bfx7sZ+9DRS83tYwgxmKh294Io2qFsPlppSQE2NIOhoaOm99INrRmoRam4I0zAMjG3yaD5ygCLtugNULCOIHpSl/ASAcZL3B6+aUYUC6XT8A/iSJhpuPiCWF1D6t7RtDzZ3MTpivTy68oL8P5ry/ZnOGxBWR1RdT+KSp0b6GMZY7TjRmiBD5IykWnhjRtIHyGtTLpJJbdBkE+TbhjFOdavmfo6JG3omjbgdWxxe/xfb7KMvmtGzuvxXg5OMCo/ODfwClqSz/xVh3sbZqi9ET+oex8KLaGqqcwX5JTtOCkuhXX5Wi1VgI12unyfOVG2nxDcZ1Q7QiQ+tU2Ejkj+bluox97MeB8LMFuUrKKZoAPxIy8LDLjQvrIo/gIsIlMMVhGxTcQ3H6SENs9lAJ87d5cfArt8ytxnjIefpFVMKYR5vRi3o9P6uSYlw5p7EzmAbz9mBdgyEqZirunwAiq8cf7aQeCxpduuEt9qWukCuMGF3E0QbUntBoXhFk1bJwKKVOsA4jg+pILg5+QZh3VgJnAziumS679wNONAU9l3Kk0soYxjfaOxtNen/LHaumXUrlztxaVk7kUeff35QUURLikemFXjA/a0UTQnUR+mCHV6qd9HY18LD4IX9D+/IgIRRSFiCjbj/of2ezE0EwoY/hTLEDpJkffqgOu2c4mSwZm5VvXIG8ODZoQYg7e0Ux68DvGr0hLJjnbf+l9pHwTIwbN9Mlv8d5UfOA81YSesiMiaPoPalk5peyN59axtoD89ebtKwK6UNVixGiwTRDcCBXRB1SGdoUfDyEWnCf4y4157NCfEVYRetcoc+SH0TnqnLn1kTn95ufGv6eqnuUx7GR+PjnsDlz26lKv6J8gT28shXyYrkd8crBo4i5k92RR2rSbhCN9s7tFHI6OAEip4/V3F/7WZN5ojwtMa93aoZnmgmHWeZUX2lxAfU67yl/N7onHDYkwGzepsYi0RUcTGQ4J1NgvGhgxswPbGR3Jhfr0q1oz3KE20hE9/TMhQ6cmRjCkXpL9vlC8cRFDGefjPWncZqQLpIDotLeHMEQ1GIc3LEDg7WotDDbmv/VozqhSVo61i78gy3iFB+pmIPKneJv/XBzpT++wbFVHjT/+K2MFlCjBceERr1xPnVInylySdVEFuww0oxb9/AMu8P5izdapFldJ4A9RwC3pjJ5EK3nx2W5vp6/7i/SELi+M5XMK+eZFjLJO6zHrQkm8LhT2SlI+uFyvYKzVNDDDAy3Q7gIgQnizwis6lmJBBaKpZA4PfbwzubkWmbchj/D8xbBxGp9KON4ACqH57Q/1exGWgFkh/opjDwhgfFL4U/Iu88dahTdTx/nFnxupqDomH99vuJx+aNZ4FXDWgkwZzm5FalbmUY8rw8nfAQYrXmQiVtrUr8rDtBAOB/N3U0ONsKMPaE6WkVkoRZQOASsqJi74WRH/GAKGIEyE27EzyFUY2CM4S37SnkAeTk/rvsIwMbt05kvsYAFbhFRgzlgeYq7xhM1BVbBGkMKT6mT5H6PvHH5jiTybguRiB0t9rGfNihyYB+mf1G6byOjT6oipP+qcSmQgXLklI4/duy7KihRgNnSUcJdxPlWPoH+9Yd8wVbOlTupE0zLNNxtivz3z5f/Wq26KyJt/UAbcVM6SbWadIoGRlnQm+Km1jiluif6q7x0HQCNx9WUop+YtYAt8ktdFshZwuX9F1eZFLmmoyJ0qB62zLt+7/8VR39+8vkW2LVW/rsIh5G9TZPu8FHB/3K4LTa9l8hLt6bJNzmOKBDbtEHKdquIHKcFIzYqgtCyTsgjSTglV8leGBoQwnVIIlRKbQlkbYcqWrTOvN3gHC0obol/18lzv1dLxgyUIvEfLOIBjbxS2rLeYZu3UfLAdZIPQIF0MyWAHsJ0xI6nvlkXRJUFzj2RoRnFUQ9NSQB6o4Vo9CHEyWpPsbn/Cz7x/Cp9Nh6xm0s96aGYBWzkmHzq9Wo0UJiB9KlemQMcpjRCHeb4g7Ejpz7pXOxkeX6hiXnfaybvYdpLI3oIHAKXAGxNYdu7EkOSvdJ6v8AlDNO1txpijsDO4xCuY45xaDGDdAmA+vEhLAlNgSo6zzbfyItytXv3f+yYxmSxtcznCJ4UhbYSOtusg54yX+mnZUGYetfxXieBbjJlPEbfg3NFQ9mZTMdVK83cgSzCCyk1g9M9qV8qy1vQ9ybJCQ7YXCsySpAFluMBJvz5jHdvJ1+waPtPNae2/rVnL/+heYfJIY8LQdFl3HAlorpq3pxHy9c6FjhyDiV/BC8+qS4owT81/HZ2Udtj0VtK0hf0TuL+/vRy0m84CmTvbAxy4f8LwumFlKaswXt6eQ4+p1TlLWFSb+B19YVZ/36vN0f8VoOyDwMTHC6tbSo28a8IKVpKMK5bzB0J/YKk0vNcyG+oUPHCLXbBlJhaqXz22n1CezhVCa8lJ9OhdFepc5wGfyEAwJPDyMvHkBp8guZ/HlRp1dKfDRQEKzYbZzfEtNLTCpxLtnuumW3ASxX/xIBNk0ZW/4BlAtY007MiVzobjy3074I8JMBRIys7lLQeVgv55RfaH8BCmnjhqNjZlhcmaTusrXZUbZvYUdlkT4O7JIkzFJA2BY+Q5pzo3wXnvCjsM4V9gJY+r9hmnjH7XSqj5ltJ6e/NgmFjwXoc1CqxKaragQqhWcqAx/YHiwD4qLKEFTOkpNEyBo1YhQF4LGh9ormwBSvtCMOkIZ80Vdcbkzpz1hyRBL3bc1K12321EICyjilO+BYMC50Nf2n0YiGboabacu9/U8wH+E+lLeVbSCFj1d9zHySioaADoN4MafkplBVV+Ph2wpWEDQI7JgkynnynERrKIoaUoDhiuUJq0twh5LWVXs/qoziaaTFnHrXpihKKDbsbls+wNAUFbPdhbybDFnGUm6yS4kEx4cUqm39qB2LDsVj8ARy9H/6koxu4MGVGD43yk7hP9BMKm5ivhOVoglA9hX663jJ2JM/vzyewKfC1WvNDBv9LQGZLBfI4kRSHYc4A2mAALhKoY9B60H/dfRLFLsE8yAv5k4BZDXfXm/eH22SCoNygNiTRGL7XtX+9pgE03FTmS0kLOO9yDe853qxif+yVfXTut15s3QhPVkr/pA4PJJuZybtZwIcKwPdJw2mR8CPgmGI2002C6sB8/MBjGgoE6Voaxf2EkQocYXcKgPy44V6DxiP+ocSjrDyc7lLFkYYmeoHS8QGcH/amagKv0Uuu2uHTzAxGMI6TXk5I3DKO5cbgVwHkA1FtWiJ88PQy6gc69pCn3HPb2NhvVWkYsM8v5BHnv53W9jfUmiODALFi0rDlg+kabIj515dUb4NPOPErv7esjclZ1ijTzB3A4XG8kMmlOMyb2WgbdsjneKge+QX55k4qyVlcLSNfuBIIdyeTtgyRfvRZsB6+J3uQGA1LqoLzaOn8eNkvSRMCCWtoEup8sP87t8JoNIU0LLpTXyI1PQq1MCCZZ6uTz+GQ4zGX9FH2wYtwOTGp38MW1XGd/Bk3zXtAfWCjmGIK5nYzm7uTTk3AmUl8qXF3hjKtuahOi/iHHhT2tcoqYzvqbPcmtIwTelazBsTAjvhTQtCmj48unYyxBcLauKvOfBALjSLOv4AFrJuwEl1rWS3p2x7wCbpFCrmI4iXG9M+QnMGY7imrz+Kb8GO7SLO+ctPsAAAWJEFAIZSkIa0EoADQfXEDfJysP/95SDDHBHkAA2TMAAAAAA';
 function forceLogo208(){
   const aside=document.querySelector("aside.nav188");
   if(!aside)return;
   let brand=aside.querySelector(":scope > .navBrand207");
   if(!brand){
     brand=document.createElement("div");
     brand.className="navBrand207";
     brand.innerHTML='<img alt="А-Темир Строй">';
     aside.insertBefore(brand,aside.firstChild);
   }
   let img=brand.querySelector("img");
   if(!img){img=document.createElement("img");brand.appendChild(img)}
   img.src=LOGO;
   /* Всегда держим логотип первым элементом ASIDE */
   if(aside.firstElementChild!==brand)aside.insertBefore(brand,aside.firstChild);
 }
 document.addEventListener("DOMContentLoaded",function(){
   forceLogo208();
   setTimeout(forceLogo208,250);
   setTimeout(forceLogo208,700);
 });
 if(document.readyState!=="loading"){forceLogo208();setTimeout(forceLogo208,250)}
})();


;


(function(){
 function renderEditor223(){
   const box=document.getElementById("reportPhotoThumbs223"),cnt=document.getElementById("reportPhotoCount223");
   if(!box)return;
   reportPhotos=Array.isArray(reportPhotos)?reportPhotos:[];
   if(cnt)cnt.textContent=reportPhotos.length+"/12";
   box.innerHTML=reportPhotos.map((p,i)=>
     '<div class="reportPhotoThumb223"><img src="'+p+'" alt="Фото '+(i+1)+'">'+
     '<button type="button" class="reportPhotoRemove223" data-i="'+i+'" title="Удалить">×</button></div>'
   ).join("");
   box.querySelectorAll(".reportPhotoRemove223").forEach(b=>b.onclick=function(){
     reportPhotos.splice(Number(this.dataset.i),1);
     renderEditor223();update();autoSaveLocal();if(window.saveReportPhotos225)window.saveReportPhotos225();
   });
 }
 function bind223(){
   renderEditor223();
   const inp=document.getElementById("reportPhotoInput223");
   if(inp&&!inp.dataset.bound223){
     inp.dataset.bound223="1";
     inp.onchange=async function(e){
       const files=[...e.target.files].slice(0,12),fresh=[];
       for(const f of files){try{fresh.push(await compressPhoto(f))}catch(err){}}
       reportPhotos=fresh;
       renderEditor223();update();autoSaveLocal();if(window.saveReportPhotos225)await window.saveReportPhotos225();
       inp.value="";
     };
   }
 }
 window.renderReportPhotos223=renderEditor223;
 document.addEventListener("DOMContentLoaded",()=>setTimeout(bind223,150));
})();


;


(function(){
 const DB="ATemirReportPhotos";
 const STORE="photos";
 const KEY="current";

 function openDB225(){
   return new Promise((resolve,reject)=>{
     const req=indexedDB.open(DB,1);
     req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(STORE))req.result.createObjectStore(STORE)};
     req.onsuccess=()=>resolve(req.result);
     req.onerror=()=>reject(req.error);
   });
 }
 async function save225(){
   try{
     const db=await openDB225();
     await new Promise((resolve,reject)=>{
       const tx=db.transaction(STORE,"readwrite");
       tx.objectStore(STORE).put((Array.isArray(reportPhotos)?reportPhotos:[]).slice(0,12),KEY);
       tx.oncomplete=resolve; tx.onerror=()=>reject(tx.error);
     });
     db.close();
   }catch(e){}
 }
 async function load225(){
   try{
     const db=await openDB225();
     const arr=await new Promise((resolve,reject)=>{
       const tx=db.transaction(STORE,"readonly");
       const rq=tx.objectStore(STORE).get(KEY);
       rq.onsuccess=()=>resolve(rq.result||[]);
       rq.onerror=()=>reject(rq.error);
     });
     db.close();
     if(Array.isArray(arr)&&arr.length){
       reportPhotos=arr.slice(0,12);
       if(window.renderReportPhotos223)window.renderReportPhotos223();
       if(typeof update==="function")update();
     }
   }catch(e){}
 }

 window.saveReportPhotos225=save225;
 window.loadReportPhotos225=load225;

 /* Сохраняем после выбора файлов, когда обработчик v223 уже закончил сжатие */
 document.addEventListener("change",function(e){
   if(e.target&&e.target.id==="reportPhotoInput223")setTimeout(save225,1200);
 });
 document.addEventListener("click",function(e){
   if(e.target&&e.target.closest&&e.target.closest(".reportPhotoRemove223"))setTimeout(save225,100);
 });

 if(document.readyState==="loading"){
   document.addEventListener("DOMContentLoaded",()=>setTimeout(load225,350));
 }else setTimeout(load225,350);
})();


;


(function(){
 function tune243(){
   try{
     var view=localStorage.getItem("atemir_view188")||"home";
     if(view!=="home") return;
     var works=[...document.querySelectorAll("#rWorks .reportWorkDay")];
     works.forEach((x,i)=>x.style.display=i<20?"":"none");
     var acted=[...document.querySelectorAll("#rActed .actedMonth")];
     acted.forEach((x,i)=>x.style.display=i<10?"":"none");
   }catch(e){}
 }
 var oldUpdate=window.update;
 if(typeof oldUpdate==="function"){
   window.update=function(){var r=oldUpdate.apply(this,arguments);tune243();return r}
 }
 function ready(){
   tune243();
   document.body.classList.add("ready243");
 }
 function finishBoot246(){
   /* В desktop-приложении не ждём искусственно "спокойного DOM".
      Основной отчёт показываем сразу после первой отрисовки. */
   requestAnimationFrame(function(){requestAnimationFrame(ready)});
 }
 if(document.readyState==="loading")
   document.addEventListener("DOMContentLoaded",finishBoot246,{once:true});
 else finishBoot246();
})();


;


(function(){
  function clearPhotos247(){
    try{ window.reportPhotos=[]; }catch(e){}
    try{
      var req=indexedDB.open("ATemirReportPhotos");
      req.onsuccess=function(){
        try{
          var db=req.result;
          if(db.objectStoreNames.contains("photos")){
            var tx=db.transaction("photos","readwrite");
            tx.objectStore("photos").delete("current");
            tx.oncomplete=function(){try{db.close()}catch(e){}};
          }else{try{db.close()}catch(e){}}
        }catch(e){}
      };
    }catch(e){}
  }

  /* Перехватываем именно кнопку очистки, до старого обработчика,
     чтобы фото не успели восстановиться из IndexedDB. */
  document.addEventListener("click",function(e){
    var b=e.target && e.target.closest ? e.target.closest("button") : null;
    if(!b)return;
    var t=(b.textContent||"").trim().toLowerCase();
    if(t.includes("очист") && t.includes("отчет")){
      clearPhotos247();
    }
  },true);

  window.clearReportPhotos247=clearPhotos247;
})();
