# Persistence fix 8.0.210

Confirmed symptoms: object metadata reverts after navigation; imported BOM/marks can disappear after reload.

Release gate: fix SQLite write/read consistency, prevent report autosave from overwriting object metadata, persist BOM atomically, and verify write -> read -> hydration before release.
