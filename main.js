const {app,BrowserWindow,ipcMain,dialog}=require("electron");
const path=require("path"),fs=require("fs"),Database=require("better-sqlite3");
let win,db;
function initDb(){const dir=app.getPath("userData");fs.mkdirSync(dir,{recursive:true});db=new Database(path.join(dir,"atemir.sqlite"));db.pragma("journal_mode=WAL");db.exec("CREATE TABLE IF NOT EXISTS state(id INTEGER PRIMARY KEY,json TEXT NOT NULL,updated TEXT NOT NULL)");}
function create(){win=new BrowserWindow({width:1500,height:930,minWidth:1000,minHeight:650,autoHideMenuBar:true,backgroundColor:"#eef3f7",webPreferences:{preload:path.join(__dirname,"preload.js"),contextIsolation:true,nodeIntegration:false}});win.loadFile(path.join(__dirname,"src","index.html"));}
app.whenReady().then(()=>{initDb();create()});app.on("window-all-closed",()=>{if(process.platform!=="darwin")app.quit()});
ipcMain.handle("db:load",()=>{const r=db.prepare("SELECT json FROM state WHERE id=1").get();return r?JSON.parse(r.json):null});
ipcMain.handle("db:save",(_,d)=>{db.prepare("INSERT INTO state(id,json,updated) VALUES(1,?,datetime('now')) ON CONFLICT(id) DO UPDATE SET json=excluded.json,updated=excluded.updated").run(JSON.stringify(d));return true});
ipcMain.handle("file:import",async()=>{const r=await dialog.showOpenDialog(win,{properties:["openFile"],filters:[{name:"SaveFiles",extensions:["json"]}]});return r.canceled?null:JSON.parse(fs.readFileSync(r.filePaths[0],"utf8"))});
ipcMain.handle("file:backup",async(_,d)=>{const r=await dialog.showSaveDialog(win,{defaultPath:"ATemir_Backup.json",filters:[{name:"JSON",extensions:["json"]}]});if(r.canceled)return false;fs.writeFileSync(r.filePath,JSON.stringify(d,null,2));return true});
ipcMain.handle("file:html",async(_,h)=>{const r=await dialog.showSaveDialog(win,{defaultPath:"A-Temir_Report.html",filters:[{name:"HTML",extensions:["html"]}]});if(r.canceled)return false;fs.writeFileSync(r.filePath,h);return true});
ipcMain.handle("file:pdf",async()=>{const r=await dialog.showSaveDialog(win,{defaultPath:"A-Temir_Report.pdf",filters:[{name:"PDF",extensions:["pdf"]}]});if(r.canceled)return false;const b=await win.webContents.printToPDF({printBackground:true,pageSize:"A4"});fs.writeFileSync(r.filePath,b);return true});
ipcMain.handle("file:logo",async()=>{
 const r=await dialog.showOpenDialog(win,{properties:["openFile"],filters:[{name:"Images",extensions:["png","jpg","jpeg","webp"]}]});
 if(r.canceled)return null;
 const p=r.filePaths[0], ext=path.extname(p).toLowerCase().replace(".","")||"png";
 const mime=ext==="jpg"||ext==="jpeg"?"image/jpeg":ext==="webp"?"image/webp":"image/png";
 return "data:"+mime+";base64,"+fs.readFileSync(p).toString("base64");
});
