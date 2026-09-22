const {contextBridge,ipcRenderer}=require("electron");
contextBridge.exposeInMainWorld("ATemir",{
 load:()=>ipcRenderer.invoke("db:load"),
 save:d=>ipcRenderer.invoke("db:save",d),
 importJSON:()=>ipcRenderer.invoke("file:import"),
 backup:d=>ipcRenderer.invoke("file:backup",d),
 exportHTML:h=>ipcRenderer.invoke("file:html",h),
 pdf:()=>ipcRenderer.invoke("file:pdf")
});