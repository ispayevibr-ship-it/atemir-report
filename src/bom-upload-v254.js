(()=>{"use strict";
const STYLE_ID="bomUploadV254Css";
function addCss(){if(document.getElementById(STYLE_ID))return;const s=document.createElement("style");s.id=STYLE_ID;s.textContent=`
body.bn252 #bomUpload517,
body.bn252 #bomUpload517[style],
body.bn252 #bomUpload517:disabled{
  display:inline-flex!important;align-items:center!important;justify-content:center!important;
  min-width:264px!important;width:264px!important;height:52px!important;padding:0 20px!important;
  border:1px solid #1695cf!important;border-radius:9px!important;
  background:#1695cf!important;color:#fff!important;-webkit-text-fill-color:#fff!important;
  font-size:12px!important;font-weight:800!important;line-height:1!important;text-align:center!important;
  opacity:1!important;filter:none!important;text-shadow:none!important;box-shadow:none!important;
  box-sizing:border-box!important;text-decoration:none!important;white-space:nowrap!important;
}
body.bn252 #bomUpload517 *,body.bn252 #bomUpload517[style] *{color:#fff!important;-webkit-text-fill-color:#fff!important;opacity:1!important}
body.bn252 #bomUpload517:not(:disabled):hover{background:#117fb2!important;border-color:#117fb2!important}
body.bn252 #bomUpload517:disabled,
body.bn252 #bomUpload517[data-disabled="true"]{
  background:#d9edf6!important;border-color:#c7e3ef!important;color:#4e7b91!important;
  -webkit-text-fill-color:#4e7b91!important;cursor:not-allowed!important;opacity:1!important;
}
body.bn252 #bomUpload517:disabled *,body.bn252 #bomUpload517[data-disabled="true"] *{color:#4e7b91!important;-webkit-text-fill-color:#4e7b91!important}
`;document.head.appendChild(s)}
function sync(){addCss();const b=document.getElementById("bomUpload517");if(!b)return;const type=document.querySelector('#view>.card:first-child select');const selects=document.querySelectorAll('#view>.card:first-child select');const project=selects[1];const inactive=!(type?.value&&project?.value);if(inactive){b.setAttribute('data-disabled','true')}else{b.removeAttribute('data-disabled')}b.style.opacity='1';b.style.filter='none'}
const obs=new MutationObserver(()=>sync());function boot(){sync();const v=document.getElementById('view');if(v)obs.observe(v,{childList:true,subtree:true,attributes:true,attributeFilter:['style','disabled']});document.addEventListener('change',e=>{if(e.target?.closest?.('#view>.card:first-child'))setTimeout(sync,0)},true)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();