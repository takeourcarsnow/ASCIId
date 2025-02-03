function generateMatrixPattern(context, time) {
    const { matrix, width, height, chars } = context;
    
    // Ensure matrix is properly initialized
    if (!matrix || matrix.length !== height || matrix[0].length !== width) {
        context.matrix = Array(height).fill().map(() => Array(width).fill(' '));
    }

    // Initialize matrix columns if they don't exist
    if (!context.matrixColumns) {
        context.matrixColumns = Array(width).fill().map(() => ({
            drops: [],
            lastDrop: performance.now() - Math.random() * 1000
        }));
    }

    // Use custom characters if available, fallback to matrix config
    const headChars = chars.length > 1 ? chars : MATRIX_CONFIG.HEAD_CHARS;
    const trailChars = chars.length > 1 ? chars : MATRIX_CONFIG.TRAIL_CHARS;

    // Clear the screen when first entering Matrix mode
    if (context.firstMatrixFrame) {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                matrix[y][x] = ' ';
            }
        }
        context.firstMatrixFrame = false;
    }

    // Update each column
    context.matrixColumns.forEach((column, x) => {
        // Add new drops randomly, using speed parameter
        if (Math.random() < 0.02 * (context.speed / 50) && 
            column.drops.length < MATRIX_CONFIG.MAX_CONCURRENT_DROPS) {
            column.drops.push({
                y: -Math.random() * 10,
                speed: MATRIX_CONFIG.BASE_SPEED * (context.speed / 50) + 
                      Math.random() * MATRIX_CONFIG.DROP_VARIANCE,
                headChar: headChars[Math.floor(Math.random() * headChars.length)],
                trail: Array(MATRIX_CONFIG.MAX_TRAIL_LENGTH).fill().map(() => 
                    trailChars[Math.floor(Math.random() * trailChars.length)]
                )
            });
        }

        // Update and draw drops
        column.drops.forEach((drop, i) => {
            // Update position using speed parameter
            drop.y += drop.speed * (context.speed / 50);
            
            // Draw head character with bounds checking
            const y = Math.floor(drop.y);
            if (y >= 0 && y < height && x >= 0 && x < width) {
                matrix[y][x] = drop.headChar;
            }

            // Draw trail with bounds checking
            for (let t = 1; t < drop.trail.length; t++) {
                const trailY = y - t;
                if (trailY >= 0 && trailY < height && x >= 0 && x < width) {
                    const intensity = 1 - (t / drop.trail.length);
                    matrix[trailY][x] = drop.trail[t];
                }
            }

            // Remove drops that have fallen off screen
            if (drop.y > height + drop.trail.length) {
                column.drops.splice(i, 1);
            }
        });
    });
} 