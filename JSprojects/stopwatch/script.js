document.addEventListener('DOMContentLoaded', () => {
    const hoursDisplay = document.getElementById('hours');
    const minutesDisplay = document.getElementById('minutes');
    const secondsDisplay = document.getElementById('seconds');
    const millisecondsDisplay = document.getElementById('milliseconds');
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const resetBtn = document.getElementById('resetBtn');
    const lapBtn = document.getElementById('lapBtn');
    const lapDurationInput = document.getElementById('lapDuration');
    const lapList = document.getElementById('lapList');

    let startTime;
    let elapsedTime = 0;
    let timerInterval;
    let isRunning = false;
    let lapCount = 0;
    let nextLapTime = 0; // Milliseconds for the next automatic lap

    // Function to format time for display
    function formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const milliseconds = ms % 1000;

        return {
            h: String(hours).padStart(2, '0'),
            m: String(minutes).padStart(2, '0'),
            s: String(seconds).padStart(2, '0'),
            ms: String(milliseconds).padStart(3, '0')
        };
    }

    // Function to update the stopwatch display
    function updateDisplay() {
        const formattedTime = formatTime(elapsedTime);
        hoursDisplay.textContent = formattedTime.h;
        minutesDisplay.textContent = formattedTime.m;
        secondsDisplay.textContent = formattedTime.s;
        millisecondsDisplay.textContent = formattedTime.ms;
    }

    // Function to start the stopwatch
    function startStopwatch() {
        if (!isRunning) {
            isRunning = true;
            startTime = Date.now() - elapsedTime;
            timerInterval = setInterval(() => {
                elapsedTime = Date.now() - startTime;
                updateDisplay();
                checkLapDuration();
            }, 10); // Update every 10 milliseconds for smoother display
            startBtn.textContent = 'Resume'; // Change text to Resume after first start
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            lapBtn.disabled = false;
        }
    }

    // Function to pause the stopwatch
    function pauseStopwatch() {
        if (isRunning) {
            isRunning = false;
            clearInterval(timerInterval);
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            lapBtn.disabled = true; // Disable lap when paused
        }
    }

    // Function to reset the stopwatch
    function resetStopwatch() {
        pauseStopwatch();
        elapsedTime = 0;
        lapCount = 0;
        nextLapTime = 0; // Reset next lap time
        updateDisplay();
        lapList.innerHTML = ''; // Clear lap list
        startBtn.textContent = 'Start';
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        lapBtn.disabled = true;
    }

    // Function to add a manual lap
    function addLap() {
        lapCount++;
        const formattedTime = formatTime(elapsedTime);
        const lapItem = document.createElement('li');
        lapItem.innerHTML = `<span>Lap ${lapCount}:</span> ${formattedTime.h}:${formattedTime.m}:${formattedTime.s}.${formattedTime.ms}`;
        lapList.prepend(lapItem); // Add to the top of the list
    }

    // Function to check for automatic lap duration
    function checkLapDuration() {
        const lapDurationMinutes = parseInt(lapDurationInput.value);
        if (isNaN(lapDurationMinutes) || lapDurationMinutes <= 0) {
            return; // Don't proceed if lap duration is invalid
        }

        const lapDurationMs = lapDurationMinutes * 60 * 1000;

        // Initialize nextLapTime if it's the first run or after a reset
        if (nextLapTime === 0 && elapsedTime >= 0) {
            nextLapTime = lapDurationMs;
        }

        if (elapsedTime >= nextLapTime) {
            addLap();
            // Calculate the next lap time, ensuring it accounts for any overflow
            // This prevents multiple laps being added if the update interval is long
            nextLapTime += lapDurationMs;
            // If the elapsed time has significantly passed the next lap time,
            // adjust nextLapTime to be a multiple of lapDurationMs just past elapsedTime
            while (nextLapTime <= elapsedTime) {
                nextLapTime += lapDurationMs;
            }
        }
    }

    // Event Listeners
    startBtn.addEventListener('click', startStopwatch);
    pauseBtn.addEventListener('click', pauseStopwatch);
    resetBtn.addEventListener('click', resetStopwatch);
    lapBtn.addEventListener('click', addLap);

    // Initial state
    updateDisplay();
    pauseBtn.disabled = true; // Pause button is disabled initially
    lapBtn.disabled = true; // Lap button is disabled initially
});