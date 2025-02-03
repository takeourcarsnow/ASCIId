function generateFireworksPattern(context, time) {
    const { matrix, width, height, chars } = context;
    const SPEED = 0.5 + (context.speed / 100);
    const MAX_PARTICLES = 100;

    // Initialize fireworks system
    if (!context.fireworks) {
        context.fireworks = {
            particles: [],
            explosions: []
        };
    }

    // Add new explosion on click
    if(context.isMouseDown && performance.now() - context.lastClickTime > 500) {
        context.fireworks.explosions.push({
            x: context.mouseX,
            y: context.mouseY,
            life: 1,
            sparks: Array(20).fill().map(() => ({
                angle: Math.random() * Math.PI * 2,
                velocity: 0.5 + Math.random() * 2,
                life: 1
            }))
        });
        context.lastClickTime = performance.now();
    }

    // Update particles
    context.fireworks.particles = context.fireworks.particles
        .map(p => ({
            ...p,
            x: p.x + Math.cos(p.angle) * p.velocity * SPEED,
            y: p.y + Math.sin(p.angle) * p.velocity * SPEED,
            life: p.life - 0.01
        }))
        .filter(p => p.life > 0 && p.x >= 0 && p.x < width && p.y >= 0 && p.y < height);

    // Update explosions
    context.fireworks.explosions = context.fireworks.explosions.flatMap(explosion => {
        if(explosion.life <= 0) return [];
        return [{
            ...explosion,
            life: explosion.life - 0.02,
            sparks: explosion.sparks.map(spark => ({
                ...spark,
                x: explosion.x + Math.cos(spark.angle) * spark.velocity * explosion.life * 5,
                y: explosion.y + Math.sin(spark.angle) * spark.velocity * explosion.life * 5,
                life: spark.life - 0.02
            }))
        }];
    });

    // Clear matrix
    for(let y = 0; y < height; y++) {
        for(let x = 0; x < width; x++) {
            matrix[y][x] = ' ';
        }
    }

    // Draw particles
    context.fireworks.particles.forEach(p => {
        const x = Math.floor(p.x);
        const y = Math.floor(p.y);
        if(x >= 0 && x < width && y >= 0 && y < height) {
            matrix[y][x] = chars[Math.floor(Math.random() * chars.length)];
        }
    });

    // Draw explosions
    context.fireworks.explosions.forEach(explosion => {
        explosion.sparks.forEach(spark => {
            const x = Math.floor(spark.x);
            const y = Math.floor(spark.y);
            if(x >= 0 && x < width && y >= 0 && y < height) {
                matrix[y][x] = chars[Math.floor(Math.random() * chars.length)];
            }
        });
    });
} 