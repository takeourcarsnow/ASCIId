let dragging=false, lastX=0,lastY=0;
canvas.addEventListener('pointerdown',e=>{dragging=true; lastX=e.clientX; lastY=e.clientY; canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointerup',e=>{dragging=false; canvas.releasePointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',e=>{
  if(!dragging) return;
  const dx=(e.clientX-lastX)/Math.max(40,W*0.4);
  const dy=(e.clientY-lastY)/Math.max(40,H*0.4);
  State.camera.yaw += dx*Math.PI;
  State.camera.pitch = clamp(State.camera.pitch + dy*Math.PI, -1.2, 1.2);
  lastX=e.clientX; lastY=e.clientY;
});
canvas.addEventListener('wheel',e=>{
  e.preventDefault();
  const f=Math.exp((e.deltaY>0?1:-1)*0.1);
  State.camera.dist = clamp(State.camera.dist*f, 1.5, 20);
},{passive:false});
window.addEventListener('keydown',e=>{
  const s=0.06;
  if(e.key==='a'||e.key==='ArrowLeft') State.camera.yaw -= s*2;
  if(e.key==='d'||e.key==='ArrowRight') State.camera.yaw += s*2;
  if(e.key==='w'||e.key==='ArrowUp') State.camera.pitch = clamp(State.camera.pitch - s, -1.2, 1.2);
  if(e.key==='s'||e.key==='ArrowDown') State.camera.pitch = clamp(State.camera.pitch + s, -1.2, 1.2);
  if(e.key==='q') State.camera.dist = clamp(State.camera.dist*0.93, 1.5, 20);
  if(e.key==='e') State.camera.dist = clamp(State.camera.dist*1.07, 1.5, 20);
  if(e.key==='r') resetCamera();
});