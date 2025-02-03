function generateInterferencePattern(context, time) {
    const { matrix, width, height, chars, isBinary } = context;
    const waveCount = 5;
    const baseFrequency = 0.15;
    
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            let combined = 0;
            
            // Generate multiple wave patterns
            for (let w = 0; w < waveCount; w++) {
                const frequency = baseFrequency * (w + 1);
                const speed = 0.5 + w * 0.1;
                const amplitude = 1 - w/waveCount;
                
                // Calculate wave components
                const xWave = Math.sin(j * frequency + time * speed);
                const yWave = Math.cos(i * frequency * 0.8 - time * speed * 0.7);
                const diagonalWave = Math.sin((j + i) * frequency * 0.5 + time * speed * 0.5);
                
                // Combine waves
                combined += (xWave + yWave + diagonalWave) * amplitude;
            }
            
            // Normalize to 0-1 range
            const normalized = (combined / waveCount + 1) / 2;
            
            if(isBinary) {
                matrix[i][j] = normalized < 0.5 ? chars[0] : chars[1];
            } else {
                const charIndex = Math.floor(normalized * (chars.length - 1));
                matrix[i][j] = chars[charIndex] || chars[0];
            }
        }
    }
} 