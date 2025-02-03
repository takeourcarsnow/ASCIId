function generateRipplePattern(context, time) {
    const { matrix, width, height, chars } = context;
    
    // Initialize ripple state if it doesn't exist
    if (!context.ripples) {
        context.ripples = [];
        // Clear the matrix when ripple mode is first selected
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                matrix[y][x] = ' ';
            }
        }
    }

    // Handle mouse click to create new ripple
    if (context.isMouseDown && performance.now() - context.lastClickTime < 100) {
        context.ripples.push({
            x: context.mouseX,
            y: context.mouseY,
            radius: 0,
            // Set max radius to cover entire screen plus some margin
            maxRadius: Math.max(width, height) * 1.5,
            speed: 0.5 + Math.random() * 0.3, // Random speed
            life: 1,
            startTime: performance.now()
        });
        context.lastClickTime = performance.now();
    }

    // Update existing ripples with smooth ramping
    context.ripples.forEach(ripple => {
        // Speed ramp: slow down as ripple expands
        const age = (performance.now() - ripple.startTime) / 1000;
        const speedFactor = Math.max(0.1, 1 - (age * 0.2));
        ripple.radius += ripple.speed * speedFactor;
        
        // Calculate life based on radius and add fade-out effect
        const radiusRatio = ripple.radius / ripple.maxRadius;
        ripple.life = (1 - Math.pow(radiusRatio, 2));
    });
    context.ripples = context.ripples.filter(r => r.life > 0);

    // Create a temporary matrix to store the new frame
    const tempMatrix = new Array(height);
    for (let y = 0; y < height; y++) {
        tempMatrix[y] = new Array(width).fill(' ');
    }

    // Draw ripples with smooth intensity
    context.ripples.forEach(ripple => {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const dx = x - ripple.x;
                const dy = y - ripple.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Smooth ripple effect with intensity falloff
                if (Math.abs(distance - ripple.radius) < 8) {
                    const intensity = ripple.life * 
                        (1 - Math.pow(Math.abs(distance - ripple.radius) / 8, 2));
                    
                    if (intensity > 0.1) { // Lower threshold for more visible ripples
                        const charIndex = Math.floor(intensity * (chars.length - 1));
                        // Blend with existing characters
                        tempMatrix[y][x] = tempMatrix[y][x] === ' ' ? 
                            chars[charIndex] || chars[0] : 
                            tempMatrix[y][x];
                    }
                }
            }
        }
    });

    return tempMatrix;
} 