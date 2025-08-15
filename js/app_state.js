const canvas=document.getElementById('canvas');
const ctx=canvas.getContext('2d',{alpha:false,desynchronized:true});
let DPR=window.devicePixelRatio||1, W=0, H=0;
let fontSize=14, fontFamily="Consolas, 'Fira Mono', Menlo, monospace", fontW="normal";
let charW=8, charH=16, cols=80, rows=40;

let State={
  shape:'Torus',
  size:1.1,
  rot:[20,35,0].map(d=>d*Math.PI/180),
  autoSpin:true, spinSpeed:0.6,
  light:{ambient:0.25,diffuse:1.05,specular:0.5,shininess:32,shadows:true,shadowK:12,ao:true,aoStrength:0.9, lightDir: norm3(0.6,0.8,0.4)},
  noise:{enabled:false,amount:0.16,scale:2.0,speed:0.9,octaves:3},
  ascii:{chars:asciiPresets.dense,invert:false},
  color:{enabled:true,mode:'luma',palette:'viridis',gamma:1.0},
  render:{fontSize:14,resScale:1.0,maxSteps:72,maxDist:24, taa:true, taaAmt:0.6, adaptive:true, targetFps:50},
  camera:{target:[0,0,0],yaw:0.4,pitch:-0.2,dist:4.0,fov:60}
};