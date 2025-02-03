function generateSolarPattern(context, time) {
    const { matrix, width, height, chars } = context;
    const centerX = width / 2;
    const centerY = height / 2;
    const SOLAR_RADIUS = Math.min(width, height) * 0.3;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dx = x - centerX;
            const dy = y - centerY;
            const distance = Math.sqrt(dx*dx + dy*dy);
            const angle = Math.atan2(dy, dx);
            
            // Solar flare pattern
            const flare = Math.sin(angle * 8 + time) * 
                        Math.cos(distance * 0.1 - time * 2) *
                        (1 - Math.min(distance / SOLAR_RADIUS, 1));
            
            // Magnetic loops
            const loop = Math.sin(angle * 3 + Math.cos(distance * 0.2 + time)) *
                       Math.pow(Math.cos(distance * 0.05), 2);

            const combined = (flare + loop) / 2;
            const charIndex = Math.floor((combined + 1) * (chars.length / 2));
            matrix[y][x] = chars[Math.abs(charIndex % chars.length)];
        }
    }
} 