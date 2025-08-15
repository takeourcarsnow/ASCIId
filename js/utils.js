// Merged utility functions from fullscreen.js, camera.js, palette_color.js

// --- fullscreen.js ---
function toggleFullscreen(){
  const el=document.documentElement;
  if(!document.fullscreenElement) el.requestFullscreen?.();
  else document.exitFullscreen?.();
}

// --- camera.js ---
function makeCamera(target,yaw,pitch,dist,fovDeg){
  const cy=Math.cos(yaw), sy=Math.sin(yaw);
  const cp=Math.cos(pitch), sp=Math.sin(pitch);
  const ro=[target[0]+dist*cp*cy, target[1]+dist*sp, target[2]+dist*cp*sy];
  const fwd = norm3(target[0]-ro[0], target[1]-ro[1], target[2]-ro[2]);
  const right = norm3(fwd[2],0,-fwd[0]);
  const up = norm3(right[1]*fwd[2]-right[2]*fwd[1], right[2]*fwd[0]-right[0]*fwd[2], right[0]*fwd[1]-right[1]*fwd[0]);
  const fov = Math.tan((fovDeg*Math.PI/180)/2);
  return {ro, fwd, right, up, fov};
}

// --- palette_color.js ---
function hsv2rgb(h,s,v){
  const i=Math.floor(h*6), f=h*6-i;
  const p=v*(1-s), q=v*(1-f*s), t=v*(1-(1-f)*s);
  switch(i%6){case 0:return[v,t,p];case 1:return[q,v,p];case 2:return[p,v,t];case 3:return[p,q,v];case 4:return[t,p,v];default:return[v,p,q]}
}
function paletteColor(s, palette){
  s=clamp(s,0,1);
  switch(palette){
    case 'grayscale': return [s,s,s];
    case 'fire':
      if(s<0.25) return [s*4, 0, 0];
      if(s<0.5) return [1, (s-0.25)*4, 0];
      if(s<0.75) return [1, 1, (s-0.5)*2];
      return [1, 1, mix(0.5,1,(s-0.75)*4)];
    case 'ice':{const a=[0.1,0.2,0.5], b=[0,1,1];return [mix(a[0],b[0],s),mix(a[1],b[1],s),mix(a[2],b[2],s)];}
    case 'viridis':{
      const stops=[[0.267,0.005,0.329],[0.283,0.141,0.458],[0.254,0.265,0.530],[0.207,0.372,0.553],[0.164,0.471,0.558],[0.128,0.567,0.551],[0.135,0.659,0.518],[0.267,0.749,0.441],[0.478,0.821,0.318],[0.741,0.873,0.150]];
      const x=s*(stops.length-1), i=Math.floor(x), t=x-i;
      const a=stops[Math.max(0,Math.min(stops.length-1,i))], b=stops[Math.max(0,Math.min(stops.length-1,i+1))];
      return [mix(a[0],b[0],t),mix(a[1],b[1],t),mix(a[2],b[2],t)];
    }
    case 'rainbow': return hsv2rgb(s*0.85,0.8,1.0);
  }
  return [s,s,s];
}
