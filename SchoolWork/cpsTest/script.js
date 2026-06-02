let clickCount = 0;
let isTestRunning = false;
let timerRunning = false;
let timer;
let duration;

function startTest(dur) {
    // Reset values
    clickCount = 0;
    isTestRunning = true;
    duration = dur;
    document.getElementById('click-button').disabled = false;
    document.getElementById('click-count').innerText = `Clicks: ${clickCount}`;
    document.getElementById('cps').innerText = `CPS: 0`;

    // Update instruction text
    document.getElementById('instruction').innerText = `Waiting for your first input to start!`;
}

function startFirstClick() {
    // Update instruction text
    document.getElementById('instruction').innerText = `Test started! Click as fast as you can for ${duration} seconds!`;

    // Start timer
    clearTimeout(timer);
    timer = setTimeout(() => {
        endTest(duration);
    }, duration * 1000);
}

function countClick() {
    if (!timerRunning) {
        startFirstClick();
        timerRunning = true;
    }

    if (isTestRunning) {
        clickCount++;
        document.getElementById('click-count').innerText = `Clicks: ${clickCount}`;
    }
}

function endTest(duration) {
    isTestRunning = false;
    document.getElementById('click-button').disabled = true;

    // Calculate CPS
    let cps = (clickCount / duration).toFixed(2);
    document.getElementById('cps').innerText = `CPS: ${cps}`;
    document.getElementById('instruction').innerText = "Test ended! Choose another timer to try again.";
    timerRunning = false;
}
