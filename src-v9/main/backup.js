"use strict";
const {app,dialog}=require("electron");const path=require("path");const fs=require("fs");const dbFile=()=>path.join(app.getPath("userData"),"data-v9","atemir-v9.db");
async function create(win){const r=await dialog.showSaveDialog(win,{title:"Создать резервную копию",defaultPath:`A-Temir-v9-backup-${new Date().toISOString().slice(0,10)}.db`,filters:[{name:"A-Temir Backup",extensions:["db"]}]});if(r.canceled||!r.filePath)return {canceled:true};fs.copyFileSync(dbFile(),r.filePath);return {ok:true,path:r.filePath}}
async function restore(win){const r=await dialog.showOpenDialog(win,{title:"Восстановить резервную копию",properties:["openFile"],filters:[{name:"A-Temir Backup",extensions:["db"]}]});if(r.canceled||!r.filePaths[0])return {canceled:true};fs.copyFileSync(r.filePaths[0],dbFile());return {ok:true,restartRequired:true}}
module.exports={create,restore};
