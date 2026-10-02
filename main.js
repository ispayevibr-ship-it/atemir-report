"use strict";
const {app,BrowserWindow,ipcMain}=require("electron");
const path=require("path");
const {initDatabase,objects,reports}=require("./src-v9/main/database");
const backup=require("./src-v9/main/backup");
const updater=require("./src-v9/main/updater");
let win;
function createWindow(){win=new BrowserWindow({width:1440,height:900,minWidth:1100,minHeight:700,show:false,webPreferences:{preload:path.join(__dirname,"preload.js"),contextIsolation:true,nodeIntegration:false}});win.loadFile(path.join(__dirname,"src-v9/renderer/index.html"));win.once("ready-to-show",()=>win.show())}
function registerIpc(){ipcMain.handle("objects:list",()=>objects.list());ipcMain.handle("objects:get",(_e,id)=>objects.get(id));ipcMain.handle("objects:create",(_e,data)=>objects.create(data));ipcMain.handle("reports:list",(_e,objectId)=>reports.list(objectId));ipcMain.handle("reports:get",(_e,x)=>reports.get(x.objectId,x.reportId));ipcMain.handle("reports:create",(_e,x)=>reports.create(x.objectId,x.data));ipcMain.handle("backup:create",()=>backup.create(win));ipcMain.handle("backup:restore",()=>backup.restore(win));ipcMain.handle("app:version",()=>app.getVersion());ipcMain.handle("update:check",()=>updater.check());ipcMain.handle("update:download",()=>updater.download());ipcMain.handle("update:install",()=>updater.install())}
app.whenReady().then(()=>{initDatabase();registerIpc();createWindow();updater.init(()=>win);app.on("activate",()=>{if(BrowserWindow.getAllWindows().length===0)createWindow()})});app.on("window-all-closed",()=>{if(process.platform!=="darwin")app.quit()});
