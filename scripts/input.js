import { clamp } from './utils.js';
import { defaultState, state } from './state.js';

const key = {};
const pointer = { active:false, x:0, y:0, lastX:0, lastY:0, id:null, second:null, lastDist:0 };

export function initInput(canvas){
  window.addEventListener('keydown', e=>{
    key[e.key.toLowerCase()] = true;
    if(['w','a','s','d','q','e','r'].includes(e.key.toLowerCase())) e.preventDefault();
  });
  window.addEventListener('keyup', e=>{ key[e.key.toLowerCase()] = false; });

  canvas.addEventListener('pointerdown', (e)=>{
    canvas.setPointerCapture(e.pointerId);
    if(pointer.active && pointer.second==null && e.pointerId!==pointer.id){
      pointer.second = e.pointerId;
      pointer.lastDist = 0;
    }else if(!pointer.active){
      pointer.active = true; pointer.id = e.pointerId;
      pointer.x = pointer.lastX = e.clientX;
      pointer.y = pointer.lastY = e.clientY;
    }
  });
  canvas.addEventListener('pointermove', (e)=>{
    if(!pointer.active) return;
    if(pointer.second!=null){
      const a = e.pointerId===pointer.id? {x:e.clientX, y:e.clientY} : {x:pointer.x, y:pointer.y};
      const others = e.pointerId===pointer.second? {x:e.clientX, y:e.clientY} : {x:pointer.lastX, y:pointer.lastY};
      const dx=a.x-others.x, dy=a.y-others.y;
      const dist=Math.hypot(dx,dy);
      if(pointer.lastDist>0){
        const delta = (dist - pointer.lastDist) * 0.01;
        state.camDist = clamp(state.camDist - delta, 1.5, 24);
      }
      pointer.lastDist = dist;
    }else if(e.pointerId===pointer.id){
      const dx = e.clientX - pointer.lastX;
      const dy = e.clientY - pointer.lastY;
      pointer.lastX = e.clientX; pointer.lastY = e.clientY;
      state.camYaw += dx * 0.004;
      state.camPitch = clamp(state.camPitch + dy * 0.004, -1.35, 1.35);
    }
  }, {passive:false});
  canvas.addEventListener('pointerup', (e)=>{
    if(e.pointerId===pointer.second) pointer.second=null;
    else if(e.pointerId===pointer.id){ pointer.active=false; pointer.id=null; }
  });
  canvas.addEventListener('wheel', (e)=>{
    e.preventDefault();
    const s = Math.exp(-e.deltaY * 0.0012);
    state.camDist = clamp(state.camDist * s, 1.5, 24);
  }, {passive:false});
}

export function updateKeyboard(dt){
  const speed = 0.8 * dt;
  if(key['r']){ state.camYaw=0; state.camPitch=0; state.camDist=defaultState.camDist; }
  if(key['a']) state.camYaw -= speed;
  if(key['d']) state.camYaw += speed;
  if(key['w']) state.camPitch = clamp(state.camPitch - speed, -1.35, 1.35);
  if(key['s']) state.camPitch = clamp(state.camPitch + speed, -1.35, 1.35);
  if(key['q']) state.camDist = clamp(state.camDist + speed*2, 1.5, 24);
  if(key['e']) state.camDist = clamp(state.camDist - speed*2, 1.5, 24);
}