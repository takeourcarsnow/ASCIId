function generateMeteorsPattern(context, time) {
    const { matrix, width, height, chars } = context;
    const SPEED = 1.5 + (context.speed / 100);
    const MAX_METEORS = 15;

    if (!context.meteors) {
        context.meteors = Array(MAX_METEORS).fill().map(() => ({
            x: Math.random() * width * 1.2,
            y: -Math.random() * height * 0.5,
            speed: 2 + Math.random() * 3,
            trail: [],
            life: 1
        }));
    }

    // Update meteors with proper bounds checking
    context.meteors.forEach(meteor => {
        meteor.x += SPEED * 0.8;
        meteor.y += meteor.speed * 1.2;
        meteor.trail.push({ x: meteor.x, y: meteor.y });
        
        if (meteor.trail.length > 25) meteor.trail.shift();
        
        if (meteor.y > height + 100 || meteor.x > width + 100) {
            meteor.x = Math.random() * -50;
            meteor.y = -Math.random() * 50;
            meteor.trail = [];
        }
    });

    // Improved trail rendering
    context.meteors.forEach(meteor => {
        meteor.trail.forEach((pos, i) => {
            const x = Math.floor(pos.x);
            const y = Math.floor(pos.y);
            if(x >= 0 && x < width && y >= 0 && y < height) {
                const intensity = 1 - (i / meteor.trail.length);
                const charIndex = Math.floor(intensity * (chars.length - 1));
                matrix[y][x] = chars[charIndex] || ' ';
            }
        });
    });

    // Add click interaction
    if(context.isMouseDown) {
        context.meteors.push({
            x: context.mouseX,
            y: context.mouseY,
            speed: 1 + Math.random() * 3,
            trail: [],
            life: 1
        });
    }
} 