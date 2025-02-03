function generateBinaryPattern(context, time) {
    const { matrix, width, height, chars } = context;
    const speed = context.speed * 0.05;
    const binaryChars = ['0', '1'];

    if (!context.binaryColumns) {
        context.binaryColumns = Array(width).fill().map(() => ({
            y: -Math.random() * height,
            speed: speed * (0.5 + Math.random() * 0.5),
            value: binaryChars[Math.floor(Math.random() * 2)]
        }));
    }

    for (let j = 0; j < width; j++) {
        const column = context.binaryColumns[j];
        column.y += column.speed;
        if (column.y > height) {
            column.y = -Math.random() * height;
            column.speed = speed * (0.5 + Math.random() * 0.5);
            column.value = binaryChars[Math.floor(Math.random() * 2)];
        }

        const y = Math.floor(column.y);
        if (y >= 0 && y < height) {
            matrix[y][j] = column.value;
        }
    }
} 