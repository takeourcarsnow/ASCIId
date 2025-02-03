function generateShockwavePattern(context, time) {
    const { matrix, mouseX, mouseY, width, height, chars } = context;
    const centerX = mouseX >= 0 ? mouseX : width / 2;
    const centerY = mouseY >= 0 ? mouseY : height / 2;
    const waveSpeed = context.speed * 0.005;
    const waveRadius = time * 50 * waveSpeed;

    // Add click handling for new shockwaves
    if(context.isMouseDown && performance.now() - context.lastClickTime < 100) {
        context.ripples.push({
            x: context.mouseX,
            y: context.mouseY,
            radius: 0,
            maxRadius: Math.min(context.width, context.height) * 0.5,
            life: 1
        });
        context.lastClickTime = performance.now();
    }

    // Update existing ripple handling
    context.ripples.forEach(ripple => {
        ripple.radius += 2;
        ripple.life = 1 - (ripple.radius / ripple.maxRadius);
    });
    context.ripples = context.ripples.filter(r => r.life > 0);

    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            const dx = j - centerX;
            const dy = i - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const wave = Math.sin(distance * 0.1 - waveRadius) * 
                       Math.cos((Math.atan2(dy, dx) * 4) - time) * 
                       (1 - Math.min(distance / 50, 1));
            
            const charIndex = Math.floor((wave + 1) * (chars.length / 2));
            matrix[i][j] = chars[Math.abs(charIndex % chars.length)];
        }
    }
} 