const {contextBridge,ipcRenderer}=require("electron");contextBridge.exposeInMainWorld("atemirDesktop",{savePdf:(arg)=>ipcRenderer.invoke("report:pdf",arg)});
