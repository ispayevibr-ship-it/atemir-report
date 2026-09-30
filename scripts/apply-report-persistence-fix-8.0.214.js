const fs=require('fs');

function patch(path, replacements){
  let s=fs.readFileSync(path,'utf8');
  for(const [from,to,label] of replacements){
    if(!s.includes(from)) throw new Error(`Not found (${label}): ${from.slice(0,120)}`);
    s=s.replace(from,to);
  }
  fs.writeFileSync(path,s,'utf8');
}

patch('main.js',[["let works=r.works||r.workItems||r.completedWorks||[];","let works=r.items||r.works||r.workItems||r.completedWorks||[];","SQLite report items"]]);

patch('src/report-app.js',[[
"function saveEntity148(kind,index){\n let entityId=\"\";",
"function saveEntity148(kind,index){\n let entityId=\"\";",
"saveEntity anchor"
],[
" let token=kind+\":\"+(entityId||String(index??\"\")),old=entityTimers148[token];if(old)clearTimeout(old);\n saveState148(\"Сохраняю…\");\n entityTimers148[token]=setTimeout(async()=>{",
" let token=kind+\":\"+(entityId||String(index??\"\")),old=entityTimers148[token];if(old)clearTimeout(old);\n saveState148(\"Сохраняю…\");\n const runSave148=async()=>{",
"remove report debounce start"
],[
"  }catch(e){console.error(\"Entity save\",e);saveState148(\"Ошибка сохранения\")}\n },kind===\"report\"?0:180)\n}",
"  }catch(e){console.error(\"Entity save\",e);saveState148(\"Ошибка сохранения\");return false}\n  return true\n };\n if(kind===\"report\")return runSave148();\n entityTimers148[token]=setTimeout(runSave148,180);\n return true\n}",
"immediate report save"
]]);

console.log('Applied daily report persistence fix for 8.0.214');
