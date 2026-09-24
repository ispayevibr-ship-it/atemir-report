const {contextBridge,ipcRenderer}=require("electron");
contextBridge.exposeInMainWorld("atemirDesktop",{savePdf:(arg)=>ipcRenderer.invoke("report:pdf",arg),saveHtml:(arg)=>ipcRenderer.invoke("report:html",arg),getVersion:()=>ipcRenderer.invoke("app:version")});
function versionBadge(){ipcRenderer.invoke("app:version").then(v=>{let x=document.createElement("div");x.textContent="Версия "+v;x.title="Текущая версия программы";x.style.cssText="position:fixed;right:18px;top:14px;z-index:2147483000;padding:5px 9px;border-radius:7px;background:rgba(16,59,100,.08);color:#65798a;font:12px Arial,sans-serif;pointer-events:none";document.body.appendChild(x)}).catch(()=>{})}
function updaterUi(){versionBadge();
 let box=document.createElement("div");box.id="atemirUpdater";box.style.cssText="display:none;position:fixed;right:18px;bottom:18px;z-index:2147483647;width:min(390px,calc(100vw - 36px));background:#fff;border:1px solid #d8e2ea;border-radius:14px;padding:14px 16px;box-shadow:0 12px 36px rgba(0,0,0,.22);font:14px Arial,sans-serif;color:#173b59";
 box.innerHTML='<div style="display:flex;align-items:center;gap:10px"><div style="font-size:22px">↻</div><div style="flex:1"><b id="atemirUpdateTitle">Обновление программы</b><div id="atemirUpdateText" style="margin-top:4px;color:#667788"></div></div></div><div id="atemirUpdateTrack" style="display:none;height:8px;background:#e7edf2;border-radius:8px;overflow:hidden;margin-top:11px"><div id="atemirUpdateBar" style="height:100%;width:0;background:#e9a91b;transition:width .2s"></div></div><button id="atemirUpdateRestart" style="display:none;margin-top:12px;width:100%;border:0;border-radius:8px;padding:10px 12px;background:#123f66;color:white;font-weight:700;cursor:pointer">Перезапустить и обновить</button>';
 document.body.appendChild(box);box.querySelector("#atemirUpdateRestart").onclick=()=>ipcRenderer.send("app:update-install");
 ipcRenderer.on("app:update",(_e,x)=>{let title=box.querySelector("#atemirUpdateTitle"),txt=box.querySelector("#atemirUpdateText"),track=box.querySelector("#atemirUpdateTrack"),bar=box.querySelector("#atemirUpdateBar"),btn=box.querySelector("#atemirUpdateRestart");
  if(x.state==="checking"||x.state==="none"){if(x.state==="none")box.style.display="none";return}
  box.style.display="block";
  if(x.state==="available"){title.textContent="Доступно обновление "+x.version;txt.textContent="Скачивание начнётся автоматически…";track.style.display="block";btn.style.display="none"}
  if(x.state==="downloading"){title.textContent="Скачиваем обновление";txt.textContent=x.got+" МБ из "+x.total+" МБ — "+x.percent+"%";track.style.display="block";bar.style.width=x.percent+"%";btn.style.display="none"}
  if(x.state==="ready"){title.textContent="Обновление "+x.version+" готово";txt.textContent="Работать можно дальше. Обновление установится после перезапуска.";track.style.display="none";btn.style.display="block"}
  if(x.state==="error"){title.textContent="Не удалось проверить обновление";txt.textContent="Программа продолжит работать. Проверим снова при следующем запуске.";track.style.display="none";btn.style.display="none";setTimeout(()=>box.style.display="none",6000)}
 });
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",updaterUi);else updaterUi();
