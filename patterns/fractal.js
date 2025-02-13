function generateFractalPattern(context, time) {
    const { matrix, width, height, chars } = context;
    const maxIterations = 30;
    const zoom = 1.0 / (1.0 + time * 0.01);
    
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            let zx = (j - width/2) * 0.03 * zoom;
            let zy = (i - height/2) * 0.03 * zoom;
            let iteration = 0;
            
            // Mandelbrot fractal calculation
            while (zx*zx + zy*zy < 4 && iteration < maxIterations) {
                const xtemp = zx*zx - zy*zy + (j - width/2) * 0.03 * zoom;
                zy = 2*zx*zy + (i - height/2) * 0.03 * zoom;
                zx = xtemp;
                iteration++;
            }
            
            // Inverted iteration mapping
            const invertedIteration = maxIterations - iteration;
            const charIndex = Math.floor((invertedIteration / maxIterations) * (chars.length - 1));
            
            matrix[i][j] = chars[charIndex] || chars[0];
        }
    }
} 