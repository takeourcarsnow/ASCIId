import { ASCII_PRESETS } from './ascii.js';

const STORAGE_KEY = 'ascii-raymarcher-state';

export const defaultState = {
  // Scene
  shape: 'Torus',
  size: 1.1,
  rotX: 20, rotY: 35, rotZ: 0,
  autoSpin: true, spinSpeed: 0.6,

  // Lighting
  ambient: 0.25, diffuse: 1.05, specular: 0.5, shininess: 32,
  shadows: true, shadowK: 12,
  ao: true, aoStrength: 0.9,

  // Noise
  noiseEnabled: false, noiseAmt: 0.16, noiseScale: 2.0, noiseSpeed: 0.9, noiseOct: 3,

  // ASCII & Color
  asciiPreset: 'dense',
  asciiChars: ASCII_PRESETS.dense,
  invert: false,
  colorEnabled: true, gamma: 1.0,
  colorMode: 'luma', palette: 'viridis',

  // Render & Performance
  fontSize: 14, resScale: 1.0, maxSteps: 72, maxDist: 24,
  taa: true, taaAmt: 0.6,
  adaptive: true, targetFps: 50,

  // Camera
  camDist: 6.0, camYaw: 0, camPitch: 0,
};

export const state = (() => {
  try{
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    return saved ? {...defaultState, ...saved} : {...defaultState};
  }catch(_){
    return {...defaultState};
  }
})();

export const flags = {
  needResize: true,
  needFontMetrics: true,
};

export function saveStateThrottled(){
  if(saveStateThrottled._t) return;
  saveStateThrottled._t = setTimeout(()=>{
    try{
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }catch(_){}
    saveStateThrottled._t = null;
  }, 250);
}

export function resetAllState(){
  for(const k of Object.keys(defaultState)){
    state[k] = defaultState[k];
  }
}