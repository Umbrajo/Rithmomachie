(function(root){
const dirs=[[1,0],[-1,0],[0,1],[0,-1]],diag=[[1,1],[1,-1],[-1,1],[-1,-1]];
function fresh(layout='classic',w=16,h=8){let pieces=[],id=0;const add=(side,type,v,x,y,layers)=>pieces.push({id:++id,side,type,v,x,y,...(layers?{layers}: {})});
if(layout==='classic'){
w=16;h=8;
const white=[
[['S',289],['S',169],null,null,null,null,['S',81],['S',25]],
[['S',153],['P',91],['T',49],['T',42],['T',20],['T',25],['S',45],['S',15]],
[['T',81],['T',72],['C',64],['C',36],['C',16],['C',4],['T',6],['T',9]],
[null,null,['C',8],['C',6],['C',4],['C',2],null,null]
];
const black=[
[['S',49],['S',121],null,null,null,null,['S',225],['S',361]],
[['S',28],['S',66],['T',36],['T',30],['T',56],['T',64],['S',120],['P',190]],
[['T',16],['T',12],['C',9],['C',25],['C',49],['C',81],['T',90],['T',100]],
[null,null,['C',3],['C',5],['C',7],['C',9],null,null]
];
for(const [side,rows]of [[0,white],[1,black]])rows.forEach((row,i)=>row.forEach((p,x)=>{if(p)add(side,p[0],p[1],side?15-i:i,7-x,p[0]==='P'?(side?[16,25,36,49,64]:[1,4,9,16,25,36]):null);}));
}else if(layout==='lesson'){add(0,'C',4,5,3);add(0,'C',8,4,5);add(0,'T',6,2,3);add(1,'C',4,7,3);add(1,'P',190,12,4,[16,25,36,49,64]);add(0,'P',91,1,4,[1,4,9,16,25,36]);}
else {[[2,4,6,8,4,16,36,64,6,20,42,72,9,25,49,81,15,45,91,153,25,81,169,289],[3,5,7,9,9,25,49,81,12,30,56,90,16,36,64,100,28,66,120,190,49,121,225,361]].forEach((values,side)=>values.forEach((v,i)=>{let row=Math.floor(i/8),j=i%8,x=side===0?3-row:12+row,y=j;if(layout==='open')x+=side===0?2:-2;let type=i<8?'C':i<16?'T':'S';let pyr=(side===0&&i===18)||(side===1&&i===19);add(side,pyr?'P':type,v,x,y,pyr?(side?[16,25,36,49,64]:[1,4,9,16,25,36]):null)}));}
return {w,h,pieces,turn:1,captured:[],last:null,ply:0,winner:null,reason:null};}
const at=(s,x,y)=>s.pieces.find(p=>p.x===x&&p.y===y);const inside=(s,x,y)=>x>=0&&y>=0&&x<s.w&&y<s.h;
function vectors(p){let types=p.type==='P'?[...(p.layers?.some(v=>p.side===0?[1,4].includes(v):v===16)?['C']:[]),...(p.layers?.some(v=>(p.side===0?[9,16]:[25,36]).includes(v))?['T']:[]),...(p.layers?.some(v=>(p.side===0?[25,36]:[49,64]).includes(v))?['S']:[])]:[p.type];return types.flatMap(t=>(t==='C'?dirs:t==='T'?diag:dirs.concat(diag)).map(([x,y])=>[x,y,t==='C'?1:t==='T'?2:3]));}
function reaches(s,p,x,y){return vectors(p).some(([dx,dy,n])=>{if(p.x+dx*n!==x||p.y+dy*n!==y)return false;for(let i=1;i<n;i++)if(at(s,p.x+dx*i,p.y+dy*i))return false;return true;});}
const vals=p=>p.type==='P'?[p.v,...p.layers]:[p.v];
function threats(s,side,moved=null,targetId=null){let out=[];const own=s.pieces.filter(p=>p.side===side);for(const e of s.pieces.filter(p=>p.side!==side&&(targetId===null||p.id===targetId))){let hit=own.filter(p=>reaches(s,p,e.x,e.y)),reason=null,layer=null;for(const a of hit){if(moved!==null&&a.id!==moved)continue;for(const v of vals(a)){if(v===e.v)reason='equal';else if(reason!=='equal'&&e.type==='P'&&e.layers.includes(v)){reason='layer';layer=v;}}}
for(let i=0;i<hit.length;i++)for(let j=i+1;j<hit.length;j++){if(moved!==null&&hit[i].id!==moved&&hit[j].id!==moved)continue;for(const a of vals(hit[i]))for(const b of vals(hit[j])){if(a+b===e.v||Math.abs(a-b)===e.v)reason='ambush';}}
for(const a of own){if(moved!==null&&a.id!==moved)continue;let dx=e.x-a.x,dy=e.y-a.y;if(!(dx===0||dy===0||Math.abs(dx)===Math.abs(dy)))continue;let distance=Math.max(Math.abs(dx),Math.abs(dy)),ux=Math.sign(dx),uy=Math.sign(dy);if(!vectors(a).some(([x,y])=>x===ux&&y===uy))continue;let clear=true;for(let k=1;k<distance;k++)if(at(s,a.x+ux*k,a.y+uy*k))clear=false;if(clear&&distance>1&&vals(a).some(v=>v* (distance+1)===e.v||e.v*(distance+1)===v))reason='assault';}
if(dirs.every(([x,y])=>{let p=at(s,e.x+x,e.y+y);return p&&p.side===side;})&&(moved===null||own.some(p=>p.id===moved&&Math.abs(p.x-e.x)+Math.abs(p.y-e.y)===1)))reason='siege';
if(reason)out.push({id:e.id,reason,layer:reason==='layer'?layer:null});}return out;}
function moves(s,side=s.turn){let a=[];for(const p of s.pieces.filter(p=>p.side===side))for(const [dx,dy,n]of vectors(p)){let x=p.x+dx*n,y=p.y+dy*n;if(inside(s,x,y)&&!at(s,x,y)&&reaches(s,p,x,y))a.push({id:p.id,x,y});}for(const c of threats(s,side))a.push({capture:c.id,id:null,x:atId(s,c.id).x,y:atId(s,c.id).y});return a;}
const atId=(s,id)=>s.pieces.find(p=>p.id===id);
function kinds(a,b,c){return [...(a+c===2*b?['A']:[]),...(a*c===b*b?['G']:[]),...(2*a*c===b*(a+c)?['H']:[])];}
function forward(s,p){return s.h>s.w?(p.side===0?p.y:s.h-1-p.y):(p.side===0?p.x:s.w-1-p.x);}
function inEnemyCamp(s,p){return forward(s,p)>=(s.h>s.w?s.h:s.w)-4;}
function harmonies(s,side,aligned=false){let a=s.pieces.filter(p=>p.side===side&&(!aligned||inEnemyCamp(s,p))),out=[];for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++)for(let k=j+1;k<a.length;k++){let p=[a[i],a[j],a[k]],v=p.map(x=>x.v).sort((a,b)=>a-b);if(v[0]===v[2])continue;let types=kinds(...v);if(!types.length)continue;if(aligned){let u=p[0],b=p[1],c=p[2];if((b.x-u.x)*(c.y-u.y)!==(b.y-u.y)*(c.x-u.x))continue;if(!(b.x===u.x||b.y===u.y||Math.abs(b.x-u.x)===Math.abs(b.y-u.y)))continue;let sorted=p.slice().sort((a,b)=>a.x-b.x||a.y-b.y);if(!kinds(...sorted.map(x=>x.v)).length)continue;}out.push({pieces:p,values:v,types});}return out;}
function apply(s,m,goal='triumph'){let n=structuredClone(s),side=s.turn,p=atId(n,m.id),taken=[];if(m.capture){let c=threats(n,side).find(c=>c.id===m.capture);if(!c)throw Error('Illegal capture');taken=[c];let target=atId(n,c.id),attacker=n.pieces.find(p=>p.side===side&&reaches(n,p,target.x,target.y));n.last=attacker?{id:attacker.id,x:attacker.x,y:attacker.y}:null;}else{if(!p||p.side!==side||!moves(s).some(a=>a.id===m.id&&a.x===m.x&&a.y===m.y))throw Error('Illegal move');p.x=m.x;p.y=m.y;n.last={id:p.id,x:p.x,y:p.y};taken=threats(n,side,p.id);}
for(const c of taken){let e=atId(n,c.id);if(c.layer){e.layers=e.layers.filter(v=>v!==c.layer);e.v=e.layers.reduce((a,b)=>a+b,0);n.captured.push({...e,v:c.layer,type:'L',by:side,reason:c.reason});}else{n.captured.push({...e,by:side,reason:c.reason});n.pieces=n.pieces.filter(p=>p.id!==c.id);}}
n.ply++;n.turn=1-side;let enemyKing=n.pieces.some(p=>p.side!==side&&p.type==='P');if(goal==='king'&&!enemyKing){n.winner=side;n.reason='king';}else if(goal==='bodies'&&n.captured.filter(p=>p.by===side&&p.type!=='L').length>=5){n.winner=side;n.reason='bodies';}else if(goal==='triumph'&&!enemyKing&&harmonies(n,side,true).length){n.winner=side;n.reason='triumph';}if(n.winner===null&&!moves(n).length){n.winner=side;n.reason='blocked';}return n;}
function evaluate(s,side){if(s.winner!==null)return s.winner===side?1e7:-1e7;return s.pieces.reduce((v,p)=>v+(p.side===side?1:-1)*(p.type==='P'?120:15+Math.sqrt(p.v)*2),0)+s.pieces.reduce((v,p)=>v+(p.side===side?1:-1)*forward(s,p)*.7,0);}
function ranked(s,goal){let base=evaluate(s,s.turn);return moves(s).map(m=>{let n=apply(s,m,goal);return {m,n,score:evaluate(n,s.turn)-base};}).sort((a,b)=>b.score-a.score);}
function best(s,level=2,goal='triumph',random=Math.random){let a=ranked(s,goal);const shuffle=list=>{for(let i=list.length-1;i>0;i--){let j=Math.floor(random()*(i+1));[list[i],list[j]]=[list[j],list[i]];}return list;};a=shuffle(a).sort((a,b)=>b.score-a.score);if(!a.length)return null;if(level===0)return a[Math.floor(random()*a.length)].m;let side=s.turn,deadline=Date.now()+[0,80,300,900,1800][level],depth=[0,1,2,3,4][level],nodes=0;
function search(n,d,alpha,beta){nodes++;if(!d||n.winner!==null||Date.now()>deadline)return evaluate(n,side);let r=shuffle(ranked(n,goal)).sort((a,b)=>b.score-a.score).slice(0,level>=3?7:5),max=n.turn===side,v=max?-Infinity:Infinity;for(const x of r){let q=search(x.n,d-1,alpha,beta);v=max?Math.max(v,q):Math.min(v,q);if(max)alpha=Math.max(alpha,v);else beta=Math.min(beta,v);if(beta<=alpha||Date.now()>deadline)break;}return Number.isFinite(v)?v:evaluate(n,side);}
const wins=a.filter(x=>x.n.winner===side);if(wins.length)return wins[Math.floor(random()*wins.length)].m;
let scored=[];for(const x of a.slice(0,level===1?12:24)){let value=search(x.n,depth-1,-Infinity,Infinity);scored.push({m:x.m,value});if(Date.now()>deadline)break;}
scored.sort((a,b)=>b.value-a.value);const margin=[0,12,5,2,1][level],pool=scored.filter(x=>x.value>=scored[0].value-margin);const weights=pool.map(x=>Math.exp((x.value-scored[0].value)/Math.max(.3,margin/2)));let draw=random()*weights.reduce((a,b)=>a+b,0);for(let i=0;i<pool.length;i++){draw-=weights[i];if(draw<=0)return pool[i].m;}return pool[0].m;}

root.Rithmo={fresh,at,atId,moves,apply,threats,harmonies,kinds,best,evaluate,ranked,vectors,forward,inEnemyCamp};if(typeof module!=='undefined')module.exports=root.Rithmo;
})(typeof self!=='undefined'?self:globalThis);
