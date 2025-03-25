// Utility function to calculate cent deviation
function calculateCentDeviation(freq, refFreq) {
    return Math.round(1200 * Math.log2(freq / refFreq));
}

// Main function to calculate overtones
function calculateOvertones() {
    const fundamental = document.getElementById('fundamental').value.trim();
    const numHarmonics = parseInt(document.getElementById('harmonics').value);

    // Validate user input
    if (!fundamental || isNaN(numHarmonics)) {
        alert("Please enter a valid pitch and number of harmonics.");
        return;
    }

    const frequencies = generateNoteFrequencies();
    const fundamentalFreq = frequencies[fundamental];
    if (!fundamentalFreq) {
        alert("Invalid fundamental pitch.");
        return;
    }

    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';

    // Generate overtone cards
    for (let i = 1; i <= numHarmonics; i++) {
        const overtoneFreq = fundamentalFreq * i;
        let closestNote = null;
        let minDeviation = Infinity;

        // Find the closest note
        for (const [note, freq] of Object.entries(frequencies)) {
            const deviation = Math.abs(overtoneFreq - freq);
            if (deviation < minDeviation) {
                minDeviation = deviation;
                closestNote = note;
            }
        }

        const midiNumber = noteMidiNumbers[closestNote] || 'N/A';
        const centDeviation = calculateCentDeviation(overtoneFreq, frequencies[closestNote]);
        const sign = centDeviation > 0 ? '+' : '';

        // Create a card for each overtone
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.frequency = overtoneFreq;
        card.dataset.selected = 'false';

        card.innerHTML = `
            <h3>${i}°</h3>
            <h2>${closestNote} ${sign}${centDeviation}¢</h2>
            <p>${overtoneFreq.toFixed(2)} Hz</p>
            <p>Midi: ${midiNumber}</p>
        `;

        // Attach hover and click event listeners using functions from play.js
        attachHoverEvents(card, overtoneFreq);
        card.addEventListener('click', () => toggleSelection(card, overtoneFreq));

        resultDiv.appendChild(card);
    }
}
