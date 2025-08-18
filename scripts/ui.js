import { ASCII_PRESETS } from './ascii.js';
import { defaultState, state, flags, saveStateThrottled, resetAllState } from './state.js';

const $ = sel=>document.querySelector(sel);

const elements = {
  canvas: null,
  viewer: null,
  fpsEl: null,
  panel: null,
  panelBtn: null,
  fullscreenBtn: null,
  mobilePanelToggle: null,
  mobileFullscreen: null,
};

function toggleFullscreen(){
  const doc = document;
  const el = doc.documentElement;
  if(!doc.fullscreenElement && el.requestFullscreen){
    el.requestFullscreen();
  }else if(doc.exitFullscreen){
    doc.exitFullscreen();
  }
}

function togglePanel(open){
  if(window.matchMedia('(max-width:860px)').matches){
    elements.panel.classList.toggle('open', open ?? !elements.panel.classList.contains('open'));
  } // desktop: no-op
}

function bind(id, type='value', conv=(x)=>x){
  const el = $('#'+id);
  if(!el) return;
  const apply = ()=>{
    const v = (type==='checked')? el.checked : el.value;
    if(id==='asciiPreset'){
      state.asciiChars = ASCII_PRESETS[v] || state.asciiChars;
      $('#asciiChars').value = state.asciiChars;
    }
    state[id] = conv(v);
    if(id==='fontSize' || id==='asciiChars') flags.needFontMetrics = true;
    if(id==='resScale' || id==='fontSize') flags.needResize = true;
    saveStateThrottled();
  };
  // initialize UI from state
  if(type==='checked'){ el.checked = !!state[id]; }
  else el.value = state[id];
  el.addEventListener('input', apply, {passive:true});
  el.addEventListener('change', apply);
}

function bindAll(){
  // Scene
  bind('shape');
  bind('size','value', parseFloat);
  bind('rotX','value', parseFloat);
  bind('rotY','value', parseFloat);
  bind('rotZ','value', parseFloat);
  bind('autoSpin','checked', Boolean);
  bind('spinSpeed','value', parseFloat);

  // Lighting
  bind('ambient','value', parseFloat);
  bind('diffuse','value', parseFloat);
  bind('specular','value', parseFloat);
  bind('shininess','value', x=>parseInt(x));
  bind('shadows','checked', Boolean);
  bind('shadowK','value', parseFloat);
  bind('ao','checked', Boolean);
  bind('aoStrength','value', parseFloat);

  // Noise
  bind('noiseEnabled','checked', Boolean);
  bind('noiseAmt','value', parseFloat);
  bind('noiseScale','value', parseFloat);
  bind('noiseSpeed','value', parseFloat);
  bind('noiseOct','value', x=>parseInt(x));

  // ASCII & Color
  bind('asciiPreset');
  bind('asciiChars');
  bind('invert','checked', Boolean);
  bind('colorEnabled','checked', Boolean);
  bind('gamma','value', parseFloat);
  bind('colorMode');
  bind('palette');

  // Render
  bind('fontSize','value', x=>parseInt(x));
  bind('resScale','value', parseFloat);
  bind('maxSteps','value', x=>parseInt(x));
  bind('maxDist','value', parseFloat);
  bind('taa','checked', Boolean);
  bind('taaAmt','value', parseFloat);
  bind('adaptive','checked', Boolean);
  bind('targetFps','value', x=>parseInt(x));

  // Buttons
  $('#resetCam')?.addEventListener('click', ()=>{
    state.camDist = defaultState.camDist;
    state.camYaw = 0; state.camPitch = 0;
    state.rotX = defaultState.rotX; state.rotY = defaultState.rotY; state.rotZ = defaultState.rotZ;
    saveStateThrottled();
  });

  $('#resetAll')?.addEventListener('click', ()=>{
    resetAllState();
    // Sync UI values
    for(const [k,v] of Object.entries(state)){
      const el = document.getElementById(k);
      if(!el) continue;
      if(el.type==='checkbox') el.checked = !!v;
      else el.value = v;
    }
    flags.needFontMetrics = true;
    flags.needResize = true;
    saveStateThrottled();
  });
}

function bindChrome(){
  elements.panelBtn?.addEventListener('click', ()=> togglePanel());
  elements.mobilePanelToggle?.addEventListener('click', ()=> togglePanel());
  elements.fullscreenBtn?.addEventListener('click', toggleFullscreen);
  elements.mobileFullscreen?.addEventListener('click', toggleFullscreen);

  // Close panel when clicking outside on mobile
  document.addEventListener('click', (e)=>{
    if(!elements.panel.classList.contains('open')) return;
    const inside = elements.panel.contains(e.target) || e.target===elements.panelBtn || e.target===elements.mobilePanelToggle;
    if(!inside) elements.panel.classList.remove('open');
  });
}

export function initUI(){
  elements.canvas = $('#canvas');
  elements.viewer = $('#viewer');
  elements.fpsEl = $('#fps');
  elements.panel = $('#panel');
  elements.panelBtn = $('#panelBtn');
  elements.fullscreenBtn = $('#fullscreenBtn');
  elements.mobilePanelToggle = $('#mobilePanelToggle');
  elements.mobileFullscreen = $('#mobileFullscreen');

  bindAll();
  bindChrome();
}

export function getCanvas(){ return elements.canvas; }
export function getViewer(){ return elements.viewer; }

export function setValue(id, value){
  const el = document.getElementById(id);
  if(el) el.value = value;
}

export function updateFPSText(fps){
  if(elements.fpsEl) elements.fpsEl.textContent = `FPS: ${Math.round(fps)}`;
}