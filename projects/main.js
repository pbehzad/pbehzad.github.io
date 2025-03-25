// Import data from data.js
window.onload = function() {
    populateNoteDropdown();
};

// Create a single global AudioContext
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const activeOscillators = {}; // Store active oscillators by cell key
let HighlightSimilars = false;
let HighlightSameOctave = false;
let ShowOutSideRange = false;

// Function to generate and display the lattice
function generateLattice() {
    unselectAllCells();
    
    // Fetch the note frequencies
    const noteFrequencies = getNoteFrequencies();
    
    // Get the starting frequency using the helper function
    const startFrequency = getStartFrequency(noteFrequencies);
    if (!startFrequency) return; // Stop if input is invalid

    const [horRatioNum, horRatioDenom] = parseRatio(document.getElementById('horRatio').value);
    const [verRatioNum, verRatioDenom] = parseRatio(document.getElementById('verRatio').value);

    const rows = 21;
    const cols = 21;
    const latticeContainer = document.getElementById('latticeContainer');
    latticeContainer.innerHTML = '';

    const centerRow = Math.floor(rows / 2);
    const centerCol = Math.floor(cols / 2);

    // Helper function to calculate the frequency based on horizontal and vertical steps
    const calculateFrequency = (horSteps, verSteps) => {
        const [horNum, horDenom] = horSteps < 0 ? [horRatioDenom, horRatioNum] : [horRatioNum, horRatioDenom];
        const [verNum, verDenom] = verSteps > 0 ? [verRatioDenom, verRatioNum] : [verRatioNum, verRatioDenom];

        const ratioNum = Math.pow(horNum, Math.abs(horSteps)) * Math.pow(verNum, Math.abs(verSteps));
        const ratioDenom = Math.pow(horDenom, Math.abs(horSteps)) * Math.pow(verDenom, Math.abs(verSteps));
        const ratio = ratioNum / ratioDenom;

        return { newFrequency: startFrequency * ratio, ratioNum, ratioDenom };
    };

    // Generate the lattice grid
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const horSteps = col - centerCol;
            const verSteps = row - centerRow;
            
            // Calculate frequency and ratio
            const { newFrequency, ratioNum, ratioDenom } = calculateFrequency(horSteps, verSteps);
            const { noteName, noteFreq, centsDiff } = findClosestNoteName(newFrequency);

            // Create a cell element
            const cell = createCell(row, col, noteName, noteFreq, centsDiff, ratioNum, ratioDenom);
            latticeContainer.appendChild(cell);
        }
    }
}


function createCell(row, col, noteName, noteFreq, centsDiff, ratioNum, ratioDenom) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.row = row;
    cell.dataset.col = col;

    // Check if frequency is within the valid range
    const isFrequencyInRange = noteFreq > 10 && noteFreq < 16000;

    // If out-of-range and ShowOutSideRange is false, create a black cell
    if (!isFrequencyInRange && !ShowOutSideRange) {
        cell.classList.add('out-of-range');
        cell.dataset.frequency = 'null';
        cell.dataset.noteName = 'null';
        cell.dataset.selected = 'false';
        return cell;
    }

    if (ratioNum == 1 && ratioDenom == 1) {
        cell.classList.add('refrence');
    }
    cell.dataset.frequency = noteFreq;
    cell.dataset.noteName = noteName;
    cell.dataset.selected = 'false';

    const sign = centsDiff > 0 ? '+' : '';
    cell.innerHTML = `
        <strong>${noteName}</strong><br>
        ${noteFreq.toFixed(2)} Hz<br>
        ${sign}${(centsDiff).toFixed(2)}¢<br>
        ${ratioNum}:${ratioDenom}
    `;

    // Add interactive event listeners
    cell.addEventListener('click', () => toggleCellSelection(cell));
    cell.addEventListener('mouseover', () => highlightNotes(noteName));
    cell.addEventListener('mouseout', resetHighlight);

    return cell;
}


// Function to highlight notes based on the hovered cell
function highlightNotes(noteName) {
    const allCells = document.querySelectorAll('.cell');
    allCells.forEach(cell => {
        const cellNote = cell.dataset.noteName;

        // Highlight exact matches (e.g., G#5) in gray
        if (cellNote === noteName && HighlightSameOctave) {
            
            cell.classList.add('highlight-gray');
        } 
        else if (HighlightSimilars){
            // Extract the base note letter (e.g., "D#" or "D")
            const baseNote = noteName.replace(/[0-9]/g, ''); // Removes the octave number, e.g., "G#5" -> "G#"
                
            // Extract the base note of the cell, excluding its octave number
            const cellBaseNote = cellNote.replace(/[0-9]/g, ''); // e.g., "D#3" -> "D#"
            
            // Check if the cell note matches the base note exactly (but different octaves)
            if (cellBaseNote === baseNote) {
                cell.classList.add('highlight-orange');
            }
        }
    });
}

// Function to reset all highlights
function resetHighlight() {
    const allCells = document.querySelectorAll('.cell');
    allCells.forEach(cell => {
        cell.classList.remove('highlight-gray', 'highlight-orange');
    });
}


// Function to toggle cell selection and play/stop tone
function toggleCellSelection(cell) {
    const isSelected = cell.dataset.selected === 'true';
    const frequency = parseFloat(cell.dataset.frequency);
    const cellKey = `${cell.dataset.row}-${cell.dataset.col}`;

    if (isSelected) {
        cell.dataset.selected = 'false';
        cell.classList.remove('selected');
        stopTone(cellKey);
    } else {
        cell.dataset.selected = 'true';
        cell.classList.add('selected');
        playTone(cellKey, frequency);
    }
}


function unselectAllCells() {
    // Select all cells (assuming they have the 'cell' class, change selector as needed)
    const allCells = document.querySelectorAll('.cell');

    allCells.forEach(cell => {
        if (cell.dataset.selected === 'true') {
            cell.dataset.selected = 'false';
            cell.classList.remove('selected');
            const cellKey = `${cell.dataset.row}-${cell.dataset.col}`;
            stopTone(cellKey);
        }
    });
}

// Event listener for the "Generate" button
document.getElementById('generateBtn').addEventListener('click', generateLattice);

document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'Backspace':
            unselectAllCells();
            break;
        case '1':
            HighlightSameOctave = !HighlightSameOctave;
            break;
        case '2':
            HighlightSimilars = !HighlightSimilars;
            break;
        case '3':
            ShowOutSideRange = !ShowOutSideRange;
            unselectAllCells();
            generateLattice();
            break;
        case 's':
            saveChord();
            break;
        case 'd':
            if (currentChordIndex < Object.keys(savedSequences).length - 1) {
                showChord(currentChordIndex + 1);
            }
            break;
        case 'a':
            if (currentChordIndex > 0) {
                showChord(currentChordIndex - 1);
            }
            break;
    }
});


  