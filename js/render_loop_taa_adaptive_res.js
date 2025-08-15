let lastTime=performance.now(), accTime=0, frameCount=0, fps=0;
let lastSpinRot=0;
function resetHistory(){
  History.luma=null; History.r=null; History.g=null; History.b=null; History.valid=false;
}
const History={luma:null,r:null,g:null,b:null,valid:false};

function ensureHistory(){
  const N=Grid.N;
  if(!History.luma || History.luma.length!==N){
    History.luma = new Float32Array(N);
    History.r = new Float32Array(N);
    History.g = new Float32Array(N);
    History.b = new Float32Array(N);
    History.valid=false;
  }
}

function resizeCanvas(){
  DPR=window.devicePixelRatio||1;
  W=canvas.clientWidth; H=canvas.clientHeight;
  canvas.width=Math.max(1,Math.floor(W*DPR));
  canvas.height=Math.max(1,Math.floor(H*DPR));
  ctx.setTransform(DPR,0,0,DPR,0,0);
}

function frame(){
  const now=performance.now();
  const dt=(now-lastTime)/1000; lastTime=now;
  accTime += dt; frameCount++;
  if(accTime>0.5){ fps = Math.round(frameCount/accTime); frameCount=0; accTime=0; byId('fps').textContent=`FPS: ${fps}`; if(State.render.adaptive) autoScaleRes(fps); }
  if(State.autoSpin){ State.rot[1]+=dt*State.spinSpeed; State.rot[0]+=dt*State.spinSpeed*0.25; lastSpinRot+=dt*State.spinSpeed; }
  render(now/1000);
  requestAnimationFrame(frame);
}
function autoScaleRes(fps){
  const target=State.render.targetFps|0;
  const s=State.render.resScale;
  if(fps < target-3) State.render.resScale = clamp(s*0.96, 0.6, 1.5);
  else if(fps > target+5) State.render.resScale = clamp(s*1.03, 0.6, 1.5);
  if(Math.abs(State.render.resScale - s) > 1e-4){ byId('resScale').value=State.render.resScale.toFixed(2); gridDirty=true; }
}

function render(time){
  // Resize and metrics
  if(canvas.width !== Math.floor(canvas.clientWidth*DPR) || canvas.height!==Math.floor(canvas.clientHeight*DPR)){ resizeCanvas(); }
  updateTextMetrics(); updateGridCache();
  if(asciiCacheDirty){ refreshAscii(); asciiCacheDirty=false; }

  ctx.fillStyle='#06080c'; ctx.fillRect(0,0,W,H);
  ctx.font=`${fontW} ${fontSize}px ${fontFamily}`; ctx.textBaseline='top';

  // Camera & precompute
  const C=State.camera;
  const cam=makeCamera(C.target,C.yaw,C.pitch,C.dist,C.fov);
  const rightF = [cam.right[0]*cam.fov, cam.right[1]*cam.fov, cam.right[2]*cam.fov];
  const upF    = [cam.up[0]*cam.fov,    cam.up[1]*cam.fov,    cam.up[2]*cam.fov];
  const lightDir=State.light.lightDir;

  // Params snapshot
  const Params={shape:State.shape,size:State.size,rot:State.rot.slice(),noise:{...State.noise}};
  const maxSteps=State.render.maxSteps|0, maxDist=+State.render.maxDist;
  const epsilonBase=0.0012;
  const gamma=State.color.gamma;
  const needMom = (State.color.enabled && State.color.mode==='momentum');
  const Rbound = boundRadius(Params)+0.15;

  ensureHistory();

  const N=Grid.N;
  const uv=Grid.uv;

  // Draw
  for(let j=0;j<rows;j++){
    for(let i=0;i<cols;i++){
      const idx=j*cols+i;
      const u=uv[idx*2+0], v=uv[idx*2+1];

      // Ray dir
      const dir = norm3(
        cam.fwd[0] + u*rightF[0] + v*upF[0],
        cam.fwd[1] + u*rightF[1] + v*upF[1],
        cam.fwd[2] + u*rightF[2] + v*upF[2]
      );

      const tEps = epsilonBase * (1.0 + 0.2*Math.abs(u)+0.2*Math.abs(v));
      const hit=raymarch(cam.ro,dir,time,Params,maxSteps,maxDist,tEps,needMom,Rbound);

      let shade=0, spec=0, depth=0, nrm=[0,0,0], momentum=0;

      if(hit.hit){
        const p=hit.p;
        depth = 1 - clamp(hit.t/maxDist,0,1);
        nrm = calcNormalFast(p,time,Params);
        let ndl = clamp(dot3(nrm[0],nrm[1],nrm[2], lightDir[0],lightDir[1],lightDir[2]), 0, 1);
        let shadow=1.0;
        if(State.light.shadows && ndl>0.0001){
          const po=[p[0]+nrm[0]*tEps*2,p[1]+nrm[1]*tEps*2,p[2]+nrm[2]*tEps*2];
          shadow = softShadow(po, lightDir, time, Params, 0.02, 12.0, State.light.shadowK);
        }
        const ao = State.light.ao ? calcAO(p,nrm,time,Params,5,0.14,State.light.aoStrength) : 1.0;
        const diffuse = ndl * State.light.diffuse * shadow;
        const view=[-dir[0],-dir[1],-dir[2]];
        const h = norm3(lightDir[0]+view[0], lightDir[1]+view[1], lightDir[2]+view[2]);
        spec = Math.pow(clamp(dot3(nrm[0],nrm[1],nrm[2],h[0],h[1],h[2]),0,1), State.light.shininess) * State.light.specular * shadow;
        shade = clamp(State.light.ambient + diffuse, 0, 2) * ao;
        momentum = needMom ? clamp(hit.mom*0.15,0,1) : 0;
      }

      // Luma and ASCII char
      let luma = clamp(shade + spec*0.5, 0, 1);
      if(gamma!==1.0) luma = Math.pow(luma, 1.0/gamma);
  let lumad = luma;

      // Temporal AA (blend luma & color)
      const doTAA = State.render.taa && History.valid;
      const alpha = doTAA ? State.render.taaAmt : 0;
      if(alpha>0){
        lumad = mix(lumad, History.luma[idx], alpha);
      }

      const cIdx = Math.floor(lumad*(asciiCount-1) + 0.5);
      const ch = asciiList[Math.max(0, Math.min(asciiCount-1, cIdx))];

      // Color
      let color=[1,1,1];
      if(State.color.enabled){
        const mode=State.color.mode;
        if(mode==='luma') color = paletteColor(luma, State.color.palette);
        else if(mode==='depth') color = paletteColor(depth, State.color.palette);
        else if(mode==='specular') color = paletteColor(spec, State.color.palette);
        else if(mode==='momentum') color = paletteColor(momentum, State.color.palette);
        else if(mode==='normal') color = [0.5*(nrm[0]+1), 0.5*(nrm[1]+1), 0.5*(nrm[2]+1)];
      }else{
        color=[luma,luma,luma];
      }

      // Gentle luma mix to keep glyph contrast readable
      const k=0.9;
      let r=clamp(color[0]*k + luma*(1-k),0,1);
      let g=clamp(color[1]*k + luma*(1-k),0,1);
      let b=clamp(color[2]*k + luma*(1-k),0,1);

      if(alpha>0){
        r=mix(r,History.r[idx],alpha);
        g=mix(g,History.g[idx],alpha);
        b=mix(b,History.b[idx],alpha);
      }

      // Store history
      History.luma[idx]=lumad; History.r[idx]=r; History.g[idx]=g; History.b[idx]=b;

      // Draw glyph
      ctx.fillStyle=`rgb(${(r*255)|0},${(g*255)|0},${(b*255)|0})`;
      ctx.fillText(ch, i*charW*invResScale, j*charH*invResScale);
    }
  }
  History.valid=true;
}