const fs=require('fs');
let p='main.js',s=fs.readFileSync(p,'utf8');
const marker='async function checkHotUpdate(){';
if(!s.includes(marker))throw Error('checkHotUpdate target not found');
if(!s.includes('raw.githubusercontent.com/ispayevibr-ship-it/atemir-report-updates/main/hot/latest.json')){
 const add='async function checkHotUpdate(){\n try{let raw=await new Promise((resolve,reject)=>{let u="https://raw.githubusercontent.com/ispayevibr-ship-it/atemir-report-updates/main/hot/latest.json?t="+Date.now();https.get(u,{headers:{"User-Agent":"atemir-report","Cache-Control":"no-cache"}},r=>{let b="";r.on("data",d=>b+=d);r.on("end",()=>r.statusCode===200?resolve(b):reject(Error("HTTP "+r.statusCode)))}).on("error",reject)});let manifest=JSON.parse(raw);if(manifest&&newer(manifest.version,app.getVersion())){sendUpdate("available",{version:manifest.version,hot:true});return manifest}}catch(e){console.error("Direct hot update check failed:",e.message)}';
 s=s.replace(marker,add);
}
fs.writeFileSync(p,s);console.log('patched main.js');
