
// Game state variables
let playerScore = 0;
let cpuScore = 0;
let gamePhase = 'player-batting'; // 'player-batting', 'cpu-batting', 'game-over'
let targetScore = 0;

// DOM elements
const playerScoreElement = document.getElementById('playerScore');
const cpuScoreElement = document.getElementById('cpuScore');
const gamePhaseElement = document.getElementById('gamePhase');
const lastMoveElement = document.getElementById('lastMove');
const numberButtons = document.getElementById('numberButtons');
const gameResult = document.getElementById('gameResult');
const resultText = document.getElementById('resultText');

// Initialize game
function initGame() {
    playerScore = 0;
    cpuScore = 0;
    gamePhase = 'player-batting';
    targetScore = 0;
    updateDisplay();
    enableButtons();
    gameResult.style.display = 'none';
    gamePhaseElement.textContent = 'Your turn to bat!';
    lastMoveElement.textContent = 'Choose a number to start...';
}

// Generate random number for CPU (1-6)
function getCPUMove() {
    return Math.floor(Math.random() * 6) + 1;
}

// Handle player move
function playMove(playerChoice) {
    if (gamePhase === 'game-over') return;
    
    const cpuChoice = getCPUMove();
    
    if (gamePhase === 'player-batting') {
        handlePlayerBatting(playerChoice, cpuChoice);
    } else if (gamePhase === 'cpu-batting') {
        handleCPUBatting(playerChoice, cpuChoice);
    }
    
    updateDisplay();
}

// Handle player batting phase
function handlePlayerBatting(playerChoice, cpuChoice) {
    lastMoveElement.textContent = `You played ${playerChoice}, CPU played ${cpuChoice}`;
    
    if (playerChoice === cpuChoice) {
        // Player is out
        targetScore = playerScore + 1;
        gamePhase = 'cpu-batting';
        gamePhaseElement.textContent = `You're OUT! Your score: ${playerScore}. CPU needs ${targetScore} to win.`;
        
        // Add dramatic pause before CPU starts batting
        setTimeout(() => {
            if (gamePhase === 'cpu-batting') {
                gamePhaseElement.textContent = 'CPU is batting now. Choose numbers to bowl!';
            }
        }, 2000);
    } else {
        // Player scores
        playerScore += playerChoice;
        gamePhaseElement.textContent = `Good shot! You scored ${playerChoice} runs.`;
    }
}

// Handle CPU batting phase
function handleCPUBatting(playerChoice, cpuChoice) {
    lastMoveElement.textContent = `You bowled ${playerChoice}, CPU played ${cpuChoice}`;
    
    if (playerChoice === cpuChoice) {
        // CPU is out
        gamePhase = 'game-over';
        endGame();
    } else {
        // CPU scores
        cpuScore += cpuChoice;
        
        if (cpuScore >= targetScore) {
            // CPU wins
            gamePhase = 'game-over';
            endGame();
        } else {
            gamePhaseElement.textContent = `CPU scored ${cpuChoice}. CPU needs ${targetScore - cpuScore} more runs.`;
        }
    }
}

// End game and show results
function endGame() {
    disableButtons();
    gameResult.style.display = 'block';
    
    // Remove previous result classes
    gameResult.classList.remove('loss', 'draw');
    
    if (cpuScore >= targetScore && gamePhase === 'game-over' && playerScore < cpuScore) {
        resultText.textContent = `🤖 CPU Wins! CPU: ${cpuScore}, You: ${playerScore}`;
        gameResult.classList.add('loss');
        gamePhaseElement.textContent = 'CPU reached the target!';
    } else if (playerScore > cpuScore) {
        resultText.textContent = `🎉 You Win! You: ${playerScore}, CPU: ${cpuScore}`;
        gamePhaseElement.textContent = 'Congratulations! You won!';
    } else if (playerScore === cpuScore) {
        resultText.textContent = `🤝 It's a Draw! Both scored ${playerScore}`;
        gameResult.classList.add('draw');
        gamePhaseElement.textContent = 'What a match! It\'s a tie!';
    } else {
        resultText.textContent = `🎉 You Win! You: ${playerScore}, CPU: ${cpuScore}`;
        gamePhaseElement.textContent = 'CPU got out! You won!';
    }
}

// Update score display
function updateDisplay() {
    playerScoreElement.textContent = playerScore;
    cpuScoreElement.textContent = cpuScore;
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
    initGame();
}

// Add some visual feedback for button clicks
document.querySelectorAll('.number-btn').forEach(button => {
    button.addEventListener('click', function() {
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = '';
        }, 100);
    });
});

// Initialize game on page load
window.addEventListener('load', initGame);

// Add keyboard support for better accessibility
document.addEventListener('keydown', function(event) {
    const key = event.key;
    if (key >= '1' && key <= '6') {
        const number = parseInt(key);
        playMove(number);
    } else if (key === 'r' || key === 'R') {
        if (gamePhase === 'game-over') {
            restartGame();
        }
    }
});
