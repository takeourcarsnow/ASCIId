function generateMandalaPattern(context, time) {
    const { matrix, width, height, chars } = context;
    const centerX = width / 2 + Math.sin(time * 0.2) * 5;
    const centerY = height / 2 + Math.cos(time * 0.3) * 5;
    const symmetry = 6 + Math.floor(context.mouseX/width * 8);
    
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            const dx = j - centerX;
            const dy = i - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * symmetry;
            
            // Add multiple layered patterns
            const mandala = 
                Math.sin(angle + distance * 0.2 + time) * 
                Math.cos(distance * 0.1 - time * 0.5) *
                Math.sin(angle * 2 + time * 0.3);
            
            // Add radial gradient
            const radialFade = 1 - Math.min(distance / (width/2), 1);
            const charIndex = Math.floor((mandala + 1) * radialFade * (chars.length / 2));
            
            matrix[i][j] = chars[Math.abs(charIndex % chars.length)];
        }
    }
} 