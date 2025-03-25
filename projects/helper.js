// Populate the dropdown for selecting the starting note (C2 to C6)
function populateNoteDropdown() {
    const noteFrequencies = getNoteFrequencies(440);
    const startNoteDropdown = document.getElementById('startNote');
    startNoteDropdown.innerHTML = ''; // Clear existing options

    // Use regex to extract the octave correctly
    const filteredNotes = Object.keys(noteFrequencies).filter(note => {
        const match = note.match(/([A-G]#?)(-?\d+)/); // Match note and octave
        if (!match) return false;
        const octave = parseInt(match[2]); // Extract the octave number
        // Only include notes in the range C2 to C6
        return octave >= 2 && octave <= 6;
    });
    const option = document.createElement('option');
    option.value = 'select-note';
    option.text = 'select note';
    startNoteDropdown.add(option);
    // Populate the dropdown with the filtered notes
    filteredNotes.forEach(note => {
        const option = document.createElement('option');
        option.value = note;
        option.text = note;
        startNoteDropdown.add(option);
    });
}

// Helper function to validate input and return the frequency
function getStartFrequency(noteFrequencies) {
    const referenceFreqInput = document.getElementById('refrenceFreq').value;
    const startNote = document.getElementById('startNote').value;

    // If both fields are filled or both are empty, show an error
    if (referenceFreqInput && startNote !== 'select-note') {
        alert('Please provide only one input: either a frequency or a note.');
        return null;
    }

    // If the user provided a frequency, validate and return it
    if (referenceFreqInput) {
        const referenceFreq = parseFloat(referenceFreqInput);
        if (isNaN(referenceFreq) || referenceFreq <= 0) {
            alert('Invalid frequency input. Please enter a positive number.');
            return null;
        }
        return referenceFreq;
    }

    // If the user selected a note, look up its frequency
    if (startNote !== 'select-note') {
        return noteFrequencies[startNote];
    }

    // If neither input is provided, show an error
    alert('Please provide either a frequency or a note.');
    return null;
}

  // Helper function to convert a ratio string (e.g., "5:4") to a decimal
function parseRatio(ratioString) {
    const [numerator, denominator] = ratioString.split(':').map(Number);
    return [numerator, denominator];
}

// Function to find the closest note to a given frequency
function findClosestNoteName(frequency) {
    const noteFrequencies = getNoteFrequencies();
    let closestNote = null;
    let closestFreq = null;
    let minDifference = Infinity;

    for (const [note, freq] of Object.entries(noteFrequencies)) {
        const diff = Math.abs(freq - frequency);
        if (diff < minDifference) {
            minDifference = diff;
            closestNote = note;
            closestFreq = freq;
        }
    }

    const centsDiff = 1200 * Math.log2(frequency / closestFreq);
    return { noteName: closestNote, noteFreq: frequency, centsDiff };
}