// Tetrahedron SDF
function sdTetrahedron(p, s) {
  // Centered at origin, size s
  const k = Math.sqrt(2.0);
  p = [p[0], p[1] + s/3, p[2]];
  return Math.max(
    p[1],
    (-p[1] + k*p[0] + k*p[2]) / 2,
    (-p[1] - k*p[0] + k*p[2]) / 2,
    (-p[1] + k*p[0] - k*p[2]) / 2,
    (-p[1] - k*p[0] - k*p[2]) / 2
  ) - s/2.5;
}

// Star SDF (3D star, union of two intersecting octahedra)
function sdStar(p, s) {
  return Math.min(sdOcta(p, s), sdOcta([p[0], p[2], p[1]], s));
}

// Heart SDF (approximate)
function sdHeart(p, s) {
  // 3D heart shape
  let x = p[0]/s, y = p[1]/s, z = p[2]/s;
  let q = Math.sqrt(x*x + z*z);
  let d = Math.pow(q,2.0) + Math.pow(y-0.5,2.0) - 1.0;
  return d * s * 0.5;
}

// Egg SDF
function sdEgg(p, s) {
  // Elongated ellipsoid, bottom fatter
  let k = 0.8 + 0.2 * Math.tanh(p[1]/s);
  return sdEllipsoid([p[0], p[1], p[2]], [s*k, s, s*k*0.7]);
}
// Ellipsoid SDF: p = point, r = [rx, ry, rz]
function sdEllipsoid(p, r) {
  const k0 = Math.hypot(p[0]/r[0], p[1]/r[1], p[2]/r[2]);
  return k0 - 1.0;
}

// Rounded Box SDF: p = point, b = [bx, by, bz], r = radius
function sdRoundBox(p, b, r) {
  const q = [Math.abs(p[0])-b[0], Math.abs(p[1])-b[1], Math.abs(p[2])-b[2]];
  return Math.hypot(Math.max(q[0],0), Math.max(q[1],0), Math.max(q[2],0)) + Math.min(Math.max(q[0],Math.max(q[1],q[2])),0) - r;
}

// Triangular Prism SDF: p = point, h = height, w = width
function sdTriPrism(p, h, w) {
  const k = Math.sqrt(3.0);
  const px = Math.abs(p[0]);
  const py = Math.abs(p[1]);
  const pz = Math.abs(p[2]);
  const d1 = py - h*0.5;
  const d2 = Math.max(px*0.5 + k*pz, px) - w*0.5;
  return Math.max(d1, d2);
}

// Hexagonal Prism SDF: p = point, h = height, r = radius
function sdHexPrism(p, h, r) {
  const qx = Math.abs(p[0]);
  const qz = Math.abs(p[2]);
  const d1 = Math.max(qx*0.866025 + qz*0.5, qz) - r;
  const d2 = Math.abs(p[1]) - h*0.5;
  return Math.max(d1, d2);
}

// Plane SDF: p = point, n = normal, h = offset
function sdPlane(p, n, h) {
  return p[0]*n[0] + p[1]*n[1] + p[2]*n[2] + h;
}

// Cross SDF: p = point, b = [bx, by, bz]
function sdCross(p, b) {
  const dx = Math.abs(p[0]) - b[0];
  const dy = Math.abs(p[1]) - b[1];
  const dz = Math.abs(p[2]) - b[2];
  return Math.min(Math.min(
    Math.max(dx, Math.max(dy, dz)),
    Math.max(dy, Math.max(dx, dz))),
    Math.max(dz, Math.max(dx, dy)));
}
const sdSphere=(p,r)=>Math.hypot(p[0],p[1],p[2]) - r;
function sdBox(p,b){
  const ax=Math.abs(p[0])-b[0], ay=Math.abs(p[1])-b[1], az=Math.abs(p[2])-b[2];
  const mx=Math.max(ax,0), my=Math.max(ay,0), mz=Math.max(az,0);
  return Math.hypot(mx,my,mz) + Math.min(Math.max(ax,Math.max(ay,az)),0);
}
const sdTorus=(p,t)=>Math.hypot(Math.hypot(p[0],p[2]) - t[0], p[1]) - t[1];
function sdOcta(p,s){ const a=[Math.abs(p[0]),Math.abs(p[1]),Math.abs(p[2])]; return (a[0]+a[1]+a[2]-s)*0.5773502692; }

// Capsule SDF: p = point, a/b = end points, r = radius
function sdCapsule(p, a, b, r) {
  const pa = [p[0]-a[0], p[1]-a[1], p[2]-a[2]];
  const ba = [b[0]-a[0], b[1]-a[1], b[2]-a[2]];
  const h = Math.max(0, Math.min(1, (pa[0]*ba[0]+pa[1]*ba[1]+pa[2]*ba[2])/(ba[0]*ba[0]+ba[1]*ba[1]+ba[2]*ba[2])));
  const d = [pa[0]-ba[0]*h, pa[1]-ba[1]*h, pa[2]-ba[2]*h];
  return Math.hypot(d[0], d[1], d[2]) - r;
}

// Cylinder SDF: p = point, h = height, r = radius
function sdCylinder(p, h, r) {
  const d = [Math.hypot(p[0], p[2]) - r, Math.abs(p[1]) - h*0.5];
  return Math.min(Math.max(d[0], d[1]), 0.0) + Math.hypot(Math.max(d[0], 0.0), Math.max(d[1], 0.0));
}

// Cone SDF: p = point, h = height, r1 = base radius, r2 = top radius
function sdCone(p, h, r1, r2) {
  const q = [Math.hypot(p[0], p[2]), p[1]];
  const k1 = r2 - r1;
  const k2 = h;
  const k3 = Math.sqrt(k1*k1 + k2*k2);
  const d = [q[0] - r1 - (r2 - r1) * q[1] / h, Math.abs(q[1]) - h*0.5];
  return Math.min(Math.max(d[0], d[1]), 0.0) + Math.hypot(Math.max(d[0], 0.0), Math.max(d[1], 0.0));
}

// Pyramid SDF (square base): p = point, h = height, b = base half-width
function sdPyramid(p, h, b) {
  // Approximate as intersection of 4 planes and a base
  const px = Math.abs(p[0]);
  const pz = Math.abs(p[2]);
  const y = p[1];
  const m = h / b;
  const d1 = y - h + m * px;
  const d2 = y - h + m * pz;
  const d3 = -y;
  return Math.max(Math.max(d1, d2), d3);
}