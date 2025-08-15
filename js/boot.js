function fit(){
  const rect=document.getElementById('viewer').getBoundingClientRect();
  canvas.style.width=rect.width+'px';
  canvas.style.height=rect.height+'px';
  resizeCanvas(); gridDirty=true;
}
window.addEventListener('resize',fit);
fit();
requestAnimationFrame(frame);