// --- DOM Element References ---
// Cache elements we'll use frequently
const scoreDisplay = document.getElementById("score");
const cpsDisplay = document.getElementById("cps"); // New element for CPS
const potatoImage = document.getElementById("potato-image"); // Renamed from "cookie"
const upgradeBtn1 = document.getElementById("upgradeBtn1"); // Renamed from "upgradeBtn"
const upgradeCost1Display = document.getElementById("upgradeCost1"); // Renamed from "upgradeCost"
const upgradeBtn2 = document.getElementById("upgradeBtn2");
const upgradeCost2Display = document.getElementById("upgradeCost2");
const upgradeBtn3 = document.getElementById("upgradeBtn3");
const upgradeCost3Display = document.getElementById("upgradeCost3");

// --- Game Data ---
// Initialize game data with default values
var gameData = {
  score: 0,
  clicks: 0, // Total clicks made
  cookiesPerClick: 1, // Potatoes gained per click (base)
  cookiesPerSecond: 0, // Potatoes gained passively per second
  upgradeCost: 50,    // Cost for +1 Potato/Click
  upgradeCost2: 100,   // Cost for +1 Potato/Sec
  upgradeCost3: 1000,  // Cost for Click Multiplier
  clickMultiplier: 1, // Multiplier applied to both clicks and passive income
  // banned: false // Anti-cheat flag (commented out for now)
};

// --- Anti-Cheat / Session Tracking --- (Simplified)
var startingScore = 0; // Score when the session started
var csscore = 0;       // Clicks in the current session
var timeOpen = 0;      // Seconds the game has been open this session

// --- Load & Save ---
// Load game data from localStorage or use defaults
const savedData = JSON.parse(localStorage.getItem("potatoClickerGameData") || "{}"); // Use a specific key

// Merge saved data with default gameData
// This ensures new properties added in updates are included
gameData = { ...gameData, ...savedData };
startingScore = gameData.score; // Track score at the start of this session

// Function to save gameData to localStorage
function saveGameData() {
  localStorage.setItem("potatoClickerGameData", JSON.stringify(gameData));
}

// --- UI Update Functions ---
function formatScore(num) {
    // Basic formatting, you could add larger number handling (K, M, B) later
    return Math.floor(num);
}

function updateScoreDisplay() {
    scoreDisplay.innerText = `Potatoes: ${formatScore(gameData.score)}`;
}

function updateCpsDisplay() {
    // Calculate effective CPS including multiplier
    const effectiveCps = gameData.cookiesPerSecond * gameData.clickMultiplier;
    cpsDisplay.innerText = `Per Second: ${formatScore(effectiveCps)}`;
}

function updateUpgradeCosts() {
    upgradeCost1Display.innerText = `Cost: ${formatScore(gameData.upgradeCost)} Potatoes`;
    upgradeCost2Display.innerText = `Cost: ${formatScore(gameData.upgradeCost2)} Potatoes`;
    upgradeCost3Display.innerText = `Cost: ${formatScore(gameData.upgradeCost3)} Potatoes`;
}

// Function to enable/disable upgrade buttons based on cost
function updateButtonStates() {
    upgradeBtn1.disabled = gameData.score < gameData.upgradeCost;
    upgradeBtn2.disabled = gameData.score < gameData.upgradeCost2;
    upgradeBtn3.disabled = gameData.score < gameData.upgradeCost3;
}

// --- Game Logic Functions ---

function handleClick() {
    gameData.score += (gameData.cookiesPerClick * gameData.clickMultiplier);
    gameData.clicks++;
    csscore++; // Increment session clicks
    updateScoreDisplay();
    updateButtonStates(); // Check if upgrades became affordable
    // Consider adding visual feedback for the click here
    // saveGameData(); // Saving on every click might be too much, save periodically or on upgrades/close
}

function buyUpgrade1() {
    if (gameData.score >= gameData.upgradeCost) {
        gameData.score -= gameData.upgradeCost;
        gameData.cookiesPerClick++;
        gameData.upgradeCost = Math.floor(gameData.upgradeCost * 1.5); // Increase cost

        updateScoreDisplay();
        updateUpgradeCosts();
        updateButtonStates();
        saveGameData();
    }
}

function buyUpgrade2() {
    if (gameData.score >= gameData.upgradeCost2) {
        gameData.score -= gameData.upgradeCost2;
        gameData.cookiesPerSecond++;
        gameData.upgradeCost2 = Math.floor(gameData.upgradeCost2 * 1.5); // Increase cost

        updateScoreDisplay();
        updateCpsDisplay(); // Update CPS display as it changed
        updateUpgradeCosts();
        updateButtonStates();
        saveGameData();
    }
}

function buyUpgrade3() {
    if (gameData.score >= gameData.upgradeCost3) {
        gameData.score -= gameData.upgradeCost3;
        gameData.clickMultiplier++; // Increment multiplier
        // Maybe increase cost more steeply for multipliers
        gameData.upgradeCost3 = Math.floor(gameData.upgradeCost3 * 2.0); // Increase cost

        updateScoreDisplay();
        updateCpsDisplay(); // Update CPS display as multiplier affects it
        updateUpgradeCosts();
        updateButtonStates();
        saveGameData();
    }
}

function passiveIncomeTick() {
    timeOpen++; // Increment session timer

    // Apply passive income
    if (gameData.cookiesPerSecond > 0) {
        gameData.score += (gameData.cookiesPerSecond * gameData.clickMultiplier);
        updateScoreDisplay();
        updateButtonStates(); // Check affordability due to passive income
    }

    // --- Basic Anti-Cheat / Monitoring (Optional Refinement) ---
    // This section is complex and may need careful tuning or simplification.
    // It attempts to detect abnormally high score increases or click rates.
    if (csscore > 0 && timeOpen > 5) { // Avoid checks in the first few seconds
        const cps = csscore / timeOpen; // Clicks per second this session
        const changePerSecond = (gameData.score - startingScore) / timeOpen; // Average score gain per second

        // Expected max gain per second roughly: (Max CPS * PPC) + passive CPS
        // Let's set a generous threshold, e.g., 20 clicks/sec
        const expectedMaxClickGain = 20 * gameData.cookiesPerClick * gameData.clickMultiplier;
        const expectedPassiveGain = gameData.cookiesPerSecond * gameData.clickMultiplier;
        const generousThreshold = (expectedMaxClickGain + expectedPassiveGain) * 1.5; // Allow 50% buffer

        console.log(`Avg SPS: ${changePerSecond.toFixed(2)}, Session CPS: ${cps.toFixed(2)}, Threshold: ${generousThreshold.toFixed(2)}`);

        // Example simplistic checks (adjust thresholds carefully):
        if (changePerSecond > generousThreshold * 5) { // Very high score gain?
          console.warn("Suspiciously high score gain detected.");
             // Consider action: reset score, flag account, etc.
          gameData.score = 0; // Example action
        } else if (cps > 25) { // Very high click rate?
            console.warn("Suspiciously high click rate detected.");
            // Consider action: temporary penalty, score reduction, etc.
            gameData.score -= (100 * gameData.cookiesPerClick * gameData.clickMultiplier); // Example penalty
        }
    }
     // --- End Anti-Cheat ---

     // We save periodically in the background now, e.g., every 30 seconds
     if(timeOpen % 30 === 0) {
         saveGameData();
         // console.log("Game saved automatically.");
     }

}

// --- Event Listeners ---
potatoImage.addEventListener("click", handleClick);
upgradeBtn1.addEventListener("click", buyUpgrade1);
upgradeBtn2.addEventListener("click", buyUpgrade2);
upgradeBtn3.addEventListener("click", buyUpgrade3);

window.addEventListener('beforeunload', saveGameData);


// --- Initialization ---
// Initial UI update on page load
updateScoreDisplay();
updateCpsDisplay();
updateUpgradeCosts();
updateButtonStates();

// --- Game Loop ---
// Start the passive income interval (game tick)
setInterval(passiveIncomeTick, 1000); // Run every 1 second

// Initial save in case nothing else triggers it
saveGameData();