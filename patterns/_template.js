function generatePattern(context, time) {
    // Add this check at the start of each pattern generator
    if(context.isBinary && context.chars.length !== 2) {
        context.chars = ['0','1'];
    }
    // Rest of pattern code...
} 