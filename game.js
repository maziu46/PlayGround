const canvas=document.getElementById('scene'),ctx=canvas.getContext('2d');
let W=innerWidth,H=innerHeight,dpr=Math.min(devicePixelRatio||1,2),hover=null,step=0,inventory=false,sound=true,dialogueIndex=0,toastTimer;
const objects=[
 {id:'gate',label:'Inspect gate',x:.21,y:.42,rx:.12,ry:.22,lines:[['Village gate','The watch bell is cold, but the rope has been freshly cut. Someone came through before sunrise.'],['You find a tiny silver thread snagged on the post. A clue.','The courier probably passed this way. The market stall is a good place to search next.']]},
 {id:'stall',label:'Search market stall',x:.52,y:.54,rx:.14,ry:.16,lines:[['Market stall','Beneath a stack of rice paper, you find a sealed courier scroll marked with the Emberleaf crest.'],['Scroll secured','The seal is warm with residual chakra. Take it to the messenger by the training yard.']]},
 {id:'messenger',label:'Speak to courier',x:.73,y:.47,rx:.1,ry:.18,lines:[['Mio · courier','You found it! I dropped the scroll when that masked stranger spooked me. They fled toward the old cedar grove.'],['Mission complete','The village is safe for now. The cedar grove waits beyond the eastern path...']],},
 {id:'shrine',label:'Visit shrine',x:.85,y:.29,rx:.1,ry:.18,lines:[['Ember shrine','Red paper charms flutter in the breeze. A fox-shaped flame watches from the roof.'],['A quiet chakra pool','Rest here to refill your focus. The village hums with hidden paths.']]},
];
function resize(){W=innerWidth;H=innerHeight;canvas.width=W*dpr;canvas.height=H*dpr;canvas.style.width=W+'px';canvas.style.height=H+'px';ctx.setTransform(dpr,0,0,dpr,0,0)}addEventListener('resize',resize);resize();
function clamp(v,a,b){return Math.max(a,Math.min(b,v))} function lerp(a,b,t){return a+(b-a)*t}
function path(points,fill,stroke){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke()}}
function rect(x,y,w,h,fill,stroke){ctx.fillStyle=fill;ctx.fillRect(x,y,w,h);if(stroke){ctx.strokeStyle=stroke;ctx.strokeRect(x,y,w,h)}}
function text(s,x,y,size,color,align='center'){ctx.font=`${size}px Georgia,serif`;ctx.fillStyle=color;ctx.textAlign=align;ctx.fillText(s,x,y)}
function drawCloud(x,y,s,a){ctx.save();ctx.globalAlpha=a;ctx.fillStyle='#f8efd9';ctx.beginPath();ctx.ellipse(x,y,s*1.5,s*.4,0,0,7);ctx.ellipse(x-s*.7,y+3,s*.65,s*.3,0,0,7);ctx.ellipse(x+s*.6,y+1,s*.8,s*.32,0,0,7);ctx.fill();ctx.restore()}
function drawTree(x,y,s){ctx.fillStyle='#334b42';ctx.fillRect(x-s*.09,y,s*.18,s*.95);ctx.fillStyle='#1f463e';ctx.beginPath();ctx.arc(x,y-s*.08,s*.46,0,7);ctx.arc(x-s*.25,y+s*.12,s*.34,0,7);ctx.arc(x+s*.25,y+s*.13,s*.35,0,7);ctx.fill();ctx.fillStyle='#396254';ctx.beginPath();ctx.arc(x-s*.12,y-s*.2,s*.24,0,7);ctx.arc(x+s*.2,y-s*.05,s*.2,0,7);ctx.fill()}
function drawBuilding(x,y,w,h,roof,wall,door){path([[x-w/2,y],[x,y-h*.28],[x+w/2,y],[x+w*.43,y+h*.12],[x-w*.43,y+h*.12]],roof,'#263843');rect(x-w*.4,y+h*.1,w*.8,h*.7,wall,'#553c36');rect(x-w*.12,y+h*.46,w*.24,h*.35,door,'#302d31');rect(x-w*.31,y+h*.31,w*.14,h*.12,'#d7a34b');rect(x+w*.17,y+h*.31,w*.14,h*.12,'#d7a34b');rect(x-w*.32,y+h*.25,w*.64,3,'#8e4438')}
function drawPerson(x,y,s,kind){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.fillStyle=kind==='messenger'?'#345d76':'#b94939';ctx.fillRect(-13,15,26,34);ctx.fillStyle='#e3b58a';ctx.beginPath();ctx.arc(0,3,12,0,7);ctx.fill();ctx.fillStyle='#262e39';ctx.beginPath();ctx.arc(0,0,13,Math.PI,0);ctx.fill();ctx.fillStyle='#e9cf7a';ctx.fillRect(-13,3,26,3);ctx.fillStyle='#272e35';ctx.fillRect(-8,23,6,26);ctx.fillRect(2,23,6,26);ctx.restore()}
function draw(){const t=Date.now()/1000;let day=(Math.sin(t*.05)+1)/2;let sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,`rgb(${lerp(36,114,day)},${lerp(57,154,day)},${lerp(78,172,day)})`);sky.addColorStop(1,'#e1b979');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
 // sun and distant ridges
 ctx.fillStyle='rgba(255,221,133,.8)';ctx.beginPath();ctx.arc(W*.77,H*.19,40,0,7);ctx.fill();path([[0,H*.46],[W*.2,H*.34],[W*.4,H*.43],[W*.65,H*.3],[W,H*.4],[W,H*.64],[0,H*.64]],'#526b67');path([[0,H*.53],[W*.18,H*.43],[W*.38,H*.52],[W*.64,H*.4],[W,H*.5],[W,H*.7],[0,H*.7]],'#3c5957');drawCloud(W*.2,H*.17,55,.35);drawCloud(W*.54,H*.11,42,.25);
 // ground
 ctx.fillStyle='#9a865b';ctx.fillRect(0,H*.58,W,H*.42);path([[0,H*.64],[W*.22,H*.59],[W*.51,H*.64],[W,H*.58],[W,H*.7],[0,H*.7]],'#7c7254');
 // perspective road
 path([[W*.38,H],[W*.63,H],[W*.56,H*.59],[W*.45,H*.59]],'#bd9b6b');path([[W*.44,H],[W*.57,H],[W*.53,H*.62],[W*.48,H*.62]],'#cfb27c');
 // village buildings
 drawBuilding(W*.11,H*.43,180,185,'#a84338','#bd7650','#573b39');drawBuilding(W*.38,H*.43,165,165,'#385665','#be9164','#48393b');drawBuilding(W*.67,H*.4,205,190,'#b34c3b','#d3a26d','#493b3b');
 // roofs ridge accents
 ctx.strokeStyle='#e4b85e';ctx.lineWidth=4;[[W*.11,H*.43,90],[W*.38,H*.43,82],[W*.67,H*.4,102]].forEach(a=>{ctx.beginPath();ctx.moveTo(a[0]-a[2],a[1]);ctx.lineTo(a[0]+a[2],a[1]);ctx.stroke()});
 // gate
 let gx=W*.21,gy=H*.49;ctx.fillStyle='#4b3935';ctx.fillRect(gx-42,gy-130,17,150);ctx.fillRect(gx+25,gy-130,17,150);ctx.fillStyle='#8c4036';ctx.fillRect(gx-58,gy-145,116,16);ctx.fillStyle='#dca853';ctx.fillRect(gx-48,gy-129,96,7);ctx.fillStyle='#bd503e';ctx.beginPath();ctx.arc(gx,gy-112,18,0,7);ctx.fill();text('炎',gx,gy-106,18,'#f5d378');
 // stall awning
 let sx=W*.52,sy=H*.54;ctx.fillStyle='#5e4439';ctx.fillRect(sx-65,sy-55,6,82);ctx.fillRect(sx+59,sy-55,6,82);path([[sx-76,sy-58],[sx,sy-78],[sx+76,sy-58],[sx+70,sy-40],[sx-70,sy-40]],'#bd4e3e','#6a3933');rect(sx-64,sy-38,128,60,'#a9794f');rect(sx-50,sy-25,100,35,'#d4ad72');
 // shrine at east
 let shx=W*.85,shy=H*.36;ctx.fillStyle='#4d3b39';ctx.fillRect(shx-3,shy-34,6,72);path([[shx-53,shy-42],[shx,shy-57],[shx+53,shy-42],[shx+40,shy-31],[shx-40,shy-31]],'#b84b3a','#643a38');ctx.fillStyle='#d4a84e';ctx.fillRect(shx-40,shy-26,80,5);ctx.fillStyle='#c74c3e';ctx.fillRect(shx-25,shy-13,50,45);text('✦',shx,shy+17,19,'#f5d17c');
 // trees and foreground grass
 drawTree(W*.03,H*.53,130);drawTree(W*.94,H*.58,170);drawTree(W*.28,H*.68,90);drawTree(W*.77,H*.7,85);
 // lanterns
 [[W*.31,H*.52],[W*.59,H*.54]].forEach(([x,y])=>{ctx.strokeStyle='#36363a';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y-38);ctx.lineTo(x,y);ctx.stroke();ctx.fillStyle='#e9aa4f';ctx.fillRect(x-8,y-33,16,19);ctx.fillStyle='rgba(255,209,94,.3)';ctx.beginPath();ctx.arc(x,y-24,20,0,7);ctx.fill()});
 drawPerson(W*.73,H*.56,1.05,'messenger');drawPerson(W*.48,H*.68,.72,'villager');
 // flags
 ctx.strokeStyle='#493d3a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(W*.78,H*.57);ctx.lineTo(W*.78,H*.31);ctx.stroke();path([[W*.78,H*.33],[W*.84,H*.35],[W*.78,H*.39]],'#cb4e3b');
 // fireflies
 for(let i=0;i<16;i++){let x=(i*97+t*9)%W,y=H*(.58+((i*37)%35)/100);ctx.fillStyle=`rgba(248,211,113,${.35+.3*Math.sin(t+i)})`;ctx.fillRect(x,y,3,3)}
 requestAnimationFrame(draw)}draw();
function hit(x,y){return objects.find(o=>Math.abs(x/W-o.x)<o.rx&&Math.abs(y/H-o.y)<o.ry)}
function positionHotspot(o){const el=document.getElementById('hotspot');el.style.left=(o.x*100)+'%';el.style.top=(o.y*100)+'%';el.textContent=o.label;el.classList.add('show')}
canvas.addEventListener('mousemove',e=>{hover=hit(e.clientX,e.clientY);if(hover)positionHotspot(hover);else document.getElementById('hotspot').classList.remove('show')});
canvas.addEventListener('mouseleave',()=>document.getElementById('hotspot').classList.remove('show'));
canvas.addEventListener('click',e=>{let o=hit(e.clientX,e.clientY);if(o)openObject(o)});
function openObject(o){if(o.id==='stall'&&step<1){toast('The gate should be checked first.');return}if(o.id==='messenger'&&step<2){toast('Mio is busy sorting delivery tags. Find the scroll first.');return}dialogueIndex=0;showDialogue(o.lines[0][0],o.lines[0][1],o)}
let current;
function showDialogue(name,copy,obj){current=obj;document.getElementById('dialogueName').textContent=name;document.getElementById('dialogueCopy').textContent=copy;document.getElementById('dialogue').style.display='block';document.getElementById('dialogueNext').textContent='Continue →'}
document.getElementById('dialogueNext').onclick=()=>{if(!current)return;dialogueIndex++;if(dialogueIndex<current.lines.length){showDialogue(current.lines[dialogueIndex][0],current.lines[dialogueIndex][1],current);if(dialogueIndex===current.lines.length-1)document.getElementById('dialogueNext').textContent='Close'}else{complete(current);closeDialogue()}};
document.getElementById('dialogueClose').onclick=closeDialogue;function closeDialogue(){document.getElementById('dialogue').style.display='none';current=null}
function complete(o){if(o.id==='gate'&&step===0){step=1;toast('Clue logged • Search the market stall')}if(o.id==='stall'&&step===1){step=2;document.getElementById('scrollItem').classList.add('found');toast('Sealed scroll added to field kit')}if(o.id==='messenger'&&step===2){step=3;toast('Mission complete • New path unlocked')}updateQuest()}
function updateQuest(){let labels=['Check the village gate','Search the market stall','Deliver the scroll to Mio','Mission complete'];document.getElementById('questtext').textContent=labels[step];document.getElementById('queststate').textContent=step===3?'3 / 3 steps complete':step+' / 3 steps complete';document.getElementById('progress').style.width=(step/3*100)+'%';if(step===3)document.querySelector('.dots').textContent='✦✦✦'}
function toast(msg){const el=document.getElementById('toast');el.textContent=msg;el.classList.add('on');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('on'),2600)}
document.getElementById('invBtn').onclick=()=>{inventory=true;document.getElementById('inventory').style.display='block'};document.getElementById('invClose').onclick=()=>{inventory=false;document.getElementById('inventory').style.display='none'};document.getElementById('soundBtn').onclick=e=>{sound=!sound;e.currentTarget.textContent=sound?'♪':'×';toast(sound?'Ambient sound on':'Ambient sound off')};document.getElementById('mapBtn').onclick=()=>toast('Village map: gate → market → training yard');
