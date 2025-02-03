// Add these constants at the top of the file
const MIN_DENSITY = 0.1; // Minimum density threshold
const MAX_DENSITY = 0.6; // Maximum density threshold
const REGENERATION_RATE = 0.02; // Rate of new cell generation
const STABILITY_THRESHOLD = 0.01; // Density change threshold for stability

function generateCellularPattern(context) {
    const { width, height, cellularGrid, speed } = context;
    
    // Add at the beginning
    const isBinary = context.chars.length === 2 && context.chars.includes('0') && context.chars.includes('1');
    const activeChars = isBinary ? ['0', '1'] : context.chars;
    
    // Create working grid reference with proper initialization
    let grid = cellularGrid || [];
    
    // Initialize grid if empty or if dimensions have changed
    if (grid.length === 0 || grid.length !== height || grid[0].length !== width) {
        grid = Array(height).fill().map(() => 
            Array(width).fill().map(() => 
                Math.random() > 0.5 ? activeChars[Math.floor(Math.random() * activeChars.length)] : ' '
            )
        );
    }

    // Create new grid with safe boundary checks
    const newGrid = Array(height).fill().map((_, i) => 
        Array(width).fill().map((_, j) => {
            // Safe boundary check
            if (i <= 0 || j <= 0 || i >= height-1 || j >= width-1) return ' ';
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
                    // Add safe array access
                    if (grid[ni] && grid[ni][nj] && grid[ni][nj] !== ' ') {
                        neighbors++;
                    }
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

    // Add density-based regeneration
    if (density < MIN_DENSITY) {
        const regenerationCount = Math.floor(width * height * REGENERATION_RATE);
        for (let n = 0; n < regenerationCount; n++) {
            const x = Math.floor(Math.random() * (width - 2)) + 1;
            const y = Math.floor(Math.random() * (height - 2)) + 1;
            
            // Only regenerate in areas with existing cells
            let hasNeighbor = false;
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
            
            if (hasNeighbor) {
                // Use the most common neighbor character instead of random
                const neighborChars = [];
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (dx === 0 && dy === 0) continue;
                        const char = newGrid[y + dy]?.[x + dx];
                        if (char && char !== ' ') {
                            neighborChars.push(char);
                        }
                    }
                }
                
                if (neighborChars.length > 0) {
                    // Get the most frequent character
                    const charCounts = neighborChars.reduce((acc, char) => {
                        acc[char] = (acc[char] || 0) + 1;
                        return acc;
                    }, {});
                    
                    const mostCommonChar = Object.keys(charCounts).reduce((a, b) => 
                        charCounts[a] > charCounts[b] ? a : b
                    );
                    
                    newGrid[y][x] = mostCommonChar;
                }
            }
        }
    }

    // Add controlled decay when density is too high
    if (density > MAX_DENSITY) {
        const decayCount = Math.floor(width * height * 0.01);
        for (let n = 0; n < decayCount; n++) {
            const x = Math.floor(Math.random() * (width - 2)) + 1;
            const y = Math.floor(Math.random() * (height - 2)) + 1;
            if (newGrid[y][x] !== ' ' && Math.random() < 0.5) {
                newGrid[y][x] = ' ';
            }
        }
    }

    // Add continuous perturbation
    const perturbationRate = 0.0005;
    const perturbationCount = Math.floor(width * height * perturbationRate);
    for (let n = 0; n < perturbationCount; n++) {
        const x = Math.floor(Math.random() * (width - 2)) + 1;
        const y = Math.floor(Math.random() * (height - 2)) + 1;
        
        // Only perturb cells with neighbors
        let hasNeighbor = false;
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
        
        if (hasNeighbor) {
            const flipProbability = density < MIN_DENSITY ? 0.8 : 0.2;
            if (Math.random() < flipProbability) {
                newGrid[y][x] = newGrid[y][x] === ' ' 
                    ? activeChars[0] // Use the first character instead of random
                    : ' ';
            }
        }
    }

    // Add click handling
    if(context.isMouseDown && performance.now() - context.lastClickTime < 100) {
        const x = Math.max(1, Math.min(context.mouseX, context.width-2));
        const y = Math.max(1, Math.min(context.mouseY, context.height-2));
        
        newGrid[y][x] = activeChars[Math.floor(Math.random() * activeChars.length)];
        for(let dy = -1; dy <= 1; dy++) {
            for(let dx = -1; dx <= 1; dx++) {
                const ny = y + dy;
                const nx = x + dx;
                if (ny >= 1 && ny < height-1 && nx >= 1 && nx < width-1) {
                    if(newGrid[ny][nx] === ' ') {
                        newGrid[ny][nx] = activeChars[Math.floor(Math.random() * activeChars.length)];
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