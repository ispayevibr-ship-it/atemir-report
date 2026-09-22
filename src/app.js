const views=[["home","Отчёт"],["progress","Сводка объёмов"],["works","Выполненные работы"],["bom","Ведомость марок"],["invoices","Поставка"],["people","Ответственные / работники"],["machines","Машины и механизмы"],["dynamics","Динамика работ"],["deadlines","Сроки выполнения"],["acted","Актированные дни"],["penalties","Штрафы"],["manage","Меню управления"]];
const manageViews=[["object","Объект"],["types","Виды работ"],["tasks","Задачи / ведомость"],["reportInfo","Дата, погода, фото"],["deadlines","Сроки выполнения"],["works","Выполненные работы"],["invoices","Поставка"],["workers","Работники"],["responsibles","Ответственные"],["equipment","Машины и механизмы"],["acted","Актированные дни"],["penalties","Штрафы"]];
let state={companyName:"",object:"",address:"",client:"",reportDate:"",weather:{temp:"",wind:"",precip:""},workTypes:[],tasks:[],workDays:[],invoices:[],workers:[],responsibles:[],equipment:[],deadlines:[],actedDays:[],penalties:[],reportPhotos:[],companyLogo:""},view="home",manageView="object";
const $=s=>document.querySelector(s), esc=v=>String(v??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const arr=n=>Array.isArray(state[n])?state[n]:[], card=(t,b)=>`<div class="card"><h2>${t}</h2><div class="body">${b}</div></div>`;
let saveTimer=null,saveBusy=false,saveAgain=false;
async function flushSave(){
 if(saveBusy){saveAgain=true;return}
 saveBusy=true;
 try{await ATemir.save(state)}finally{
  saveBusy=false;
  if(saveAgain){saveAgain=false;await flushSave()}
 }
}
function save(immediate=false){
 clearTimeout(saveTimer);
 if(immediate)return flushSave();
 saveTimer=setTimeout(flushSave,450);
}
function table(rows,cols){if(!rows.length)return '<div class="empty">Нет данных</div>';return '<table><thead><tr>'+cols.map(c=>'<th>'+c[0]+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+cols.map(c=>'<td>'+esc(typeof c[1]==="function"?c[1](r):r[c[1]])+'</td>').join('')+'</tr>').join('')+'</tbody></table>'}
function fieldEditor(key,r,i,f){
 const [label,k,type]=f, val=r[k]??"";
 if(type==="projectcode"){
  const typeVal=r.type||"", opts=[...new Set(arr("tasks").filter(t=>(t.type||"")===typeVal).map(t=>t.code).filter(Boolean))];
  const all=(val&&!opts.includes(val))?[val,...opts]:opts;
  return `<div class="field"><label>${label}</label><select data-list="${key}" data-i="${i}" data-k="${k}"><option value="">Выберите шифр</option>${all.map(x=>`<option value="${esc(x)}" ${x===val?"selected":""}>${esc(x)}</option>`).join("")}</select></div>`;
 }
 if(type==="bommark"){
  const task=arr("tasks").find(t=>(t.type||"")===(r.type||"")&&(t.code||"")===(r.code||"")), opts=(task?.bom||[]).map(b=>b.mark).filter(Boolean);
  const all=(val&&!opts.includes(val))?[val,...opts]:opts;
  return `<div class="field"><label>${label}</label><select data-list="${key}" data-i="${i}" data-k="${k}"><option value="">Выберите марку</option>${all.map(x=>{const b=(task?.bom||[]).find(z=>normMark(z.mark)===normMark(x)),left=Math.max(0,n(b?.qty)-usedMark(r.type||"",r.code||"",x)+(key==="workDays"&&normMark(r.mark)===normMark(x)?qtyOf(r):0));return `<option value="${esc(x)}" ${x===val?"selected":""}>${esc(x)} · остаток ${left}</option>`}).join("")}</select></div>`;
 }
 if(type==="readonly") return `<div class="field"><label>${label}</label><input readonly value="${esc(val)}"></div>`;
 if(type==="worktype"){
  const opts=arr("workTypes").map(x=>x.name).filter(Boolean);
  const all=(val&&!opts.includes(val))?[val,...opts]:opts;
  return `<div class="field"><label>${label}</label><select data-list="${key}" data-i="${i}" data-k="${k}"><option value="">Выберите вид работ</option>${all.map(x=>`<option value="${esc(x)}" ${x===val?"selected":""}>${esc(x)}</option>`).join("")}</select></div>`;
 }
 return `<div class="field"><label>${label}</label><input data-list="${key}" data-i="${i}" data-k="${k}" type="${type||"text"}" value="${esc(val)}"></div>`;
}
function rowEditor(key,fields){const rows=arr(key);return `<div class="editorRows">${rows.map((r,i)=>`<div class="editRow">${fields.map(f=>fieldEditor(key,r,i,f)).join("")}<button class="danger" data-del="${key}" data-i="${i}">Удалить</button></div>`).join("")}</div><button class="btn add" data-add="${key}">+ Добавить</button>`}

function n(v){const x=Number(String(v??"").replace(",","."));return Number.isFinite(x)?x:0}
function qtyOf(x){return n(x.qty??x.quantity)}
function taskVol(t){return n(t.volume??t.qty??t.quantity)}
function doneFor(type,code){return arr("workDays").filter(x=>(x.type||"")===type&&(x.code||"")===code).reduce((s,x)=>s+qtyOf(x)*n(x.per||1),0)}
function deliveredFor(type,code){return arr("invoices").filter(x=>(!x.type||x.type===type)&&(x.code||"")===code).reduce((s,x)=>s+qtyOf(x)*n(x.per||1),0)}
function normMark(v){return String(v||"").trim().toUpperCase().replace(/[–—−]/g,"-").replace(/\s+/g,"").replace(/^K(?=\d)/,"К")}
function bomRows(){return arr("tasks").flatMap(t=>(t.bom||[]).map(b=>({...b,type:t.type,code:t.code,unit:t.unit})))}
function usedMark(type,code,mark){return arr("workDays").filter(x=>(x.type||"")===type&&(x.code||"")===code&&normMark(x.mark)===normMark(mark)).reduce((s,x)=>s+qtyOf(x),0)}
function bomView(){
 const rows=bomRows().map(b=>{const q=n(b.qty??b.quantity),d=Math.min(q,usedMark(b.type,b.code,b.mark));return{...b,q,d,left:Math.max(0,q-d),status:d>=q?"Смонтировано":d>0?"Частично":"Не начато"}});
 const total=rows.reduce((s,x)=>s+x.q,0),done=rows.reduce((s,x)=>s+x.d,0);
 return card("Ведомость марок",`<div class="stats"><b>Всего: ${total}</b><b>Смонтировано: ${done}</b><b>Остаток: ${Math.max(0,total-done)}</b></div>`+table(rows,[["Работа","type"],["Шифр","code"],["Марка","mark"],["Наименование","name"],["Выполнено",x=>x.d+" / "+x.q],["Остаток","left"],["Статус","status"]]))
}
function dynamicsView(){
 const groups={}; arr("workDays").filter(x=>x.date).forEach(x=>{const k=(x.type||"—")+"|||"+(x.code||"—")+"|||"+(x.unit||"");groups[k]??={type:x.type||"—",code:x.code||"—",unit:x.unit||"",daily:{}};groups[k].daily[x.date]=(groups[k].daily[x.date]||0)+qtyOf(x)*n(x.per||1)});
 const cards=Object.values(groups).map(g=>{const ds=Object.keys(g.daily).sort();if(!ds.length)return"";const max=Math.max(1,...Object.values(g.daily));return `<div class="chartBox"><h3>${esc(g.type)} · ${esc(g.code)}</h3><div class="bars">${ds.map(d=>{const v=g.daily[d];return `<div class="barCol" title="${esc(d)}: ${v}"><span>${v?v.toFixed(2).replace(/\.00$/,""):""}</span><i style="height:${Math.max(3,v/max*100)}%"></i><small>${d.slice(8,10)}.${d.slice(5,7)}</small></div>`}).join("")}</div></div>`}).join("");
 return card("Динамика выполненных работ",cards||'<div class="empty">Добавьте выполненные работы с датами.</div>')
}
function ganttView(){
 const today=state.reportDate||new Date().toISOString().slice(0,10);
 const cards=arr("deadlines").map(dl=>{const t=arr("tasks").find(x=>(x.type||"")===(dl.type||"")&&(x.code||"")===(dl.code||""))||{},start=dl.start,end=dl.end||dl.date;if(!start||!end)return"";
 const s=new Date(start),e=new Date(end),td=new Date(today),span=Math.max(1,e-s),pp=Math.max(0,Math.min(100,(td-s)/span*100)),vol=taskVol(t),act=doneFor(dl.type||"",dl.code||""),fp=vol?Math.min(100,act/vol*100):0,expected=vol*pp/100,stateCls=act+1e-9<expected?"behind":act>expected?"ahead":"ontime",status=stateCls==="behind"?"Отставание":stateCls==="ahead"?"Опережение":"По графику";
 return `<div class="gantt ${stateCls}"><div class="gHead"><b>${esc(dl.type||"Работа")} · ${esc(dl.code||"")}</b><span>${status}</span></div><div class="gDates"><small>${start}</small><small>Сегодня ${today}</small><small>${end}</small></div><div class="gTrack"><i class="gFact" style="width:${fp}%"></i><i class="gToday" style="left:${pp}%"></i></div><div class="gMeta">План на дату: ${expected.toFixed(2)} · Факт: ${act.toFixed(2)} · Всего: ${vol}</div></div>`}).join("");
 return card("Сроки выполнения — график",cards||'<div class="empty">Добавьте сроки с датами начала и окончания.</div>')
}
function calendarView(){
 const work=new Set(arr("workDays").filter(x=>x.date&&qtyOf(x)>0).map(x=>x.date)),acted=new Set(arr("actedDays").map(x=>typeof x==="string"?x:x.date).filter(Boolean)),all=[...work,...acted].sort();if(!all.length)return card("Календарь работ",'<div class="empty">Нет дат.</div>');
 const last=state.reportDate||all.at(-1),ym=last.slice(0,7),y=+ym.slice(0,4),m=+ym.slice(5,7)-1,days=new Date(y,m+1,0).getDate(),off=(new Date(y,m,1).getDay()+6)%7,names=["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];
 let cells=names.map(x=>`<b class="calHead">${x}</b>`).join("")+"<i class='calEmpty'></i>".repeat(off);
 for(let d=1;d<=days;d++){const ds=ym+"-"+String(d).padStart(2,"0"),w=work.has(ds),ac=acted.has(ds);cells+=`<div class="calDay ${w&&ac?"both":w?"work":ac?"acted":""}"><b>${d}</b></div>`}
 return card("Календарь работ / актированных дней",`<div class="calendar">${cells}</div><div class="legend">Работы — зелёный · Актированный день — красный</div>`)
}

function fmt(v){const x=n(v);return x.toLocaleString("ru-RU",{maximumFractionDigits:2})}
function groupedWorksView(){
 const by={};arr("workDays").forEach(x=>{const d=x.date||"Без даты";(by[d]??=[]).push(x)});
 const dates=Object.keys(by).sort().reverse();
 return card("Выполненные работы",dates.map((d,idx)=>`<details class="reportGroup" ${idx<3?"open":""}><summary><b>${esc(d)}</b><span>${by[d].length} поз.</span></summary>${table(by[d],[["Вид работ","type"],["Шифр","code"],["Марка","mark"],["Наименование","name"],["Кол-во",x=>x.qty||x.quantity],["Ед.","unit"],["Итого вес",x=>x.totalWeight||""]])}</details>`).join("")||'<div class="empty">Нет данных</div>')
}
function groupedInvoicesView(){
 const by={};arr("invoices").forEach(x=>{const d=x.date||"Без даты";(by[d]??=[]).push(x)});
 return card("Поставка",Object.keys(by).sort().reverse().map((d,idx)=>`<details class="reportGroup" ${idx<3?"open":""}><summary><b>${esc(d)}</b><span>${by[d].length} поз.</span></summary>${table(by[d],[["Вид работ","type"],["Шифр","code"],["Марка","mark"],["Количество",x=>x.qty||x.quantity]])}</details>`).join("")||'<div class="empty">Нет данных</div>')
}
function penaltiesView(){
 const rows=arr("penalties"),total=rows.reduce((s,x)=>s+n(x.amount),0);
 return card("Штрафы",`<div class="stats"><b>Количество: ${rows.length}</b><b>Общая сумма: ${fmt(total)}</b></div>`+table(rows,[["Дата","date"],["Описание",x=>x.text||x.reason||x.name],["Сумма","amount"]]))
}
function monthCalendar(ym,work,acted){
 const y=+ym.slice(0,4),m=+ym.slice(5)-1,days=new Date(y,m+1,0).getDate(),off=(new Date(y,m,1).getDay()+6)%7,names=["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];
 let cells=names.map(x=>`<b class="calHead">${x}</b>`).join("")+"<i class='calEmpty'></i>".repeat(off);
 for(let d=1;d<=days;d++){const ds=ym+"-"+String(d).padStart(2,"0"),w=work.has(ds),ac=acted.has(ds);cells+=`<div class="calDay ${w&&ac?"both":w?"work":ac?"acted":""}"><b>${d}</b></div>`}
 return `<div class="monthCard"><h3>${new Date(y,m,1).toLocaleDateString("ru-RU",{month:"long",year:"numeric"})}</h3><div class="calendar">${cells}</div></div>`
}
function multiCalendarView(){
 const work=new Set(arr("workDays").filter(x=>x.date&&qtyOf(x)>0).map(x=>x.date)),acted=new Set(arr("actedDays").map(x=>typeof x==="string"?x:x.date).filter(Boolean)),all=[...work,...acted].sort();
 if(!all.length)return card("Календарь работ",'<div class="empty">Нет дат.</div>');
 const base=new Date((state.reportDate||all.at(-1))+"T12:00:00"),months=[];
 for(let i=2;i>=0;i--){const d=new Date(base.getFullYear(),base.getMonth()-i,1);months.push(d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0"))}
 return card("Календарь работ / актированных дней",`<div class="multiCalendar">${months.map(x=>monthCalendar(x,work,acted)).join("")}</div><div class="legend">Работы — зелёный · Актированный день — красный</div>`)
}
function photoReportView(){
 if(!arr("reportPhotos").length)return"";
 return card("Фотоотчёт",`<div class="photoCollage">${arr("reportPhotos").map((p,i)=>`<img data-lightbox="${i}" src="${typeof p==="string"?p:(p.data||p.url||"")}" alt="Фото ${i+1}">`).join("")}</div>`)
}

function summary(){const rows=arr("tasks").map(t=>{const done=arr("workDays").filter(w=>(w.type||"")===(t.type||"")&&(w.code||"")===(t.code||"")).reduce((a,w)=>a+(+w.qty||+w.quantity||0),0),del=arr("invoices").filter(i=>(!i.type||i.type===t.type)&&(i.code||"")===(t.code||"")).reduce((a,i)=>a+(+i.qty||+i.quantity||0),0),p=+t.qty||+t.quantity||+t.volume||0;return{type:t.type,code:t.code,p,del,done,left:Math.max(0,p-done),unit:t.unit}});return card("Сводка объёмов работ",table(rows,[["Работа","type"],["Шифр","code"],["Проект","p"],["Поставлено","del"],["Выполнено","done"],["Остаток","left"],["Ед.","unit"]]))}
function home(){return (state.companyLogo?`<div class="reportLogo"><img src="${state.companyLogo}" alt="Логотип компании"></div>`:"")+(state.companyName?card("Организация",`<b class="companyReportName">${esc(state.companyName)}</b>`):"")+card("Дата отчёта",`<b>${esc(state.reportDate||"—")}</b> &nbsp; Температура: ${esc(state.weather?.temp||"—")} °C &nbsp; Ветер: ${esc(state.weather?.wind||"—")} м/с &nbsp; Осадки: ${esc(state.weather?.precip||"—")}`)+photoReportView()+summary()+bomView()+card("Ответственные лица",table(arr("responsibles"),[["ФИО",r=>r.name||r.fio],["Должность","position"]]))+card("Работники",table(arr("workers"),[["ФИО",r=>r.name||r.fio],["Должность","position"]]))+card("Машины и механизмы",table(arr("equipment"),[["Наименование",r=>r.name||r.title],["Количество",r=>r.qty||r.quantity]]))+groupedWorksView()+groupedInvoicesView()+dynamicsView()+ganttView()+multiCalendarView()+penaltiesView()}
function management(){
 let b=`<div class="manageTabs">${manageViews.map(x=>`<button data-mv="${x[0]}" class="${manageView===x[0]?"active":""}">${x[1]}</button>`).join("")}</div>`;
 if(manageView==="object") b+=card("Компания",`<div class="grid companySettings"><div class="field"><label>Название фирмы</label><input data-root="companyName" value="${esc(state.companyName||"")} " placeholder="Введите название организации"></div></div>`)+card("Логотип компании",`<div class="logoEditor">${state.companyLogo?`<img src="${state.companyLogo}" alt="Логотип">`:`<div class="logoEmpty">Логотип не загружен</div>`}<div><button class="btn" data-logo-load>Загрузить логотип</button>${state.companyLogo?`<button class="danger logoRemove" data-logo-remove>Удалить</button>`:""}<p class="hint">PNG, JPG/JPEG или WebP. Логотип сохраняется вместе с базой и резервной копией.</p></div></div>`)+card("Объект",`<div class="grid"><div class="field"><label>Наименование объекта</label><textarea data-root="object">${esc(state.object||state.objectName||"")}</textarea></div><div class="field"><label>Адрес</label><textarea data-root="address">${esc(state.address)}</textarea></div><div class="field"><label>Заказчик</label><textarea data-root="client">${esc(state.client||state.customer||"")}</textarea></div></div>`);
 if(manageView==="types") b+=card("Виды работ",rowEditor("workTypes",[["Наименование","name"]]));
 if(manageView==="tasks") b+=card("Задачи — объёмы согласно проекту",rowEditor("tasks",[["Вид работ","type","worktype"],["Шифр проекта","code"],["Проектный объём","qty","number"],["Ед.","unit"]])+arr("tasks").map((t,i)=>`<div class="bomAttach"><b>${esc(t.type||"Задача")} · ${esc(t.code||"без шифра")}</b><span>${(t.bom||[]).length?("Ведомость: "+t.bom.length+" марок"):"Ведомость не загружена"}</span><button class="btn" data-bom-import="${i}">${(t.bom||[]).length?"Заменить Excel":"Загрузить Excel"}</button></div>`).join("")+'<p class="hint">Excel: Марка | Наименование | Количество | Вес 1 ед. | Общий вес. Ведомость привязывается к выбранной задаче.</p>');
 if(manageView==="reportInfo") b+=card("Дата отчёта и погода",`<div class="grid"><div class="field"><label>Дата</label><input type="date" data-root="reportDate" value="${esc(state.reportDate)}"></div><div class="field"><label>Температура °C</label><input data-weather="temp" value="${esc(state.weather?.temp)}"></div><div class="field"><label>Ветер м/с</label><input data-weather="wind" value="${esc(state.weather?.wind)}"></div><div class="field"><label>Осадки</label><input data-weather="precip" value="${esc(state.weather?.precip)}"></div></div><div class="photoTools"><button class="btn" data-photo-add>+ Добавить фото</button><button class="danger" data-photo-clear>Очистить фото</button></div><div class="photoGrid editPhotos">${arr("reportPhotos").map((p,i)=>`<div><img src="${typeof p==="string"?p:(p.data||p.url||"")}"><button class="danger" data-photo-del="${i}">×</button></div>`).join("")}</div>`);
 const configs={deadlines:[["Работа","type","worktype"],["Шифр","code","projectcode"],["Начало","start","date"],["Окончание","end","date"]],works:[["Дата","date","date"],["Работа","type","worktype"],["Шифр","code","projectcode"],["Марка","mark","bommark"],["Наименование","name","readonly"],["Вес 1 ед.","weight1","readonly"],["Остаток","remaining","readonly"],["Количество","qty","number"],["Общий вес","totalWeight","readonly"],["Ед.","unit","readonly"]],invoices:[["Дата","date","date"],["Работа","type","worktype"],["Шифр","code","projectcode"],["Марка","mark","bommark"],["Количество","qty","number"]],workers:[["ФИО","name"],["Должность","position"]],responsibles:[["ФИО","name"],["Должность","position"]],equipment:[["Наименование","name"],["Количество","qty","number"]],acted:[["Дата","date","date"],["Причина","reason"],["Значение","value"],["Время","time"]],penalties:[["Дата","date","date"],["Описание","text"],["Сумма","amount","number"]]};
 const keys={deadlines:"deadlines",works:"workDays",invoices:"invoices",workers:"workers",responsibles:"responsibles",equipment:"equipment",acted:"actedDays",penalties:"penalties"};
 if(configs[manageView]) b+=card(manageViews.find(x=>x[0]===manageView)[1],rowEditor(keys[manageView],configs[manageView]));
 return b;
}
function render(){$("#nav").innerHTML=views.map(x=>`<button data-v="${x[0]}" class="${view===x[0]?"active":""}">${x[1]}</button>`).join("");$("#title").textContent=views.find(x=>x[0]===view)?.[1]||"Отчёт";$("#obj").textContent=state.object||state.objectName||"Новый объект";$("#companyBrand").textContent=state.companyName||"КОМПАНИЯ";document.title="Отчет строительно-монтажных работ"+(state.companyName?" — "+state.companyName:"");const c=$("#content");
 if(view==="home")c.innerHTML=home();else if(view==="progress")c.innerHTML=summary();else if(view==="works")c.innerHTML=groupedWorksView();else if(view==="bom")c.innerHTML=bomView();else if(view==="invoices")c.innerHTML=groupedInvoicesView();else if(view==="people")c.innerHTML=card("Ответственные / работники",table([...arr("responsibles"),...arr("workers")],[["ФИО",r=>r.name||r.fio],["Должность","position"]]));else if(view==="machines")c.innerHTML=card("Машины и механизмы",table(arr("equipment"),[["Наименование",r=>r.name||r.title],["Количество",r=>r.qty||r.quantity]]));else if(view==="dynamics")c.innerHTML=dynamicsView();else if(view==="deadlines")c.innerHTML=ganttView();else if(view==="acted")c.innerHTML=card("Актированные дни",table(arr("actedDays"),[["Дата",r=>r.date||r],["Причина",r=>r.reason||r.text||""],["Значение",r=>r.value||""],["Время",r=>r.time||""]]))+multiCalendarView();else if(view==="penalties")c.innerHTML=penaltiesView();else c.innerHTML=management();
}
$("#nav").onclick=e=>{const b=e.target.closest("[data-v]");if(b){view=b.dataset.v;render()}};
$("#content").onclick=async e=>{const lb=e.target.closest("[data-lightbox]");if(lb){const box=document.createElement("div");box.className="lightbox";box.innerHTML='<button aria-label="Закрыть">×</button><img src="'+lb.src+'">';box.onclick=()=>box.remove();document.body.appendChild(box);return}const bi=e.target.closest("[data-bom-import]");if(bi){try{const res=await ATemir.importBOM();if(res){const t=arr("tasks")[+bi.dataset.bomImport];t.bom=res.rows;await save(true);render();alert("Ведомость загружена: "+res.rows.length+" марок.")}}catch(err){alert("Ошибка Excel: "+err.message)}return}const pa=e.target.closest("[data-photo-add]");if(pa){const imgs=await ATemir.choosePhotos();if(imgs?.length){state.reportPhotos=[...arr("reportPhotos"),...imgs].slice(0,12);await save(true);render()}return}const pd=e.target.closest("[data-photo-del]");if(pd){arr("reportPhotos").splice(+pd.dataset.photoDel,1);await save(true);render();return}const pc=e.target.closest("[data-photo-clear]");if(pc){state.reportPhotos=[];await save(true);render();return}const ll=e.target.closest("[data-logo-load]");if(ll){const data=await ATemir.chooseLogo();if(data){state.companyLogo=data;await save(true);render()}return}const lr=e.target.closest("[data-logo-remove]");if(lr){state.companyLogo="";await save(true);render();return}const m=e.target.closest("[data-mv]");if(m){manageView=m.dataset.mv;render();return}const a=e.target.closest("[data-add]");if(a){state[a.dataset.add]=arr(a.dataset.add);state[a.dataset.add].push({});await save(true);render();return}const d=e.target.closest("[data-del]");if(d){arr(d.dataset.del).splice(+d.dataset.i,1);await save(true);render()}};
$("#content").oninput=async e=>{if(e.target.dataset.root){state[e.target.dataset.root]=e.target.value}else if(e.target.dataset.weather){state.weather=state.weather||{};state.weather[e.target.dataset.weather]=e.target.value}else if(e.target.dataset.list){const r=arr(e.target.dataset.list)[+e.target.dataset.i];r[e.target.dataset.k]=e.target.value}save();$("#obj").textContent=state.object||"Новый объект";$("#companyBrand").textContent=state.companyName||"КОМПАНИЯ"};
$("#saveReport").onclick=async()=>{try{await save(true);const b=$("#saveReport"),old=b.textContent;b.textContent="Сохранено ✓";b.classList.add("saved");setTimeout(()=>{b.textContent=old;b.classList.remove("saved")},1400)}catch(e){alert("Ошибка сохранения: "+e.message)}};
$("#imp").onclick=async()=>{try{const d=await ATemir.importJSON();if(d){state={...state,...d};state.weather=state.weather||{};await save(true);render();alert("SaveFiles импортирован и сохранён в SQLite.")}}catch(e){alert("Ошибка импорта: "+e.message)}};$("#bak").onclick=()=>ATemir.backup(state);$("#pdf").onclick=()=>ATemir.pdf();$("#html").onclick=()=>{const title=esc(state.object||"Отчёт");const company=esc(state.companyName||"");ATemir.exportHTML(`<!doctype html><html lang="ru"><meta charset="utf-8"><title>${title}</title><style>body{font-family:Arial;margin:20px;color:#183247}.card{margin-bottom:15px;break-inside:avoid}.card h2{border-bottom:2px solid #f2b318}table{width:100%;border-collapse:collapse;font-size:10px}th,td{border:1px solid #ccc;padding:6px}.photoCollage{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}.photoCollage img{width:100%;height:130px;object-fit:cover}.bars{height:180px;display:flex;align-items:flex-end;gap:4px}.barCol{height:100%;min-width:28px;display:flex;flex-direction:column;justify-content:flex-end;align-items:center}.barCol i{width:70%;background:#123e63}.barCol small,.barCol span{font-size:7px}.gTrack{height:18px;background:#dfe8f0;position:relative}.gFact{display:block;height:100%;background:#1769aa}.gToday{position:absolute;top:-4px;bottom:-4px;width:2px;background:#e0a800}.calendar{display:grid;grid-template-columns:repeat(7,1fr);gap:2px}.calDay{min-height:26px;border:1px solid #ddd}.calDay.work{background:#dff4e5}.calDay.acted{background:#fbe0e0}.multiCalendar{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}</style><body>${company?`<h2>${company}</h2>`:""}<h1>${title}</h1>${home()}</body></html>`)};
(async()=>{const d=await ATemir.load();if(d)state={...state,...d};state.weather=state.weather||{};render()})().catch(e=>alert("Ошибка запуска: "+e.message));
window.addEventListener("blur",()=>flushSave());
window.addEventListener("beforeunload",()=>{try{flushSave()}catch(e){}});

$("#content").onchange=async e=>{if(e.target.dataset.list){const key=e.target.dataset.list,r=arr(key)[+e.target.dataset.i],k=e.target.dataset.k;if(r){r[k]=e.target.value;if(k==="type"){r.code="";r.mark="";r.name="";r.weight1="";r.remaining="";r.totalWeight=""}if(k==="code"){r.mark="";r.name="";r.weight1="";r.remaining="";r.totalWeight=""}if(k==="mark"&&key==="workDays"){const task=arr("tasks").find(t=>(t.type||"")===(r.type||"")&&(t.code||"")===(r.code||"")),b=(task?.bom||[]).find(x=>normMark(x.mark)===normMark(r.mark));if(b){r.name=b.name||"";r.weight1=n(b.weight1||b.weight);r.unit=task.unit||"шт";r.remaining=Math.max(0,n(b.qty??b.quantity)-usedMark(r.type||"",r.code||"",r.mark)+qtyOf(r));r.totalWeight=qtyOf(r)*n(r.weight1)}}if(k==="qty"&&key==="workDays"){const task=arr("tasks").find(t=>(t.type||"")===(r.type||"")&&(t.code||"")===(r.code||"")),b=(task?.bom||[]).find(x=>normMark(x.mark)===normMark(r.mark));if(b){const max=Math.max(0,n(b.qty??b.quantity)-usedMark(r.type||"",r.code||"",r.mark)+qtyOf(r));if(qtyOf(r)>max)r.qty=max;r.remaining=Math.max(0,max-qtyOf(r));r.totalWeight=qtyOf(r)*n(r.weight1)}}await save(true);if(["type","code","mark","qty"].includes(k))render()}}};
