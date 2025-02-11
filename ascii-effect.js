class ASCIIEffect {
    constructor() {
        this.setupDOM();
        this.setupConfig();
        this.initializeDropdown();
        this.initializeCharSelector();
        setupEventHandlers(this);
        
        // Performance optimizations
        this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        this.frameSkip = this.isMobile ? 2 : 1;
        this.lastRenderTime = 0;
        this.minRenderInterval = this.isMobile ? 50 : 16;
        
        // Start animation loop
        this.animate();
    }

    setupDOM() {
        this.container = document.getElementById('ascii-container');
        this.fpsDisplay = document.querySelector('.fps');
        this.resolutionDisplay = document.querySelector('.resolution');
        this.modeDisplay = document.querySelector('.mode-display');
        this.modeNameDisplay = document.querySelector('.mode-name');
    }

    setupConfig() {
        this.modes = MODES;
        this.charSets = CHAR_SETS;
        this.currentCharSet = 0;
        this.currentMode = 8;
        this.autoMode = false;
        this.frame = 0;
        this.lastTime = 0;
        this.fps = 0;
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        this.speed = 10; // Changed from 20 to 10
        this.charSize = 20;
        this.maxCharSize = 50;
        this.rippleStrength = 1;
        this.noiseScale = 0.05;
        this.noiseOffset = 0;
        this.mouseX = -1;
        this.mouseY = -1;
        this.isMouseDown = false;
        this.lastClickTime = 0;
        this.clickIntensity = 0;
        this.ripples = [];
        this.cellularDensity = 0.5;
        this.cellularIterations = 5;
        this.cellularThreshold = 0.5;
        this.cellularSmoothing = 0.5;
        this.matrixColumns = null;
        this.firstMatrixFrame = true;
        this.updateDimensions();
        this.initMatrix();
    }

    initializeDropdown() {
        const selector = document.getElementById('mode-selector');
        selector.innerHTML = this.modes
            .map((mode, index) => `<option value="${index}">${mode}</option>`)
            .join('');
        selector.value = this.currentMode;
    }

    initializeCharSelector() {
        const selector = document.getElementById('char-selector');
        selector.innerHTML = this.charSets
            .map((set, index) => `<option value="${index}">${set.name}</option>`)
            .join('');
        selector.value = this.currentCharSet;
    }

    updateDimensions() {
        const scale = this.isMobile ? 2 : 1;
        this.fontSize = this.charSize;
        this.charWidth = this.charSize * 0.6;
        
        // Calculate dimensions based on container size
        const containerWidth = window.innerWidth;
        const containerHeight = window.innerHeight;
        
        // Calculate number of columns and rows
        this.width = Math.ceil(containerWidth / (this.charWidth * scale));
        this.height = Math.ceil(containerHeight / (this.fontSize * scale));
        
        // Update container style
        this.container.style.fontSize = `${this.fontSize}px`;
        this.container.style.lineHeight = `${this.fontSize}px`;
        this.container.style.width = '100vw';
        this.container.style.height = '100vh';
        
        this.initMatrix();
    }

    resetPatternData() {
        switch(this.modes[this.currentMode]) {
            case 'Cellular':
                this.cellularGrid = null;
                break;
            case 'Matrix':
                this.matrixColumns = null;
                this.firstMatrixFrame = true;
                break;
            // Add other pattern resets as needed
        }
    }

    createMatrixColumns() {
        const headChars = this.charSets[this.currentCharSet].chars.length > 1 ? 
            this.charSets[this.currentCharSet].chars : MATRIX_CONFIG.HEAD_CHARS;
        const trailChars = this.charSets[this.currentCharSet].chars.length > 1 ? 
            this.charSets[this.currentCharSet].chars : MATRIX_CONFIG.TRAIL_CHARS;

        return Array(this.width).fill().map((_, i) => ({
            drops: Array(3).fill().map(() => ({
                y: -Math.random() * 30,
                progress: Math.random(),
                headChar: headChars[Math.floor(Math.random() * headChars.length)],
                trail: Array(MATRIX_CONFIG.MAX_TRAIL_LENGTH).fill().map(() => 
                    trailChars[Math.floor(Math.random() * trailChars.length)]
                )
            })),
            lastDrop: performance.now() - i * 10
        }));
    }

    initMatrix() {
        this.matrix = Array(this.height).fill().map(() => Array(this.width).fill(' '));
    }

    addRipple(x, y) {
        const maxRadius = Math.max(this.width, this.height) * 0.5;
        // this.ripples.push(new Ripple(x, y, maxRadius));
    }

    generatePattern() {
        const time = this.frame * this.speed / 1000;
        const context = {
            matrix: this.matrix,
            mouseX: this.mouseX,
            mouseY: this.mouseY,
            isMouseDown: this.isMouseDown,
            clickIntensity: this.clickIntensity,
            lastClickTime: this.lastClickTime,
            chars: this.charSets[this.currentCharSet].name === 'Binary' ? ['0','1'] : this.charSets[this.currentCharSet].chars,
            width: this.width,
            height: this.height,
            frame: this.frame,
            speed: this.speed,
            matrixColumns: this.matrixColumns,
            matrixConfig: MATRIX_CONFIG,
            ripples: this.ripples,
            cellularGrid: this.cellularGrid,
            isBinary: this.charSets[this.currentCharSet].name === 'Binary',
            firstMatrixFrame: this.firstMatrixFrame
        };
        
        // Update click intensity decay
        if(this.clickIntensity > 0) {
            this.clickIntensity = Math.max(0, this.clickIntensity - 0.02);
        }
        
        const currentSet = this.charSets[this.currentCharSet];
        context.chars = currentSet.name === 'Binary' ? ['0','1'] : currentSet.chars;
        
        switch(this.modes[this.currentMode]) {
            case 'Wave': generateWavePattern(context, time); break;
            case 'Spiral': generateSpiralPattern(context, time); break;
            case 'Vortex': generateVortexPattern(context, time); break;
            case 'Mandala': generateMandalaPattern(context, time); break;
            case 'Tunnel': generateTunnelPattern(context, time); break;
            case 'Fractal': generateFractalPattern(context, time); break;
            case 'Interference': generateInterferencePattern(context, time); break;
            case 'Psychedelic': generatePsychedelicPattern(context, time); break;
            case 'Cellular': {
                const { newGrid, newMatrix } = generateCellularPattern({
                    matrix: this.matrix,
                    width: this.width,
                    height: this.height,
                    chars: this.charSets[this.currentCharSet].chars,
                    cellularGrid: this.cellularGrid,
                    speed: this.speed,
                    mouseX: this.mouseX,
                    mouseY: this.mouseY,
                    isMouseDown: this.isMouseDown,
                    lastClickTime: this.lastClickTime,
                    cellularDensity: this.cellularDensity,
                    cellularIterations: this.cellularIterations,
                    cellularThreshold: this.cellularThreshold,
                    cellularSmoothing: this.cellularSmoothing,
                    isBinary: this.charSets[this.currentCharSet].chars.length === 2 && this.charSets[this.currentCharSet].chars.includes('0') && this.charSets[this.currentCharSet].chars.includes('1')
                });
                this.cellularGrid = newGrid;
                this.matrix = newMatrix;
                break;
            }
            case 'Shockwave': generateShockwavePattern(context, time); break;
            case 'Plasma': generatePlasmaPattern(context, time); break;
            case 'Rain': generateRainPattern(context, time); break;
            case 'Ripple': {
                const newMatrix = generateRipplePattern(context, time);
                if (newMatrix) this.matrix = newMatrix;
                break;
            }
            case 'Matrix': 
                generateMatrixPattern(context, time); 
                break;
        }
        
        // Reset firstMatrixFrame after first frame
        if (this.firstMatrixFrame) {
            this.firstMatrixFrame = false;
        }
    }

    setMode(index) {
        this.currentMode = index % this.modes.length;
        if (this.modeDisplay) this.modeDisplay.textContent = this.modes[this.currentMode];
        this.modeNameDisplay.textContent = `Current Mode: ${this.modes[this.currentMode]}`;
        document.getElementById('mode-selector').value = this.currentMode;
        updateSettingsVisibility(this, this.modes[this.currentMode]);
    }

    cycleChar() {
        this.currentCharSet = (this.currentCharSet + 1) % this.charSets.length;
        
        if (this.modes[this.currentMode] === 'Cellular') {
            this.cellularGrid = null;
        }
    }

    cycleTheme() {
        const themeNames = Object.keys(THEMES);
        const currentTheme = getComputedStyle(document.documentElement)
            .getPropertyValue('--primary-color').trim();
        
        let nextThemeIndex = 0;
        for (let i = 0; i < themeNames.length; i++) {
            if (THEMES[themeNames[i]].primary === currentTheme) {
                nextThemeIndex = (i + 1) % themeNames.length;
                break;
            }
        }

        const nextTheme = THEMES[themeNames[nextThemeIndex]];
        this.applyTheme(nextTheme);
    }

    applyTheme(theme) {
        document.documentElement.style.setProperty('--primary-color', theme.primary);
        document.documentElement.style.setProperty('--background-color', theme.background);
        document.documentElement.style.setProperty('--accent-color', theme.accent);
        document.documentElement.style.setProperty('--glow-color', theme.primary + '80');
    }

    reset() {
        this.initMatrix();
        this.ripples = [];
        this.frame = 0;
    }

    toggleAutoMode() {
        this.autoMode = !this.autoMode;
        if (this.autoMode) {
            this.autoModeInterval = setInterval(() => this.cycleMode(), 5000);
        } else {
            clearInterval(this.autoModeInterval);
        }
    }

    updateFPS(currentTime) {
        this.frameCount++;
        const elapsed = currentTime - this.lastFpsUpdate;
        
        if (elapsed >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / elapsed);
            this.fpsDisplay.textContent = `FPS: ${this.fps}`;
            this.frameCount = 0;
            this.lastFpsUpdate = currentTime;
        }
    }

    animate(currentTime = 0) {
        // Handle frame skipping for mobile
        if (this.frameSkip > 1 && this.frame % this.frameSkip !== 0) {
            this.frame++;
            requestAnimationFrame(time => this.animate(time));
            return;
        }

        // Throttle frame rate on mobile
        const deltaTime = currentTime - this.lastRenderTime;
        if (deltaTime < this.minRenderInterval) {
            requestAnimationFrame(time => this.animate(time));
            return;
        }

        this.lastRenderTime = currentTime;
        
        // Update FPS
        this.updateFPS(currentTime);

        // Initialize matrix if needed
        if (!this.matrix || this.matrix.length !== this.height || 
            this.matrix[0].length !== this.width) {
            this.initMatrix();
        }

        // Initialize matrix columns for Matrix effect
        if (this.modes[this.currentMode] === 'Matrix' && !this.matrixColumns) {
            this.matrixColumns = this.createMatrixColumns();
        }

        // Generate the pattern
        this.generatePattern();

        // Efficient string concatenation
        const lines = new Array(this.height);
        for (let i = 0; i < this.height; i++) {
            lines[i] = this.matrix[i].join('');
        }
        
        // Single DOM update
        this.container.textContent = lines.join('\n');

        // Update resolution display less frequently
        if (this.frame % 30 === 0) {
            this.resolutionDisplay.textContent = `${this.width} x ${this.height}`;
        }

        this.frame++;
        requestAnimationFrame(time => this.animate(time));
    }

    setCharSize(newSize) {
        this.charSize = Math.max(12, Math.min(newSize, this.maxCharSize));
        this.fontSize = this.charSize;
        this.charWidth = this.charSize * 0.6;
        
        // Update container style
        this.container.style.fontSize = `${this.fontSize}px`;
        this.container.style.lineHeight = `${this.fontSize}px`;
        
        // Recalculate dimensions
        this.updateDimensions();
        
        // Reset pattern-specific data
        if (this.modes[this.currentMode] === 'Matrix') {
            this.matrixColumns = null;
            this.firstMatrixFrame = true;
        }
        if (this.modes[this.currentMode] === 'Cellular') {
            this.cellularGrid = null;
        }
    }
}