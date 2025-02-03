function generateSpiralPattern(context, time) {
    const { matrix, width, height, chars } = context;
    const centerX = width / 2 + Math.sin(time * 0.5) * 10; // Animated center
    const centerY = height / 2 + Math.cos(time * 0.5) * 10;
    const spinSpeed = 0.5 + (context.mouseX/width * 0.5);
    
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            const dx = j - centerX;
            const dy = i - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);
            
            // Dynamic spiral parameters
            const spiralValue = Math.sin(angle * 5 + distance * 0.1 * spinSpeed - time) *
                              Math.cos(distance * 0.1 + time * 0.5) *
                              (1 + (context.mouseY/height * 0.5));
            
            // Add distance-based fading
            const distanceFade = 1 - Math.min(distance / (width/2), 1);
            const normalized = (spiralValue + 1) / 2 * distanceFade;
            
            const charIndex = Math.floor(normalized * (chars.length - 1));
            matrix[i][j] = chars[charIndex] || chars[0];
        }
    }
} 