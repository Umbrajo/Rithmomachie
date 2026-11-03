importScripts('engine.js');onmessage=e=>{const {s,level,goal,token}=e.data;postMessage({m:Rithmo.best(s,level,goal),token});};
