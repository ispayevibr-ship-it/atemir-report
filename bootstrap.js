"use strict";
// Network compatibility layer for lightweight updates.
// Public update files are mirrored through jsDelivr so the updater does not
// depend on GitHub Contents API rate limits or raw.githubusercontent.com reachability.
const https = require("https");
const {EventEmitter} = require("events");
const originalGet = https.get.bind(https);

/*
 * Persistence compatibility guard (8.0.210).
 *
 * The relational SQLite layer stores both indexed columns and the complete entity
 * snapshot in raw_json. Older write statements could update the indexed columns on
 * conflict but leave raw_json untouched. Reads hydrate from raw_json, so a successful
 * edit appeared on screen and then reverted after navigation/restart. The same class
 * of bug can affect objects, tasks and BOM rows.
 *
 * main.js is intentionally left structurally untouched here. Before it is loaded we
 * harden DatabaseSync.prepare(): every INSERT ... ON CONFLICT statement that contains
 * a raw_json column is guaranteed to update raw_json as part of the conflict clause.
 * This keeps the canonical snapshot and indexed columns in the same SQLite statement.
 */
try {
  const {DatabaseSync} = require("node:sqlite");
  const proto = DatabaseSync && DatabaseSync.prototype;
  if (proto && typeof proto.prepare === "function" && !proto.__atemirPersistence210) {
    const originalPrepare = proto.prepare;
    Object.defineProperty(proto,"__atemirPersistence210",{value:true,configurable:false});
    proto.prepare = function(sql) {
      let text = String(sql ?? "");
      if (/^\s*INSERT\s+INTO\s+/i.test(text) && /\braw_json\b/i.test(text) && /\bON\s+CONFLICT\b/i.test(text) && /\bDO\s+UPDATE\s+SET\b/i.test(text)) {
        const updatePart = text.split(/\bDO\s+UPDATE\s+SET\b/i)[1] || "";
        if (!/\braw_json\s*=\s*excluded\.raw_json\b/i.test(updatePart)) {
          text = text.replace(/\bDO\s+UPDATE\s+SET\b/i, "DO UPDATE SET raw_json=excluded.raw_json,");
        }
      }
      return originalPrepare.call(this,text);
    };
  }
} catch (e) {
  console.error("Persistence guard 8.0.210 failed to initialize",e);
}

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

  if (url.hostname === "raw.githubusercontent.com") {
    const p=url.pathname.split("/").filter(Boolean);
    if (p.length>=4) {
      const owner=p.shift(), repo=p.shift(), ref=p.shift(), file=p.join("/");
      const cdn=`https://cdn.jsdelivr.net/gh/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}@${encodeURIComponent(ref)}/${p.map(encodeURIComponent).join("/")}?v=${Date.now()}`;
      return proxyBuffer(cdn,cb,opts?.headers||{});
    }
  }

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
