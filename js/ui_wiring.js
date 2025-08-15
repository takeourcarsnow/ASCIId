const byId = id=>document.getElementById(id);
function hookRange(id,path,conv=(x)=>+x){byId(id).addEventListener('input',()=>setPath(State,path,conv(byId(id).value))); }
function hookCheck(id,path){byId(id).addEventListener('change',()=>setPath(State,path,byId(id).checked));}
function hookSelect(id,path){byId(id).addEventListener('change',()=>{const el=byId(id); setPath(State,path,el.value); if(id==='asciiPreset'){ byId('asciiChars').value = asciiPresets[el.value]; State.ascii.chars = byId('asciiChars').value; asciiCacheDirty=true; }});}
function hookText(id,path){byId(id).addEventListener('input',()=>{ setPath(State,path,String(byId(id).value)); asciiCacheDirty=true; });}
function setPath(obj,path,value){const parts=Array.isArray(path)?path:path.split('.'); let o=obj; for(let i=0;i<parts.length-1;i++){o=o[parts[i]]} o[parts[parts.length-1]]=value;}

hookSelect('shape','shape');
hookRange('size','size',parseFloat);
['rotX','rotY','rotZ'].forEach((id,i)=>byId(id).addEventListener('input', e=>State.rot[i] = (+e.target.value)*Math.PI/180));
hookCheck('autoSpin','autoSpin'); hookRange('spinSpeed','spinSpeed',parseFloat);
hookRange('ambient','light.ambient',parseFloat); hookRange('diffuse','light.diffuse',parseFloat);
hookRange('specular','light.specular',parseFloat); hookRange('shininess','light.shininess',v=>+v|0);
hookCheck('shadows','light.shadows'); hookRange('shadowK','light.shadowK',parseFloat);
hookCheck('ao','light.ao'); hookRange('aoStrength','light.aoStrength',parseFloat);
hookCheck('noiseEnabled','noise.enabled'); hookRange('noiseAmt','noise.amount',parseFloat);
hookRange('noiseScale','noise.scale',parseFloat); hookRange('noiseSpeed','noise.speed',parseFloat);
hookRange('noiseOct','noise.octaves',v=>+v|0);
hookSelect('asciiPreset','ascii.preset'); hookText('asciiChars','ascii.chars');
hookCheck('invert','ascii.invert');
hookCheck('colorEnabled','color.enabled'); hookRange('gamma','color.gamma',parseFloat); hookSelect('colorMode','color.mode');
hookSelect('palette','color.palette');
hookRange('fontSize','render.fontSize',v=>{fontSize=+v; return +v;}); hookRange('resScale','render.resScale',parseFloat);
hookRange('maxSteps','render.maxSteps',v=>+v|0); hookRange('maxDist','render.maxDist',parseFloat);
hookCheck('taa','render.taa'); hookRange('taaAmt','render.taaAmt',parseFloat);
hookCheck('adaptive','render.adaptive'); hookRange('targetFps','render.targetFps',v=>+v|0);
byId('resetCam').onclick=()=>resetCamera(); byId('resetAll').onclick=()=>resetAll();
// Responsive panel toggle: slide and give space to viewer
const panelEl = byId('panel');
const mainEl = byId('main');
if (panelEl) panelEl.classList.add('open');
if (mainEl) mainEl.classList.remove('panel-hidden');
byId('panelBtn').onclick = () => {
  const panel = byId('panel');
  const main = byId('main');
  if (panel && main) {
    const isOpen = panel.classList.toggle('open');
    if (isOpen) {
      main.classList.remove('panel-hidden');
    } else {
      main.classList.add('panel-hidden');
    }
  }
};
byId('fullscreenBtn').onclick=()=>toggleFullscreen();

function resetCamera(){ State.camera.yaw=0.4; State.camera.pitch=-0.2; State.camera.dist=4.0; }
function resetAll(){
  Object.assign(State,{
  shape:'Torus', size:1.1, rot:[20,35,0].map(d=>d*Math.PI/180), autoSpin:true, spinSpeed:0.6,
    light:{ambient:0.25,diffuse:1.05,specular:0.5,shininess:32,shadows:true,shadowK:12,ao:true,aoStrength:0.9, lightDir: norm3(0.6,0.8,0.4)},
  noise:{enabled:false,amount:0.16,scale:2.0,speed:0.9,octaves:3},
    ascii:{chars:asciiPresets.dense,invert:false,dither:0.3},
    color:{enabled:true,mode:'luma',palette:'viridis',gamma:1.0},
    render:{fontSize:14,resScale:1.0,maxSteps:72,maxDist:24,taa:true,taaAmt:0.6,adaptive:true,targetFps:50},
    camera:{target:[0,0,0],yaw:0.4,pitch:-0.2,dist:4.0,fov:60}
  });
  // Set shape dropdown to default. If new shapes are present, this will still work.
  byId('shape').value='Torus'; byId('size').value=1.1;
  byId('rotX').value=20; byId('rotY').value=35; byId('rotZ').value=0;
  byId('autoSpin').checked=true; byId('spinSpeed').value=0.6;
  byId('ambient').value=0.25; byId('diffuse').value=1.05; byId('specular').value=0.5; byId('shininess').value=32;
  byId('shadows').checked=true; byId('shadowK').value=12; byId('ao').checked=true; byId('aoStrength').value=0.9;
  byId('noiseEnabled').checked=false; byId('noiseAmt').value=0.16; byId('noiseScale').value=2.0; byId('noiseSpeed').value=0.9; byId('noiseOct').value=3;
  byId('asciiPreset').value='dense'; byId('asciiChars').value=asciiPresets.dense; byId('invert').checked=false;
  byId('colorEnabled').checked=true; byId('colorMode').value='luma'; byId('palette').value='viridis'; byId('gamma').value=1.0;
  byId('fontSize').value=14; byId('resScale').value=1.0; byId('maxSteps').value=72; byId('maxDist').value=24;
  byId('taa').checked=true; byId('taaAmt').value=0.6; byId('adaptive').checked=true; byId('targetFps').value=50;
  asciiCacheDirty=true; gridDirty=true; resetHistory();
}