function generateRipplePattern(context, time) {
    const { matrix, ripples, width, height, chars } = context;
    const tempMatrix = matrix.map(row => [...row]);

    // Add new ripples on click
    if(context.isMouseDown && performance.now() - context.lastClickTime < 100) {
        const maxRadius = Math.max(width, height) * 0.8;
        const intensity = 0.5 + Math.random() * 0.5; // Random intensity
        ripples.push({
            x: context.mouseX,
            y: context.mouseY,
            radius: 0,
            maxRadius: maxRadius,
            speed: 0.5 + Math.random() * 0.3, // Random speed
            life: 1,
            intensity: intensity,
            startTime: performance.now(),
            charSet: chars.slice(Math.floor(Math.random() * (chars.length / 2))) // Random character set
        });
        context.lastClickTime = performance.now();
    }

    // Update existing ripples
    ripples.forEach(ripple => {
        // Speed ramp: slow down as ripple expands
        const age = (performance.now() - ripple.startTime) / 1000;
        const speedFactor = Math.max(0.1, 1 - (age * 0.2));
        ripple.radius += ripple.speed * speedFactor;
        
        // Calculate life based on radius and add fade-out effect
        const radiusRatio = ripple.radius / ripple.maxRadius;
        ripple.life = (1 - Math.pow(radiusRatio, 2)) * ripple.intensity;
        
        // Add ripple decay
        ripple.intensity *= 0.99;
        
        // Edge reflection
        if (ripple.x - ripple.radius < 0 || ripple.x + ripple.radius > width ||
            ripple.y - ripple.radius < 0 || ripple.y + ripple.radius > height) {
            ripple.speed *= 0.95; // Slow down when hitting edges
        }
        
        // Remove dead ripples
        if (ripple.radius > ripple.maxRadius * 1.1 || ripple.intensity < 0.1) {
            ripple.life = 0;
        }
    });

    // Filter out dead ripples
    context.ripples = ripples.filter(r => r.life > 0);

    // Render ripples with interaction
    if (Array.isArray(ripples)) {
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                let maxIntensity = 0;
                let selectedChar = ' ';
                
                // Find the strongest ripple effect at this position
                ripples.forEach(ripple => {
                    const dx = j - ripple.x;
                    const dy = i - ripple.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (Math.abs(distance - ripple.radius) < 8) {
                        const intensity = ripple.life * 
                            (1 - Math.pow(Math.abs(distance - ripple.radius) / 8, 2));
                        
                        if (intensity > maxIntensity) {
                            maxIntensity = intensity;
                            // Use different characters based on intensity
                            const charIndex = Math.floor(intensity * (ripple.charSet.length - 1));
                            selectedChar = ripple.charSet[charIndex];
                        }
                    }
                });
                
                // Blend with existing characters
                if (maxIntensity > 0.2) {
                    tempMatrix[i][j] = selectedChar;
                }
            }
        }
    }

    // Return modified matrix instead of mutating context
    return tempMatrix;
} 