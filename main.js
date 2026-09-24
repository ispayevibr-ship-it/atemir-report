const {app,BrowserWindow,dialog,ipcMain}=require("electron");const fs=require("fs");const {autoUpdater}=require("electron-updater");const path=require("path");ipcMain.handle("report:html",async(_e,arg={})=>{let file=await dialog.showSaveDialog(win,{title:"Выгрузить отчёт HTML",defaultPath:arg.filename||"А-Темир_Строй_отчет.html",filters:[{name:"HTML",extensions:["html"]}]});if(file.canceled||!file.filePath)return {canceled:true};fs.writeFileSync(file.filePath,String(arg.html||""),"utf8");return {ok:true,path:file.filePath}});
ipcMain.handle("report:pdf",async(_e,arg={})=>{let file=await dialog.showSaveDialog(win,{title:"Сохранить PDF",defaultPath:arg.filename||"А-Темир_Строй_отчет.pdf",filters:[{name:"PDF",extensions:["pdf"]}]});if(file.canceled||!file.filePath)return {canceled:true};let w=new BrowserWindow({show:false,webPreferences:{contextIsolation:true,nodeIntegration:false}}),tmp="";try{if(arg.html){tmp=path.join(app.getPath("temp"),"atemir-export-"+Date.now()+".html");fs.writeFileSync(tmp,String(arg.html),"utf8");await w.loadFile(tmp)}else await w.loadFile(path.join(__dirname,"src","legacy-report.html"));await new Promise(r=>setTimeout(r,700));let buf=await w.webContents.printToPDF({printBackground:true,pageSize:"A4",margins:{top:0.25,bottom:0.25,left:0.2,right:0.2}});fs.writeFileSync(file.filePath,buf);return {ok:true,path:file.filePath}}finally{if(tmp)try{fs.unlinkSync(tmp)}catch{}if(!w.isDestroyed())w.destroy()}});

let win;
function sendUpdate(state,data={}){if(win&&!win.isDestroyed())win.webContents.send("app:update",{state,...data})}
function create(){ipcMain.removeHandler("app:version");ipcMain.handle("app:version",()=>app.getVersion());win=new BrowserWindow({width:1500,height:930,minWidth:900,minHeight:650,autoHideMenuBar:true,backgroundColor:"#eef3f7",webPreferences:{preload:path.join(__dirname,"preload.js"),contextIsolation:true,nodeIntegration:false}});win.loadFile(path.join(__dirname,"src","index.html"))}
ipcMain.on("app:update-install",()=>autoUpdater.quitAndInstall(false,true));
function updates(){
 if(!app.isPackaged)return;
 autoUpdater.autoDownload=true;
 autoUpdater.autoInstallOnAppQuit=true;
 autoUpdater.on("checking-for-update",()=>sendUpdate("checking"));
 autoUpdater.on("update-available",i=>sendUpdate("available",{version:i.version}));
 autoUpdater.on("update-not-available",()=>sendUpdate("none"));
 autoUpdater.on("download-progress",p=>{
  const got=(p.transferred/1024/1024).toFixed(1),total=(p.total/1024/1024).toFixed(1),percent=Math.max(0,Math.min(100,Math.round(p.percent||0)));
  if(win&&!win.isDestroyed()){win.setProgressBar(percent/100);win.setTitle("А-Темир Строй Отчёт — обновление "+percent+"%")}
  sendUpdate("downloading",{percent,got,total});
 });
 autoUpdater.on("update-downloaded",i=>{if(win&&!win.isDestroyed()){win.setProgressBar(-1);win.setTitle("А-Темир Строй Отчёт")}sendUpdate("ready",{version:i.version})});
 autoUpdater.on("error",e=>{console.error("Auto update:",e.message);sendUpdate("error",{message:e.message})});
 setTimeout(()=>autoUpdater.checkForUpdates().catch(e=>console.error("Update check:",e.message)),2500);
}
app.whenReady().then(()=>{create();updates()});app.on("window-all-closed",()=>{if(process.platform!=="darwin")app.quit()});app.on("activate",()=>{if(BrowserWindow.getAllWindows().length===0)create()});