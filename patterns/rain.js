function generateRainPattern(context, time) {
    const { matrix, matrixColumns, matrixConfig, width, height, chars } = context;
    const { MAX_TRAIL_LENGTH, BASE_SPEED, DROP_VARIANCE, MAX_SPEED } = matrixConfig;
    
    // Use first 30% of chars for head, 70% for trail
    const HEAD_CHARS = chars.slice(0, Math.floor(chars.length * 0.3)) || ['@'];
    const TRAIL_CHARS = chars.slice(Math.floor(chars.length * 0.3)) || ['·'];
    
    const speed = BASE_SPEED + (context.speed / 100) * MAX_SPEED * 1.5; // 50% faster than matrix
    const dropInterval = 1000 / (speed * 8);

    matrixColumns.forEach((col, x) => {
        const now = performance.now();
        processRainDrops(
            col, 
            now, 
            dropInterval, 
            HEAD_CHARS, 
            TRAIL_CHARS, 
            matrixConfig,
            speed,
            height
        );
    });

    // Initialize matrix
    for (let i = 0; i < height; i++) {
        if (!matrix[i]) matrix[i] = [];
        for (let j = 0; j < width; j++) {
            matrix[i][j] = ' ';
        }
    }

    // Draw drops with less trail than matrix
    matrixColumns.forEach((col, x) => {
        col.drops.forEach(drop => {
            const baseY = Math.floor(drop.y);
            if (baseY >= 0 && baseY < height) {
                matrix[baseY][x] = drop.headChar;
            }

            // Shorter trail than matrix
            for (let i = 1; i < MAX_TRAIL_LENGTH/2; i++) {
                const y = baseY - i;
                if (y >= 0 && y < height) {
                    matrix[y][x] = drop.trail[i] || ' ';
                }
            }
        });
    });

    // Add click interaction
    if(context.isMouseDown) {
        const centerX = context.mouseX;
        for(let x = centerX - 2; x <= centerX + 2; x++) {
            if(x >= 0 && x < width) {
                const col = matrixColumns[x];
                if(col.drops.length < matrixConfig.MAX_CONCURRENT_DROPS) {
                    col.drops.push(createRainDrop(HEAD_CHARS, TRAIL_CHARS, MAX_TRAIL_LENGTH));
                }
            }
        }
    }
}

function createRainDrop(HEAD_CHARS, TRAIL_CHARS, MAX_TRAIL_LENGTH) {
    return {
        y: -MAX_TRAIL_LENGTH,
        progress: 0,
        headChar: HEAD_CHARS[Math.random() * HEAD_CHARS.length | 0],
        trail: Array(MAX_TRAIL_LENGTH).fill().map(() => 
            TRAIL_CHARS[Math.floor(Math.random() * TRAIL_CHARS.length)]
        )
    };
}

function processRainDrops(col, now, dropInterval, HEAD_CHARS, TRAIL_CHARS, matrixConfig, speed, height) {
    const { DROP_VARIANCE, MAX_TRAIL_LENGTH, MAX_CONCURRENT_DROPS } = matrixConfig;
    
    if (now - col.lastDrop > dropInterval * (1 + Math.random() * DROP_VARIANCE)) {
        if (col.drops.length < MAX_CONCURRENT_DROPS) {
            col.drops.push(createRainDrop(HEAD_CHARS, TRAIL_CHARS, MAX_TRAIL_LENGTH));
        }
        col.lastDrop = now;
    }

    let activeCount = 0;
    for (let d = 0; d < col.drops.length; d++) {
        const drop = col.drops[d];
        drop.y += speed * 1.2; // Faster fall rate
        drop.progress += 0.0005;
        
        if (drop.y < height + MAX_TRAIL_LENGTH) {
            col.drops[activeCount++] = drop;
        }
    }
    col.drops.length = activeCount;
} 