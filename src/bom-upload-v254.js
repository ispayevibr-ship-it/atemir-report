(()=>{"use strict";
const STYLE_ID="bomUploadV264Css";
function addCss(){if(document.getElementById(STYLE_ID))return;const s=document.createElement("style");s.id=STYLE_ID;s.textContent=`
body.bn252 #view>.card:first-child .grid{grid-template-columns:minmax(260px,1fr) minmax(260px,1fr) 264px!important;align-items:end!important}
body.bn252 #bomUpload517{display:none!important}
body.bn252 #bomUpload517.bom260ready{
  display:flex!important;align-items:center!important;justify-content:center!important;
  width:264px!important;min-width:264px!important;max-width:264px!important;height:42px!important;min-height:42px!important;
  margin:0!important;padding:0 18px!important;box-sizing:border-box!important;
  border:1px solid #1695cf!important;border-radius:8px!important;
  background:#1695cf!important;background-image:none!important;
  color:#fff!important;-webkit-text-fill-color:#fff!important;
  font-family:inherit!important;font-size:11px!important;font-weight:800!important;line-height:40px!important;
  text-align:center!important;text-decoration:none!important;white-space:nowrap!important;
  opacity:1!important;filter:none!important;text-shadow:none!important;box-shadow:none!important;
  cursor:pointer!important;overflow:hidden!important;
}
body.bn252 #bomUpload517.bom260ready:hover{background:#0874a7!important;border-color:#0874a7!important;color:#fff!important;-webkit-text-fill-color:#fff!important}
body.bn252 #bomUpload517 input{display:none!important}
@media(max-width:1200px){body.bn252 #view>.card:first-child .grid{grid-template-columns:1fr 1fr!important}body.bn252 #view>.card:first-child .grid>div:last-child{grid-column:1/-1!important}body.bn252 #bomUpload517.bom260ready{width:264px!important}}
`;document.head.appendChild(s)}
function sync(){addCss();const b=document.getElementById("bomUpload517");if(!b)return;if(!b.classList.contains('bom260ready')){b.style.setProperty('display','none','important');return}b.style.removeProperty('display');b.style.setProperty('opacity','1','important');b.style.setProperty('background','#1695cf','important');b.style.setProperty('color','#fff','important');b.style.setProperty('-webkit-text-fill-color','#fff','important')}
function boot(){sync();const v=document.getElementById('view');if(v)new MutationObserver(()=>requestAnimationFrame(sync)).observe(v,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});document.addEventListener('change',()=>requestAnimationFrame(sync),true)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();