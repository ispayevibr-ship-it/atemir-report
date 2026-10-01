(()=>{"use strict";
const style=document.createElement('style');style.textContent=`
body.marksPolish235 #view{background:#f5f8fa;padding:18px 20px 28px!important;color:#17364d}
body.marksPolish235 #view>div{max-width:none}
body.marksPolish235 #view h2,body.marksPolish235 #view h3{color:#17364d;margin:0 0 14px;font-weight:750}
body.marksPolish235 #view select,body.marksPolish235 #view input[type=text],body.marksPolish235 #view input:not([type]){height:38px;border:1px solid #d7e1e8;border-radius:7px;background:#fff;padding:0 11px;color:#17364d;outline:none;transition:.15s}
body.marksPolish235 #view select:focus,body.marksPolish235 #view input:focus{border-color:#2b95c9;box-shadow:0 0 0 3px rgba(43,149,201,.1)}
body.marksPolish235 #view button{min-height:36px;border:1px solid #cfdce5;border-radius:7px;background:#fff;color:#31566f;padding:0 13px;font-size:12px;font-weight:650;cursor:pointer;transition:.15s}
body.marksPolish235 #view button:hover{background:#eef8fc;border-color:#9bcfe5;color:#147eae}
body.marksPolish235 .marksTop235{background:#fff;border:1px solid #e0e8ed;border-radius:10px;padding:18px 20px;margin-bottom:12px;box-shadow:0 2px 8px rgba(19,50,72,.045)}
body.marksPolish235 .marksTop235 h2{font-size:16px!important;margin-bottom:14px!important}
body.marksPolish235 .marksTop235 select{margin:4px 8px 7px 4px;min-width:250px}
body.marksPolish235 .marksStats235{display:grid!important;grid-template-columns:repeat(6,minmax(115px,1fr));gap:9px;margin:12px 0!important;padding:0!important;border:0!important;background:transparent!important}
body.marksPolish235 .marksStat235{background:#fff;border:1px solid #e0e8ed;border-radius:9px;padding:12px 13px;min-height:68px;display:flex;flex-direction:column;justify-content:center;box-shadow:0 1px 5px rgba(19,50,72,.035)}
body.marksPolish235 .marksStat235 span{font-size:10px;color:#718696;margin-bottom:5px}body.marksPolish235 .marksStat235 b{font-size:20px;color:#17364d;line-height:1}
body.marksPolish235 .marksStat235.ready b{color:#16895a}
body.marksPolish235 .marksTools235{display:flex!important;align-items:center;gap:8px;background:#fff;border:1px solid #e0e8ed;border-radius:9px;padding:11px 12px;margin-bottom:10px}
body.marksPolish235 .marksTools235 input{flex:1;min-width:240px}
body.marksPolish235 .marksTools235 button.active235{background:#1695cf!important;border-color:#1695cf!important;color:#fff!important}
body.marksPolish235 .markCard235{background:#fff;border:1px solid #e1e8ed!important;border-radius:9px!important;margin:0 0 7px!important;padding:14px 18px!important;box-shadow:0 1px 4px rgba(18,48,68,.035);transition:.15s}
body.marksPolish235 .markCard235:hover{border-color:#b9d5e4!important;box-shadow:0 3px 10px rgba(18,48,68,.07);transform:translateY(-1px)}
body.marksPolish235 .markCard235 b,body.marksPolish235 .markCard235 strong{color:#17364d;font-size:13px}
body.marksPolish235 .markCard235{font-size:11px;line-height:1.55;color:#607787}
@media(max-width:1100px){body.marksPolish235 .marksStats235{grid-template-columns:repeat(3,1fr)}}
`;
document.head.appendChild(style);
function text(el){return (el?.textContent||'').replace(/\s+/g,' ').trim()}
function polish(){const view=document.getElementById('view');if(!view)return;const t=text(view);if(!t.includes('Загрузить ведомость марок')&&!t.includes('Марок всего')){document.body.classList.remove('marksPolish235');return}document.body.classList.add('marksPolish235');
 const kids=[...view.children];const top=kids.find(x=>text(x).includes('Загрузить ведомость марок'));if(top)top.classList.add('marksTop235');
 const walker=[...view.querySelectorAll('div')];let stats=walker.find(x=>{const s=text(x);return s.includes('Марок всего')&&s.includes('Готовность')&&x.children.length>=4&&x.children.length<=10});
 if(stats){stats.classList.add('marksStats235');[...stats.children].forEach((c,i)=>{c.classList.add('marksStat235');if(i===5)c.classList.add('ready');const raw=text(c);const m=raw.match(/^(.*?)(-?\d+(?:[.,]\d+)?%?)$/);if(m&&!c.querySelector('b'))c.innerHTML='<span>'+m[1].trim()+'</span><b>'+m[2]+'</b>';});}
 const input=[...view.querySelectorAll('input')].find(x=>(x.placeholder||'').toLowerCase().includes('поиск по наименованию'));
 if(input){let tools=input.parentElement;if(tools){tools.classList.add('marksTools235');[...tools.querySelectorAll('button')].forEach((b,i)=>{if(i===0)b.classList.add('active235')});}}
 const candidates=[...view.querySelectorAll('div')].filter(x=>{const s=text(x);return /Проект:\s*\d+/i.test(s)&&/Смонтировано:/i.test(s)&&x.children.length<=8});candidates.forEach(x=>x.classList.add('markCard235'));
}
let scheduled=false;const obs=new MutationObserver(()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;polish()})});const view=document.getElementById('view');if(view)obs.observe(view,{childList:true,subtree:true});polish();
})();