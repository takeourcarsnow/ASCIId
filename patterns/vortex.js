function generateVortexPattern(context, time) {
    const { matrix, width, height, chars, isBinary } = context;
    const centerX = width / 2;
    const centerY = height / 2;
    
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            const dx = j - centerX;
            const dy = i - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);
            
            // Calculate vortex pattern
            const vortexValue = Math.sin(angle * 3 + distance * 0.1 - time) *
                              Math.cos(distance * 0.1);
            
            // Normalize to 0-1 range
            const normalized = (vortexValue + 1) / 2;
            
            if(isBinary) {
                matrix[i][j] = normalized < 0.5 ? chars[0] : chars[1];
            } else {
                const charIndex = Math.floor(normalized * (chars.length - 1));
                matrix[i][j] = chars[charIndex] || chars[0];
            }
        }
    }
} 