
// Game state variables
let playerScore = 0;
let cpuScore = 0;
let gamePhase = 'setup'; // 'setup', 'player-batting', 'cpu-batting', 'game-over'
let targetScore = 0;
let playerName = '';
let playerChoice = ''; // 'bat' or 'bowl'
let ballsRemaining = 6;
let currentScreen = 1;

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
    nameInput.addEventListener('input', function() {
        const submitBtn = document.getElementById('nameSubmitBtn');
        submitBtn.disabled = this.value.trim().length === 0;
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
    
    if (choice === coinResult) {
        // Player wins toss - go to Screen 3
        document.getElementById('choiceTitle').textContent = `${playerName}, you won the toss! Choose:`;
        showScreen(3);
    } else {
        // CPU wins toss - CPU chooses to bat first, go to Screen 4
        playerChoice = 'bowl';
        startGameplay();
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
    
    showScreen(4);
    
    // Update player name in score display
    document.getElementById('playerScoreTitle').innerHTML = `${playerName}: <span id="playerScore">0</span>`;
    
    if (playerChoice === 'bat') {
        gamePhase = 'player-batting';
        gamePhaseElement.textContent = `${playerName}, your turn to bat!`;
    } else {
        gamePhase = 'cpu-batting';
        gamePhaseElement.textContent = `${playerName}, your turn to bowl! CPU is batting.`;
    }
    
    updateDisplay();
    enableButtons();
    lastMoveElement.textContent = 'Choose a number to start...';
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
            endGame();
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
            endPlayerInnings();
        }, 2000);
    } else {
        // Player scores
        playSound(hitSound);
        playerScore += playerMove;
        showModal('🏏 RUNS!', `You played ${playerMove}, CPU bowled ${cpuMove}`, `Great shot! +${playerMove} runs`, 'hit');
        
        setTimeout(() => {
            gamePhaseElement.textContent = `Good batting! You scored ${playerMove} runs.`;
            lastMoveElement.textContent = `Total: ${playerScore} runs. Balls left: ${ballsRemaining}`;
        }, 1500);
    }
}

// End player innings and start CPU batting
function endPlayerInnings() {
    targetScore = playerScore + 1;
    gamePhase = 'cpu-batting';
    ballsRemaining = 6;
    
    gamePhaseElement.textContent = `You scored ${playerScore}. CPU needs ${targetScore} to win.`;
    lastMoveElement.textContent = 'Now bowl to the CPU!';
    updateDisplay();
}

// Handle CPU batting phase
function handleCPUBatting(playerMove, cpuMove) {
    if (playerMove === cpuMove) {
        // CPU is out
        playSound(outSound);
        showModal('🎯 WICKET!', `You bowled ${playerMove}, CPU played ${cpuMove}`, 'CPU is OUT!', 'wicket');
        
        gamePhase = 'game-over';
        setTimeout(() => {
            endGame();
        }, 2000);
    } else {
        // CPU scores
        cpuScore += cpuMove;
        
        if (cpuScore >= targetScore) {
            // CPU wins
            playSound(outSound);
            showModal('😔 CPU WINS!', `You bowled ${playerMove}, CPU played ${cpuMove}`, `CPU reached the target!`, 'loss');
            gamePhase = 'game-over';
            setTimeout(() => {
                endGame();
            }, 2000);
        } else {
            playSound(hitSound);
            showModal('🤖 CPU SCORES!', `You bowled ${playerMove}, CPU played ${cpuMove}`, `CPU scored ${cpuMove} runs`, 'cpu-hit');
            
            setTimeout(() => {
                gamePhaseElement.textContent = `CPU scored ${cpuMove}. CPU needs ${targetScore - cpuScore} more runs.`;
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
    
    // Remove previous result classes
    gameResult.classList.remove('loss', 'draw');
    
    // Update match history
    matchHistory.totalMatches++;
    
    if (playerScore > matchHistory.highScore) {
        matchHistory.highScore = playerScore;
        matchHistory.highScorePlayer = playerName;
    }
    
    if (playerScore > cpuScore) {
        resultText.textContent = `🎉 ${playerName} Wins! ${playerName}: ${playerScore}, CPU: ${cpuScore}`;
        gamePhaseElement.textContent = 'Congratulations! You won!';
        matchHistory.totalWins++;
        playSound(winSound);
    } else if (cpuScore >= targetScore && playerChoice === 'bat') {
        resultText.textContent = `🤖 CPU Wins! CPU: ${cpuScore}, ${playerName}: ${playerScore}`;
        gameResult.classList.add('loss');
        gamePhaseElement.textContent = 'CPU reached the target!';
    } else if (playerScore === cpuScore) {
        resultText.textContent = `🤝 It's a Draw! Both scored ${playerScore}`;
        gameResult.classList.add('draw');
        gamePhaseElement.textContent = 'What a match! It\'s a tie!';
        matchHistory.totalWins += 0.5;
    } else if (playerChoice === 'bowl' && (cpuScore < targetScore || ballsRemaining <= 0)) {
        resultText.textContent = `🎉 ${playerName} Wins! CPU got out at ${cpuScore}, ${playerName}: ${playerScore}`;
        gamePhaseElement.textContent = 'Great bowling! You won!';
        matchHistory.totalWins++;
        playSound(winSound);
    } else {
        resultText.textContent = `🤖 CPU Wins! CPU: ${cpuScore}, ${playerName}: ${playerScore}`;
        gameResult.classList.add('loss');
        gamePhaseElement.textContent = 'Better luck next time!';
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
    gameResult.style.display = 'none';
    // Reset form
    document.getElementById('playerName').value = '';
    document.getElementById('nameSubmitBtn').disabled = true;
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
