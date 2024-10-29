const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set initial canvas size
resizeCanvas();

// Variables for the ball
let ballRadius = 12;
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 5;
let dy = -5;

// Variables for the paddle
const paddleHeight = 20;
const paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2;
let rightPressed = false;
let leftPressed = false;

// Variable to track the score
let score = 0;

// Variable for game state
let isGameOver = false;
let playerName = '';

// Prompt for the player's name
function getPlayerName() {
    playerName = prompt("Enter your name to start the game:");
    if (!playerName) {
        playerName = "Anonymous";  // Default name if none provided
    }
}

// Call this once to get the player's name
getPlayerName();

// Event listeners for paddle movement
document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);

// Event listener to handle window resizing and keep the game responsive
window.addEventListener('resize', resizeCanvas);

// Event listener for the Play Again button
document.getElementById('play-again-btn').addEventListener('click', resetGame);

// Function to resize the canvas based on window size
function resizeCanvas() {
    canvas.width = window.innerWidth * 0.6;  // Make the canvas 60% of the window width
    canvas.height = window.innerHeight * 0.81; // Make the canvas 81% of the window height
}

// Handle keydown event
function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true;
    }
    if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true;
    }
}

// Handle keyup event
function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
    }
    if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false;
    }
}

// Draw the paddle
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "#000000";
    ctx.fill();
    ctx.closePath();
}

// Draw the ball on the canvas
function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#FF0000';
    ctx.fill();
    ctx.closePath();
}

// Draw the score
function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Score: " + score, 8, 20);
}

// Draw game over message
function drawGameOver() {
    ctx.font = "24px Arial";
    ctx.fillStyle = "#FF0000";
    ctx.fillText("💔Game Over💔", canvas.width / 2 - 85, canvas.height / 6);
    document.getElementById('play-again-btn').style.display = 'block';
}

// Function to submit score to the backend
function submitScore() {
    fetch('/submit_score', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: playerName, score: score }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Score submitted:', data);
    })
    .catch(error => {
        console.error('Error submitting score:', error);
    });
}

// Game loop
function draw() {
    if (isGameOver) return;  // Stop the game if it's over
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the ball, paddle, and score
    drawBall();
    drawPaddle();
    drawScore();

    // Ball movement logic
    x += dx;
    y += dy;

    // Bounce the ball off the left and right walls
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }

    // Bounce the ball off the top wall
    if (y + dy < ballRadius) {
        dy = -dy;
    }

    // If the ball touches the paddle, increase the score and bounce it
    if (y + dy > canvas.height - ballRadius - paddleHeight && x > paddleX && x < paddleX + paddleWidth) {
        dy = -dy;
        score++;
    }
    // If the ball misses the paddle and touches the bottom, game over
    else if (y + dy > canvas.height - ballRadius) {
        isGameOver = true;
        drawGameOver();
        submitScore();  // Submit the score when game is over
        return;
    }

    // Move the paddle
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 10;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 10;
    }

    // Continue the game loop
    requestAnimationFrame(draw);
}

// Reset the game when the player clicks "Play Again"
function resetGame() {
    isGameOver = false;
    document.getElementById('play-again-btn').style.display = 'none';
    paddleX = (canvas.width - paddleWidth) / 2;
    x = canvas.width / 2;
    y = canvas.height - 30;
    dx = 5;
    dy = -5;
    score = 0;
    draw();
}

// Start the game
draw();
