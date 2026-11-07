// Regression: handwriting must not return to the lessons or exercise menu.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const lesson=fs.readFileSync(path.join(__dirname,'../jeu/parcours.js'),'utf8');
const index=fs.readFileSync(path.join(__dirname,'../jeu/index.html'),'utf8');
assert(!lesson.includes('lessonTrace'));assert(!lesson.includes('guideFor'));
assert(!/id: 'trace', label:/.test(index));console.log('Tracing removed from lessons and menu: PASS');
