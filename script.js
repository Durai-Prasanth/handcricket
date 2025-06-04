
// Game state variables
let playerScore = 0;
let cpuScore = 0;
let gamePhase = 'setup'; // 'setup', 'toss', 'choice', 'player-batting', 'cpu-batting', 'game-over'
let targetScore = 0;
let playerName = '';
let playerChoice = ''; // 'bat' or 'bowl'
let tossWinner = '';

// Match history
let matchHistory = {
    totalMatches: 0,
    totalWins: 0,
    highScore: 0
};

// DOM elements
const playerScoreElement = document.getElementById('playerScore');
const cpuScoreElement = document.getElementById('cpuScore');
const gamePhaseElement = document.getElementById('gamePhase');
const lastMoveElement = document.getElementById('lastMove');
const numberButtons = document.getElementById('numberButtons');
const gameResult = document.getElementById('gameResult');
const resultText = document.getElementById('resultText');
const playerSetup = document.getElementById('playerSetup');
const gameInfo = document.getElementById('gameInfo');
const matchHistorySection = document.getElementById('matchHistory');

// Audio elements
const hitSound = document.getElementById('hitSound');
const outSound = document.getElementById('outSound');
const winSound = document.getElementById('winSound');

// Initialize game
function initGame() {
    loadMatchHistory();
    showSetup();
}

// Show setup section
function showSetup() {
    playerSetup.style.display = 'block';
    gameInfo.style.display = 'none';
    gameResult.style.display = 'none';
    matchHistorySection.style.display = 'block';
    updateMatchHistoryDisplay();
    
    const nameInput = document.getElementById('playerName');
    nameInput.addEventListener('input', function() {
        if (this.value.trim().length > 0) {
            document.getElementById('tossSection').style.display = 'block';
        } else {
            document.getElementById('tossSection').style.display = 'none';
            document.getElementById('choiceSection').style.display = 'none';
            document.getElementById('startGameBtn').style.display = 'none';
        }
    });
}

// Handle toss
function handleToss(choice) {
    const coinResult = Math.random() > 0.5 ? 'heads' : 'tails';
    const tossResultElement = document.getElementById('tossResult');
    const choiceSection = document.getElementById('choiceSection');
    const choiceTitle = document.getElementById('choiceTitle');
    
    playerName = document.getElementById('playerName').value.trim();
    
    if (choice === coinResult) {
        tossWinner = 'player';
        tossResultElement.textContent = `🎉 It's ${coinResult}! You won the toss!`;
        choiceTitle.textContent = `${playerName}, you won the toss! Choose:`;
    } else {
        tossWinner = 'cpu';
        tossResultElement.textContent = `😔 It's ${coinResult}! CPU won the toss!`;
        choiceTitle.textContent = 'CPU won the toss and chose to bat first!';
        playerChoice = 'bowl';
        setTimeout(() => {
            document.getElementById('startGameBtn').style.display = 'block';
        }, 1500);
    }
    
    choiceSection.style.display = 'block';
}

// Handle player choice
function makeChoice(choice) {
    playerChoice = choice;
    document.getElementById('startGameBtn').style.display = 'block';
}

// Start actual game
function startGame() {
    playerScore = 0;
    cpuScore = 0;
    targetScore = 0;
    
    playerSetup.style.display = 'none';
    gameInfo.style.display = 'block';
    matchHistorySection.style.display = 'none';
    
    // Update player name in score display
    document.querySelector('.player-score h3').innerHTML = `${playerName}: <span id="playerScore">0</span>`;
    
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

// Generate random number for CPU (1-6)
function getCPUMove() {
    return Math.floor(Math.random() * 6) + 1;
}

// Handle player move
function playMove(playerMove) {
    if (gamePhase === 'game-over' || gamePhase === 'setup') return;
    
    const cpuMove = getCPUMove();
    
    if (gamePhase === 'player-batting') {
        handlePlayerBatting(playerMove, cpuMove);
    } else if (gamePhase === 'cpu-batting') {
        handleCPUBatting(playerMove, cpuMove);
    }
    
    updateDisplay();
}

// Handle player batting phase
function handlePlayerBatting(playerMove, cpuMove) {
    if (playerMove === cpuMove) {
        // Player is out
        playSound(outSound);
        showModal('❌ OUT!', `You played ${playerMove}, CPU bowled ${playerMove}`, 'You\'re OUT!', 'out');
        
        targetScore = playerScore + 1;
        gamePhase = 'cpu-batting';
        
        setTimeout(() => {
            gamePhaseElement.textContent = `You scored ${playerScore}. CPU needs ${targetScore} to win.`;
            lastMoveElement.textContent = 'Now bowl to the CPU!';
        }, 2000);
    } else {
        // Player scores
        playSound(hitSound);
        playerScore += playerMove;
        showModal('🏏 RUNS!', `You played ${playerMove}, CPU bowled ${cpuMove}`, `Great shot! +${playerMove} runs`, 'hit');
        
        setTimeout(() => {
            gamePhaseElement.textContent = `Good batting! You scored ${playerMove} runs.`;
            lastMoveElement.textContent = `Total: ${playerScore} runs`;
        }, 1500);
    }
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
        
        if (gamePhase === 'cpu-batting' && cpuScore >= targetScore) {
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
                if (gamePhase === 'cpu-batting') {
                    gamePhaseElement.textContent = `CPU scored ${cpuMove}. CPU needs ${targetScore - cpuScore} more runs.`;
                    lastMoveElement.textContent = `CPU total: ${cpuScore} runs`;
                }
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
    
    // Auto close after 3 seconds for non-critical modals
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
    }
    
    if (gamePhase === 'game-over' && playerScore > cpuScore) {
        resultText.textContent = `🎉 ${playerName} Wins! ${playerName}: ${playerScore}, CPU: ${cpuScore}`;
        gamePhaseElement.textContent = 'Congratulations! You won!';
        matchHistory.totalWins++;
        playSound(winSound);
    } else if (gamePhase === 'game-over' && cpuScore >= targetScore && playerChoice === 'bat') {
        resultText.textContent = `🤖 CPU Wins! CPU: ${cpuScore}, ${playerName}: ${playerScore}`;
        gameResult.classList.add('loss');
        gamePhaseElement.textContent = 'CPU reached the target!';
    } else if (playerScore === cpuScore) {
        resultText.textContent = `🤝 It's a Draw! Both scored ${playerScore}`;
        gameResult.classList.add('draw');
        gamePhaseElement.textContent = 'What a match! It\'s a tie!';
        matchHistory.totalWins += 0.5; // Half point for draw
    } else if (playerChoice === 'bowl' && cpuScore < targetScore) {
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
    gameResult.style.display = 'none';
    showSetup();
    // Reset form
    document.getElementById('playerName').value = '';
    document.getElementById('tossSection').style.display = 'none';
    document.getElementById('choiceSection').style.display = 'none';
    document.getElementById('startGameBtn').style.display = 'none';
    document.getElementById('tossResult').textContent = '';
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
    document.getElementById('totalMatches').textContent = matchHistory.totalMatches;
    document.getElementById('totalWins').textContent = Math.floor(matchHistory.totalWins);
    document.getElementById('highScore').textContent = matchHistory.highScore;
}

// Add visual feedback for button clicks
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

// Add keyboard support
document.addEventListener('keydown', function(event) {
    const key = event.key;
    if (key >= '1' && key <= '6') {
        const number = parseInt(key);
        playMove(number);
    } else if (key === 'r' || key === 'R') {
        if (gamePhase === 'game-over') {
            restartGame();
        }
    } else if (key === 'Enter') {
        const modal = document.getElementById('moveModal');
        if (modal.style.display === 'flex') {
            closeModal();
        }
    }
});

// Close modal when clicking outside
document.getElementById('moveModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});
