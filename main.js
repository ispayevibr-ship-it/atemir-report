const {app,BrowserWindow,ipcMain,dialog}=require("electron");
const path=require("path"),fs=require("fs"),Database=require("better-sqlite3"),XLSX=require("xlsx");
let win,db;
function initDb(){const dir=app.getPath("userData");fs.mkdirSync(dir,{recursive:true});db=new Database(path.join(dir,"atemir.sqlite"));db.pragma("journal_mode=WAL");db.exec("CREATE TABLE IF NOT EXISTS state(id INTEGER PRIMARY KEY,json TEXT NOT NULL,updated TEXT NOT NULL);CREATE TABLE IF NOT EXISTS reports(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,json TEXT NOT NULL,updated TEXT NOT NULL);CREATE TABLE IF NOT EXISTS meta(key TEXT PRIMARY KEY,value TEXT NOT NULL)");
 const migrated=db.prepare("SELECT value FROM meta WHERE key='legacy_state_migrated'").get();
 if(!migrated){const count=db.prepare("SELECT COUNT(*) n FROM reports").get().n;if(!count){const old=db.prepare("SELECT json FROM state WHERE id=1").get();if(old){try{const d=JSON.parse(old.json),name=d.object||d.objectName||"Первый отчёт";db.prepare("INSERT INTO reports(name,json,updated) VALUES(?,?,datetime('now'))").run(name,JSON.stringify(d))}catch(e){}}}db.prepare("INSERT OR REPLACE INTO meta(key,value) VALUES('legacy_state_migrated','1')").run()}}
function create(){win=new BrowserWindow({width:1500,height:930,minWidth:1000,minHeight:650,autoHideMenuBar:true,backgroundColor:"#eef3f7",webPreferences:{preload:path.join(__dirname,"preload.js"),contextIsolation:true,nodeIntegration:false}});win.loadFile(path.join(__dirname,"src","index.html"));}
app.whenReady().then(()=>{initDb();create()});app.on("window-all-closed",()=>{if(process.platform!=="darwin")app.quit()});
ipcMain.handle("db:reports",()=>db.prepare("SELECT id,name,updated FROM reports ORDER BY datetime(updated) DESC,id DESC").all());
ipcMain.handle("db:createReport",(_,name)=>{const d={object:name||"Новый отчёт"};const r=db.prepare("INSERT INTO reports(name,json,updated) VALUES(?,?,datetime('now'))").run(name||"Новый отчёт",JSON.stringify(d));return Number(r.lastInsertRowid)});
ipcMain.handle("db:duplicateReport",(_,id)=>{const r=db.prepare("SELECT name,json FROM reports WHERE id=?").get(id);if(!r)return null;const d=JSON.parse(r.json),name=(r.name||"Отчёт")+" — копия";d.object=name;const q=db.prepare("INSERT INTO reports(name,json,updated) VALUES(?,?,datetime('now'))").run(name,JSON.stringify(d));return Number(q.lastInsertRowid)});
ipcMain.handle("db:deleteReport",(_,id)=>{db.prepare("DELETE FROM reports WHERE id=?").run(id);return true});
ipcMain.handle("db:load",(_,id)=>{const r=id?db.prepare("SELECT json FROM reports WHERE id=?").get(id):db.prepare("SELECT json FROM reports ORDER BY datetime(updated) DESC,id DESC LIMIT 1").get();return r?JSON.parse(r.json):null});
ipcMain.handle("db:save",(_,id,d)=>{if(!id)return false;const name=d.object||d.objectName||"Без названия";db.prepare("UPDATE reports SET name=?,json=?,updated=datetime('now') WHERE id=?").run(name,JSON.stringify(d),id);return true});
ipcMain.handle("file:import",async()=>{const r=await dialog.showOpenDialog(win,{properties:["openFile"],filters:[{name:"SaveFiles",extensions:["json"]}]});return r.canceled?null:JSON.parse(fs.readFileSync(r.filePaths[0],"utf8"))});
ipcMain.handle("file:backup",async(_,d)=>{const r=await dialog.showSaveDialog(win,{defaultPath:"Отчет-СМР_резервная-копия.json",filters:[{name:"JSON",extensions:["json"]}]});if(r.canceled)return false;fs.writeFileSync(r.filePath,JSON.stringify(d,null,2));return true});
ipcMain.handle("file:html",async(_,h)=>{const r=await dialog.showSaveDialog(win,{defaultPath:"Отчет-СМР.html",filters:[{name:"HTML",extensions:["html"]}]});if(r.canceled)return false;fs.writeFileSync(r.filePath,h);return true});
ipcMain.handle("file:pdf",async(_,html)=>{const r=await dialog.showSaveDialog(win,{defaultPath:"Отчет-СМР.pdf",filters:[{name:"PDF",extensions:["pdf"]}]});if(r.canceled)return false;const pw=new BrowserWindow({show:false,webPreferences:{contextIsolation:true,nodeIntegration:false}}),tmp=path.join(app.getPath("temp"),"otchet-smr-"+Date.now()+".html");try{fs.writeFileSync(tmp,html,"utf8");await pw.loadFile(tmp);const b=await pw.webContents.printToPDF({printBackground:true,pageSize:"A4",preferCSSPageSize:true,margins:{top:0.35,bottom:0.35,left:0.35,right:0.35}});fs.writeFileSync(r.filePath,b);return true}finally{pw.destroy();try{fs.unlinkSync(tmp)}catch(e){}}});
ipcMain.handle("file:logo",async()=>{
 const r=await dialog.showOpenDialog(win,{properties:["openFile"],filters:[{name:"Images",extensions:["png","jpg","jpeg","webp"]}]});
 if(r.canceled)return null;
 const p=r.filePaths[0], ext=path.extname(p).toLowerCase().replace(".","")||"png";
 const mime=ext==="jpg"||ext==="jpeg"?"image/jpeg":ext==="webp"?"image/webp":"image/png";
 return "data:"+mime+";base64,"+fs.readFileSync(p).toString("base64");
});

ipcMain.handle("file:photos",async()=>{
 const r=await dialog.showOpenDialog(win,{properties:["openFile","multiSelections"],filters:[{name:"Images",extensions:["png","jpg","jpeg","webp"]}]});
 if(r.canceled)return [];
 return r.filePaths.slice(0,12).map(p=>{const ext=path.extname(p).toLowerCase();const mime=ext===".png"?"image/png":ext===".webp"?"image/webp":"image/jpeg";return "data:"+mime+";base64,"+fs.readFileSync(p).toString("base64")});
});

ipcMain.handle("file:bom",async()=>{
 const r=await dialog.showOpenDialog(win,{properties:["openFile"],filters:[{name:"Excel",extensions:["xlsx","xls","xlsm"]}]});
 if(r.canceled)return null;
 const wb=XLSX.readFile(r.filePaths[0],{cellDates:false});
 let chosen=wb.SheetNames[0],raw=[];
 for(const sn of wb.SheetNames){const rr=XLSX.utils.sheet_to_json(wb.Sheets[sn],{header:1,defval:""});const ok=rr.some(row=>row.some(v=>/марка/i.test(String(v)))&&row.some(v=>/колич|кол-во/i.test(String(v))));if(ok){chosen=sn;raw=rr;break}}
 if(!raw.length)raw=XLSX.utils.sheet_to_json(wb.Sheets[chosen],{header:1,defval:""});
 const clean=s=>String(s??"").trim().toLowerCase().replace(/ё/g,"е");
 let hi=raw.findIndex(row=>row.some(v=>/марка/.test(clean(v)))&&row.some(v=>/наимен/.test(clean(v))));
 if(hi<0)hi=0;
 const head=raw[hi].map(clean);
 const col=(tests)=>head.findIndex(h=>tests.some(t=>t.test(h)));
 const mi=col([/^марка/,/позици/]), ni=col([/наимен/]), qi=col([/колич/,/^кол-во/]), wi=col([/вес.*1/,/масса.*1/,/вес.*ед/]), ti=col([/общ.*вес/,/итого.*вес/,/общ.*мас/]);
 if(mi<0||qi<0)throw new Error("Не найдены обязательные колонки «Марка» и «Количество».");
 const num=v=>{const n=Number(String(v??"").replace(/\s/g,"").replace(",","."));return Number.isFinite(n)?n:0};
 const rows=raw.slice(hi+1).map(r=>({mark:String(r[mi]??"").trim(),name:ni>=0?String(r[ni]??"").trim():"",qty:num(r[qi]),weight1:wi>=0?num(r[wi]):0,totalWeight:ti>=0?num(r[ti]):0})).filter(x=>x.mark&&x.qty>0);
 if(!rows.length)throw new Error("Ведомость распознана, но строки с марками и количеством не найдены.");
 return {sheet:chosen,rows,file:path.basename(r.filePaths[0])};
});
