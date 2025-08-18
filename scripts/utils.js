export const clamp = (x,a,b)=>Math.max(a,Math.min(b,x));
export const mix = (a,b,t)=>a*(1-t)+b*t;
export const smoothstep = (a,b,x)=>{const t=clamp((x-a)/(b-a),0,1); return t*t*(3-2*t);};
export const TAU = Math.PI*2;
export const DEG = Math.PI/180;

// Vector helpers
export const dot3=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
export const add3=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
export const sub3=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
export const mul3s=(a,s)=>[a[0]*s,a[1]*s,a[2]*s];
export const len3=a=>Math.hypot(a[0],a[1],a[2]);
export const norm3=a=>{const l=len3(a)||1; return [a[0]/l,a[1]/l,a[2]/l];};
export const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];

// 3x3 rotation matrix for Euler XYZ (Rz * Ry * Rx)
export function rotXYZ(rx,ry,rz){
  const cx=Math.cos(rx),sx=Math.sin(rx);
  const cy=Math.cos(ry),sy=Math.sin(ry);
  const cz=Math.cos(rz),sz=Math.sin(rz);
  return [
    [cz*cy, cz*sy*sx - sz*cx, cz*sy*cx + sz*sx],
    [sz*cy, sz*sy*sx + cz*cx, sz*sy*cx - cz*sx],
    [-sy,   cy*sx,             cy*cx]
  ];
}
export const mulMat3v = (m,v)=>[
  m[0][0]*v[0]+m[0][1]*v[1]+m[0][2]*v[2],
  m[1][0]*v[0]+m[1][1]*v[1]+m[1][2]*v[2],
  m[2][0]*v[0]+m[2][1]*v[1]+m[2][2]*v[2]
];

// Bayer 4x4 dithering threshold [0..1)
export const BAYER4 = [
   0,  8,  2, 10,
  12,  4, 14,  6,
   3, 11,  1,  9,
  15,  7, 13,  5
].map(v=> (v+0.5)/16);

// Halton sequence for jitter
export function halton(index, base){
  let f=1, r=0, i=index;
  while(i>0){ f/=base; r += f*(i%base); i=Math.floor(i/base); }
  return r;
}