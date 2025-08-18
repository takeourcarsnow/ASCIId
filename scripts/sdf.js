import { clamp, smoothstep, dot3, add3, sub3, mul3s, len3, norm3, mulMat3v } from './utils.js';
import { fbm3 } from './noise.js';

// SDFs
export const sdSphere = (p, r)=> len3(p) - r;
export const sdBox = (p, b)=> {
  const q=[Math.abs(p[0])-b[0], Math.abs(p[1])-b[1], Math.abs(p[2])-b[2]];
  const outside = Math.hypot(Math.max(q[0],0), Math.max(q[1],0), Math.max(q[2],0));
  const inside = Math.min(Math.max(q[0], Math.max(q[1], q[2])), 0);
  return outside + inside;
};
export const sdRoundBox = (p,b,r)=> sdBox(p,b.map(v=>v-r)) - r;
export const sdTorus = (p, t)=> {
  const q = [Math.hypot(p[0],p[2]) - t[0], p[1]];
  return Math.hypot(q[0], q[1]) - t[1];
};
export const sdOctahedron = (p, s)=>{
  const m = Math.abs(p[0]) + Math.abs(p[1]) + Math.abs(p[2]) - s;
  return m * 0.57735026919;
};
export const sdCapsule = (p, a, b, r)=>{
  const pa=sub3(p,a), ba=sub3(b,a);
  const h=clamp(dot3(pa,ba)/dot3(ba,ba),0,1);
  return len3(sub3(pa, mul3s(ba,h))) - r;
};
export const sdCylinder = (p, r, h)=>{
  const d = [Math.hypot(p[0],p[2]) - r, Math.abs(p[1])-h];
  return Math.min(Math.max(d[0], d[1]), 0) + Math.hypot(Math.max(d[0],0), Math.max(d[1],0));
};
export const sdCone = (p, h, r)=>{
  const q=[Math.hypot(p[0],p[2]), p[1]];
  const k = r/h;
  const d = Math.max(Math.hypot(q[0], q[1]*k) - r, -q[1]-h);
  return d;
};
export const sdPlane = (p, n, h)=> dot3(p,n)+h;
export const sdEllipsoid = (p, r)=> {
  const k = [p[0]/r[0], p[1]/r[1], p[2]/r[2]];
  return (len3(k)-1) * Math.min(r[0], r[1], r[2]);
};
export const sdTriPrism = (p, h)=>{
  const q=[Math.abs(p[0]), p[1], Math.abs(p[2])];
  const d1 = q[2] - h[1];
  const d2 = Math.max(q[0]*0.866025404 + q[1]*0.5, -q[1]) - h[0]*0.5;
  return Math.min(Math.max(d1, d2),0) + Math.hypot(Math.max(d1,0), Math.max(d2,0));
};
export const sdHexPrism = (p, h)=>{
  const q=[Math.abs(p[0]), Math.abs(p[1]), Math.abs(p[2])];
  const d1 = q[2] - h[1];
  const d2 = Math.max(q[0]*0.866025404 + q[1]*0.5, q[1]) - h[0];
  return Math.min(Math.max(d1, d2),0) + Math.hypot(Math.max(d1,0), Math.max(d2,0));
};
export const sdTetrahedron = (p, s)=>{
  const n1=norm3([ 1, 1, 1]);
  const n2=norm3([-1,-1, 1]);
  const n3=norm3([-1, 1,-1]);
  const n4=norm3([ 1,-1,-1]);
  const d = Math.max(
    dot3(p,n1)-s*0.577,
    Math.max(dot3(p,n2)-s*0.577, Math.max(dot3(p,n3)-s*0.577, dot3(p,n4)-s*0.577))
  );
  return d;
};
export const sdPyramid = (p, h)=>{
  const m = [Math.abs(p[0]), Math.abs(p[2])];
  const d = Math.max(m[0]+m[1] - h, Math.abs(p[1]) - h*0.5);
  return d;
};
export const sdCross = (p, s)=>{
  const b=s;
  return Math.min(sdBox(p,[b, s, s]), Math.min(sdBox(p,[s, b, s]), sdBox(p,[s, s, b])));
};
export const sdHeart = (p, s)=>{
  const x=p[0]/s, y=p[1]/s, z=p[2]/s;
  const f = Math.pow(x*x + 9/4*y*y + z*z - 1, 3) - x*x*z*z*z - 9/80*y*y*z*z*z;
  const g = Math.hypot(2*x*(x*x + 9/4*y*y + z*z - 1) - 2*x*z*z*z,
                       (27/2)*y*(y*y + (4/9)*x*x + (4/9)*z*z - 4/9) - (9/40)*2*y*z*z*z,
                       2*z*(x*x + 9/4*y*y + z*z - 1) - 3*z*z*(x*x + 9/80*y*y));
  return f/(g+1e-3);
};
export const sdEgg = (p, s)=>{
  const k = 0.2 + 0.8*smoothstep(-1,1,p[1]/s);
  const r=[s*k, s, s*k*0.9];
  return sdEllipsoid(p, r);
};

// Scene mapping (with optional animated noise)
export function mapScene(p, state, rotM, time){
  const pr = mulMat3v(rotM, p);
  const size = state.size;
  let d = 1e9;
  switch(state.shape){
    case 'Sphere':       d = sdSphere(pr, size); break;
    case 'Box':          d = sdBox(pr, [size,size,size]); break;
    case 'RoundedBox':   d = sdRoundBox(pr, [size,size,size], size*0.2); break;
    case 'Torus':        d = sdTorus(pr, [size*1.0, size*0.38]); break;
    case 'Octahedron':   d = sdOctahedron(pr, size); break;
    case 'Capsule':      d = sdCapsule(pr, [-size,0,0], [size,0,0], size*0.35); break;
    case 'Cylinder':     d = sdCylinder(pr, size*0.7, size*0.8); break;
    case 'Cone':         d = sdCone(pr, size*0.9, size*0.8); break;
    case 'Pyramid':      d = sdPyramid(pr, size*1.5); break;
    case 'Ellipsoid':    d = sdEllipsoid(pr, [size, size*0.7, size*1.2]); break;
    case 'TriPrism':     d = sdTriPrism(pr, [size*1.7, size*0.8]); break;
    case 'HexPrism':     d = sdHexPrism(pr, [size*0.9, size*0.7]); break;
    case 'Plane':        d = sdPlane(pr, [0,1,0], 0.6); break;
    case 'Cross':        d = sdCross(pr, size*1.2); break;
    case 'Tetrahedron':  d = sdTetrahedron(pr, size*1.8); break;
    case 'Star':         d = Math.min(sdOctahedron(pr, size*0.9), sdTorus(pr,[size*0.9, size*0.22])); break;
    case 'Heart':        d = sdHeart(pr, size*0.9); break;
    case 'Egg':          d = sdEgg(pr, size); break;
  }

  if(state.noiseEnabled){
    const ns = state.noiseScale;
    const t = time*state.noiseSpeed;
    const n = fbm3([pr[0]*ns + 7.1, pr[1]*ns - 11.3 + t, pr[2]*ns + 3.7], state.noiseOct);
    d -= state.noiseAmt * (n*2-1);
  }
  return d;
}
export function getNormal(p, state, rotM, time){
  const e = 0.0015;
  const d = mapScene(p, state, rotM, time);
  const nx = mapScene([p[0]+e, p[1], p[2]], state, rotM, time) - d;
  const ny = mapScene([p[0], p[1]+e, p[2]], state, rotM, time) - d;
  const nz = mapScene([p[0], p[1], p[2]+e], state, rotM, time) - d;
  return norm3([nx,ny,nz]);
}
export function softShadow(ro, rd, mint, maxt, k, state, rotM, time){
  let res = 1.0, t = mint;
  for(let i=0; i<32 && t<maxt; i++){
    const h = mapScene(add3(ro, mul3s(rd,t)), state, rotM, time);
    if(h<1e-4) return 0.0;
    res = Math.min(res, k*h/t);
    t += clamp(h, 0.01, 0.5);
  }
  return clamp(res,0,1);
}
export function ambientOcclusion(p, n, state, rotM, time){
  if(!state.ao) return 1;
  let occ=0, sca=1;
  for(let i=1;i<=5;i++){
    const h = i*0.08;
    const d = mapScene(add3(p, mul3s(n,h)), state, rotM, time);
    occ += (h - d) * sca;
    sca *= 0.7;
  }
  return clamp(1 - occ*state.aoStrength, 0, 1);
}