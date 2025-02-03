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
    effect.container.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = effect.container.getBoundingClientRect();
        effect.mouseX = Math.floor((touch.clientX - rect.left) / effect.charWidth);
        effect.mouseY = Math.floor((touch.clientY - rect.top) / effect.fontSize);
        effect.isMouseDown = true;
        effect.lastClickTime = performance.now();
    });

    effect.container.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = effect.container.getBoundingClientRect();
        effect.mouseX = Math.floor((touch.clientX - rect.left) / effect.charWidth);
        effect.mouseY = Math.floor((touch.clientY - rect.top) / effect.fontSize);
    });

    effect.container.addEventListener('touchend', () => {
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
        effect.speed = parseInt(e.target.value);
        document.querySelector('.speed-value').textContent = effect.speed;
    };

    document.querySelector('.char-size-control').addEventListener('input', (e) => {
        const newSize = parseInt(e.target.value, 10);
        effect.setCharSize(newSize);
        document.querySelector('.char-size-value').textContent = newSize;
    });

    document.getElementById('cellular-density').oninput = (e) => {
        effect.cellularDensity = parseFloat(e.target.value);
        document.querySelector('.cellular-density-value').textContent = effect.cellularDensity.toFixed(1);
        if (effect.modes[effect.currentMode] === 'Cellular') {
            effect.cellularGrid = null; // Reset the grid to apply new density
        }
    };

    document.getElementById('cellular-speed').oninput = (e) => {
        effect.speed = parseInt(e.target.value);
        document.querySelector('.cellular-speed-value').textContent = effect.speed;
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
            case 'Space':
                e.preventDefault();
                effect.toggleAutoMode();
                break;
            case 'KeyM':
                effect.setMode((effect.currentMode + 1) % effect.modes.length);
                break;
            case 'KeyC':
                effect.cycleChar();
                break;
            case 'KeyT':
                effect.cycleTheme();
                break;
            case 'KeyR':
                effect.reset();
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

    // Add to existing keydown handler
    document.addEventListener('keydown', (e) => {
        if (e.key === 'r' || e.key === 'R') {
            document.getElementById('random-color').click();
        }
    });
}

// Add this function to handle menu toggling
function setupMenuToggle(effect) {
    const toggleButton = document.getElementById('toggle-menu');
    const elementsToHide = [
        document.querySelector('.stats'),
        document.querySelector('.controls'),
        document.querySelector('.mode-info')
    ];

    toggleButton.addEventListener('click', () => {
        elementsToHide.forEach(element => {
            element.classList.toggle('hidden');
        });
        toggleButton.textContent = toggleButton.textContent === 'Hide Menus' ? 'Show Menus' : 'Hide Menus';
    });
} 