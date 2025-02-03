function generateCellularPattern(context) {
    const { width, height, cellularGrid, speed } = context;
    
    // Add at the beginning
    const isBinary = context.chars.length === 2 && context.chars.includes('0') && context.chars.includes('1');
    const activeChars = isBinary ? ['0', '1'] : context.chars;
    
    // Create working grid reference
    let grid = cellularGrid || [];
    
    // Initialize grid if empty
    if (grid.length === 0) {
        grid = Array(height).fill().map(() => 
            Array(width).fill().map(() => 
                Math.random() > 0.5 ? activeChars[Math.floor(Math.random() * activeChars.length)] : ' '
            )
        );
    }

    // Create new grid with border checks
    const newGrid = Array(height).fill().map((_, i) => 
        Array(width).fill().map((_, j) => {
            if (i === 0 || j === 0 || i === height-1 || j === width-1) return ' ';
            return grid[i][j];
        })
    );

    // Calculate next generation and track changes
    let changes = 0;
    for (let i = 1; i < height-1; i++) {
        for (let j = 1; j < width-1; j++) {
            let neighbors = 0;
            for (let di = -1; di <= 1; di++) {
                for (let dj = -1; dj <= 1; dj++) {
                    if (di === 0 && dj === 0) continue;
                    const ni = i + di;
                    const nj = j + dj;
                    if (grid[ni] && grid[ni][nj] !== ' ') neighbors++;
                }
            }
            
            const currentCell = grid[i][j];
            const newCell = (currentCell !== ' ')
                ? (neighbors === 2 || neighbors === 3) ? currentCell : ' '
                : (neighbors === 3) ? activeChars[Math.floor(Math.random() * activeChars.length)] : ' ';
            
            if (newCell !== currentCell) changes++;
            newGrid[i][j] = newCell;
        }
    }

    // Calculate grid density
    let liveCells = 0;
    for (let i = 1; i < height-1; i++) {
        for (let j = 1; j < width-1; j++) {
            if (newGrid[i][j] !== ' ') liveCells++;
        }
    }
    const density = liveCells / ((width - 2) * (height - 2));

    // Speed-adaptive parameters
    const speedFactor = speed / 100;
    const newLifeRate = 0.01 + 0.04 * speedFactor;
    const decayRate = 0.01 + 0.04 * speedFactor;

    // Add structured new life
    const stabilityThreshold = width * height * 0.008; // Slightly lower threshold
    if (changes < stabilityThreshold) {
        const newLifeCount = Math.floor(width * height * newLifeRate);
        for (let n = 0; n < newLifeCount; n++) {
            const x = Math.floor(Math.random() * (width - 2)) + 1;
            const y = Math.floor(Math.random() * (height - 2)) + 1;
            // Only add life in areas with some existing neighbors
            if (newGrid[y][x] === ' ' && Math.random() < 0.7) {
                newGrid[y][x] = activeChars[Math.floor(Math.random() * activeChars.length)];
            }
        }
    }

    // Gentle decay mechanism
    if (density > 0.45) { // Slightly lower density threshold
        const decayCount = Math.floor(width * height * decayRate);
        for (let n = 0; n < decayCount; n++) {
            const x = Math.floor(Math.random() * (width - 2)) + 1;
            const y = Math.floor(Math.random() * (height - 2)) + 1;
            if (newGrid[y][x] !== ' ' && Math.random() < 0.8) {
                newGrid[y][x] = ' ';
            }
        }
    }

    // Targeted perturbations with neighbor check
    const perturbationRate = 0.00025; // Balanced rate
    const perturbationCount = Math.floor(width * height * perturbationRate);
    for (let n = 0; n < perturbationCount; n++) {
        const x = Math.floor(Math.random() * (width - 2)) + 1;
        const y = Math.floor(Math.random() * (height - 2)) + 1;
        
        // Allow 30% of perturbations in isolated areas
        const allowIsolated = Math.random() < 0.3;
        let hasNeighbor = false;
        
        if (!allowIsolated) {
            // Check for existing neighbors
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (dx === 0 && dy === 0) continue;
                    if (newGrid[y + dy]?.[x + dx] !== ' ') {
                        hasNeighbor = true;
                        break;
                    }
                }
                if (hasNeighbor) break;
            }
        }

        if (allowIsolated || hasNeighbor) {
            if (newGrid[y][x] === ' ') {
                newGrid[y][x] = activeChars[Math.floor(Math.random() * activeChars.length)];
            } else if (Math.random() < 0.15) { // Controlled removal
                newGrid[y][x] = ' ';
            }
        }
    }

    // Add click handling
    if(context.isMouseDown && performance.now() - context.lastClickTime < 100) {
        const x = context.mouseX;
        const y = context.mouseY;
        if(x > 1 && x < context.width-1 && y > 1 && y < context.height-1) {
            newGrid[y][x] = activeChars[Math.floor(Math.random() * activeChars.length)];
            for(let dy = -1; dy <= 1; dy++) {
                for(let dx = -1; dx <= 1; dx++) {
                    if(newGrid[y+dy][x+dx] === ' ') {
                        newGrid[y+dy][x+dx] = activeChars[Math.floor(Math.random() * activeChars.length)];
                    }
                }
            }
        }
    }

    return {
        newGrid: newGrid,
        newMatrix: newGrid.map(row => [...row])
    };
} 