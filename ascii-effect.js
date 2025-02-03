class ASCIIEffect {
    constructor() {
        this.setupDOM();
        this.setupConfig();
        this.initializeDropdown();
        this.initializeCharSelector();
        setupEventHandlers(this);
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
        this.speed = 20;
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
        this.cellularDensity = 0.5; // Default density for cellular mode
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
        this.fontSize = this.charSize;
        this.charWidth = this.fontSize * 0.6;
        this.width = Math.floor(window.innerWidth / this.charWidth);
        this.height = Math.floor(window.innerHeight / this.fontSize);
        
        // Add this to prevent layout shifts
        requestAnimationFrame(() => {
            this.container.style.fontSize = `${this.fontSize}px`;
            this.resolutionDisplay.textContent = `${this.width} x ${this.height}`;
            this.cellularGrid = null;
            
            // Update matrix columns with new dimensions
            this.matrixColumns = Array(this.width).fill().map((_, i) => ({
                drops: Array(3).fill().map(() => ({
                    y: -Math.random() * 30,
                    progress: Math.random(),
                    headChar: this.charSets[this.currentCharSet].chars[0],
                    trail: Array(MATRIX_CONFIG.MAX_TRAIL_LENGTH).fill().map(() => 
                        this.charSets[this.currentCharSet].chars[1]
                    )
                })),
                lastDrop: performance.now() - i * 10
            }));
        });
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
            isBinary: this.charSets[this.currentCharSet].name === 'Binary'
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
                const result = generateCellularPattern({
                    ...context,
                    cellularGrid: this.cellularGrid
                });
                this.cellularGrid = result.newGrid;
                this.matrix = result.newMatrix;
                break;
            }
            case 'Shockwave': generateShockwavePattern(context, time); break;
            case 'Plasma': generatePlasmaPattern(context, time); break;
            case 'Rain': generateRainPattern(context, time); break;
        }
    }

    setMode(index) {
        this.currentMode = index % this.modes.length;
        if (this.modeDisplay) this.modeDisplay.textContent = this.modes[this.currentMode];
        this.modeNameDisplay.textContent = `Current Mode: ${this.modes[this.currentMode]}`;
        document.getElementById('mode-selector').value = this.currentMode;
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
        this.updateFPS(currentTime);
        
        if (!['Matrix', 'Cellular'].includes(this.modes[this.currentMode])) {
            this.initMatrix();
        }
        
        this.generatePattern();
        
        // Optimized rendering using single string buffer
        let buffer = '';
        for (let i = 0; i < this.height; i++) {
            buffer += this.matrix[i].join('') + '\n';
        }
        this.container.textContent = buffer;
        
        this.frame++;
        requestAnimationFrame(time => this.animate(time));
    }

    setCharSize(newSize) {
        this.charSize = Math.min(Math.max(newSize, 8), this.maxCharSize);
        this.updateDimensions();
    }
} 