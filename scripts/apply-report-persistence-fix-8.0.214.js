const fs=require('fs');

function replaceOnce(path,from,to,label){
  let s=fs.readFileSync(path,'utf8');
  if(!s.includes(from)) throw new Error(`Not found (${label})`);
  s=s.replace(from,to);
  fs.writeFileSync(path,s,'utf8');
}

// main.js may already contain this fix from 8.0.213. Only change it when the old form is still present.
{
  const path='main.js';
  let s=fs.readFileSync(path,'utf8');
  const old='let works=r.works||r.workItems||r.completedWorks||[];';
  const fixed='let works=r.items||r.works||r.workItems||r.completedWorks||[];';
  if(s.includes(old)){
    s=s.replace(old,fixed);
    fs.writeFileSync(path,s,'utf8');
  }else if(!s.includes(fixed)){
    throw new Error('SQLite report items handler not found');
  }
}

replaceOnce('src/report-app.js',
` let token=kind+":"+(entityId||String(index??"")),old=entityTimers148[token];if(old)clearTimeout(old);
 saveState148("Сохраняю…");
 entityTimers148[token]=setTimeout(async()=>{`,
` let token=kind+":"+(entityId||String(index??"")),old=entityTimers148[token];if(old)clearTimeout(old);
 saveState148("Сохраняю…");
 const runSave148=async()=>{`,
'entity save start');

replaceOnce('src/report-app.js',
`   saveState148("Сохранено")
  }catch(e){console.error("Targeted save",e);saveState148("Ошибка сохранения")}
  finally{delete entityTimers148[token]}
 },300)
}`,
`   saveState148("Сохранено");return true
  }catch(e){console.error("Targeted save",e);saveState148("Ошибка сохранения");return false}
  finally{delete entityTimers148[token]}
 };
 if(kind==="report")return runSave148();
 entityTimers148[token]=setTimeout(runSave148,300);
 return true
}`,
'entity save end');

console.log('Applied daily report persistence fix for 8.0.214');
