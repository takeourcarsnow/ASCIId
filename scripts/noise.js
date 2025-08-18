import { mix } from './utils.js';

export function hash32(x){
  x = (x ^ 61) ^ (x >>> 16);
  x = x + (x << 3);
  x = x ^ (x >>> 4);
  x = x * 0x27d4eb2d;
  x = x ^ (x >>> 15);
  return x>>>0;
}
function rnd3(i,j,k){
  const n = hash32((i*73856093) ^ (j*19349663) ^ (k*83492791));
  return (n & 0xfffffff) / 0xfffffff;
}
export function noise3(x,y,z){
  const xi=Math.floor(x), yi=Math.floor(y), zi=Math.floor(z);
  const xf=x - xi, yf=y - yi, zf=z - zi;
  const u=xf*xf*(3-2*xf), v=yf*yf*(3-2*yf), w=zf*zf*(3-2*zf);
  function r(i,j,k){ return rnd3(xi+i, yi+j, zi+k); }
  const c000=r(0,0,0), c100=r(1,0,0), c010=r(0,1,0), c110=r(1,1,0);
  const c001=r(0,0,1), c101=r(1,0,1), c011=r(0,1,1), c111=r(1,1,1);
  const x00 = mix(c000,c100,u), x10 = mix(c010,c110,u);
  const x01 = mix(c001,c101,u), x11 = mix(c011,c111,u);
  const y0 = mix(x00,x10,v), y1 = mix(x01,x11,v);
  return mix(y0,y1,w);
}
export function fbm3(p, octaves=4, lac=2.0, gain=0.5){
  let a=0, amp=0.5, f=1, sum=0;
  for(let i=0;i<octaves;i++){
    sum += amp * noise3(p[0]*f, p[1]*f, p[2]*f);
    a += amp; amp *= gain; f *= lac;
  }
  return sum/(a||1);
}