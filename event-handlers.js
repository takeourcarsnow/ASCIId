const handleModeChange = (effect, direction) => {
    const currentIndex = effect.currentMode;
    const newIndex = (currentIndex + direction + effect.modes.length) % effect.modes.length;
    effect.setMode(newIndex);
    
    // Update the dropdown menu
    const modeSelector = document.getElementById('mode-selector');
    if (modeSelector) {
        modeSelector.selectedIndex = newIndex;
    }

    updateSettingsVisibility(effect, effect.modes[newIndex]);
};

const handleCharSetChange = (effect, direction) => {
    const currentIndex = effect.currentCharSet;
    const newIndex = (currentIndex + direction + effect.charSets.length) % effect.charSets.length;
    effect.currentCharSet = newIndex;
    effect.cycleChar();
    
    // Update the dropdown menu
    const charSelector = document.getElementById('char-selector');
    if (charSelector) {
        charSelector.selectedIndex = newIndex;
    }
};

const updateSettingsVisibility = (effect, currentModeName) => {
    const settingsMap = {
        'Wave': ['speed-container', 'char-size-container'],
        'Spiral': ['speed-container', 'char-size-container'],
        'Vortex': ['speed-container', 'char-size-container'],
        'Mandala': ['speed-container', 'char-size-container'],
        'Tunnel': ['speed-container', 'char-size-container'],
        'Fractal': ['speed-container', 'char-size-container'],
        'Interference': ['speed-container', 'char-size-container'],
        'Psychedelic': ['speed-container', 'char-size-container'],
        'Shockwave': ['speed-container', 'char-size-container'],
        'Plasma': ['speed-container', 'char-size-container'],
        'Ripple': ['speed-container', 'char-size-container'],
        'Rain': ['speed-container', 'char-size-container'],
        'Matrix': ['speed-container', 'char-size-container'],
        'Cellular': [
            'char-size-container',
            'cellular-density-container',
            'cellular-iterations-container',
            'cellular-threshold-container',
            'cellular-smoothing-container'
        ]
    };

    // Hide all settings first
    const allSettings = Array.from(document.querySelectorAll('.slider-container')).map(el => el.id);
    allSettings.forEach(settingId => {
        const settingElement = document.getElementById(settingId);
        if (settingElement) {
            settingElement.classList.add('hidden');
        }
    });

    // Then show only relevant settings for the current mode
    const visibleSettings = settingsMap[currentModeName] || ['speed-container', 'char-size-container']; // Default to speed and size
    visibleSettings.forEach(settingId => {
        const settingElement = document.getElementById(settingId);
        if (settingElement) {
            settingElement.classList.remove('hidden');
        }
    });
};

function setupEventHandlers(effect) {
    // Mouse events
    effect.container.addEventListener('mousemove', (e) => {
        const rect = effect.container.getBoundingClientRect();
        effect.mouseX = Math.floor((e.clientX - rect.left) / effect.charWidth);
        effect.mouseY = Math.floor((e.clientY - rect.top) / effect.fontSize);
    });

    effect.container.addEventListener('mousedown', (e) => {
        effect.isMouseDown = true;
        effect.lastClickTime = performance.now();
    });

    effect.container.addEventListener('mouseup', () => {
        effect.isMouseDown = false;
    });

    // Touch events
    let initialDistance = null;
    let initialFontSize = 20;

    effect.container.addEventListener('touchstart', (e) => {
        e.preventDefault();
        
        // Handle two-finger touch for zoom
        if (e.touches.length === 2) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            initialDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );
            initialFontSize = effect.charSize;
        } else {
            // Existing single touch handling
            const touch = e.touches[0];
            const rect = effect.container.getBoundingClientRect();
            effect.mouseX = Math.floor((touch.clientX - rect.left) / effect.charWidth);
            effect.mouseY = Math.floor((touch.clientY - rect.top) / effect.fontSize);
            effect.isMouseDown = true;
            effect.lastClickTime = performance.now();
        }
    });

    effect.container.addEventListener('touchmove', (e) => {
        e.preventDefault();
        
        // Handle two-finger zoom
        if (e.touches.length === 2) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const currentDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );

            if (initialDistance !== null) {
                const scale = currentDistance / initialDistance;
                const newSize = Math.min(Math.max(
                    Math.round(initialFontSize * scale), 
                    8
                ), 50);
                
                // Update size control and effect
                const sizeInput = document.getElementById('char-size');
                const sizeValue = document.querySelector('.char-size-value');
                if (sizeInput && sizeValue) {
                    sizeInput.value = newSize;
                    sizeValue.textContent = newSize;
                    effect.setCharSize(newSize);
                }
            }
        } else if (e.touches.length === 1) {
            // Handle swipe for mode change
            const touch = e.touches[0];
            const rect = effect.container.getBoundingClientRect();
            const currentX = touch.clientX;
            
            if (typeof this.lastTouchX === 'number') {
                const deltaX = currentX - this.lastTouchX;
                if (Math.abs(deltaX) > 30) { // Swipe threshold
                    if (deltaX > 0) {
                        handleModeChange(effect, 1); // Swipe right - next mode
                    } else {
                        handleModeChange(effect, -1); // Swipe left - previous mode
                    }
                    this.lastTouchX = null; // Reset after handling swipe
                }
            }
            this.lastTouchX = currentX;
        }
    });

    effect.container.addEventListener('touchend', () => {
        // Reset zoom tracking
        initialDistance = null;
        effect.isMouseDown = false;
    });

    // Control events
    document.getElementById('mode-selector').onchange = (e) => effect.setMode(e.target.selectedIndex);
    document.getElementById('char-selector').onchange = (e) => {
        effect.currentCharSet = e.target.selectedIndex;
        if (effect.modes[effect.currentMode] === 'Cellular') {
            effect.cellularGrid = null;
        }
    };
    document.getElementById('cycle-theme').onclick = () => effect.cycleTheme();

    // Sliders
    document.getElementById('speed').oninput = (e) => {
        // Convert linear value (1-100) to logarithmic scale (0.1-100)
        const minLog = Math.log(0.1);
        const maxLog = Math.log(100);
        const logRange = maxLog - minLog;
        const linearValue = parseInt(e.target.value);
        const logValue = Math.exp(minLog + (logRange * (linearValue / 100)));
        
        effect.speed = logValue;
        document.querySelector('.speed-value').textContent = logValue.toFixed(1);
    };

    document.getElementById('char-size').addEventListener('input', (e) => {
        const newSize = Math.max(12, parseInt(e.target.value, 10));
        effect.setCharSize(newSize);
        document.querySelector('.char-size-value').textContent = newSize;
    });

    document.getElementById('cellular-density').oninput = (e) => {
        effect.cellularDensity = parseFloat(e.target.value);
        document.querySelector('.cellular-density-value').textContent = effect.cellularDensity.toFixed(3);
        if (effect.modes[effect.currentMode] === 'Cellular') {
            effect.cellularGrid = null; // Reset the grid to apply new density
        }
    };

    document.getElementById('cellular-iterations').oninput = (e) => {
        effect.cellularIterations = parseInt(e.target.value);
        document.querySelector('.cellular-iterations-value').textContent = effect.cellularIterations;
        if (effect.modes[effect.currentMode] === 'Cellular') {
            effect.cellularGrid = null; // Reset the grid to apply new iterations
        }
    };

    document.getElementById('cellular-threshold').oninput = (e) => {
        effect.cellularThreshold = parseFloat(e.target.value);
        document.querySelector('.cellular-threshold-value').textContent = effect.cellularThreshold.toFixed(1);
        if (effect.modes[effect.currentMode] === 'Cellular') {
            effect.cellularGrid = null; // Reset the grid to apply new threshold
        }
    };

    document.getElementById('cellular-smoothing').oninput = (e) => {
        effect.cellularSmoothing = parseFloat(e.target.value);
        document.querySelector('.cellular-smoothing-value').textContent = effect.cellularSmoothing.toFixed(1);
        if (effect.modes[effect.currentMode] === 'Cellular') {
            effect.cellularGrid = null; // Reset the grid to apply new smoothing
        }
    };

    // Color pickers
    document.getElementById('primary-color').oninput = (e) => {
        document.documentElement.style.setProperty('--primary-color', e.target.value);
        document.documentElement.style.setProperty('--glow-color', e.target.value + '80');
    };

    document.getElementById('background-color').oninput = (e) => {
        document.documentElement.style.setProperty('--background-color', e.target.value);
    };

    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
        switch(e.code) {
            case 'KeyM':
                effect.setMode((effect.currentMode + 1) % effect.modes.length);
                break;
            case 'KeyC':
                effect.cycleChar();
                document.getElementById('char-selector').value = effect.currentCharSet;
                break;
            case 'KeyT':
                effect.cycleTheme();
                break;
        }
    });

    // Window resize
    window.addEventListener('resize', () => {
        effect.updateDimensions();
        effect.initMatrix();
    });

    // Add this function to handle menu toggling
    setupMenuToggle(effect);

    // Add to setupEventHandlers function
    document.getElementById('random-color').onclick = () => {
        const randomHex = () => Math.floor(Math.random()*16777215).toString(16).padStart(6,0);
        const primary = `#${randomHex()}`;
        const accent = `#${randomHex()}`;
        
        document.documentElement.style.setProperty('--primary-color', primary);
        document.documentElement.style.setProperty('--glow-color', `${primary}80`);
        document.documentElement.style.setProperty('--accent-color', accent);
        
        effect.container.classList.toggle('random-color');
    };

    // Add arrow controls
    document.getElementById('prev-mode').onclick = () => handleModeChange(effect, -1);
    document.getElementById('next-mode').onclick = () => handleModeChange(effect, 1);
    document.getElementById('prev-char').onclick = () => handleCharSetChange(effect, -1);
    document.getElementById('next-char').onclick = () => handleCharSetChange(effect, 1);

    updateSettingsVisibility(effect, effect.modes[effect.currentMode]);
}

// Add this function to handle menu toggling
function setupMenuToggle(effect) {
    const toggleButton = document.getElementById('toggle-menu');
    const elementsToHide = [
        document.querySelector('.stats'),
        document.querySelector('.controls'),
        document.querySelector('.mode-info')
    ];

    // Add touch event for mobile devices
    toggleButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        toggleButton.classList.add('active');
        toggleMenu();
    });

    toggleButton.addEventListener('touchend', () => {
        toggleButton.classList.remove('active');
    });

    toggleButton.addEventListener('click', (e) => {
        e.preventDefault();
        toggleMenu();
    });

    const toggleMenu = () => {
        elementsToHide.forEach(element => {
            element.classList.toggle('hidden');
        });
        toggleButton.innerHTML = toggleButton.innerHTML === '&#128065;' ? '&#128308;' : '&#128065;';
        
        if (!document.querySelector('.controls').classList.contains('hidden')) {
            document.querySelector('.controls').scrollIntoView({ 
                behavior: 'auto',
                block: 'center'
            });
        }
    };
} 