// Function to play a continuous tone using the single global AudioContext
function playTone(cellKey, frequency) {
    if (activeOscillators[cellKey]) return; // If already playing, do nothing

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    // Get the current value of the gain slider
    const gainSlider = document.getElementById('gainSlider');
    const initialGain = parseFloat(gainSlider.value);

    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Set initial gain based on the slider value
    gainNode.gain.setValueAtTime(initialGain, audioContext.currentTime);
    oscillator.start();

    // Store the oscillator and gain node in the dictionary using cellKey
    activeOscillators[cellKey] = { oscillator, gainNode };

    // Show the gain control for the last selected note
    lastSelectedCellKey = cellKey;
    showGainControl();
}

// Function to stop the tone
function stopTone(cellKey) {
    if (activeOscillators[cellKey]) {
        const { oscillator, gainNode } = activeOscillators[cellKey];
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.1);
        oscillator.stop(audioContext.currentTime + 0.01);
        oscillator.disconnect();
        gainNode.disconnect();
        delete activeOscillators[cellKey];
    }
}

function showGainControl() {
    const gainControlContainer = document.getElementById('gainControlContainer');
    const gainSlider = document.getElementById('gainSlider');

    if (lastSelectedCellKey && activeOscillators[lastSelectedCellKey]) {
        const { gainNode } = activeOscillators[lastSelectedCellKey];
        gainSlider.value = 0.1;
        gainControlContainer.style.display = 'block';

        // Update gain in real-time when the slider changes
        gainSlider.oninput = function () {
            gainNode.gain.setValueAtTime(parseFloat(this.value), audioContext.currentTime);
        };
    }
}


// Function to hide the gain control if no cell is selected
function hideGainControl() {
    const gainControlContainer = document.getElementById('gainControlContainer');
    gainControlContainer.style.display = 'none';
}