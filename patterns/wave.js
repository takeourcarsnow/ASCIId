function generateWavePattern(context, time) {
    const { matrix, width, height, chars, isBinary } = context;
    const waveParams = {
        baseFreq: 0.25 + (context.mouseX/context.width * 0.1),
        colorShift: time * (0.1 + (context.mouseY/context.height * 0.2)),
        depth: 3 // Add depth effect
    };

    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            // Add perspective distortion
            const depthFactor = 1 - (i / height) * waveParams.depth;
            
            // Calculate multiple wave components with depth
            const wave1 = Math.sin(j * waveParams.baseFreq * depthFactor - time);
            const wave2 = Math.cos(i * waveParams.baseFreq * 0.8 * depthFactor + time * 0.7);
            const wave3 = Math.sin((i + j) * 0.1 * depthFactor - time * 1.2);
            
            // Add mouse interaction
            const mouseDist = Math.hypot(j - context.mouseX, i - context.mouseY);
            const mouseInfluence = Math.max(0, 1 - mouseDist/50);
            
            const combined = (wave1 + wave2 + wave3 + mouseInfluence) / 4;
            const normalized = (combined + 1) / 2;
            
            // Dynamic character mapping
            const charIndex = Math.floor(normalized * (chars.length - 1));
            matrix[i][j] = isBinary ? 
                (normalized < 0.5 ? chars[0] : chars[1]) : 
                chars[charIndex];
        }
    }
} 