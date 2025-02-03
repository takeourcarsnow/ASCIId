function generateMandalaPattern(context, time) {
    const { matrix, width, height, chars } = context;
    const centerX = width / 2;
    const centerY = height / 2;
    
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            const dx = j - centerX;
            const dy = i - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * 6;
            
            const mandala = Math.sin(angle + distance * 0.2 + time) * 
                           Math.cos(distance * 0.1 - time * 0.5);
                           
            const charIndex = Math.floor((mandala + 1) * (chars.length / 2));
            matrix[i][j] = chars[Math.abs(charIndex % chars.length)];
        }
    }
} 