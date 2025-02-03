mpfunction generateMatrixPattern(context, time) {
    const { matrix, matrixColumns, matrixConfig, width, height, chars } = context;
    const { MAX_TRAIL_LENGTH, BASE_SPEED, DROP_VARIANCE, MAX_SPEED, SPARKLE_RATE } = matrixConfig;
    
    // Use first 20% of current chars for head, next 50% for trail, remaining for glow
    const HEAD_CHARS = chars.slice(0, Math.floor(chars.length * 0.2)) || ['@'];
    const TRAIL_CHARS = chars.slice(Math.floor(chars.length * 0.2), Math.floor(chars.length * 0.7)) || ['*'];
    const GLOW_CHARS = chars.slice(Math.floor(chars.length * 0.7)) || ['Æ'];

    const speed = BASE_SPEED + (context.speed / 100) * MAX_SPEED;
    const dropInterval = 1000 / (speed * 6);

    matrixColumns.forEach((col, x) => {
        const now = performance.now();
        processDrops(
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

    // Initialize matrix rows if they don't exist
    for (let i = 0; i < height; i++) {
        if (!matrix[i]) {
            matrix[i] = [];
        }
        for (let j = 0; j < width; j++) {
            matrix[i][j] = ' ';
        }
    }

    matrixColumns.forEach((col, x) => {
        col.drops.forEach(drop => {
            const drift = Math.sin(time * 0.3 + x * 0.5 + drop.progress * 2) * 0.3;
            const baseY = Math.floor(drop.y);
            const drawX = Math.min(width - 1, Math.max(0, x + Math.round(drift)));

            // Add bounds checking for matrix access
            if (baseY >= 0 && baseY < height && drawX >= 0 && drawX < width) {
                if (!matrix[baseY]) matrix[baseY] = [];
                matrix[baseY][drawX] = Math.random() < SPARKLE_RATE ? 
                    GLOW_CHARS[Math.floor(Math.random() * GLOW_CHARS.length)] :
                    drop.headChar;
            }

            for (let i = 1; i < MAX_TRAIL_LENGTH; i++) {
                const y = baseY - i;
                if (y >= 0 && y < height && drawX >= 0 && drawX < width) {
                    if (!matrix[y]) matrix[y] = [];
                    const intensity = 1 - (i / MAX_TRAIL_LENGTH);
                    matrix[y][drawX] = intensity > 0.2 ? drop.trail[i] : ' ';
                }
            }
        });
    });

    // Add near drop processing:
    if(context.isMouseDown) {
        const influenceCols = 5;
        const centerX = context.mouseX;
        const centerY = context.mouseY;
        
        for(let x = centerX - influenceCols; x <= centerX + influenceCols; x++) {
            if(x >= 0 && x < context.width) {
                const col = context.matrixColumns[x];
                if(col.drops.length < context.matrixConfig.MAX_CONCURRENT_DROPS) {
                    col.drops.push(createNewDrop(
                        HEAD_CHARS,
                        TRAIL_CHARS,
                        matrixConfig.MAX_TRAIL_LENGTH
                    ));
                }
            }
        }
    }
}

// Fix circular dependency in drop pool initialization
function createNewDrop(HEAD_CHARS, TRAIL_CHARS, MAX_TRAIL_LENGTH) {
    return {
        y: -MAX_TRAIL_LENGTH,
        progress: 0,
        headChar: HEAD_CHARS[Math.random() * HEAD_CHARS.length | 0],
        trail: Array(MAX_TRAIL_LENGTH).fill().map(() => 
            TRAIL_CHARS[Math.floor(Math.random() * TRAIL_CHARS.length)]
        )
    };
}

// Initialize pool with concrete implementation
let poolIndex = 0;
const DROP_POOL = Array(1000).fill().map(() => 
    createNewDrop(['@'], ['*'], MATRIX_CONFIG.MAX_TRAIL_LENGTH)
);

// Modified processDrops with proper variable access
function processDrops(col, now, dropInterval, HEAD_CHARS, TRAIL_CHARS, matrixConfig, speed, height) {
    const { DROP_VARIANCE, MAX_TRAIL_LENGTH, MAX_CONCURRENT_DROPS } = matrixConfig;
    
    if (now - col.lastDrop > dropInterval * (1 + Math.random() * DROP_VARIANCE)) {
        if (col.drops.length < MAX_CONCURRENT_DROPS) {
            col.drops.push(createNewDrop(HEAD_CHARS, TRAIL_CHARS, MAX_TRAIL_LENGTH));
        }
        col.lastDrop = now;
    }

    // Keep the rest of the processing logic the same
    let activeCount = 0;
    for (let d = 0; d < col.drops.length; d++) {
        const drop = col.drops[d];
        drop.y += speed * (1 + drop.progress * 0.2);
        drop.progress += 0.0003;
        
        if (drop.y < height + MAX_TRAIL_LENGTH) {
            col.drops[activeCount++] = drop;
        }
    }
    col.drops.length = activeCount;
} 