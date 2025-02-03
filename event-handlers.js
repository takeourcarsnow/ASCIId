const handleModeChange = (effect, direction) => {
    const currentIndex = effect.currentMode;
    const newIndex = (currentIndex + direction + effect.modes.length) % effect.modes.length;
    effect.setMode(newIndex);
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

// Add these constants at the top of the file
const MIN_ZOOM_SCALE = 0.5;
const MAX_ZOOM_SCALE = 2.0;
const ZOOM_SENSITIVITY = 0.01;

// Add this function to handle pinch zoom
const handlePinchZoom = (effect, initialDistance, currentDistance) => {
    const scale = currentDistance / initialDistance;
    const newSize = Math.min(
        MAX_ZOOM_SCALE,
        Math.max(
            MIN_ZOOM_SCALE,
            effect.charSize * (1 + (scale - 1) * ZOOM_SENSITIVITY)
        )
    );
    effect.setCharSize(Math.round(newSize));
    document.querySelector('.char-size-value').textContent = Math.round(newSize);
    document.querySelector('.char-size-control').value = Math.round(newSize);
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
    effect.container.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = effect.container.getBoundingClientRect();
        effect.mouseX = Math.floor((touch.clientX - rect.left) / effect.charWidth);
        effect.mouseY = Math.floor((touch.clientY - rect.top) / effect.fontSize);
        effect.isMouseDown = true;
        effect.lastClickTime = performance.now();

        // Add pinch zoom handling
        let initialDistance = null;
        if (e.touches.length === 2) {
            // Calculate initial distance between two fingers
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            initialDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );
        }
    });

    effect.container.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = effect.container.getBoundingClientRect();
        effect.mouseX = Math.floor((touch.clientX - rect.left) / effect.charWidth);
        effect.mouseY = Math.floor((touch.clientY - rect.top) / effect.fontSize);

        // Add pinch zoom handling
        if (e.touches.length === 2 && initialDistance !== null) {
            // Calculate current distance between two fingers
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const currentDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );
            
            // Handle the zoom
            handlePinchZoom(effect, initialDistance, currentDistance);
        }
    });

    effect.container.addEventListener('touchend', () => {
        effect.isMouseDown = false;

        // Reset initial distance when touch ends
        if (e.touches.length < 2) {
            initialDistance = null;
        }
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
        toggleButton.innerHTML = toggleButton.innerHTML === '&#128065;' ? '&#128308;' : '&#128065;';
        
        // Add this to ensure controls are visible when toggled
        if (!document.querySelector('.controls').classList.contains('hidden')) {
            document.querySelector('.controls').scrollIntoView({ 
                behavior: 'auto',
                block: 'center'
            });
        }
    });
} 