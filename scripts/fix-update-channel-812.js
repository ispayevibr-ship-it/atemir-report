const fs=require('fs');
let p='main.js',s=fs.readFileSync(p,'utf8');
const old='async function fetchHotMeta(){let url="https://api.github.com/repos/"+HOT_OWNER+"/"+HOT_REPO+"/contents/hot/latest.json?ref=main&ts="+Date.now(),raw=await ghGet(url),api=JSON.parse(raw),txt=Buffer.from(String(api.content||"").replace(/\\\n/g,""),"base64").toString("utf8"),meta=JSON.parse(txt);if(!meta.version)throw Error("Сервер обновлений не вернул номер версии");return meta}';
const neu='async function fetchHotMeta(){let rawUrl="https://raw.githubusercontent.com/"+HOT_OWNER+"/"+HOT_REPO+"/main/hot/latest.json?ts="+Date.now(),meta;try{meta=JSON.parse(await ghGet(rawUrl))}catch(rawErr){let apiUrl="https://api.github.com/repos/"+HOT_OWNER+"/"+HOT_REPO+"/contents/hot/latest.json?ref=main&ts="+Date.now(),raw=await ghGet(apiUrl),api=JSON.parse(raw),txt=Buffer.from(String(api.content||"").replace(/\\\n/g,""),"base64").toString("utf8");meta=JSON.parse(txt)}if(!meta.version)throw Error("Сервер обновлений не вернул номер версии");return meta}';
if(!s.includes(old)) throw new Error('fetchHotMeta target not found');
s=s.replace(old,neu);fs.writeFileSync(p,s);
let pkg=JSON.parse(fs.readFileSync('package.json','utf8'));pkg.version='8.0.212';fs.writeFileSync('package.json',JSON.stringify(pkg,null,2)+'\n');
