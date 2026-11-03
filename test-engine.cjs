const assert=require('node:assert/strict');const E=require('./dist/engine.js');
let s=E.fresh();assert.equal(s.pieces.length,48);assert.equal(s.turn,1);assert.equal(new Set(s.pieces.map(p=>p.x+','+p.y)).size,48);assert.equal(s.pieces.find(p=>p.side===0&&p.type==='P').v,91);assert.equal(s.pieces.find(p=>p.side===1&&p.type==='P').v,190);
for(const p of s.pieces.filter(p=>p.type==='P'))assert.equal(new Set(E.vectors(p).map(v=>v[2])).size,3);
let lesson=E.fresh('lesson');lesson.turn=0;const p=E.at(lesson,5,3);assert(E.moves(lesson).some(m=>m.id===p.id&&m.x===6&&m.y===3));let n=E.apply(lesson,{id:p.id,x:6,y:3},'king');assert(!E.at(n,7,3));assert.equal(n.captured[0].reason,'equal');assert.equal(lesson.pieces.length,6);
assert.deepEqual(E.kinds(2,4,6),['A']);assert.deepEqual(E.kinds(4,8,16),['G']);assert.deepEqual(E.kinds(3,4,6),['H']);
let simple={w:8,h:8,turn:0,ply:0,captured:[],last:null,winner:null,pieces:[{id:1,side:0,type:'C',v:190,x:3,y:3},{id:2,side:1,type:'P',v:190,layers:[16,25,36,49,64],x:4,y:3}]};let king=E.apply(simple,{capture:2},'king');assert.equal(king.winner,0);assert.equal(king.reason,'king');
let layers=structuredClone(simple);layers.pieces[0].v=16;let reduced=E.apply(layers,{capture:2},'king');assert.equal(reduced.pieces[1].v,174);assert.equal(reduced.winner,null);assert.equal(reduced.captured[0].type,'L');
let tri={...simple,pieces:[{id:1,side:0,type:'C',v:2,x:4,y:1},{id:2,side:0,type:'C',v:4,x:5,y:1},{id:3,side:0,type:'C',v:6,x:6,y:1}]};assert.equal(E.harmonies(tri,0,true).length,1);
let ai=E.best(s,2,'triumph');assert(E.moves(s).some(m=>JSON.stringify(m)===JSON.stringify(ai)));console.log('Engine checks passed: armies, shapes, moves, capture, layers, king victory, progressions, AI legality.');
let board=E.fresh();for(let i=0;i<12&&board.winner===null;i++){let legal=E.moves(board);let next=E.apply(board,legal[i%legal.length]);assert(next.pieces.every(p=>p.x>=0&&p.x<next.w&&p.y>=0&&p.y<next.h));assert.equal(new Set(next.pieces.map(p=>p.x+','+p.y)).size,next.pieces.length);board=next;}console.log('12-ply simulation passed.');
const vm=require('node:vm'),fs=require('node:fs');const src=fs.readFileSync(__dirname+'/dist/app.js','utf8');const validator=src.slice(src.indexOf('function validate(data)'),src.indexOf('function exportPosition()'));let ctx={};vm.createContext(ctx);vm.runInContext(validator,ctx);let data={format:'rithmomachia-position',version:1,ruleset:'mebben-educational-v1',board:{width:s.w,height:s.h},firstPlayer:1,pieces:s.pieces.map(({id,v,...p})=>({...p,value:v}))};let parsed=ctx.validate(JSON.parse(JSON.stringify(data)));assert.equal(parsed.pieces.length,48);let bad=structuredClone(data);bad.pieces[1].x=bad.pieces[0].x;bad.pieces[1].y=bad.pieces[0].y;assert.throws(()=>ctx.validate(bad));bad=structuredClone(data);bad.pieces[0].value=-1;assert.throws(()=>ctx.validate(bad));bad=structuredClone(data);bad.board.width=10000;assert.throws(()=>ctx.validate(bad));console.log('JSON round-trip and invalid-position rejection passed.');
// Reference image: ranks read from White's edge, left to right.
const reference=[
['S289','S169','','','','','S81','S25'],
['S153','P91','T49','T42','T20','T25','S45','S15'],
['T81','T72','C64','C36','C16','C4','T6','T9'],
['','','C8','C6','C4','C2','',''],
...Array.from({length:8},()=>Array(8).fill('')),
['','','C3','C5','C7','C9','',''],
['T16','T12','C9','C25','C49','C81','T90','T100'],
['S28','S66','T36','T30','T56','T64','S120','P190'],
['S49','S121','','','','','S225','S361']];
assert.equal(s.w,16);assert.equal(s.h,8);for(let y=0;y<16;y++)for(let x=0;x<8;x++){let p=E.at(s,y,7-x);assert.equal(p?p.type+p.v:'',reference[y][x],`Reference ${x},${y}`);if(p)assert.equal(p.side,y<8?0:1);}
assert.equal(E.fresh('compact').w,16);assert.equal(E.fresh('open').pieces.length,48);
let vertical={...tri,w:8,h:16,pieces:tri.pieces.map((p,i)=>({...p,x:2,y:12+i}))};assert.equal(E.harmonies(vertical,0,true).length,1);vertical.pieces.forEach(p=>p.y-=5);assert.equal(E.harmonies(vertical,0,true).length,0);
function seeded(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
const openings=new Set();for(let seed=1;seed<=16;seed++){let m=E.best(s,1,'triumph',seeded(seed));assert(E.moves(s).some(a=>JSON.stringify(a)===JSON.stringify(m)));openings.add(JSON.stringify(m));}assert(openings.size>1);
for(let level=1;level<=4;level++){let m=E.best(simple,level,'king',seeded(level));assert.equal(E.apply(simple,m,'king').winner,0);}console.log(`Reference layout, vertical camps, ${openings.size} varied legal openings and forced king wins passed.`);
