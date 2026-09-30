"use strict";
// Bootstrap network compatibility for lightweight updates.
// Some networks can reach api.github.com but fail on raw.githubusercontent.com.
// Route raw update files through GitHub Contents API and expose the decoded bytes
// with the same response shape expected by main.js.
const https = require("https");
const {EventEmitter} = require("events");
const originalGet = https.get.bind(https);

https.get = function patchedGet(input, options, callback) {
  let cb = callback;
  let opts = options;
  if (typeof options === "function") { cb = options; opts = undefined; }
  let url;
  try { url = input instanceof URL ? input : new URL(String(input)); } catch { return originalGet(input, options, callback); }
  if (url.hostname !== "raw.githubusercontent.com") return originalGet(input, options, callback);

  const parts = url.pathname.split("/").filter(Boolean);
  if (parts.length < 5) return originalGet(input, options, callback);
  const owner = parts.shift();
  const repo = parts.shift();
  const ref = parts.shift();
  const filePath = parts.map(encodeURIComponent).join("/");
  const apiUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${filePath}?ref=${encodeURIComponent(ref)}&ts=${Date.now()}`;
  const headers = Object.assign({}, opts?.headers || {}, {
    "User-Agent": "A-Temir-Stroy-Report",
    "Accept": "application/vnd.github+json",
    "Cache-Control": "no-cache, no-store",
    "Pragma": "no-cache"
  });

  return originalGet(apiUrl, {headers}, apiRes => {
    if (apiRes.statusCode !== 200) { cb(apiRes); return; }
    const chunks = [];
    apiRes.on("data", c => chunks.push(c));
    apiRes.on("end", () => {
      try {
        const json = JSON.parse(Buffer.concat(chunks).toString("utf8"));
        if (!json.content || json.encoding !== "base64") throw new Error("GitHub API did not return file content");
        const data = Buffer.from(String(json.content).replace(/\s/g, ""), "base64");
        const fake = new EventEmitter();
        fake.statusCode = 200;
        fake.headers = {"content-length": String(data.length), "content-type": "application/octet-stream"};
        fake.resume = () => {};
        cb(fake);
        process.nextTick(() => { fake.emit("data", data); fake.emit("end"); });
      } catch (err) {
        const fake = new EventEmitter();
        fake.statusCode = 502;
        fake.headers = {};
        fake.resume = () => {};
        cb(fake);
        process.nextTick(() => fake.emit("end"));
      }
    });
  });
};

require("./main.js");
