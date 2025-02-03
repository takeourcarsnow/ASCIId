function generateRipplePattern(context, time) {
    const { matrix, ripples, width, height, chars } = context;
    const tempMatrix = matrix.map(row => [...row]);

    // Removed mouse interaction code
    // const mouseX = context.mouseX; // Example of what might be removed
    // const mouseY = context.mouseY; // Example of what might be removed

    // Check if ripples exists and is an array
    if (Array.isArray(ripples)) {
        ripples.forEach(ripple => {
            for (let i = 0; i < height; i++) {
                for (let j = 0; j < width; j++) {
                    const dx = j - ripple.x;
                    const dy = i - ripple.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (Math.abs(distance - ripple.radius) < 5) {
                        const intensity = ripple.life * (1 - Math.abs(distance - ripple.radius) / 5);
                        const charIndex = Math.floor(intensity * (chars.length - 1));
                        tempMatrix[i][j] = chars[charIndex];
                    }
                }
            }
        });
    }

    // Return modified matrix instead of mutating context
    return tempMatrix;
} 