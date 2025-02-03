class Effects {
    static applyDistortionEffect(matrix, width, height, distortion, time) {
        if (distortion <= 0) return matrix;
        const tempMatrix = new Array(height);
        
        // Pre-calculate noise samples
        const noiseSamples = new Array(width * height);
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                noiseSamples[i * width + j] = Effects.perlinNoise(i * 0.1, j * 0.1, time) * distortion * 3;
            }
        }

        for (let i = 0; i < height; i++) {
            tempMatrix[i] = new Array(width);
            for (let j = 0; j < width; j++) {
                const sourceX = Math.floor(j + noiseSamples[i * width + j]);
                tempMatrix[i][j] = (sourceX >= 0 && sourceX < width) 
                    ? matrix[i][sourceX] 
                    : ' ';
            }
        }
        return tempMatrix;
    }

    static fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    static perlinNoise(x, y, z) {
        // Implementation of Perlin noise would go here
        return Math.random(); // Placeholder for actual implementation
    }
} 