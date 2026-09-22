const {contextBridge,ipcRenderer}=require("electron");
contextBridge.exposeInMainWorld("ATemir",{
 reports:()=>ipcRenderer.invoke("db:reports"),
 createReport:n=>ipcRenderer.invoke("db:createReport",n),
 duplicateReport:id=>ipcRenderer.invoke("db:duplicateReport",id),
 deleteReport:id=>ipcRenderer.invoke("db:deleteReport",id),
 load:id=>ipcRenderer.invoke("db:load",id),
 save:(id,d)=>ipcRenderer.invoke("db:save",id,d),
 importJSON:()=>ipcRenderer.invoke("file:import"),
 backup:d=>ipcRenderer.invoke("file:backup",d),
 exportHTML:h=>ipcRenderer.invoke("file:html",h),
 pdf:h=>ipcRenderer.invoke("file:pdf",h),
 chooseLogo:()=>ipcRenderer.invoke("file:logo"),
 choosePhotos:()=>ipcRenderer.invoke("file:photos"),
 importBOM:()=>ipcRenderer.invoke("file:bom")
});