document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const playerElement = document.getElementById('player');
    const enemyElement = document.getElementById('enemy');
    const playerHealthBar = document.getElementById('player-health-bar');
    const enemyHealthBar = document.getElementById('enemy-health-bar');
    const messageElement = document.getElementById('message');
    const scoreElement = document.getElementById('score');
    const startButton = document.getElementById('start-button');

    // Game Constants
    const MAX_PLAYER_HEALTH = 100;
    const MAX_ENEMY_HEALTH = 75;
    const PLAYER_ATTACK_DAMAGE = 10;
    const ENEMY_ATTACK_DAMAGE = 20;
    const REACTION_WINDOW_MS = 300; // Time player has to block (adjust difficulty)
    const BLOCK_DURATION_MS = 250; // How long the block visual lasts
    const ENEMY_ATTACK_COOLDOWN_MIN = 600; // Min time between enemy attacks
    const ENEMY_ATTACK_COOLDOWN_MAX = 800; // Max time between enemy attacks
    const TELEGRAPH_DELAY_MIN = 500; // Min time before telegraphing
    const TELEGRAPH_DELAY_MAX = 1500; // Max time before telegraphing

    // Game State Variables
    let playerHealth;
    let enemyHealth;
    let score;
    let isPlayerBlocking = false;
    let isEnemyTelegraphing = false;
    let isGameOver = true; // Start in game over state
    let enemyAttackTimeout = null;
    let telegraphTimeout = null;
    let reactionTimeout = null;
    let blockResetTimeout = null;
    let playerAttackCooldown = false; // Prevent spamming attack

    // --- Core Game Functions ---

    function startGame() {
        playerHealth = MAX_PLAYER_HEALTH;
        enemyHealth = MAX_ENEMY_HEALTH;
        score = 0;
        isGameOver = false;
        isPlayerBlocking = false;
        isEnemyTelegraphing = false;
        playerAttackCooldown = false;

        updateUI();
        clearTimeouts(); // Clear any lingering timeouts

        messageElement.textContent = "Get Ready!";
        startButton.disabled = true;
        startButton.textContent = "Game Running...";

        // Short delay before the first enemy action
        setTimeout(() => {
            spawnEnemy(); // Start with the first enemy
        }, 1000);
    }

    function spawnEnemy() {
        if (isGameOver) return;

        enemyHealth = MAX_ENEMY_HEALTH + Math.floor(score / 50); // Slightly harder enemies over time
        enemyElement.style.opacity = 1;
        enemyElement.classList.remove('telegraphing');
        isEnemyTelegraphing = false;
        updateEnemyHealthBar();
        setMessage("A new challenger appears!");

        // Start the enemy's attack pattern
        scheduleNextEnemyAttack();
    }

    function scheduleNextEnemyAttack() {
        if (isGameOver || enemyHealth <= 0) return;

        const cooldown = Math.random() * (ENEMY_ATTACK_COOLDOWN_MAX - ENEMY_ATTACK_COOLDOWN_MIN) + ENEMY_ATTACK_COOLDOWN_MIN;

        enemyAttackTimeout = setTimeout(() => {
            startEnemyTelegraph();
        }, cooldown);
    }

    function startEnemyTelegraph() {
        if (isGameOver || enemyHealth <= 0) return;

        const delay = Math.random() * (TELEGRAPH_DELAY_MAX - TELEGRAPH_DELAY_MIN) + TELEGRAPH_DELAY_MIN;

        telegraphTimeout = setTimeout(() => {
             if (isGameOver || enemyHealth <= 0) return; // Check again before telegraphing

            isEnemyTelegraphing = true;
            enemyElement.classList.add('telegraphing');
            setMessage("Enemy is attacking!");

            // Start the reaction window timer
            reactionTimeout = setTimeout(resolveEnemyAttack, REACTION_WINDOW_MS);
        }, delay);
    }

    function resolveEnemyAttack() {
         if (isGameOver) return; // Don't resolve if game ended during window

        enemyElement.classList.remove('telegraphing');

        if (isEnemyTelegraphing) { // Ensure attack was actually in progress
            if (isPlayerBlocking) {
                setMessage("Blocked!");
                // Optional: Add score for successful block?
                // score += 5;
                // updateScore();
            } else {
                setMessage("Hit!");
                playerTakeDamage(ENEMY_ATTACK_DAMAGE);
                playerElement.classList.add('hit');
                setTimeout(() => playerElement.classList.remove('hit'), 200); // Remove hit effect
            }
        }

        isEnemyTelegraphing = false; // Reset telegraph state regardless

        // Schedule the next attack if the enemy is still alive and game not over
         if (!isGameOver && enemyHealth > 0) {
            scheduleNextEnemyAttack();
         }
    }


    function playerBlock() {
        if (isGameOver || isPlayerBlocking) return; // Prevent spamming block or blocking when game over

        isPlayerBlocking = true;
        playerElement.classList.add('blocking');
        setMessage("Blocking!");

        // Automatically remove block state after a short duration
        clearTimeout(blockResetTimeout); // Clear previous reset if key is mashed
        blockResetTimeout = setTimeout(() => {
            isPlayerBlocking = false;
            playerElement.classList.remove('blocking');
            // Optionally reset message if it's still "Blocking!"
            if(messageElement.textContent === "Blocking!") {
                 setMessage(""); // Clear block message if no other event happened
            }
        }, BLOCK_DURATION_MS);
    }

    function playerAttack() {
        if (isGameOver || isEnemyTelegraphing || playerAttackCooldown || enemyHealth <= 0) return; // Can't attack if game over, enemy telegraphing, attack on cooldown, or enemy dead

        // Apply cooldown
        playerAttackCooldown = true;
        setTimeout(() => { playerAttackCooldown = false; }, 300); // 300ms attack cooldown

        setMessage("Player attacks!");
        enemyTakeDamage(PLAYER_ATTACK_DAMAGE);
        enemyElement.classList.add('hit');
        setTimeout(() => enemyElement.classList.remove('hit'), 200);

        // Check if enemy defeated
        if (enemyHealth <= 0) {
            enemyDefeated();
        }
    }

    function playerTakeDamage(amount) {
        playerHealth -= amount;
        if (playerHealth < 0) playerHealth = 0;
        updatePlayerHealthBar();

        if (playerHealth <= 0) {
            gameOver();
        }
    }

    function enemyTakeDamage(amount) {
        enemyHealth -= amount;
        if (enemyHealth < 0) enemyHealth = 0;
        updateEnemyHealthBar();
    }

    function enemyDefeated() {
        setMessage("Enemy defeated!");
        score += 10;
        updateScore();
        clearTimeouts(); // Stop current enemy's attack timers
        enemyElement.style.opacity = 0; // Hide defeated enemy

        // Spawn next enemy after a short delay
        setTimeout(spawnEnemy, 1000);
    }


    function gameOver() {
        isGameOver = true;
        clearTimeouts();
        setMessage(`Game Over! Final Score: ${score}`);
        startButton.disabled = false;
        startButton.textContent = "Restart Game";
        playerElement.classList.remove('blocking'); // Ensure block visual is off
        enemyElement.classList.remove('telegraphing'); // Ensure telegraph visual is off
        enemyElement.style.opacity = 0; // Hide enemy on game over
    }

    // --- UI Update Functions ---

    function updateUI() {
        updatePlayerHealthBar();
        updateEnemyHealthBar();
        updateScore();
    }

    function updatePlayerHealthBar() {
        const percentage = (playerHealth / MAX_PLAYER_HEALTH) * 100;
        playerHealthBar.style.width = `${percentage}%`;
    }

    function updateEnemyHealthBar() {
        const maxHP = MAX_ENEMY_HEALTH + Math.floor(score / 50); // Use consistent max HP calculation
        const percentage = (enemyHealth / maxHP) * 100;
        enemyHealthBar.style.width = `${percentage}%`;
    }

    function updateScore() {
        scoreElement.textContent = `Score: ${score}`;
    }

    function setMessage(msg) {
        messageElement.textContent = msg;
    }

    // --- Utility Functions ---
    function clearTimeouts() {
         clearTimeout(enemyAttackTimeout);
         clearTimeout(telegraphTimeout);
         clearTimeout(reactionTimeout);
         clearTimeout(blockResetTimeout);
    }


    // --- Event Listeners ---

    startButton.addEventListener('click', startGame);

    document.addEventListener('keydown', (event) => {
        if (isGameOver) return;

        if (event.code === 'Space') {
            event.preventDefault(); // Prevent spacebar from scrolling page
            playerBlock();
        } else if (event.key === 'a' || event.key === 'A') {
             playerAttack();
        }
    });

    // Initial UI state (before game starts)
    setMessage("Press Start Game!");
    playerHealthBar.style.width = '100%';
    enemyHealthBar.style.width = '100%';
    enemyElement.style.opacity = 0; // Hide enemy initially
});