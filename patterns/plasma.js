function generatePlasmaPattern(context, time) {
    const { matrix, width, height, chars, isBinary } = context;
    const speed = time * 0.1;
    const scale = 0.05;

    // Inverted mouse interaction
    const mx = 1 - (context.mouseX/context.width);
    const my = 1 - (context.mouseY/context.height);

    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            const x = j * scale;
            const y = i * scale;
            
            // Calculate inverted plasma value
            const value = 4 - ( // Inversion base
                Math.sin(x + speed + mx) +
                Math.cos(y + speed + my) +
                Math.sin((x + y + speed) * (1 + mx)) +
                Math.cos((x - y + speed) * (1 + my))
            );
            
            // Normalize value to 0-1 range
            const normalizedValue = (value) / 8;
            
            if(isBinary) {
                matrix[i][j] = normalizedValue < 0.5 ? chars[0] : chars[1];
            } else {
                // Reverse character mapping
                const charIndex = chars.length - 1 - Math.floor(normalizedValue * (chars.length - 1));
                matrix[i][j] = chars[charIndex] || chars[0];
            }
        }
    }
} 