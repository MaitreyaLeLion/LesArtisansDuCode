/* ===========================

   CONFIG & VARIABLES
   =========================== */

const DOMAIN_NAME = "http://129.151.255.248:3001/";


const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// GRID fixe (20x20) -> box calculé pour s'adapter exactement au canvas
const GRID = 20;
const box = canvas.width / GRID; // ex: 560 / 20 = 28
const rows = GRID;
const cols = GRID;

/* Serpent (tête, corps, queue) */
let snake = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 }
];
let direction = "RIGHT";
let nextDirection = "RIGHT";

/* Nourriture */
let food = { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) };

/* Score */
let score = 0;

/* Game state */
let gameOver = false;
let gameInterval = null;
let allowControlButtons = true;

/* Boss */
let bossActive = false;
let bossType = 0;
let bombs = []; // positions {x,y}

/* Tick speeds (ms) */
const normalSpeed = 120;
let currentSpeed = normalSpeed;

/* ===========================
   IMAGES (préchargées)
   =========================== */
const imgHead = new Image();
const imgBody = new Image();
const imgTail = new Image();
const imgCorner = new Image();
const imgFood = new Image();
const imgBomb = new Image();

imgHead.src = "img/head.png";
imgBody.src = "img/body.png";
imgTail.src = "img/tail.png";
imgCorner.src = "img/corner.png";
imgFood.src = "img/food.png";
imgBomb.src = "img/bomb.png";

/* ===========================
   CONTROLES
   =========================== */
document.addEventListener("keydown", e => {
  if (!allowControlButtons) return;

  const k = e.key.toLowerCase();
  if ((k === "arrowup" || k === "z") && direction !== "DOWN") nextDirection = "UP";
  else if ((k === "arrowdown" || k === "s") && direction !== "UP") nextDirection = "DOWN";
  else if ((k === "arrowleft" || k === "q") && direction !== "RIGHT") nextDirection = "LEFT";
  else if ((k === "arrowright" || k === "d") && direction !== "LEFT") nextDirection = "RIGHT";
});

/* ===========================
   DESSIN UTILS
   =========================== */
function drawRotatedImage(img, x, y, angle = 0, padding = 0) {
  const w = box - 2 * padding;
  const h = box - 2 * padding;
  ctx.save();
  ctx.translate(x * box + box / 2, y * box + box / 2);
  ctx.rotate(angle - Math.PI / 2);
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
  ctx.restore();
}

function isCorner(i) {
  if (i <= 0 || i >= snake.length - 1) return false;
  const prev = snake[i - 1], curr = snake[i], next = snake[i + 1];
  const dx1 = prev.x - curr.x, dy1 = prev.y - curr.y;
  const dx2 = next.x - curr.x, dy2 = next.y - curr.y;
  return dx1 !== dx2 && dy1 !== dy2;
}

function getCornerAngle(i) {
  const prev = snake[i - 1], curr = snake[i], next = snake[i + 1];
  const dx1 = prev.x - curr.x, dy1 = prev.y - curr.y;
  const dx2 = next.x - curr.x, dy2 = next.y - curr.y;

  if ((dx1 === -1 && dy2 === -1) || (dx2 === -1 && dy1 === -1)) return 0;
  if ((dx1 === -1 && dy2 === 1) || (dx2 === -1 && dy1 === 1)) return -Math.PI / 2;
  if ((dx1 === 1 && dy2 === -1) || (dx2 === 1 && dy1 === -1)) return Math.PI / 2;
  if ((dx1 === 1 && dy2 === 1) || (dx2 === 1 && dy1 === 1)) return Math.PI;
  return 0;
}

/* ===========================
   COLLISIONS & HELPERS
   =========================== */
function collision(head, array) {
  return array.some(seg => seg.x === head.x && seg.y === head.y);
}

function setTickSpeed(ms) {
  if (currentSpeed === ms) return;
  currentSpeed = ms;
  if (gameInterval) {
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, currentSpeed);
  }
}

/* ===========================
   GAME OVER / RESET
   =========================== */
function showGameOver() {
  gameOver = true;
  allowControlButtons = false;
  document.getElementById("gameOver").classList.add("active");
  if (gameInterval) { clearInterval(gameInterval); gameInterval = null; }
}

function resetGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ];
  direction = "RIGHT";
  nextDirection = "RIGHT";
  // place food on an empty cell
  do {
    food.x = Math.floor(Math.random() * cols);
    food.y = Math.floor(Math.random() * rows);
  } while (snake.some(s => s.x === food.x && s.y === food.y));
  score = 0;
  document.getElementById("score").textContent = score;
  document.getElementById("passwordOverlay").classList.remove("active");
  document.getElementById("gameOver").classList.remove("active");
  gameOver = false;
  bossActive = false;
  bossType = 0;
  bombs = [];
  allowControlButtons = true;

  // reset tick speed to normal
  setTickSpeed(normalSpeed);
}

/* ===========================
   BOUTONS & START/STOP
   =========================== */
function startGame() {
  if (!gameInterval && allowControlButtons) {
    gameInterval = setInterval(gameLoop, currentSpeed);
  }
}
function stopGame() {
  if (gameInterval) {
    clearInterval(gameInterval);
    gameInterval = null;
  }
}

document.getElementById("startBtn").onclick = () => startGame();
document.getElementById("pauseBtn").onclick = () => stopGame();
document.getElementById("resetBtn").onclick = () => { resetGame(); };
document.getElementById("menuBtn").onclick = () => { resetGame(); startGame(); };
document.getElementById("closePasswordBtn").onclick = () => document.getElementById("passwordOverlay").classList.remove("active");

/* ===========================
   BOSS 2 : GENERATION BOMBES
   =========================== */
function generateBombs(count) {
  bombs = [];
  while (bombs.length < count) {
    const x = Math.floor(Math.random() * cols);
    const y = Math.floor(Math.random() * rows);
    if (!snake.some(seg => seg.x === x && seg.y === y) && !bombs.some(b => b.x === x && b.y === y)
        && !(food.x === x && food.y === y)) {
      bombs.push({ x, y });
    }
  }
}

/* ===========================
   GAME LOOP
   =========================== */
async function gameLoop() {
  if (gameOver) return;

  // appliquer la prochaine direction (réactivité)
  direction = nextDirection;

  /* -------------------------
     GESTION DES BOSSES (PRIORITÉ / logique)
     Boss1: score 5..9 -> vitesse progressive (division par 1.2,1.4...)
     Boss2: score 15..19 -> invisibilité corps
     Boss3: score 25..29 -> bombes
     ------------------------- */
  if (score >= 5 && score < 10) {
    // Boss1 : accélération progressive
    if (!bossActive || bossType !== 1) { bossActive = true; bossType = 1; }
    // facteur: 5->1.2, 6->1.4, 7->1.6, 8->1.8, 9->2.0
    const facteur = 1 + (score - 4) * 0.2;
    let newSpeed = Math.round(normalSpeed / facteur);
    if (newSpeed < 10) newSpeed = 10;
    setTickSpeed(newSpeed);

  } else if (score >= 15 && score < 20) {
    // Boss2 : invisibilité du corps
    if (!bossActive || bossType !== 2) {
      bossActive = true; bossType = 2;
      setTickSpeed(normalSpeed);
    }

  } else if (score >= 25 && score < 30) {
    // Boss3 : bombes
    if (!bossActive || bossType !== 3) {
      bossActive = true; bossType = 3;
      setTickSpeed(normalSpeed);
      if (bombs.length === 0) generateBombs(10);
    }

  } else {
    // retour à la normale (quand on sort de n'importe quel boss)
    if (bossActive) setTickSpeed(normalSpeed);
    bossActive = false;
    bossType = 0;
    bombs = [];
  }

  // clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // draw nourriture
  drawRotatedImage(imgFood, food.x, food.y);

  // draw bombs if boss3
  if (bossActive && bossType === 3) {
    bombs.forEach(b => drawRotatedImage(imgBomb, b.x, b.y));
  }

  // draw snake (take into account Boss2 invisibility)
  for (let i = 0; i < snake.length; i++) {
    const p = snake[i];
    // Boss2: hide body and corners (only draw head & tail)
    if (bossActive && bossType === 2 && i > 0 && i < snake.length - 1) continue;

    if (i === 0) {
      // head orientation based on direction
      let headAngle = 0;
      if (direction === "UP") headAngle = -Math.PI / 2;
      if (direction === "DOWN") headAngle = Math.PI / 2;
      if (direction === "LEFT") headAngle = Math.PI;
      if (direction === "RIGHT") headAngle = 0;
      drawRotatedImage(imgHead, p.x, p.y, headAngle);
    } else if (i === snake.length - 1) {
      // tail oriented toward previous segment
      const tail = snake[i], beforeTail = snake[i - 1];
      let tailAngle = 0;
      if (beforeTail.x < tail.x) tailAngle = 0;
      else if (beforeTail.x > tail.x) tailAngle = Math.PI;
      else if (beforeTail.y < tail.y) tailAngle = Math.PI / 2;
      else if (beforeTail.y > tail.y) tailAngle = -Math.PI / 2;
      drawRotatedImage(imgTail, tail.x, tail.y, tailAngle);
    } else if (isCorner(i)) {
      drawRotatedImage(imgCorner, p.x, p.y, getCornerAngle(i));
    } else {
      let prev = snake[i - 1], next = snake[i + 1];
      let angle = (prev.x !== next.x) ? 0 : Math.PI / 2;
      drawRotatedImage(imgBody, p.x, p.y, angle);
    }
  }

  // Calcul nouvelle tête (mouvement normal)
  let headX = snake[0].x;
  let headY = snake[0].y;
  if (direction === "LEFT") headX--;
  if (direction === "RIGHT") headX++;
  if (direction === "UP") headY--;
  if (direction === "DOWN") headY++;

  // collisions bord / self
  if (headX < 0 || headX >= cols || headY < 0 || headY >= rows || collision({ x: headX, y: headY }, snake)) {
    showGameOver();
    return;
  }

  // collision bombe (boss3)
  if (bossActive && bossType === 3 && bombs.some(b => b.x === headX && b.y === headY)) {
    showGameOver();
    return;
  }

  // mange nourriture ?
  const ateFood = (headX === food.x && headY === food.y);
  if (ateFood) {
    // replacer nourriture sur une case libre (pas sur snake ni bombes)
    do {
      food.x = Math.floor(Math.random() * cols);
      food.y = Math.floor(Math.random() * rows);
    } while (snake.some(s => s.x === food.x && s.y === food.y) || bombs.some(b => b.x === food.x && b.y === food.y));

    score++;
    document.getElementById("score").textContent = score;

    // affiche overlay mot de passe si seuil atteint
    if (score >= 30) {document.getElementById("passwordOverlay").classList.add("active")
      await fetch(DOMAIN_NAME + "/api/snake_password", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
			});
    };
  } else {
    // si non mangé, on supprime la queue pour avancer normalement
    snake.pop();
  }

  // ajouter nouvelle tête
  snake.unshift({ x: headX, y: headY });
}

/* ===========================
   LANCEMENT INIT
   =========================== */
// set tick to normal (interval not started automatically)
setTickSpeed(normalSpeed);
// If you want auto-start: uncomment the next line
// gameInterval = setInterval(gameLoop, currentSpeed);
