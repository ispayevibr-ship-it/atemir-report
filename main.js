const {app,BrowserWindow,dialog,ipcMain}=require("electron");const {DatabaseSync}=require("node:sqlite");const fs=require("fs");const https=require("https");const {autoUpdater}=require("electron-updater");const path=require("path");ipcMain.handle("report:html",async(_e,arg={})=>{let file=await dialog.showSaveDialog(win,{title:"Выгрузить отчёт HTML",defaultPath:arg.filename||"А-Темир_Строй_отчет.html",filters:[{name:"HTML",extensions:["html"]}]});if(file.canceled||!file.filePath)return {canceled:true};fs.writeFileSync(file.filePath,String(arg.html||""),"utf8");return {ok:true,path:file.filePath}});
ipcMain.handle("report:pdf",async(_e,arg={})=>{let file=await dialog.showSaveDialog(win,{title:"Сохранить PDF",defaultPath:arg.filename||"А-Темир_Строй_отчет.pdf",filters:[{name:"PDF",extensions:["pdf"]}]});if(file.canceled||!file.filePath)return {canceled:true};let w=new BrowserWindow({show:false,webPreferences:{contextIsolation:true,nodeIntegration:false}}),tmp="";try{if(arg.html){tmp=path.join(app.getPath("temp"),"atemir-export-"+Date.now()+".html");fs.writeFileSync(tmp,String(arg.html),"utf8");await w.loadFile(tmp)}else await w.loadFile(runtimeFile(path.join("src","legacy-report.html")));await new Promise(r=>setTimeout(r,700));let buf=await w.webContents.printToPDF({printBackground:true,pageSize:"A4",margins:{top:0.25,bottom:0.25,left:0.2,right:0.2}});fs.writeFileSync(file.filePath,buf);return {ok:true,path:file.filePath}}finally{if(tmp)try{fs.unlinkSync(tmp)}catch{}if(!w.isDestroyed())w.destroy()}});


const DB_FILE_NAME="atemir-data-v1.json",SQLITE_FILE_NAME="atemir.db";
function dbPath(){return path.join(app.getPath("userData"),DB_FILE_NAME)}
function sqlitePath163(){return path.join(app.getPath("userData"),SQLITE_FILE_NAME)}
let sqlite163=null;
function sqliteDb163(){
 if(sqlite163)return sqlite163;
 let file=sqlitePath163();fs.mkdirSync(path.dirname(file),{recursive:true});
 sqlite163=new DatabaseSync(file);
 sqlite163.exec("PRAGMA journal_mode=WAL; PRAGMA synchronous=NORMAL; PRAGMA foreign_keys=ON; CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL); CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);");
 migrateJsonToSqlite163();
 return sqlite163
}
function migrateJsonToSqlite163(){
 let db=sqlite163;if(!db)return;
 let done=db.prepare("SELECT value FROM meta WHERE key=?").get("json_migrated_v1");
 if(done)return;
 let legacy={version:1,kv:{}};try{legacy=JSON.parse(fs.readFileSync(dbPath(),"utf8"))||legacy}catch{}
 let entries=Object.entries(legacy.kv||{}),now=new Date().toISOString();
 db.exec("BEGIN IMMEDIATE");
 try{
  let put=db.prepare("INSERT INTO kv(key,value,updated_at) VALUES(?,?,?) ON CONFLICT(key) DO NOTHING");
  for(let [key,value] of entries)put.run(key,JSON.stringify(value),now);
  db.prepare("INSERT INTO meta(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run("json_migrated_v1",JSON.stringify({at:now,keys:entries.length,source:dbPath()}));
  db.exec("COMMIT");
  if(fs.existsSync(dbPath())){
   let dir=path.join(app.getPath("userData"),"backups");fs.mkdirSync(dir,{recursive:true});
   let dest=path.join(dir,"pre-sqlite-"+now.replace(/[:.]/g,"-")+".json");
   if(!fs.existsSync(dest))fs.copyFileSync(dbPath(),dest)
  }
 }catch(e){try{db.exec("ROLLBACK")}catch{}throw e}
}
function dbRead(){
 let db=sqliteDb163(),kv={};
 for(let row of db.prepare("SELECT key,value FROM kv").all()){try{kv[row.key]=JSON.parse(row.value)}catch{kv[row.key]=row.value}}
 let migrated=db.prepare("SELECT value FROM meta WHERE key=?").get("json_migrated_v1");
 return {version:2,engine:"sqlite",kv,migratedAt:migrated?JSON.parse(migrated.value).at:""}
}
function dbWrite(x){
 let db=sqliteDb163(),wanted=x&&x.kv&&typeof x.kv==="object"?x.kv:{},now=new Date().toISOString();
 db.exec("BEGIN IMMEDIATE");
 try{
  db.exec("DELETE FROM kv");
  let put=db.prepare("INSERT INTO kv(key,value,updated_at) VALUES(?,?,?)");
  for(let [key,value] of Object.entries(wanted))put.run(key,JSON.stringify(value),now);
  db.exec("COMMIT")
 }catch(e){try{db.exec("ROLLBACK")}catch{}throw e}
}
function photoRoot(){return path.join(app.getPath("userData"),"photos")}
function safePhotoKey(key){return String(key||"").replace(/[^a-zA-Z0-9_-]/g,"_")}
function photoDir(key){return path.join(photoRoot(),safePhotoKey(key))}
function dataUrlToBuffer(v){let m=String(v||"").match(/^data:([^;]+);base64,(.+)$/);if(!m)return null;return {mime:m[1],buf:Buffer.from(m[2],"base64")}}
function extForMime(m){return /png/i.test(m)?".png":/webp/i.test(m)?".webp":".jpg"}
ipcMain.handle("photos:set",(_e,key,items=[])=>{let dir=photoDir(key);fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir,{recursive:true});let saved=[];(items||[]).forEach((v,i)=>{let x=dataUrlToBuffer(v);if(!x)return;let name=String(i+1).padStart(2,"0")+extForMime(x.mime);fs.writeFileSync(path.join(dir,name),x.buf);saved.push(name)});return {ok:true,count:saved.length}});
ipcMain.handle("photos:get",(_e,key)=>{let dir=photoDir(key);if(!fs.existsSync(dir))return [];return fs.readdirSync(dir).sort().map(name=>{let file=path.join(dir,name),ext=path.extname(name).toLowerCase(),mime=ext===".png"?"image/png":ext===".webp"?"image/webp":"image/jpeg";return "data:"+mime+";base64,"+fs.readFileSync(file).toString("base64")})});
ipcMain.handle("photos:remove",(_e,key)=>{fs.rmSync(photoDir(key),{recursive:true,force:true});return true});
ipcMain.handle("photos:remove-prefix",(_e,prefix)=>{let root=photoRoot();if(!fs.existsSync(root))return 0;let p=safePhotoKey(prefix),n=0;for(let name of fs.readdirSync(root)){if(name.startsWith(p)){fs.rmSync(path.join(root,name),{recursive:true,force:true});n++}}return n});
ipcMain.handle("db:get",(_e,key)=>{let db=dbRead();return Object.prototype.hasOwnProperty.call(db.kv||{},key)?db.kv[key]:null});
ipcMain.on("db:get-sync",(e,key)=>{let db=dbRead();e.returnValue=Object.prototype.hasOwnProperty.call(db.kv||{},key)?db.kv[key]:null});
ipcMain.on("db:all-sync",(e)=>{e.returnValue=dbRead().kv||{}});
ipcMain.on("db:get-prefix-sync",(e,prefix)=>{let db=dbRead(),out={};for(let [key,value] of Object.entries(db.kv||{}))if(key.startsWith(prefix))out[key]=value;e.returnValue=out});

ipcMain.on("db:set-sync",(e,key,value)=>{try{let db=dbRead();db.kv=db.kv||{};db.kv[key]=value;db.updatedAt=new Date().toISOString();dbWrite(db);e.returnValue=true}catch(err){console.error("DB sync save",err);e.returnValue=false}});
ipcMain.handle("db:set",(_e,key,value)=>{let db=dbRead();db.kv=db.kv||{};db.kv[key]=value;db.updatedAt=new Date().toISOString();dbWrite(db);return true});
ipcMain.handle("db:remove",(_e,key)=>{let db=dbRead();if(db.kv)delete db.kv[key];db.updatedAt=new Date().toISOString();dbWrite(db);return true});
ipcMain.handle("db:migrate",(_e,entries={})=>{let db=dbRead(),added=0;db.kv=db.kv||{};for(let [key,value] of Object.entries(entries||{})){if(!Object.prototype.hasOwnProperty.call(db.kv,key)){db.kv[key]=value;added++}}db.migratedAt=db.migratedAt||new Date().toISOString();dbWrite(db);return {ok:true,added,path:dbPath()}});
ipcMain.handle("db:info",()=>{let db=dbRead();return {path:sqlitePath163(),engine:"sqlite",keys:Object.keys(db.kv||{}).length,updatedAt:db.updatedAt||db.migratedAt||""}});
ipcMain.handle("db:backup",async()=>{let db=dbRead(),dir=path.join(app.getPath("userData"),"backups");fs.mkdirSync(dir,{recursive:true});let stamp=new Date().toISOString().replace(/[:.]/g,"-"),jsonDest=path.join(dir,"atemir-data-"+stamp+".json"),sqlDest=path.join(dir,"atemir-"+stamp+".db");fs.writeFileSync(jsonDest,JSON.stringify(db),"utf8");sqliteDb163().exec("PRAGMA wal_checkpoint(FULL)");fs.copyFileSync(sqlitePath163(),sqlDest);return {ok:true,path:sqlDest,jsonPath:jsonDest}});
ipcMain.handle("db:write-many",(_e,entries={})=>{let db=dbRead();db.kv=db.kv||{};for(let [key,value] of Object.entries(entries||{}))db.kv[key]=value;db.updatedAt=new Date().toISOString();dbWrite(db);return true});
ipcMain.handle("db:remove-prefix",(_e,prefix)=>{let db=dbRead(),n=0;db.kv=db.kv||{};for(let key of Object.keys(db.kv)){if(key.startsWith(prefix)){delete db.kv[key];n++}}if(n){db.updatedAt=new Date().toISOString();dbWrite(db)}return n});
ipcMain.handle("db:remove-many",(_e,keys=[])=>{let db=dbRead(),n=0;db.kv=db.kv||{};for(let key of keys||[]){if(Object.prototype.hasOwnProperty.call(db.kv,key)){delete db.kv[key];n++}}if(n){db.updatedAt=new Date().toISOString();dbWrite(db)}return n});




let win,hotUpdate=null;
const HOT_OWNER="ispayevibr-ship-it",HOT_REPO="atemir-report-updates";
function hotRoot(){let p=path.join(app.getPath("userData"),"hot-update");try{fs.mkdirSync(p,{recursive:true})}catch{}return p}
function effectiveVersion(){try{let x=JSON.parse(fs.readFileSync(path.join(hotRoot(),"version.json"),"utf8"));return x.version||app.getVersion()}catch{return app.getVersion()}}
function runtimeFile(rel){let hot=path.join(hotRoot(),rel),base=path.join(__dirname,rel);return fs.existsSync(hot)?hot:base}
function ghGet(url,binary=false,redirects=0){return new Promise((resolve,reject)=>{let req=https.get(url,{headers:{"User-Agent":"A-Temir-Stroy-Report","Accept":"application/vnd.github+json","Cache-Control":"no-cache, no-store","Pragma":"no-cache"}},res=>{if(res.statusCode>=300&&res.statusCode<400&&res.headers.location&&redirects<5){res.resume();return ghGet(res.headers.location,binary,redirects+1).then(resolve,reject)}if(res.statusCode!==200){res.resume();return reject(Error("HTTP "+res.statusCode))}let a=[];res.on("data",x=>a.push(x));res.on("end",()=>{let b=Buffer.concat(a);resolve(binary?b:b.toString("utf8"))})});req.on("error",reject)})}
function verCmp(a,b){let A=String(a).split(".").map(Number),B=String(b).split(".").map(Number);for(let i=0;i<3;i++){let d=(A[i]||0)-(B[i]||0);if(d)return d}return 0}
async function fetchHotMeta(){let url="https://api.github.com/repos/"+HOT_OWNER+"/"+HOT_REPO+"/contents/hot/latest.json?ref=main&ts="+Date.now(),raw=await ghGet(url),api=JSON.parse(raw),txt=Buffer.from(String(api.content||"").replace(/\\n/g,""),"base64").toString("utf8"),meta=JSON.parse(txt);if(!meta.version)throw Error("Сервер обновлений не вернул номер версии");return meta}
async function checkHotUpdate(){try{let meta=await fetchHotMeta();if(verCmp(meta.version,effectiveVersion())<=0){hotUpdate=null;return "current"}hotUpdate=meta;sendUpdate("available",{version:meta.version,sizeBytes:meta.size||0,light:true});return true}catch(e){console.error("Hot update check:",e.message);return false}}
async function downloadHotUpdate(){if(!hotUpdate)return;try{let files=hotUpdate.files||[],total=files.reduce((s,x)=>s+(x.size||0),0)||1,got=0;for(let f of files){let data=await ghGet("https://raw.githubusercontent.com/"+HOT_OWNER+"/"+HOT_REPO+"/main/hot/"+hotUpdate.version+"/"+f.path,true),dest=path.join(hotRoot(),f.path);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,data);got+=data.length;sendUpdate("downloading",{percent:Math.min(100,Math.round(got/total*100)),got:(got/1024/1024).toFixed(2),total:(total/1024/1024).toFixed(2),light:true})}fs.writeFileSync(path.join(hotRoot(),"version.json"),JSON.stringify({version:hotUpdate.version}));sendUpdate("ready",{version:hotUpdate.version,light:true})}catch(e){sendUpdate("error",{message:e.message})}}
function sendUpdate(state,data={}){if(win&&!win.isDestroyed())win.webContents.send("app:update",{state,...data})}
function create(){ipcMain.removeHandler("app:version");ipcMain.handle("app:version",()=>effectiveVersion());win=new BrowserWindow({width:1500,height:930,minWidth:900,minHeight:650,autoHideMenuBar:true,backgroundColor:"#eef3f7",webPreferences:{preload:path.join(__dirname,"preload.js"),contextIsolation:true,nodeIntegration:false}});win.on("blur",()=>{});win.on("focus",()=>{if(!win.isDestroyed())win.webContents.focus()});win.webContents.on("before-input-event",()=>{if(win&&!win.isDestroyed()&&!win.webContents.isFocused())win.webContents.focus()});win.loadFile(runtimeFile(path.join("src","index.html")))}
ipcMain.removeHandler("app:update-check");ipcMain.handle("app:update-check",async()=>{sendUpdate("checking");hotUpdate=null;const installed=effectiveVersion();try{let meta=await fetchHotMeta(),latest=String(meta.version||"").trim();if(!latest)return {state:"error",installed,message:"Сервер обновлений не вернул номер последней версии."};if(verCmp(latest,installed)>0){hotUpdate=meta;sendUpdate("available",{version:latest,installed,sizeBytes:meta.size||0,light:true});return {state:"available",installed,latest}}sendUpdate("none",{version:installed,installed,latest});return {state:"none",installed,latest}}catch(e){return {state:"error",installed,message:e.message||String(e)}}});
ipcMain.on("app:update-download",()=>{if(hotUpdate)return downloadHotUpdate();autoUpdater.downloadUpdate().catch(e=>sendUpdate("error",{message:e.message}))});
ipcMain.on("app:update-install",()=>{sendUpdate("installing");if(hotUpdate){setTimeout(()=>{app.relaunch();app.exit(0)},500);return}setTimeout(()=>autoUpdater.quitAndInstall(true,true),900)});
function updates(){
 if(!app.isPackaged)return;
 autoUpdater.autoDownload=false;
 autoUpdater.autoInstallOnAppQuit=true;
 autoUpdater.autoRunAppAfterInstall=true;
 autoUpdater.disableWebInstaller=true;
 autoUpdater.on("checking-for-update",()=>sendUpdate("checking"));
 autoUpdater.on("update-available",i=>sendUpdate("available",{version:i.version}));
 autoUpdater.on("update-not-available",()=>sendUpdate("none"));
 autoUpdater.on("download-progress",p=>{
  const got=(p.transferred/1024/1024).toFixed(1),total=(p.total/1024/1024).toFixed(1),percent=Math.max(0,Math.min(100,Math.round(p.percent||0)));
  if(win&&!win.isDestroyed()){win.setProgressBar(percent/100);win.setTitle("А-Темир Строй Отчёт — обновление "+percent+"%")}
  sendUpdate("downloading",{percent,got,total});
 });
 autoUpdater.on("update-downloaded",i=>{if(win&&!win.isDestroyed()){win.setProgressBar(-1);win.setTitle("А-Темир Строй Отчёт")}sendUpdate("ready",{version:i.version});setTimeout(()=>{sendUpdate("installing",{version:i.version});setTimeout(()=>autoUpdater.quitAndInstall(true,true),1200)},700)});
 autoUpdater.on("error",e=>{console.error("Auto update:",e.message);sendUpdate("error",{message:e.message})});
 setTimeout(async()=>{let hot=await checkHotUpdate();if(!hot)autoUpdater.checkForUpdates().catch(e=>console.error("Update check:",e.message))},2500);
}
app.whenReady().then(()=>{create();updates()});app.on("window-all-closed",()=>{if(process.platform!=="darwin")app.quit()});app.on("activate",()=>{if(BrowserWindow.getAllWindows().length===0)create()});