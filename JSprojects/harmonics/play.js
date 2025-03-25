let audioContext;
const activeOscillators = {};

// Function to initialize the AudioContext with a user interaction
function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        console.log("Audio context initialized");
    }
}

// Attach a listener to the entire document to initialize the audio context on any interaction
document.addEventListener('click', initAudioContext);

// Function to play a frequency with a fade-in effect
function playFrequency(frequency) {
    // Ensure AudioContext is initialized
    if (!audioContext) return;

    // Check if the frequency is already playing
    if (activeOscillators[frequency]) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

    // Set initial gain to 0 for fade-in effect
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    
    // Apply a quick fade-in over 50 milliseconds
    const fadeInDuration = 0.2; // Adjust this value for smoother fade-in
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + fadeInDuration);

    // Connect oscillator to gain node, then to audio context
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    activeOscillators[frequency] = { oscillator, gainNode };
}

// Function to stop a frequency with a fade-out effect
function stopFrequency(frequency) {
    if (activeOscillators[frequency]) {
        const { oscillator, gainNode } = activeOscillators[frequency];

        // Apply a quick fade-out before stopping
        const fadeOutDuration = 0.1;
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + fadeOutDuration);

        // Stop the oscillator after the fade-out is complete
        setTimeout(() => {
            oscillator.stop();
            oscillator.disconnect();
            gainNode.disconnect();
            delete activeOscillators[frequency];
        }, fadeOutDuration * 1000);
    }
}

function attachHoverEvents(card, frequency) {
    card.addEventListener('mouseenter', () => {
        if (card.dataset.selected === 'false') playFrequency(frequency);
    });

    card.addEventListener('mouseleave', () => {
        if (card.dataset.selected === 'false') stopFrequency(frequency);
    });
}

function toggleSelection(card, frequency) {
    const isSelected = card.dataset.selected === 'true';

    if (isSelected) {
        card.dataset.selected = 'false';
        card.classList.remove('selected');
        stopFrequency(frequency);
    } else {
        card.dataset.selected = 'true';
        card.classList.add('selected');
        playFrequency(frequency);
    }
}

