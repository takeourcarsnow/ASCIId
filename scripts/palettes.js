import { clamp } from './utils.js';

export function palGrayscale(t){ t=clamp(t,0,1); const v=Math.round(t*255); return [v,v,v]; }
export function palFire(t){
  t=clamp(t,0,1);
  const c = t<.3 ? [t/.3*180, 0, 0]
        : t<.6 ? [180+ (t-.3)/.3*75, (t-.3)/.3*90, 0]
        : t<.85? [255, 180+(t-.6)/.25*70, 0]
               : [255, 250, (t-.85)/.15*255];
  return c.map(v=>clamp(Math.round(v),0,255));
}
export function palIce(t){
  t=clamp(t,0,1);
  const r = Math.round(10 + 40*t);
  const g = Math.round(50 + 170*t);
  const b = Math.round(90 + 165*t);
  return [r,g,b];
}
export function palRainbow(t){
  t=clamp(t,0,1);
  const h = t*6; const i=Math.floor(h);
  const f=h - i; const q=1-f;
  let r=0,g=0,b=0;
  switch(i%6){
    case 0: r=1; g=f; b=0; break;
    case 1: r=q; g=1; b=0; break;
    case 2: r=0; g=1; b=f; break;
    case 3: r=0; g=q; b=1; break;
    case 4: r=f; g=0; b=1; break;
    case 5: r=1; g=0; b=q; break;
  }
  return [Math.round(r*255),Math.round(g*255),Math.round(b*255)];
}
export function palViridis(t){
  t=clamp(t,0,1);
  const r = Math.round(68 + 167*t - 39*t*t);
  const g = Math.round(1 + 198*t - 75*t*t);
  const b = Math.round(84 + 77*t + 90*t*t);
  return [clamp(r,0,255),clamp(g,0,255),clamp(b,0,255)];
}
export const PALETTES = {
  grayscale: palGrayscale,
  fire: palFire,
  ice: palIce,
  rainbow: palRainbow,
  viridis: palViridis,
};