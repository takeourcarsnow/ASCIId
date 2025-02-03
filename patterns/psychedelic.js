function generatePsychedelicPattern(context, time) {
    const { matrix, width, height, chars } = context;
    const centerX = width / 2;
    const centerY = height / 2;
    
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            const dx = j - centerX;
            const dy = i - centerY;
            const angle = Math.atan2(dy, dx);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            const psychedelic = Math.sin(angle * 5 + distance * 0.1 + time) *
                              Math.cos(distance * 0.2 - time * 2) *
                              Math.sin(angle * 2 + time * 3);
            
            const charIndex = Math.floor((psychedelic + 1) * (chars.length / 2));
            matrix[i][j] = chars[Math.abs(charIndex % chars.length)];
        }
    }
} 