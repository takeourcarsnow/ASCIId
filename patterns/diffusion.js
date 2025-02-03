function generateDiffusionPattern(context, time) {
    const { matrix, width, height, chars } = context;
    const SIMULATION_SIZE = 48;  // Reduced for better performance
    const DENSITY_DECAY = 0.92;   // Increased decay for smoother transitions
    const VELOCITY_DAMPING = 0.85; // More velocity damping
    const FORCE_INTENSITY = 0.3;   // Reduced force intensity
    const NOISE_SCALE = 0.05;     // Finer noise pattern

    if (!context.diffusionGrids) {
        context.diffusionGrids = {
            density: Array(SIMULATION_SIZE).fill().map(() => 
                Array(SIMULATION_SIZE).fill(0.1)), // Initial base density
            velocityX: Array(SIMULATION_SIZE).fill().map(() => 
                Array(SIMULATION_SIZE).fill(0)),
            velocityY: Array(SIMULATION_SIZE).fill().map(() => 
                Array(SIMULATION_SIZE).fill(0)),
            prevMouse: { x: -1, y: -1 }
        };
    }

    const { density, velocityX, velocityY, prevMouse } = context.diffusionGrids;
    const newDensity = density.map(row => [...row]);
    const newVelocityX = velocityX.map(row => [...row]);
    const newVelocityY = velocityY.map(row => [...row]);

    // Add stable base noise pattern
    for (let y = 0; y < SIMULATION_SIZE; y++) {
        for (let x = 0; x < SIMULATION_SIZE; x++) {
            const noise = Effects.perlinNoise(
                x * NOISE_SCALE, 
                y * NOISE_SCALE, 
                time * 0.05  // Slower noise evolution
            ) * 0.3;
            newDensity[y][x] = Math.max(0.1, newDensity[y][x] + noise);
        }
    }

    // Fluid simulation with momentum conservation
    for (let y = 0; y < SIMULATION_SIZE; y++) {
        for (let x = 0; x < SIMULATION_SIZE; x++) {
            // Velocity damping and density decay
            newVelocityX[y][x] *= VELOCITY_DAMPING;
            newVelocityY[y][x] *= VELOCITY_DAMPING;
            newDensity[y][x] *= DENSITY_DECAY;

            // Advection with boundary wrapping
            const srcX = (x - newVelocityX[y][x] + SIMULATION_SIZE) % SIMULATION_SIZE;
            const srcY = (y - newVelocityY[y][x] + SIMULATION_SIZE) % SIMULATION_SIZE;
            const x1 = Math.floor(srcX);
            const y1 = Math.floor(srcY);
            
            // Linear interpolation
            const xLerp = srcX - x1;
            const yLerp = srcY - y1;
            const x2 = (x1 + 1) % SIMULATION_SIZE;
            const y2 = (y1 + 1) % SIMULATION_SIZE;
            
            newDensity[y][x] += (
                density[y1][x1] * (1 - xLerp) * (1 - yLerp) +
                density[y1][x2] * xLerp * (1 - yLerp) +
                density[y2][x1] * (1 - xLerp) * yLerp +
                density[y2][x2] * xLerp * yLerp
            ) * 0.5;
        }
    }

    // Render to matrix with smooth transitions
    const DENSITY_SCALE = 1.2;
    const CHAR_RANGE = chars.length - 1;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const simX = Math.floor((x / width) * SIMULATION_SIZE);
            const simY = Math.floor((y / height) * SIMULATION_SIZE);
            const density = Math.min(1, newDensity[simY][simX] * DENSITY_SCALE);
            
            // Smooth character transition using eased value
            const eased = density * density * (3 - 2 * density); // Cubic easing
            const charIndex = Math.floor(eased * CHAR_RANGE);
            
            matrix[y][x] = chars[charIndex] || ' ';
        }
    }

    // Update simulation state
    context.diffusionGrids = {
        density: newDensity,
        velocityX: newVelocityX,
        velocityY: newVelocityY,
        prevMouse
    };
} 