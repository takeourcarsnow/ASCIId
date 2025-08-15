const clamp = (x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const mix = (a,b,t)=>a+(b-a)*t;
const length3 = (x,y,z)=>Math.hypot(x,y,z);
const dot3=(ax,ay,az,bx,by,bz)=>ax*bx+ay*by+az*bz;
const norm3=(x,y,z)=>{const l=Math.hypot(x,y,z)||1;return [x/l,y/l,z/l];};

function rotXYZ(p, rx, ry, rz){
  const cx=Math.cos(rx), sx=Math.sin(rx);
  const cy=Math.cos(ry), sy=Math.sin(ry);
  const cz=Math.cos(rz), sz=Math.sin(rz);
  // Rx -> Ry -> Rz
  let x=p[0], y=p[1], z=p[2];
  let y1=y*cx - z*sx, z1=y*sx + z*cx;
  let x2=x*cy + z1*sy, z2=-x*sy + z1*cy;
  let x3=x2*cz - y1*sz, y3=x2*sz + y1*cz;
  return [x3,y3,z2];
}