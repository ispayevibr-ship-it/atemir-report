"use strict";
// Network compatibility layer for lightweight updates.
// Public update files are mirrored through jsDelivr so the updater does not
// depend on GitHub Contents API rate limits or raw.githubusercontent.com reachability.
const https = require("https");
const {EventEmitter} = require("events");
const originalGet = https.get.bind(https);

function proxyBuffer(url, cb, headers = {}) {
  return originalGet(url, {headers:{"User-Agent":"A-Temir-Stroy-Report","Cache-Control":"no-cache","Pragma":"no-cache",...headers}}, res => {
    if (res.statusCode !== 200) { cb(res); return; }
    const chunks=[];
    res.on("data", c=>chunks.push(c));
    res.on("end",()=>{
      const data=Buffer.concat(chunks);
      const fake=new EventEmitter();
      fake.statusCode=200;
      fake.headers={"content-length":String(data.length),"content-type":"application/octet-stream"};
      fake.resume=()=>{};
      cb(fake);
      process.nextTick(()=>{fake.emit("data",data);fake.emit("end")});
    });
  });
}

https.get = function patchedGet(input, options, callback) {
  let cb=callback, opts=options;
  if (typeof options === "function") { cb=options; opts=undefined; }
  let url;
  try { url=input instanceof URL?input:new URL(String(input)); }
  catch { return originalGet(input,options,callback); }

  // raw.githubusercontent.com/<owner>/<repo>/<ref>/<path>
  if (url.hostname === "raw.githubusercontent.com") {
    const p=url.pathname.split("/").filter(Boolean);
    if (p.length>=4) {
      const owner=p.shift(), repo=p.shift(), ref=p.shift(), file=p.join("/");
      const cdn=`https://cdn.jsdelivr.net/gh/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}@${encodeURIComponent(ref)}/${p.map(encodeURIComponent).join("/")}?v=${Date.now()}`;
      return proxyBuffer(cdn,cb,opts?.headers||{});
    }
  }

  // api.github.com/repos/<owner>/<repo>/contents/<path>?ref=<ref>
  // Return the same JSON shape expected by main.js, but obtain bytes from CDN.
  if (url.hostname === "api.github.com") {
    const m=url.pathname.match(/^\/repos\/([^/]+)\/([^/]+)\/contents\/(.+)$/);
    if (m) {
      const owner=decodeURIComponent(m[1]), repo=decodeURIComponent(m[2]), file=m[3].split("/").map(decodeURIComponent).join("/");
      const ref=url.searchParams.get("ref")||"main";
      const cdn=`https://cdn.jsdelivr.net/gh/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}@${encodeURIComponent(ref)}/${file.split("/").map(encodeURIComponent).join("/")}?v=${Date.now()}`;
      return originalGet(cdn,{headers:{"User-Agent":"A-Temir-Stroy-Report","Cache-Control":"no-cache","Pragma":"no-cache"}},res=>{
        if(res.statusCode!==200){cb(res);return}
        const chunks=[];res.on("data",c=>chunks.push(c));res.on("end",()=>{
          const data=Buffer.concat(chunks);
          const body=Buffer.from(JSON.stringify({type:"file",encoding:"base64",content:data.toString("base64"),size:data.length}));
          const fake=new EventEmitter();fake.statusCode=200;fake.headers={"content-type":"application/json","content-length":String(body.length)};fake.resume=()=>{};cb(fake);
          process.nextTick(()=>{fake.emit("data",body);fake.emit("end")});
        });
      });
    }
  }
  return originalGet(input,options,callback);
};

require("./main.js");
