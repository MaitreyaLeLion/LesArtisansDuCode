/* ===========================
       INITIALISATION
=========================== */
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const box = 30;
const rows = canvas.height / box;
const cols = canvas.width / box;

/* Serpent : tête, corps, queue de départ */
let snake = [
    { x: 10, y: 10 }, // tête
    { x: 9, y: 10 },  // corps
    { x: 8, y: 10 }   // queue
];
let direction = "RIGHT";
let nextDirection = "RIGHT";

/* Nourriture */
let food = {
    x: Math.floor(Math.random() * cols),
    y: Math.floor(Math.random() * rows)
};

/* Score */
let score = 0;

let gameOver = false;
let gameInterval = null;
let allowControlButtons = true; // bloque boutons après game over

/* ===========================
       CHARGEMENT IMAGES PNG
=========================== */
const imgHead = new Image();
const imgBody = new Image();
const imgTail = new Image();
const imgCorner = new Image();
const imgFood = new Image();

imgHead.src = "img/head.png";
imgBody.src = "img/body.png";
imgTail.src = "img/tail.png";
imgCorner.src = "img/corner.png";
imgFood.src = "img/food.png";

/* ===========================
          CONTROLES
=========================== */
document.addEventListener("keydown", e => {
    if (!allowControlButtons) return;

    if ((e.key === "ArrowUp" || e.key.toLowerCase() === "z") && direction !== "DOWN") nextDirection = "UP";
    if ((e.key === "ArrowDown" || e.key.toLowerCase() === "s") && direction !== "UP") nextDirection = "DOWN";
    if ((e.key === "ArrowLeft" || e.key.toLowerCase() === "q") && direction !== "RIGHT") nextDirection = "LEFT";
    if ((e.key === "ArrowRight" || e.key.toLowerCase() === "d") && direction !== "LEFT") nextDirection = "RIGHT";
});

/* ===========================
     DESSIN IMAGE ROTATION
=========================== */
function drawRotatedImage(img, x, y, angle = 0) {
    ctx.save();
    ctx.translate(x * box + box / 2, y * box + box / 2);
    ctx.rotate(angle - Math.PI / 2);
    ctx.drawImage(img, -box / 2, -box / 2, box, box);
    ctx.restore();
}

/* ===========================
     DETECTION ANGLE COIN
=========================== */
function getCornerAngle(i) {
    const prev = snake[i - 1];
    const curr = snake[i];
    const next = snake[i + 1];

    const dx1 = prev.x - curr.x;
    const dy1 = prev.y - curr.y;
    const dx2 = next.x - curr.x;
    const dy2 = next.y - curr.y;

    if ((dx1 === -1 && dy2 === -1) || (dx2 === -1 && dy1 === -1)) return 0; // bas-gauche
    if ((dx1 === -1 && dy2 === 1) || (dx2 === -1 && dy1 === 1)) return -Math.PI / 2; // haut-gauche
    if ((dx1 === 1 && dy2 === -1) || (dx2 === 1 && dy1 === -1)) return Math.PI / 2; // bas-droite
    if ((dx1 === 1 && dy2 === 1) || (dx2 === 1 && dy1 === 1)) return Math.PI; // haut-droite
    return 0;
}

/* ===========================
       DÉTECTION SI SEGMENT EST UN COIN
=========================== */
function isCorner(i) {
    if (i <= 0 || i >= snake.length - 1) return false;
    const prev = snake[i - 1];
    const curr = snake[i];
    const next = snake[i + 1];

    const dx1 = prev.x - curr.x;
    const dy1 = prev.y - curr.y;
    const dx2 = next.x - curr.x;
    const dy2 = next.y - curr.y;

    return dx1 !== dx2 && dy1 !== dy2;
}

/* ===========================
          COLLISION
=========================== */
function collision(head, array) {
    return array.some(seg => seg.x === head.x && seg.y === head.y);
}

/* ===========================
          GAME OVER
=========================== */
function showGameOver() {
    gameOver = true;
    allowControlButtons = false; // bloque boutons
    document.getElementById("gameOver").classList.add("active");
    clearInterval(gameInterval);
    gameInterval = null;
}

/* ===========================
          RESTART
=========================== */
function resetGame() {
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    direction = "RIGHT";
    nextDirection = "RIGHT";
    food = { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) };
    score = 0;
    document.getElementById("score").textContent = score;
    document.getElementById("message")?.remove(); // supprime le message du mot de passe si présent
    gameOver = false;
    document.getElementById("gameOver").classList.remove("active");
    allowControlButtons = true; // réactive boutons
}

/* ===========================
          BOUTONS
=========================== */
function startGame() {
    if (!gameInterval && allowControlButtons) {
        gameInterval = setInterval(gameLoop, 120);
    }
}

function stopGame() {
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
    }
}

// Boutons
document.getElementById("startBtn").onclick = () => startGame();
document.getElementById("pauseBtn").onclick = () => stopGame();
document.getElementById("resetBtn").onclick = () => resetGame();
document.getElementById("menuBtn").onclick = () => {
    resetGame();
    startGame(); // Rejouer depuis menu
};

/* ===========================
          LOOP
=========================== */
function gameLoop() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // mise à jour direction
    direction = nextDirection;

    // Nourriture
    drawRotatedImage(imgFood, food.x, food.y);

    // Dessin serpent
    for (let i = 0; i < snake.length; i++) {
        const p = snake[i];

        if (i === 0) { // tête
            let headAngle = 0;
            if (direction === "UP") headAngle = -Math.PI / 2;
            if (direction === "DOWN") headAngle = Math.PI / 2;
            if (direction === "LEFT") headAngle = Math.PI;
            if (direction === "RIGHT") headAngle = 0;
            drawRotatedImage(imgHead, p.x, p.y, headAngle);
        } else if (i === snake.length - 1) { // queue
            let tail = snake[i];
            let beforeTail = snake[i - 1];
            let tailAngle = 0;
            if (beforeTail.x < tail.x) tailAngle = 0;
            if (beforeTail.x > tail.x) tailAngle = Math.PI;
            if (beforeTail.y < tail.y) tailAngle = Math.PI / 2;
            if (beforeTail.y > tail.y) tailAngle = -Math.PI / 2;
            drawRotatedImage(imgTail, tail.x, tail.y, tailAngle);
        } else if (isCorner(i)) { // coin
            drawRotatedImage(imgCorner, p.x, p.y, getCornerAngle(i));
        } else { // corps droit
            let prev = snake[i - 1];
            let next = snake[i + 1];
            let angle = (prev.x !== next.x) ? 0 : Math.PI / 2;
            drawRotatedImage(imgBody, p.x, p.y, angle);
        }
    }

    // Nouvelle tête
    let headX = snake[0].x;
    let headY = snake[0].y;

    if (direction === "LEFT") headX--;
    if (direction === "RIGHT") headX++;
    if (direction === "UP") headY--;
    if (direction === "DOWN") headY++;

    // Game Over
    if (headX < 0 || headX >= cols || headY < 0 || headY >= rows || collision({ x: headX, y: headY }, snake)) {
        showGameOver();
        return;
    }

    // Mange nourriture
    if (headX === food.x && headY === food.y) {
        food = { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) };
        score++;
        document.getElementById("score").textContent = score;

        // Affiche le message si score atteint 1 (ou plus si tu veux)
  if (score >= 2) { // par exemple
      document.getElementById("passwordOverlay").classList.add("active");
  }

  // bouton pour fermer le message
  document.getElementById("closePasswordBtn").onclick = () => {
      document.getElementById("passwordOverlay").classList.remove("active");
  };
    } else {
        snake.pop();
    }

    snake.unshift({ x: headX, y: headY });
}
