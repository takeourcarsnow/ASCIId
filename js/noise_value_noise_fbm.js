function smooth5(t){return t*t*t*(t*(t*6-15)+10);}
function hash3i(ix,iy,iz){
  let x = ix*374761393 + iy*668265263 + iz*2147483647;
  x = (x ^ (x>>>13)) * 1274126177;
  x = (x ^ (x>>>16));
  return (x>>>0)/4294967295;
}
function valueNoise3(x,y,z){
  const ix=Math.floor(x), iy=Math.floor(y), iz=Math.floor(z);
  const fx=x-ix, fy=y-iy, fz=z-iz;
  const u=smooth5(fx), v=smooth5(fy), w=smooth5(fz);
  const c000=hash3i(ix,iy,iz),     c100=hash3i(ix+1,iy,iz);
  const c010=hash3i(ix,iy+1,iz),   c110=hash3i(ix+1,iy+1,iz);
  const c001=hash3i(ix,iy,iz+1),   c101=hash3i(ix+1,iy,iz+1);
  const c011=hash3i(ix,iy+1,iz+1), c111=hash3i(ix+1,iy+1,iz+1);
  const x00 = mix(c000,c100,u), x10 = mix(c010,c110,u);
  const x01 = mix(c001,c101,u), x11 = mix(c011,c111,u);
  const y0  = mix(x00,x10,v),   y1  = mix(x01,x11,v);
  return mix(y0,y1,w);
}
function fbm3(p, oct=4, lac=2.0, gain=0.5){
  let a=0, amp=0.5, f=1.0;
  for(let i=0;i<oct;i++){ a += amp*valueNoise3(p[0]*f,p[1]*f,p[2]*f); f*=lac; amp*=gain; }
  return a;
}