const fs=require('fs');
const p='src/report-app.js';
let s=fs.readFileSync(p,'utf8');
const old=`entries[entityPrefix144+"report_"+x.id]={...x,photos:[],items:(x.items||[]).map(i=>({...i,photos:[]}))};\n     let idx=window.atemirDesktop?.dbGetSync?.(entityPrefix144+"reportIndex")||[],cur=idx.find(z=>z.id===x.id);\n     if(!cur||cur.date!==(x.date||"")||idx.length!==(d.workDays||[]).length)entries[entityPrefix144+"reportIndex"]=(d.workDays||[]).map((z,sort)=>({id:z.id,date:z.date||"",sort}))`;
const neu=`entries[entityPrefix144+"report_"+x.id]={...x};\n     // Always persist the report index together with the report. This makes a new/edited daily report atomic.\n     entries[entityPrefix144+"reportIndex"]=(d.workDays||[]).map((z,sort)=>({id:z.id,date:z.date||"",sort}))`;
if(!s.includes(old))throw new Error('daily report save block not found');
s=s.replace(old,neu);
const oldWrite=`await writeEntities153(entries);saveState148("Сохранено")`;
const newWrite=`await writeEntities153(entries);\n   if(kind==="report"&&entityId){\n    let saved=await window.atemirDesktop?.dbGet?.(entityPrefix144+"report_"+entityId);\n    let indexSaved=await window.atemirDesktop?.dbGet?.(entityPrefix144+"reportIndex");\n    if(!saved||String(saved.id)!==String(entityId)||!Array.isArray(indexSaved)||!indexSaved.some(z=>String(z.id)===String(entityId)))throw new Error("Daily report persistence verification failed")\n   }\n   saveState148("Сохранено")`;
if(!s.includes(oldWrite))throw new Error('write verification insertion point not found');
s=s.replace(oldWrite,newWrite);
fs.writeFileSync(p,s);
// trigger 1
