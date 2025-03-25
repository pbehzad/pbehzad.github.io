
let savedSequences = {}; // Object to store chords
let currentChordIndex = 0; // Track the current chord

function saveChord() {
    const selectedCells = document.querySelectorAll('.cell[data-selected="true"]');
    if (selectedCells.length === 0) return; // Do nothing if no cells are selected

    const coordinates = Array.from(selectedCells).map(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const cellKey = `${row}-${col}`;

        // Get the gain value from the active oscillator if it exists
        const gain = activeOscillators[cellKey]?.gainNode.gain.value || 0.1;

        return { row, col, gain };
    });

    // Save the coordinates and gain in the savedSequences object
    savedSequences[currentChordIndex] = coordinates;

    // Update display
    currentChordIndex++;
    document.getElementById('currentChordDisplay').textContent = `Chord: ${currentChordIndex}`;
    console.log("Chord saved:", coordinates);
}


function playChord(chordIndex) {
    if (!(chordIndex in savedSequences)) return;

    unselectAllCells(); // Deselect all cells before playing the new chord

    const coordinates = savedSequences[chordIndex];
    coordinates.forEach(({ row, col, gain }) => {
        const cell = document.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
        if (cell) {
            cell.dataset.selected = 'true';
            cell.classList.add('selected');
            const frequency = parseFloat(cell.dataset.frequency);
            const cellKey = `${row}-${col}`;

            // Play tone with the stored gain value
            playToneWithGain(cellKey, frequency, gain);
        }
    });
}

// Updated playTone function to accept gain as an argument
function playToneWithGain(cellKey, frequency, gain) {
    if (activeOscillators[cellKey]) return; // If already playing, do nothing

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Set the gain to the saved value
    gainNode.gain.setValueAtTime(gain, audioContext.currentTime);
    oscillator.start();

    // Store the oscillator in the dictionary using cellKey
    activeOscillators[cellKey] = { oscillator, gainNode };
}


function showChord(index) {
    if (!(index in savedSequences)) return;

    currentChordIndex = index;
    playChord(currentChordIndex);
    document.getElementById('currentChordDisplay').textContent = `Chord: ${currentChordIndex}`;
}

document.getElementById('nextChordBtn').addEventListener('click', function() {
    if (currentChordIndex < Object.keys(savedSequences).length - 1) {
        showChord(currentChordIndex + 1);
    }
});

document.getElementById('prevChordBtn').addEventListener('click', function() {
    if (currentChordIndex > 0) {
        showChord(currentChordIndex - 1);
    }
});

document.getElementById('saveChordBtn').addEventListener('click', saveChord);
