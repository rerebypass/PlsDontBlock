const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 400;
canvas.height = 400;

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [
  { x: 10, y: 10 }
];
let velocity = { x: 0, y: 0 };
let food = { x: 15, y: 15 };
let score = 0;

document.addEventListener('keydown', changeDirection);

function gameLoop() {
  update();
  draw();
  if (checkGameOver()) {
    alert('Game Over! Your score: ' + score);
    resetGame();
  } else {
    setTimeout(gameLoop, 100);
  }
}

function update() {
  const head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y };

  // Snake eating food
  if (head.x === food.x && head.y === food.y) {
    score++;
    food = { x: Math.floor(Math.random() * tileCount), y: Math.floor(Math.random() * tileCount) };
  } else {
    snake.pop(); // Remove the last part of the snake unless it grows
  }

  snake.unshift(head); // Add new head to the snake
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw snake
  snake.forEach(part => {
    ctx.fillStyle = 'lime';
    ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize, gridSize);
  });

  // Draw food
  ctx.fillStyle = 'red';
  ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);

  // Draw score
  ctx.fillStyle = 'white';
  ctx.fillText("Score: " + score, 10, 20);
}

function changeDirection(event) {
  const keyPressed = event.keyCode;

  if (keyPressed === 37 && velocity.x === 0) { // Left arrow
    velocity = { x: -1, y: 0 };
  } else if (keyPressed === 38 && velocity.y === 0) { // Up arrow
    velocity = { x: 0, y: -1 };
  } else if (keyPressed === 39 && velocity.x === 0) { // Right arrow
    velocity = { x: 1, y: 0 };
  } else if (keyPressed === 40 && velocity.y === 0) { // Down arrow
    velocity = { x: 0, y: 1 };
  }
}

function checkGameOver() {
  const head = snake[0];
  
  // Check if snake hits the wall
  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
    return true;
  }

  // Check if snake hits itself
  for (let i = 1; i < snake.length; i++) {
    if (snake[i].x === head.x && snake[i].y === head.y) {
      return true;
    }
  }

  return false;
}

function resetGame() {
  snake = [{ x: 10, y: 10 }];
  velocity = { x: 0, y: 0 };
  score = 0;
  food = { x: 15, y: 15 };
}

gameLoop();
