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
 sqlite163.exec(`PRAGMA journal_mode=WAL; PRAGMA synchronous=NORMAL; PRAGMA foreign_keys=ON;
 CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS objects (id TEXT PRIMARY KEY,name TEXT,client TEXT,status TEXT,address TEXT,participants TEXT,notes TEXT,hero_photo TEXT,raw_json TEXT NOT NULL,updated_at TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY,object_id TEXT NOT NULL,type TEXT,code TEXT,unit TEXT,volume REAL,start_date TEXT,end_date TEXT,bom_name TEXT,sort_order INTEGER NOT NULL DEFAULT 0,raw_json TEXT NOT NULL,updated_at TEXT NOT NULL,FOREIGN KEY(object_id) REFERENCES objects(id) ON DELETE CASCADE);
 CREATE INDEX IF NOT EXISTS idx_tasks_object ON tasks(object_id,sort_order);
 CREATE TABLE IF NOT EXISTS bom_marks (object_id TEXT NOT NULL,task_id TEXT NOT NULL,mark_key TEXT NOT NULL,mark TEXT,name TEXT,qty REAL,unit TEXT,sort_order INTEGER NOT NULL DEFAULT 0,raw_json TEXT NOT NULL,updated_at TEXT NOT NULL,PRIMARY KEY(task_id,mark_key),FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE CASCADE);
 CREATE INDEX IF NOT EXISTS idx_bom_object_task ON bom_marks(object_id,task_id,sort_order); CREATE TABLE IF NOT EXISTS reports (id TEXT PRIMARY KEY,object_id TEXT NOT NULL,report_date TEXT,weather TEXT,notes TEXT,sort_order INTEGER NOT NULL DEFAULT 0,raw_json TEXT NOT NULL,updated_at TEXT NOT NULL,FOREIGN KEY(object_id) REFERENCES objects(id) ON DELETE CASCADE); CREATE INDEX IF NOT EXISTS idx_reports_object_date ON reports(object_id,report_date,sort_order); CREATE TABLE IF NOT EXISTS report_works (report_id TEXT NOT NULL,work_key TEXT NOT NULL,task_id TEXT,mark TEXT,name TEXT,qty REAL,unit TEXT,sort_order INTEGER NOT NULL DEFAULT 0,raw_json TEXT NOT NULL,PRIMARY KEY(report_id,work_key),FOREIGN KEY(report_id) REFERENCES reports(id) ON DELETE CASCADE); CREATE TABLE IF NOT EXISTS report_people (report_id TEXT NOT NULL,person_key TEXT NOT NULL,kind TEXT NOT NULL,role TEXT,name TEXT,qty REAL,sort_order INTEGER NOT NULL DEFAULT 0,raw_json TEXT NOT NULL,PRIMARY KEY(report_id,person_key),FOREIGN KEY(report_id) REFERENCES reports(id) ON DELETE CASCADE); CREATE TABLE IF NOT EXISTS report_equipment (report_id TEXT NOT NULL,equipment_key TEXT NOT NULL,type TEXT,name TEXT,qty REAL,sort_order INTEGER NOT NULL DEFAULT 0,raw_json TEXT NOT NULL,PRIMARY KEY(report_id,equipment_key),FOREIGN KEY(report_id) REFERENCES reports(id) ON DELETE CASCADE); CREATE INDEX IF NOT EXISTS idx_report_works_report ON report_works(report_id,sort_order); CREATE INDEX IF NOT EXISTS idx_report_people_report ON report_people(report_id,kind,sort_order); CREATE INDEX IF NOT EXISTS idx_report_equipment_report ON report_equipment(report_id,sort_order); CREATE TABLE IF NOT EXISTS invoices (id TEXT PRIMARY KEY,object_id TEXT NOT NULL,invoice_date TEXT,number TEXT,sort_order INTEGER NOT NULL DEFAULT 0,raw_json TEXT NOT NULL,updated_at TEXT NOT NULL,FOREIGN KEY(object_id) REFERENCES objects(id) ON DELETE CASCADE); CREATE TABLE IF NOT EXISTS invoice_items (invoice_id TEXT NOT NULL,item_key TEXT NOT NULL,task_id TEXT,code TEXT,mark TEXT,qty REAL,volume REAL,unit TEXT,sort_order INTEGER NOT NULL DEFAULT 0,raw_json TEXT NOT NULL,PRIMARY KEY(invoice_id,item_key),FOREIGN KEY(invoice_id) REFERENCES invoices(id) ON DELETE CASCADE); CREATE INDEX IF NOT EXISTS idx_invoices_object ON invoices(object_id,invoice_date,sort_order); CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id,sort_order); CREATE TABLE IF NOT EXISTS acted_days (object_id TEXT NOT NULL,day TEXT NOT NULL,raw_json TEXT NOT NULL,PRIMARY KEY(object_id,day),FOREIGN KEY(object_id) REFERENCES objects(id) ON DELETE CASCADE); CREATE TABLE IF NOT EXISTS penalties (object_id TEXT NOT NULL,penalty_key TEXT NOT NULL,penalty_date TEXT,title TEXT,amount REAL,sort_order INTEGER NOT NULL DEFAULT 0,raw_json TEXT NOT NULL,PRIMARY KEY(object_id,penalty_key),FOREIGN KEY(object_id) REFERENCES objects(id) ON DELETE CASCADE); CREATE INDEX IF NOT EXISTS idx_penalties_object ON penalties(object_id,penalty_date,sort_order);`);
 migrateJsonToSqlite163();
 migrateRelational165();
 migrateReports166();
 migrateOperations167();
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
function relNum165(v){let n=Number(String(v??"").replace(",","."));return Number.isFinite(n)?n:null}
function migrateRelational165(){
 let db=sqlite163;if(!db)return;
 let done=db.prepare("SELECT value FROM meta WHERE key=?").get("relational_v1");
 if(done)return;
 let list=kvParseSafe165(db.prepare("SELECT value FROM kv WHERE key=?").get("atemir-company-objects-v1")?.value,[]);
 let now=new Date().toISOString();
 let putObj=db.prepare("INSERT INTO objects(id,name,client,status,address,participants,notes,hero_photo,raw_json,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,client=excluded.client,status=excluded.status,address=excluded.address,participants=excluded.participants,notes=excluded.notes,hero_photo=excluded.hero_photo,raw_json=excluded.raw_json,updated_at=excluded.updated_at");
 let putTask=db.prepare("INSERT INTO tasks(id,object_id,type,code,unit,volume,start_date,end_date,bom_name,sort_order,raw_json,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET object_id=excluded.object_id,type=excluded.type,code=excluded.code,unit=excluded.unit,volume=excluded.volume,start_date=excluded.start_date,end_date=excluded.end_date,bom_name=excluded.bom_name,sort_order=excluded.sort_order,raw_json=excluded.raw_json,updated_at=excluded.updated_at");
 let putBom=db.prepare("INSERT INTO bom_marks(object_id,task_id,mark_key,mark,name,qty,unit,sort_order,raw_json,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?) ON CONFLICT(task_id,mark_key) DO UPDATE SET object_id=excluded.object_id,mark=excluded.mark,name=excluded.name,qty=excluded.qty,unit=excluded.unit,sort_order=excluded.sort_order,raw_json=excluded.raw_json,updated_at=excluded.updated_at");
 db.exec("BEGIN IMMEDIATE");
 try{
  for(let o of Array.isArray(list)?list:[]){
   let oid=String(o?.id??"");if(!oid)continue,p="atemir_entity_"+oid+"_";
   let base=kvParseSafe165(db.prepare("SELECT value FROM kv WHERE key=?").get(p+"base")?.value,{});
   putObj.run(oid,o.name||base.objectName||"",o.client||base.client||"",o.status||"В работе",o.address||base.address||"",base.participants||o.participants||"",base.notes||o.notes||"",base.heroPhoto||"",JSON.stringify({...o,base}),now);
   let ti=kvParseSafe165(db.prepare("SELECT value FROM kv WHERE key=?").get(p+"taskIndex")?.value,[]);
   for(let z of Array.isArray(ti)?ti:[]){
    let t=kvParseSafe165(db.prepare("SELECT value FROM kv WHERE key=?").get(p+"task_"+z.id)?.value,null);if(!t)continue;
    let tid=String(t.id||z.id);putTask.run(tid,oid,t.type||"",t.code||"",t.unit||"",relNum165(t.volume),t.start||"",t.date||"",t.bomName||"",Number(z.sort||0),JSON.stringify(t),now);
    let bom=kvParseSafe165(db.prepare("SELECT value FROM kv WHERE key=?").get(p+"bom_"+tid)?.value,[]);
    (Array.isArray(bom)?bom:[]).forEach((r,i)=>{let mk=String(r.id||r.mark||r.name||i);putBom.run(oid,tid,mk,r.mark||"",r.name||r.title||"",relNum165(r.qty??r.count??r.volume),r.unit||t.unit||"",i,JSON.stringify(r),now)})
   }
  }
  db.prepare("INSERT INTO meta(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run("relational_v1",JSON.stringify({at:now,objects:db.prepare("SELECT COUNT(*) n FROM objects").get().n,tasks:db.prepare("SELECT COUNT(*) n FROM tasks").get().n,bom:db.prepare("SELECT COUNT(*) n FROM bom_marks").get().n}));
  db.exec("COMMIT")
 }catch(e){try{db.exec("ROLLBACK")}catch{}throw e}
}
function kvParseSafe165(v,fallback){if(v==null)return fallback;try{return JSON.parse(v)}catch{return fallback}}
function migrateReports166(){
 let db=sqlite163;if(!db||db.prepare("SELECT value FROM meta WHERE key=?").get("relational_reports_v1"))return;
 let objects=kvParseSafe165(db.prepare("SELECT value FROM kv WHERE key=?").get("atemir-company-objects-v1")?.value,[]),now=new Date().toISOString();
 let pr=db.prepare("INSERT INTO reports(id,object_id,report_date,weather,notes,sort_order,raw_json,updated_at) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET object_id=excluded.object_id,report_date=excluded.report_date,weather=excluded.weather,notes=excluded.notes,sort_order=excluded.sort_order,raw_json=excluded.raw_json,updated_at=excluded.updated_at");
 let pw=db.prepare("INSERT INTO report_works(report_id,work_key,task_id,mark,name,qty,unit,sort_order,raw_json) VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(report_id,work_key) DO UPDATE SET task_id=excluded.task_id,mark=excluded.mark,name=excluded.name,qty=excluded.qty,unit=excluded.unit,sort_order=excluded.sort_order,raw_json=excluded.raw_json");
 let pp=db.prepare("INSERT INTO report_people(report_id,person_key,kind,role,name,qty,sort_order,raw_json) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(report_id,person_key) DO UPDATE SET kind=excluded.kind,role=excluded.role,name=excluded.name,qty=excluded.qty,sort_order=excluded.sort_order,raw_json=excluded.raw_json");
 let pe=db.prepare("INSERT INTO report_equipment(report_id,equipment_key,type,name,qty,sort_order,raw_json) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(report_id,equipment_key) DO UPDATE SET type=excluded.type,name=excluded.name,qty=excluded.qty,sort_order=excluded.sort_order,raw_json=excluded.raw_json");
 db.exec("BEGIN IMMEDIATE");try{
  for(let o of (Array.isArray(objects)?objects:[])){let oid=String(o?.id??"");if(!oid)continue,p="atemir_entity_"+oid+"_",ri=kvParseSafe165(db.prepare("SELECT value FROM kv WHERE key=?").get(p+"reportIndex")?.value,[]);
   for(let z of (Array.isArray(ri)?ri:[])){let r=kvParseSafe165(db.prepare("SELECT value FROM kv WHERE key=?").get(p+"report_"+z.id)?.value,null);if(!r)continue;let rid=String(r.id||z.id),weather=typeof r.weather==="string"?r.weather:JSON.stringify(r.weather||{});
    pr.run(rid,oid,r.date||r.reportDate||"",weather,r.notes||r.info||r.additionalInfo||"",Number(z.sort||0),JSON.stringify(r),now);
    let works=r.works||r.workItems||r.completedWorks||[];(Array.isArray(works)?works:[]).forEach((w,i)=>pw.run(rid,String(w.id||i),String(w.taskId||""),w.mark||"",w.name||w.title||"",relNum165(w.qty??w.count??w.volume),w.unit||"",i,JSON.stringify(w)));
    for(let pair of [["worker",r.people||r.workers||[]],["responsible",r.responsibles||r.responsiblePersons||[]]]){let kind=pair[0],list=Array.isArray(pair[1])?pair[1]:[];list.forEach((x,i)=>pp.run(rid,kind+"_"+String(x.id||i),kind,x.role||x.position||"",x.name||"",relNum165(x.qty??x.count??1),i,JSON.stringify(x)))}
    let eq=r.equipment||r.machinery||r.vehicles||[];(Array.isArray(eq)?eq:[]).forEach((x,i)=>pe.run(rid,String(x.id||i),x.type||x.name||"",x.name||"",relNum165(x.qty??x.count??1),i,JSON.stringify(x)))
   }
  }
  db.prepare("INSERT INTO meta(key,value) VALUES(?,?)").run("relational_reports_v1",JSON.stringify({at:now,reports:db.prepare("SELECT COUNT(*) n FROM reports").get().n,works:db.prepare("SELECT COUNT(*) n FROM report_works").get().n,people:db.prepare("SELECT COUNT(*) n FROM report_people").get().n,equipment:db.prepare("SELECT COUNT(*) n FROM report_equipment").get().n}));db.exec("COMMIT")
 }catch(e){try{db.exec("ROLLBACK")}catch{}throw e}
}
function migrateOperations167(){
 let db=sqlite163;if(!db||db.prepare("SELECT value FROM meta WHERE key=?").get("relational_operations_v1"))return;
 let objects=kvParseSafe165(db.prepare("SELECT value FROM kv WHERE key=?").get("atemir-company-objects-v1")?.value,[]),now=new Date().toISOString();
 let pi=db.prepare("INSERT INTO invoices(id,object_id,invoice_date,number,sort_order,raw_json,updated_at) VALUES(?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET object_id=excluded.object_id,invoice_date=excluded.invoice_date,number=excluded.number,sort_order=excluded.sort_order,raw_json=excluded.raw_json,updated_at=excluded.updated_at");
 let px=db.prepare("INSERT INTO invoice_items(invoice_id,item_key,task_id,code,mark,qty,volume,unit,sort_order,raw_json) VALUES(?,?,?,?,?,?,?,?,?,?) ON CONFLICT(invoice_id,item_key) DO UPDATE SET task_id=excluded.task_id,code=excluded.code,mark=excluded.mark,qty=excluded.qty,volume=excluded.volume,unit=excluded.unit,sort_order=excluded.sort_order,raw_json=excluded.raw_json");
 let pa=db.prepare("INSERT INTO acted_days(object_id,day,raw_json) VALUES(?,?,?) ON CONFLICT(object_id,day) DO UPDATE SET raw_json=excluded.raw_json");
 let pp=db.prepare("INSERT INTO penalties(object_id,penalty_key,penalty_date,title,amount,sort_order,raw_json) VALUES(?,?,?,?,?,?,?) ON CONFLICT(object_id,penalty_key) DO UPDATE SET penalty_date=excluded.penalty_date,title=excluded.title,amount=excluded.amount,sort_order=excluded.sort_order,raw_json=excluded.raw_json");
 db.exec("BEGIN IMMEDIATE");try{
  for(let o of (Array.isArray(objects)?objects:[])){let oid=String(o?.id??"");if(!oid)continue,p="atemir_entity_"+oid+"_",ii=kvParseSafe165(db.prepare("SELECT value FROM kv WHERE key=?").get(p+"invoiceIndex")?.value,[]);
   for(let z of (Array.isArray(ii)?ii:[])){let inv=kvParseSafe165(db.prepare("SELECT value FROM kv WHERE key=?").get(p+"invoice_"+z.id)?.value,null);if(!inv)continue;let iid=String(inv.id||z.id);pi.run(iid,oid,inv.date||"",inv.no||inv.number||"",Number(z.sort||0),JSON.stringify(inv),now);let items=inv.items||inv.positions||inv.rows||[];(Array.isArray(items)?items:[]).forEach((x,i)=>px.run(iid,String(x.id||i),String(x.taskId||""),x.code||"",x.mark||"",relNum165(x.qty??x.count),relNum165(x.volume),x.unit||"",i,JSON.stringify(x)))}
   let ad=kvParseSafe165(db.prepare("SELECT value FROM kv WHERE key=?").get(p+"actedDays")?.value,[]);(Array.isArray(ad)?ad:[]).forEach(x=>{let day=typeof x==="string"?x:(x.date||x.day||"");if(day)pa.run(oid,day,JSON.stringify(x))});
   let ps=kvParseSafe165(db.prepare("SELECT value FROM kv WHERE key=?").get(p+"penalties")?.value,[]);(Array.isArray(ps)?ps:[]).forEach((x,i)=>pp.run(oid,String(x.id||i),x.date||"",x.title||x.name||x.reason||"",relNum165(x.amount??x.sum),i,JSON.stringify(x)))
  }
  db.prepare("INSERT INTO meta(key,value) VALUES(?,?)").run("relational_operations_v1",JSON.stringify({at:now,invoices:db.prepare("SELECT COUNT(*) n FROM invoices").get().n,items:db.prepare("SELECT COUNT(*) n FROM invoice_items").get().n,actedDays:db.prepare("SELECT COUNT(*) n FROM acted_days").get().n,penalties:db.prepare("SELECT COUNT(*) n FROM penalties").get().n}));db.exec("COMMIT")
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
function kvParse164(row){if(!row)return null;try{return JSON.parse(row.value)}catch{return row.value}}
function kvGet164(key){return kvParse164(sqliteDb163().prepare("SELECT value FROM kv WHERE key=?").get(String(key)))}
function kvAll164(){let out={};for(let row of sqliteDb163().prepare("SELECT key,value FROM kv").all())out[row.key]=kvParse164(row);return out}
function kvPrefix164(prefix){let out={},p=String(prefix);for(let row of sqliteDb163().prepare("SELECT key,value FROM kv WHERE key LIKE ? ESCAPE '\\'").all(p.replace(/[\\%_]/g,x=>"\\"+x)+"%"))out[row.key]=kvParse164(row);return out}
function syncRelational168(key,value){
 let db=sqliteDb163(),s=String(key),now=new Date().toISOString(),x=value||{},mm=s.match(/^atemir_entity_(.+)_(task|bom|report|invoice)_([^_]+)$/);
 if(mm){let oid=mm[1],kind=mm[2],id=mm[3];
  if(kind==="task"){db.prepare("INSERT INTO tasks(id,object_id,type,code,unit,volume,start_date,end_date,bom_name,sort_order,raw_json,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET object_id=excluded.object_id,type=excluded.type,code=excluded.code,unit=excluded.unit,volume=excluded.volume,start_date=excluded.start_date,end_date=excluded.end_date,bom_name=excluded.bom_name,raw_json=excluded.raw_json,updated_at=excluded.updated_at").run(id,oid,x.type||"",x.code||"",x.unit||"",relNum165(x.volume),x.start||"",x.date||"",x.bomName||"",0,JSON.stringify(x),now)}
  else if(kind==="bom"){db.prepare("DELETE FROM bom_marks WHERE task_id=?").run(id);let q=db.prepare("INSERT INTO bom_marks(object_id,task_id,mark_key,mark,name,qty,unit,sort_order,raw_json,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)");(Array.isArray(x)?x:[]).forEach((r,i)=>q.run(oid,id,String(r.id||r.mark||r.name||i),r.mark||"",r.name||r.title||"",relNum165(r.qty??r.count??r.volume),r.unit||"",i,JSON.stringify(r),now))}
  else if(kind==="report"){syncReport168(db,oid,id,x,now)}
  else if(kind==="invoice"){syncInvoice168(db,oid,id,x,now)}
 }else{let a=s.match(/^atemir_entity_(.+)_(actedDays|penalties)$/);if(a){let oid=a[1];if(a[2]==="actedDays"){db.prepare("DELETE FROM acted_days WHERE object_id=?").run(oid);let q=db.prepare("INSERT INTO acted_days(object_id,day,raw_json) VALUES(?,?,?)");(Array.isArray(x)?x:[]).forEach(v=>{let day=typeof v==="string"?v:(v.date||v.day||"");if(day)q.run(oid,day,JSON.stringify(v))})}else{db.prepare("DELETE FROM penalties WHERE object_id=?").run(oid);let q=db.prepare("INSERT INTO penalties(object_id,penalty_key,penalty_date,title,amount,sort_order,raw_json) VALUES(?,?,?,?,?,?,?)");(Array.isArray(x)?x:[]).forEach((v,i)=>q.run(oid,String(v.id||i),v.date||"",v.title||v.name||v.reason||"",relNum165(v.amount??v.sum),i,JSON.stringify(v)))}}}
}
function syncReport168(db,oid,id,r,now){db.prepare("INSERT INTO reports(id,object_id,report_date,weather,notes,sort_order,raw_json,updated_at) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET object_id=excluded.object_id,report_date=excluded.report_date,weather=excluded.weather,notes=excluded.notes,raw_json=excluded.raw_json,updated_at=excluded.updated_at").run(id,oid,r.date||r.reportDate||"",typeof r.weather==="string"?r.weather:JSON.stringify(r.weather||{}),r.notes||r.info||r.additionalInfo||"",0,JSON.stringify(r),now);db.prepare("DELETE FROM report_works WHERE report_id=?").run(id);db.prepare("DELETE FROM report_people WHERE report_id=?").run(id);db.prepare("DELETE FROM report_equipment WHERE report_id=?").run(id);let qw=db.prepare("INSERT INTO report_works(report_id,work_key,task_id,mark,name,qty,unit,sort_order,raw_json) VALUES(?,?,?,?,?,?,?,?,?)");let works=r.works||r.workItems||r.completedWorks||[];(Array.isArray(works)?works:[]).forEach((w,i)=>qw.run(id,String(w.id||i),String(w.taskId||""),w.mark||"",w.name||w.title||"",relNum165(w.qty??w.count??w.volume),w.unit||"",i,JSON.stringify(w)));let qp=db.prepare("INSERT INTO report_people(report_id,person_key,kind,role,name,qty,sort_order,raw_json) VALUES(?,?,?,?,?,?,?,?)");for(let z of [["worker",r.people||r.workers||[]],["responsible",r.responsibles||r.responsiblePersons||[]]])(Array.isArray(z[1])?z[1]:[]).forEach((v,i)=>qp.run(id,z[0]+"_"+String(v.id||i),z[0],v.role||v.position||"",v.name||v.fio||"",relNum165(v.qty??v.count??1),i,JSON.stringify(v)));let qe=db.prepare("INSERT INTO report_equipment(report_id,equipment_key,type,name,qty,sort_order,raw_json) VALUES(?,?,?,?,?,?,?,?)");let eq=r.equipment||r.machinery||r.vehicles||[];(Array.isArray(eq)?eq:[]).forEach((v,i)=>qe.run(id,String(v.id||i),v.type||v.name||"",v.name||"",relNum165(v.qty??v.count??1),i,JSON.stringify(v)))}
function syncInvoice168(db,oid,id,v,now){db.prepare("INSERT INTO invoices(id,object_id,invoice_date,number,sort_order,raw_json,updated_at) VALUES(?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET object_id=excluded.object_id,invoice_date=excluded.invoice_date,number=excluded.number,raw_json=excluded.raw_json,updated_at=excluded.updated_at").run(id,oid,v.date||"",v.no||v.number||"",0,JSON.stringify(v),now);db.prepare("DELETE FROM invoice_items WHERE invoice_id=?").run(id);let q=db.prepare("INSERT INTO invoice_items(invoice_id,item_key,task_id,code,mark,qty,volume,unit,sort_order,raw_json) VALUES(?,?,?,?,?,?,?,?,?,?)"),items=v.items||v.positions||v.rows||[];(Array.isArray(items)?items:[]).forEach((x,i)=>q.run(id,String(x.id||i),String(x.taskId||""),x.code||"",x.mark||"",relNum165(x.qty??x.count),relNum165(x.volume),x.unit||"",i,JSON.stringify(x)))}
function kvSet164(key,value){let db=sqliteDb163();db.exec("BEGIN IMMEDIATE");try{db.prepare("INSERT INTO kv(key,value,updated_at) VALUES(?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at").run(String(key),JSON.stringify(value),new Date().toISOString());syncRelational168(key,value);db.exec("COMMIT");return true}catch(e){try{db.exec("ROLLBACK")}catch{}throw e}}
function kvWriteMany164(entries={}){let db=sqliteDb163(),put=db.prepare("INSERT INTO kv(key,value,updated_at) VALUES(?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at"),now=new Date().toISOString();db.exec("BEGIN IMMEDIATE");try{for(let [key,value] of Object.entries(entries||{})){put.run(key,JSON.stringify(value),now);syncRelational168(key,value)}db.exec("COMMIT");return true}catch(e){try{db.exec("ROLLBACK")}catch{}throw e}}
ipcMain.handle("db:get",(_e,key)=>kvGet164(key));
ipcMain.on("db:get-sync",(e,key)=>{e.returnValue=kvGet164(key)});
ipcMain.on("db:all-sync",(e)=>{e.returnValue=kvAll164()});
ipcMain.on("db:get-prefix-sync",(e,prefix)=>{e.returnValue=kvPrefix164(prefix)});
ipcMain.on("db:set-sync",(e,key,value)=>{try{e.returnValue=kvSet164(key,value)}catch(err){console.error("DB sync save",err);e.returnValue=false}});
ipcMain.handle("db:set",(_e,key,value)=>kvSet164(key,value));
ipcMain.handle("db:remove",(_e,key)=>{sqliteDb163().prepare("DELETE FROM kv WHERE key=?").run(String(key));return true});
ipcMain.handle("db:migrate",(_e,entries={})=>{let db=sqliteDb163(),added=0,put=db.prepare("INSERT INTO kv(key,value,updated_at) VALUES(?,?,?) ON CONFLICT(key) DO NOTHING"),now=new Date().toISOString();db.exec("BEGIN IMMEDIATE");try{for(let [key,value] of Object.entries(entries||{})){let r=put.run(key,JSON.stringify(value),now);added+=Number(r.changes||0)}db.exec("COMMIT");return {ok:true,added,path:sqlitePath163()}}catch(e){try{db.exec("ROLLBACK")}catch{}throw e}});
ipcMain.handle("db:info",()=>{let db=sqliteDb163(),row=db.prepare("SELECT COUNT(*) AS n FROM kv").get(),mig=db.prepare("SELECT value FROM meta WHERE key=?").get("json_migrated_v1");let at="";try{at=mig?JSON.parse(mig.value).at:""}catch{}return {path:sqlitePath163(),engine:"sqlite",keys:Number(row?.n||0),updatedAt:at}});
ipcMain.handle("db:backup",async()=>{let db=dbRead(),dir=path.join(app.getPath("userData"),"backups");fs.mkdirSync(dir,{recursive:true});let stamp=new Date().toISOString().replace(/[:.]/g,"-"),jsonDest=path.join(dir,"atemir-data-"+stamp+".json"),sqlDest=path.join(dir,"atemir-"+stamp+".db");fs.writeFileSync(jsonDest,JSON.stringify(db),"utf8");sqliteDb163().exec("PRAGMA wal_checkpoint(FULL)");fs.copyFileSync(sqlitePath163(),sqlDest);return {ok:true,path:sqlDest,jsonPath:jsonDest}});
ipcMain.handle("db:write-many",(_e,entries={})=>kvWriteMany164(entries));
ipcMain.handle("db:remove-prefix",(_e,prefix)=>{let keys=Object.keys(kvPrefix164(prefix));if(!keys.length)return 0;let db=sqliteDb163(),del=db.prepare("DELETE FROM kv WHERE key=?");db.exec("BEGIN IMMEDIATE");try{for(let key of keys)del.run(key);db.exec("COMMIT");return keys.length}catch(e){try{db.exec("ROLLBACK")}catch{}throw e}});
ipcMain.handle("db:remove-many",(_e,keys=[])=>{let db=sqliteDb163(),del=db.prepare("DELETE FROM kv WHERE key=?"),n=0;db.exec("BEGIN IMMEDIATE");try{for(let key of keys||[]){let r=del.run(String(key));n+=Number(r.changes||0)}db.exec("COMMIT");return n}catch(e){try{db.exec("ROLLBACK")}catch{}throw e}});




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