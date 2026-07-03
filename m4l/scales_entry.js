// =============================================================================
// SCALES.SIN M4L — node.script entry shim.
// node.script cannot resolve subdirectory-relative script args (proven
// 2026-07-03: "node.script bridge/main.js" silently never spawns, while a flat
// entry next to the .amxd boots). This file exists solely so the device can say
// "node.script scales_entry.js" — all real logic stays in bridge/main.js.
// =============================================================================
require('./bridge/main.js');
