function generateSpiralPattern(context, time) {
    const { matrix, width, height, chars } = context;
    const centerX = width / 2;
    const centerY = height / 2;
    
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            const dx = j - centerX;
            const dy = i - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);
            
            // Calculate spiral pattern
            const spiralValue = Math.sin(angle * 5 + distance * 0.05 - time) *
                              Math.cos(distance * 0.1 + time * 0.5) *
                              (1 + (context.mouseX/context.width * 0.5));
            
            // Normalize to 0-1 range
            const normalized = (spiralValue + 1) / 2;
            
            // Map to character index
            const charIndex = Math.floor(normalized * (chars.length - 1));
            matrix[i][j] = chars[charIndex] || chars[0];
        }
    }
} 