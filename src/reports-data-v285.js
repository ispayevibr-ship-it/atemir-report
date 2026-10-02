(()=>{"use strict";
function core(){return window.atemirObjectCore}
function iso(v){return String(v||'').slice(0,10)}
function byDate(v){const c=core();if(!c)return null;return c.reports.list().find(x=>iso(x.date)===iso(v))||null}
function get(id){const c=core();return c?id?c.reports.get(id):null:null}
function list(){const c=core();return c?c.reports.list():[]}
function index(){const c=core();return c?c.reports.index():[]}
window.atemirReportsData={list,index,get,byDate,storageId:()=>core()?.storageId||null};
window.dispatchEvent(new CustomEvent('atemir:reports-data-ready'));
})();