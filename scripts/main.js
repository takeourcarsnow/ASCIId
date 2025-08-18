import { initUI, getCanvas, getViewer } from './ui.js';
import { initInput } from './input.js';
import { startRenderer } from './renderer.js';

initUI();

const canvas = getCanvas();
const viewer = getViewer();

initInput(canvas);
startRenderer(canvas, viewer);