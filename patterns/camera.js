function generateCameraPattern(context, time) {
    const { matrix, width, height, chars, videoElement } = context;
    
    if (!videoElement || !context.canvas) return;

    // Draw video frame to canvas
    context.canvasCtx.drawImage(videoElement, 0, 0, width, height);
    const imageData = context.canvasCtx.getImageData(0, 0, width, height);
    
    // Convert image data to ASCII
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const pixelIndex = (y * width + x) * 4;
            const r = imageData.data[pixelIndex];
            const g = imageData.data[pixelIndex + 1];
            const b = imageData.data[pixelIndex + 2];
            
            // Calculate brightness
            const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            
            // Map brightness to character
            const charIndex = Math.floor(brightness * (chars.length - 1));
            matrix[y][x] = chars[charIndex] || ' ';
        }
    }
} 