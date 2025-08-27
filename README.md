# ASCII Raymarcher

A fast, mobile-optimized webapp for interactive 3D raymarching rendered as ASCII art in the browser. Features real-time controls for shape, lighting, surface noise, color, and performance, all rendered in a canvas using JavaScript and SDFs (Signed Distance Functions).

## Features
- **Interactive 3D ASCII rendering**: Choose from multiple shapes (sphere, box, torus, etc.) and control their size, rotation, and animation.
- **Lighting controls**: Adjust ambient, diffuse, specular, shininess, shadows, and ambient occlusion.
- **Surface noise**: Add animated procedural noise to surfaces.
- **ASCII & color**: Select ASCII presets, custom characters, color modes, palettes, and gamma.
- **Performance tuning**: Adaptive resolution, temporal anti-aliasing, FPS target, and more.
- **Mobile-friendly UI**: Responsive layout, touch controls, and fullscreen support.

## Demo
Open `index.html` in your browser. No build step required.

## File Structure
- `index.html` – Main HTML entry point
- `styles.css` – Responsive, modern CSS for layout and controls
- `scripts/`
  - `main.js` – App entry, initializes UI, input, and renderer
  - `renderer.js` – Core ASCII raymarching renderer
  - `sdf.js` – Signed Distance Functions for 3D shapes
  - `ui.js`, `input.js`, `state.js` – UI, input, and state management
  - `noise.js`, `palettes.js`, `utils.js` – Noise, color palettes, and math utilities

## Usage
1. Clone or download this repo.
2. Open `index.html` in any modern browser (desktop or mobile).
3. Use the controls to explore different shapes, lighting, and effects.

## Controls
- **Mouse/touch**: Drag to orbit, pinch/wheel to zoom
- **Keyboard**: WASD, QE to move, R to reset
- **Panel**: Adjust all rendering and scene parameters

## Technologies
- Vanilla JavaScript (ES6 modules)
- HTML5 Canvas
- CSS3 (responsive, dark/light mode)

## License
MIT

---

**Author:** [takeourcarsnow](https://github.com/takeourcarsnow)

Enjoy exploring 3D ASCII art!
