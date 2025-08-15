function boundRadius(P){
  const n = (P.noise.enabled? P.noise.amount:0);
  if(P.shape==='Sphere') return P.size + n;
  if(P.shape==='Box') return Math.sqrt(3)*0.75*P.size + n;
  if(P.shape==='Torus') return (P.size + 0.35*P.size) + n;
  return P.size + n; // Octahedron conservative
}
function raySphere(ro,rd,R){ // center at origin
  const b=dot3(ro[0],ro[1],ro[2], rd[0],rd[1],rd[2]);
  const c=dot3(ro[0],ro[1],ro[2], ro[0],ro[1],ro[2]) - R*R;
  const disc=b*b - c;
  if(disc<0) return null;
  const s=Math.sqrt(disc);
  const t0=-b - s, t1=-b + s;
  return {t0,t1};
}
function raymarch(ro,rd,time,P,maxSteps,maxDist,epsilon,needMom,Rbound){
  let t=0, steps=0, nval=0, mom=0;
  // Bounding sphere cull
  if(Rbound>0){
    const hitS = raySphere(ro,rd,Rbound);
    if(!hitS) return {hit:false,t:maxDist,steps};
    t = Math.max(0, hitS.t0);
    maxDist = Math.min(maxDist, hitS.t1+0.5);
    if(t>maxDist) return {hit:false,t:maxDist,steps};
  }
  for(; steps<maxSteps && t<maxDist; steps++){
    const p=[ro[0]+rd[0]*t, ro[1]+rd[1]*t, ro[2]+rd[2]*t];
    const r=mapScene(p,time,P,needMom);
    const h=r.d;
    if(needMom){ nval=r.nval; mom=r.mom; }
    if(h<epsilon) return {hit:true,t,steps,p,nval,mom};
    // adaptive step: smaller as we get closer
    t += h*0.9;
  }
  return {hit:false,t:maxDist,steps};
}