function generateWavePattern(context, time) {
    const { matrix, width, height, chars, isBinary } = context;
    const mouseInfluence = context.isMouseDown ? 2 : 1;
    const waveParams = {
        baseFreq: 0.25 + (context.mouseX/context.width * 0.1),
        colorShift: time * (0.1 + (context.mouseY/context.height * 0.2))
    };

    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            // Calculate multiple wave components
            const wave1 = Math.sin(j * waveParams.baseFreq - time);
            const wave2 = Math.cos(i * waveParams.baseFreq * 0.8 + time * 0.7);
            const wave3 = Math.sin((i + j) * 0.1 - time * 1.2);
            
            // Combine waves with different weights
            const combined = (wave1 * mouseInfluence + wave2 * 0.7 + wave3 * 0.5) / 2.2;
            
            // Normalize to 0-1 range
            const normalized = (combined + 1) / 2;
            
            // Replace charIndex calculation with:
            if(isBinary) {
                matrix[i][j] = normalized < 0.5 ? chars[0] : chars[1];
            } else {
                const charIndex = Math.floor(normalized * (chars.length - 1));
                matrix[i][j] = chars[charIndex] || chars[0];
            }
        }
    }
} 