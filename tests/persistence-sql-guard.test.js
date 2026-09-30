"use strict";
const assert=require("assert");
function harden(sql){
 let text=String(sql??"");
 if(/^\s*INSERT\s+INTO\s+/i.test(text)&&/\braw_json\b/i.test(text)&&/\bON\s+CONFLICT\b/i.test(text)&&/\bDO\s+UPDATE\s+SET\b/i.test(text)){
  const updatePart=text.split(/\bDO\s+UPDATE\s+SET\b/i)[1]||"";
  if(!/\braw_json\s*=\s*excluded\.raw_json\b/i.test(updatePart)) text=text.replace(/\bDO\s+UPDATE\s+SET\b/i,"DO UPDATE SET raw_json=excluded.raw_json,");
 }
 return text;
}
const objectSql="INSERT INTO objects(id,name,raw_json,updated_at) VALUES(?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,updated_at=excluded.updated_at";
const bomSql="INSERT INTO bom_marks(task_id,mark_key,raw_json,updated_at) VALUES(?,?,?,?) ON CONFLICT(task_id,mark_key) DO UPDATE SET updated_at=excluded.updated_at";
assert.match(harden(objectSql),/DO UPDATE SET raw_json=excluded\.raw_json,/i);
assert.match(harden(bomSql),/DO UPDATE SET raw_json=excluded\.raw_json,/i);
assert.strictEqual((harden(harden(objectSql)).match(/raw_json=excluded\.raw_json/gi)||[]).length,1);
console.log("persistence SQL guard regression checks passed");
