const WARP = [1.37,5.13,2.71];

function mapSceneRaw(pr, time, P, needMom){
  // Base SDF per shape (already rotated)
  let d;
  if(P.shape==='Sphere') d = sdSphere(pr, P.size);
  else if(P.shape==='Box') d = sdBox(pr, [P.size*0.75,P.size*0.75,P.size*0.75]);
  else if(P.shape==='Torus') d = sdTorus(pr, [P.size, P.size*0.35]);
  else if(P.shape==='Capsule') d = sdCapsule(pr, [0,-P.size*0.5,0], [0,P.size*0.5,0], P.size*0.3);
  else if(P.shape==='Cylinder') d = sdCylinder(pr, P.size, P.size*0.35);
  else if(P.shape==='Cone') d = sdCone(pr, P.size, P.size*0.35, 0.01);
  else if(P.shape==='Pyramid') d = sdPyramid(pr, P.size, P.size*0.5);
  else if(P.shape==='Ellipsoid') d = sdEllipsoid(pr, [P.size, P.size*0.7, P.size*0.5]);
  else if(P.shape==='RoundedBox') d = sdRoundBox(pr, [P.size*0.7, P.size*0.7, P.size*0.7], P.size*0.2);
  else if(P.shape==='TriPrism') d = sdTriPrism(pr, P.size, P.size*0.7);
  else if(P.shape==='HexPrism') d = sdHexPrism(pr, P.size, P.size*0.5);
  else if(P.shape==='Plane') d = sdPlane(pr, [0,1,0], 0);
  else if(P.shape==='Cross') d = sdCross(pr, [P.size*0.4, P.size*0.4, P.size*0.4]);
  else if(P.shape==='Tetrahedron') d = sdTetrahedron(pr, P.size);
  else if(P.shape==='Star') d = sdStar(pr, P.size);
  else if(P.shape==='Heart') d = sdHeart(pr, P.size);
  else if(P.shape==='Egg') d = sdEgg(pr, P.size);
  else d = sdOcta(pr, P.size);

  let nval=0, mom=0;
  if(P.noise.enabled && P.noise.amount>0){
    const q = [pr[0]*P.noise.scale + time*P.noise.speed*WARP[0],
               pr[1]*P.noise.scale + time*P.noise.speed*WARP[1],
               pr[2]*P.noise.scale + time*P.noise.speed*WARP[2]];
    const n1 = fbm3(q, P.noise.octaves, 2.0, 0.5); // [0,1]
    if(needMom){
      const dt=0.03;
      const q0 = [pr[0]*P.noise.scale + (time-dt)*P.noise.speed*WARP[0],
                  pr[1]*P.noise.scale + (time-dt)*P.noise.speed*WARP[1],
                  pr[2]*P.noise.scale + (time-dt)*P.noise.speed*WARP[2]];
      const n0 = fbm3(q0, P.noise.octaves, 2.0, 0.5);
      mom = Math.abs(n1-n0)/dt;
    }
    nval=n1;
    d += (n1-0.5)*2.0*P.noise.amount;
  }
  return {d,nval,mom};
}
function mapScene(p, time, P, needMom){
  const pr = rotXYZ(p, P.rot[0], P.rot[1], P.rot[2]);
  return mapSceneRaw(pr,time,P,needMom);
}

// Tetrahedral normal (4 SDF calls vs 6)
function calcNormalFast(p,time,P){
  const e=0.0009;
  const p1=[p[0]+e,p[1]-e,p[2]-e];
  const p2=[p[0]-e,p[1]+e,p[2]-e];
  const p3=[p[0]-e,p[1]-e,p[2]+e];
  const p4=[p[0]+e,p[1]+e,p[2]+e];
  const d1=mapScene(p1,time,P,false).d, d2=mapScene(p2,time,P,false).d, d3=mapScene(p3,time,P,false).d, d4=mapScene(p4,time,P,false).d;
  const nx = d1 - d2 - d3 + d4;
  const ny = -d1 + d2 - d3 + d4;
  const nz = -d1 - d2 + d3 + d4;
  return norm3(nx,ny,nz);
}

// Soft shadow with fewer steps
function softShadow(ro, rd, time, P, mint=0.02, maxt=20.0, k=12.0){
  let t=mint, res=1.0;
  for(let i=0;i<48 && t<maxt;i++){
    const p=[ro[0]+rd[0]*t, ro[1]+rd[1]*t, ro[2]+rd[2]*t];
    const h=mapScene(p,time,P,false).d;
    if(h<0.0005) return 0.0;
    res = Math.min(res, k*h/t);
    t += clamp(h, 0.01, 0.25);
  }
  return clamp(res,0,1);
}
function calcAO(p,n,time,P,steps=5,stepSize=0.13,strength=1.0){
  let occ=0;
  for(let i=1;i<=steps;i++){
    const t=i*stepSize;
    const pp=[p[0]+n[0]*t, p[1]+n[1]*t, p[2]+n[2]*t];
    const d=mapScene(pp,time,P,false).d;
    const dd=t-d;
    occ += clamp(dd,0,1);
  }
  return 1.0 - clamp(occ/steps,0,1)*strength;
}