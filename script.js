// Game state variables
let playerScore = 0;
let cpuScore = 0;
let gamePhase = 'setup'; // 'setup', 'player-batting', 'cpu-batting', 'innings-break', 'game-over'
let targetScore = 0;
let playerName = '';
let playerChoice = ''; // 'bat' or 'bowl'
let ballsRemaining = 6;
let currentScreen = 1;
let currentInnings = 1; // Track which innings we're in
let firstInningsScore = 0; // Store first innings score

// Match history
let matchHistory = {
    totalMatches: 0,
    totalWins: 0,
    highScore: 0,
    highScorePlayer: ''
};

// DOM elements
const playerScoreElement = document.getElementById('playerScore');
const cpuScoreElement = document.getElementById('cpuScore');
const gamePhaseElement = document.getElementById('gamePhase');
const lastMoveElement = document.getElementById('lastMove');
const ballsRemainingElement = document.getElementById('ballsRemaining');
const numberButtons = document.getElementById('numberButtons');
const gameResult = document.getElementById('gameResult');
const resultText = document.getElementById('resultText');
const matchHistorySection = document.getElementById('matchHistory');

// Audio elements
const hitSound = document.getElementById('hitSound');
const outSound = document.getElementById('outSound');
const winSound = document.getElementById('winSound');

// Initialize game
function initGame() {
    loadMatchHistory();
    showScreen(1);

    // Enable name submit button when name is entered
    const nameInput = document.getElementById('playerName');
    const submitBtn = document.getElementById('nameSubmitBtn');

    nameInput.addEventListener('input', function() {
        submitBtn.disabled = this.value.trim().length === 0;
    });

    // Allow Enter key to submit name
    nameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && this.value.trim().length > 0) {
            goToScreen2();
        }
    });
}

// Show specific screen
function showScreen(screenNumber) {
    // Hide all screens
    for (let i = 1; i <= 4; i++) {
        const screen = document.getElementById(`screen${i}`);
        if (screen) screen.style.display = 'none';
    }

    // Hide other elements
    gameResult.style.display = 'none';
    matchHistorySection.style.display = screenNumber === 1 ? 'block' : 'none';

    // Show target screen
    const targetScreen = document.getElementById(`screen${screenNumber}`);
    if (targetScreen) targetScreen.style.display = 'block';

    currentScreen = screenNumber;
    updateMatchHistoryDisplay();
}

// Screen 1 -> Screen 2
function goToScreen2() {
    playerName = document.getElementById('playerName').value.trim();
    if (playerName) {
        document.getElementById('tossPlayerName').textContent = `${playerName}, choose Heads or Tails:`;
        showScreen(2);
    }
}

// Handle toss (Screen 2 -> Screen 3 or 4)
function handleToss(choice) {
    const coinResult = Math.random() > 0.5 ? 'heads' : 'tails';

    // Show toss result with modal
    if (choice === coinResult) {
        // Player wins toss
        showModal('🎉 Toss Won!', `Coin landed on ${coinResult}`, `${playerName} won the toss!`, 'hit');
        setTimeout(() => {
            closeModal();
            document.getElementById('choiceTitle').textContent = `${playerName}, you won the toss! Choose:`;
            showScreen(3);
        }, 2000);
    } else {
        // CPU wins toss
        showModal('🪙 Toss Lost', `Coin landed on ${coinResult}`, `CPU won the toss and chose to bat first!`, 'out');
        setTimeout(() => {
            closeModal();
            playerChoice = 'bowl';
            startGameplay();
        }, 2000);
    }
}

// Handle choice (Screen 3 -> Screen 4)
function makeChoice(choice) {
    playerChoice = choice;
    startGameplay();
}

// Start gameplay (Screen 4)
function startGameplay() {
    playerScore = 0;
    cpuScore = 0;
    targetScore = 0;
    ballsRemaining = 6;
    currentInnings = 1;
    firstInningsScore = 0;

    showScreen(4);

    // Update player name in score display
    document.getElementById('playerScoreTitle').innerHTML = `${playerName}: <span id="playerScore">0</span>`;

    if (playerChoice === 'bat') {
        gamePhase = 'player-batting';
        gamePhaseElement.textContent = `Innings 1: ${playerName}, your turn to bat!`;
    } else {
        gamePhase = 'cpu-batting';
        gamePhaseElement.textContent = `Innings 1: ${playerName}, your turn to bowl! CPU is batting.`;
    }

    updateDisplay();
    enableButtons();
    lastMoveElement.textContent = 'Choose a number to start first innings...';
}

// Generate random number for CPU (1,2,3,4,6)
function getCPUMove() {
    const possibleMoves = [1, 2, 3, 4, 6];
    return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
}

// Handle player move
function playMove(playerMove) {
    if (gamePhase === 'game-over' || ballsRemaining <= 0) return;

    const cpuMove = getCPUMove();
    ballsRemaining--;

    if (gamePhase === 'player-batting') {
        handlePlayerBatting(playerMove, cpuMove);
    } else if (gamePhase === 'cpu-batting') {
        handleCPUBatting(playerMove, cpuMove);
    }

    updateDisplay();

    // Check if innings should end due to balls limit
    if (ballsRemaining <= 0 && gamePhase === 'player-batting') {
        setTimeout(() => {
            endPlayerInnings();
        }, 2000);
    } else if (ballsRemaining <= 0 && gamePhase === 'cpu-batting') {
        setTimeout(() => {
            if (currentInnings === 1) {
                endPlayerInnings(); // Go to second innings
            } else {
                endGame(); // End match after second innings
            }
        }, 2000);
    }
}

// Handle player batting phase
function handlePlayerBatting(playerMove, cpuMove) {
    if (playerMove === cpuMove) {
        // Player is out
        playSound(outSound);
        showModal('❌ OUT!', `You played ${playerMove}, CPU bowled ${cpuMove}`, 'You\'re OUT!', 'out');

        setTimeout(() => {
            closeModal();
            endPlayerInnings();
        }, 2000);
    } else {
        // Player scores
        playSound(hitSound);
        playerScore += playerMove;

        if (currentInnings === 2 && playerScore >= targetScore) {
            // Player wins in second innings
            showModal('🎉 YOU WIN!', `You played ${playerMove}, CPU bowled ${cpuMove}`, `You reached the target!`, 'hit');
            setTimeout(() => {
                closeModal();
                endGame();
            }, 2000);
        } else {
            showModal('🏏 RUNS!', `You played ${playerMove}, CPU bowled ${cpuMove}`, `Great shot! +${playerMove} runs`, 'hit');

            setTimeout(() => {
                if (currentInnings === 2) {
                    gamePhaseElement.textContent = `Innings 2: Good batting! You need ${Math.max(0, targetScore - playerScore)} more runs.`;
                } else {
                    gamePhaseElement.textContent = `Innings 1: Good batting! You scored ${playerMove} runs.`;
                }
                lastMoveElement.textContent = `Total: ${playerScore} runs. Balls left: ${ballsRemaining}`;
            }, 1500);
        }
    }
}

// End player innings and start CPU batting
function endPlayerInnings() {
    if (currentInnings === 1) {
        // End of first innings
        if (playerChoice === 'bat') {
            // Player batted first, store their score
            firstInningsScore = playerScore;
            currentInnings = 2;

            // Now CPU bats
            gamePhase = 'innings-break';
            showModal('🏏 Innings Break!', `First innings complete!`, `${playerName}: ${playerScore} runs. Now CPU will bat!`, 'hit');
            setTimeout(() => {
                closeModal();
                gamePhase = 'cpu-batting';
                ballsRemaining = 6;
                cpuScore = 0;
                targetScore = playerScore + 1;
                gamePhaseElement.textContent = `Innings 2: CPU needs ${targetScore} to win. You bowl!`;
                lastMoveElement.textContent = 'Bowl to the CPU!';
                enableButtons();
                updateDisplay();
            }, 2500);
        } else {
            // Player bowled first, store CPU score
            firstInningsScore = cpuScore;
            currentInnings = 2;

            // Now player bats
            gamePhase = 'innings-break';
            showModal('🏏 Innings Break!', `First innings complete!`, `CPU: ${cpuScore} runs. Now ${playerName} will bat!`, 'hit');
            setTimeout(() => {
                closeModal();
                gamePhase = 'player-batting';
                ballsRemaining = 6;
                playerScore = 0;
                targetScore = cpuScore + 1;
                gamePhaseElement.textContent = `Innings 2: ${playerName} needs ${targetScore} to win. Your turn to bat!`;
                lastMoveElement.textContent = 'Bat to win!';
                enableButtons();
                updateDisplay();
            }, 2500);
        }
    } else {
        // End of second innings - game is complete
        setTimeout(() => {
            endGame();
        }, 500);
    }
}

// Handle CPU batting phase
function handleCPUBatting(playerMove, cpuMove) {
    if (playerMove === cpuMove) {
        // CPU is out
        playSound(outSound);
        showModal('🎯 WICKET!', `You bowled ${playerMove}, CPU played ${cpuMove}`, 'CPU is OUT!', 'wicket');

        setTimeout(() => {
            closeModal();
            endPlayerInnings(); // Always call endPlayerInnings for proper innings handling
        }, 2000);
    } else {
        // CPU scores
        cpuScore += cpuMove;

        if (currentInnings === 2 && cpuScore >= targetScore) {
            // CPU wins in second innings
            playSound(outSound);
            showModal('😔 CPU WINS!', `You bowled ${playerMove}, CPU played ${cpuMove}`, `CPU reached the target!`, 'loss');
            setTimeout(() => {
                closeModal();
                endGame();
            }, 2000);
        } else {
            playSound(hitSound);
            showModal('🤖 CPU SCORES!', `You bowled ${playerMove}, CPU played ${cpuMove}`, `CPU scored ${cpuMove} runs`, 'cpu-hit');

            setTimeout(() => {
                if (currentInnings === 2) {
                    gamePhaseElement.textContent = `Innings 2: CPU scored ${cpuMove}. CPU needs ${Math.max(0, targetScore - cpuScore)} more runs.`;
                } else {
                    gamePhaseElement.textContent = `Innings 1: CPU scored ${cpuMove} runs.`;
                }
                lastMoveElement.textContent = `CPU total: ${cpuScore} runs. Balls left: ${ballsRemaining}`;
            }, 1500);
        }
    }
}

// Show modal with animation
function showModal(title, message, description, type) {
    const modal = document.getElementById('moveModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const moveAnimation = document.getElementById('moveAnimation');

    modalTitle.textContent = title;
    modalMessage.textContent = description;

    // Add animation based on type
    moveAnimation.className = 'move-animation ' + type;

    modal.style.display = 'flex';

    // Auto close after 2 seconds for non-critical modals
    if (type === 'hit' || type === 'cpu-hit') {
        setTimeout(() => {
            closeModal();
        }, 2000);
    }
}

// Close modal
function closeModal() {
    document.getElementById('moveModal').style.display = 'none';
}

// Play sound effect
function playSound(audio) {
    audio.currentTime = 0;
    audio.play().catch(e => console.log('Audio play failed:', e));
}

// End game and show results
function endGame() {
    disableButtons();
    gameResult.style.display = 'block';
    gamePhase = 'game-over';

    // Remove previous result classes
    gameResult.classList.remove('loss', 'draw');

    // Update match history
    matchHistory.totalMatches++;

    // Update high score (use the player's batting score)
    const playerBattingScore = playerChoice === 'bat' ? firstInningsScore : playerScore;
    if (playerBattingScore > matchHistory.highScore) {
        matchHistory.highScore = playerBattingScore;
        matchHistory.highScorePlayer = playerName;
    }

    // Determine winner based on final scores
    let finalPlayerScore, finalCpuScore;

    if (playerChoice === 'bat') {
        // Player batted first, then CPU batted
        finalPlayerScore = firstInningsScore; // Player's batting score from innings 1
        finalCpuScore = cpuScore;             // CPU's batting score from innings 2
    } else {
        // CPU batted first, then player batted
        finalPlayerScore = playerScore;       // Player's batting score from innings 2
        finalCpuScore = firstInningsScore;    // CPU's batting score from innings 1
    }

    if (finalPlayerScore > finalCpuScore) {
        resultText.textContent = `🎉 ${playerName} Wins! ${playerName}: ${finalPlayerScore}, CPU: ${finalCpuScore}`;
        gamePhaseElement.textContent = `Congratulations! ${playerName} won the match!`;
        matchHistory.totalWins++;
        playSound(winSound);
    } else if (finalCpuScore > finalPlayerScore) {
        resultText.textContent = `🤖 CPU Wins! CPU: ${finalCpuScore}, ${playerName}: ${finalPlayerScore}`;
        gameResult.classList.add('loss');
        gamePhaseElement.textContent = 'CPU won the match!';
    } else {
        resultText.textContent = `🤝 It's a Draw! Both scored ${finalPlayerScore}`;
        gameResult.classList.add('draw');
        gamePhaseElement.textContent = 'What a match! It\'s a perfect tie!';
        matchHistory.totalWins += 0.5;
    }

    saveMatchHistory();
}

// Update score display
function updateDisplay() {
    const playerScoreEl = document.getElementById('playerScore');
    const cpuScoreEl = document.getElementById('cpuScore');
    const ballsEl = document.getElementById('ballsRemaining');

    if (playerScoreEl) playerScoreEl.textContent = playerScore;
    if (cpuScoreEl) cpuScoreEl.textContent = cpuScore;
    if (ballsEl) ballsEl.textContent = ballsRemaining;
}

// Enable number buttons
function enableButtons() {
    const buttons = document.querySelectorAll('.number-btn');
    buttons.forEach(button => {
        button.disabled = false;
    });
}

// Disable number buttons
function disableButtons() {
    const buttons = document.querySelectorAll('.number-btn');
    buttons.forEach(button => {
        button.disabled = true;
    });
}

// Restart game
function restartGame() {
    // Reset all game variables
    playerScore = 0;
    cpuScore = 0;
    gamePhase = 'setup';
    targetScore = 0;
    ballsRemaining = 6;
    currentInnings = 1;
    firstInningsScore = 0;
    playerChoice = '';

    // Hide game result and show name screen
    gameResult.style.display = 'none';

    // Reset form
    document.getElementById('playerName').value = '';
    document.getElementById('nameSubmitBtn').disabled = true;

    // Show first screen
    showScreen(1);
}

// Match history functions
function saveMatchHistory() {
    localStorage.setItem('handCricketHistory', JSON.stringify(matchHistory));
}

function loadMatchHistory() {
    const saved = localStorage.getItem('handCricketHistory');
    if (saved) {
        matchHistory = JSON.parse(saved);
    }
}

function updateMatchHistoryDisplay() {
    const totalMatchesEl = document.getElementById('totalMatches');
    const totalWinsEl = document.getElementById('totalWins');
    const highScoreEl = document.getElementById('highScore');
    const highScorePlayerEl = document.getElementById('highScorePlayer');

    if (totalMatchesEl) totalMatchesEl.textContent = matchHistory.totalMatches;
    if (totalWinsEl) totalWinsEl.textContent = Math.floor(matchHistory.totalWins);
    if (highScoreEl) highScoreEl.textContent = matchHistory.highScore;
    if (highScorePlayerEl) {
        highScorePlayerEl.textContent = matchHistory.highScorePlayer ? `by ${matchHistory.highScorePlayer}` : '';
    }
}

// Add visual feedback for button clicks
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.number-btn').forEach(button => {
        button.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 100);
        });
    });
});

// Initialize game on page load
window.addEventListener('load', initGame);

// Add keyboard support
document.addEventListener('keydown', function(event) {
    const key = event.key;
    if (key >= '1' && key <= '6' && key !== '5') {
        const number = parseInt(key);
        if (currentScreen === 4) {
            playMove(number);
        }
    } else if (key === 'r' || key === 'R') {
        if (gamePhase === 'game-over') {
            restartGame();
        }
    } else if (key === 'Enter') {
        const modal = document.getElementById('moveModal');
        if (modal.style.display === 'flex') {
            closeModal();
        } else if (currentScreen === 1) {
            goToScreen2();
        }
    }
});

// Close modal when clicking outside
document.getElementById('moveModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});