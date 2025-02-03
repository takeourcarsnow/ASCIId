function generateTunnelPattern(context, time) {
    const { matrix, width, height, chars } = context;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Removed mouse interaction code
    // const mouseX = context.mouseX; // Example of what might be removed
    // const mouseY = context.mouseY; // Example of what might be removed

    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            const dx = j - centerX;
            const dy = i - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);
            
            const tunnel = Math.sin(distance * 0.1 - time) +
                          Math.cos(angle * 3 + time * 0.5);
                          
            const charIndex = Math.floor((tunnel + 2) * (chars.length / 4));
            matrix[i][j] = chars[Math.abs(charIndex % chars.length)];
        }
    }
} 