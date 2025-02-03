// This file can be deleted completely 

function generateRainPattern(context, time) {
    const { matrix, width, height, chars } = context;
    const DROP_SPACING = 3;
    const MAX_DROPS = Math.floor(width / DROP_SPACING);
    
    if (!context.rainDrops) {
        context.rainDrops = Array(MAX_DROPS).fill().map((_, i) => ({
            x: i * DROP_SPACING,
            y: -Math.random() * height,
            speed: 2 + Math.random() * 3,
            length: 5 + Math.floor(Math.random() * 10),
            life: 1
        }));
    }

    // Update drops
    context.rainDrops.forEach(drop => {
        drop.y += drop.speed * (context.speed / 50);
        if (drop.y > height + drop.length) {
            drop.y = -drop.length;
            drop.life = 1;
        }
        
        // Draw drop
        for (let i = 0; i < drop.length; i++) {
            const y = Math.floor(drop.y) - i;
            if (y >= 0 && y < height) {
                const intensity = 1 - (i / drop.length);
                const charIndex = Math.floor(intensity * (chars.length - 1));
                matrix[y][drop.x] = chars[charIndex];
            }
        }
    });
} 