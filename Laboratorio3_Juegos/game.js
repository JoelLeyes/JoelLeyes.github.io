// Canvas y contexto
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Estado del juego
let gameRunning = false;
let gameStarted = false;

// Objetos del juego
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 5,
    speedX: 5,
    speedY: 5
};

const paddle = {
    width: 10,
    height: 80,
    speed: 6
};

const player1 = {
    x: 10,
    y: canvas.height / 2 - paddle.height / 2,
    score: 0,
    keys: {}
};

const player2 = {
    x: canvas.width - paddle.width - 10,
    y: canvas.height / 2 - paddle.height / 2,
    score: 0,
    keys: {}
};

// Event listeners
document.getElementById('startBtn').addEventListener('click', startGame);

document.addEventListener('keydown', (e) => {
    if (e.key === 'w' || e.key === 'W') player1.keys['w'] = true;
    if (e.key === 's' || e.key === 'S') player1.keys['s'] = true;
    if (e.key === 'ArrowUp') player2.keys['ArrowUp'] = true;
    if (e.key === 'ArrowDown') player2.keys['ArrowDown'] = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'w' || e.key === 'W') player1.keys['w'] = false;
    if (e.key === 's' || e.key === 'S') player1.keys['s'] = false;
    if (e.key === 'ArrowUp') player2.keys['ArrowUp'] = false;
    if (e.key === 'ArrowDown') player2.keys['ArrowDown'] = false;
});

// Funciones principales
function startGame() {
    if (!gameStarted) {
        gameRunning = true;
        gameStarted = true;
        document.getElementById('startBtn').textContent = 'Reiniciar';
        gameLoop();
    } else {
        resetGame();
    }
}

function resetGame() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speedX = (Math.random() > 0.5 ? 1 : -1) * 5;
    ball.speedY = (Math.random() - 0.5) * 8;
    player1.y = canvas.height / 2 - paddle.height / 2;
    player2.y = canvas.height / 2 - paddle.height / 2;
    player1.score = 0;
    player2.score = 0;
    gameRunning = true;
}

function gameLoop() {
    if (!gameRunning) return;

    // Limpiar canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujar línea central
    ctx.strokeStyle = '#fff';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Actualizar jugadores
    updatePlayer(player1);
    updatePlayer(player2);

    // Actualizar pelota
    updateBall();

    // Dibujar todo
    drawPaddle(player1);
    drawPaddle(player2);
    drawBall();
    drawScore();

    requestAnimationFrame(gameLoop);
}

function updatePlayer(player) {
    if (player.keys['w'] && player.y > 0) {
        player.y -= paddle.speed;
    }
    if (player.keys['s'] && player.y + paddle.height < canvas.height) {
        player.y += paddle.speed;
    }
    if (player.keys['ArrowUp'] && player.y > 0) {
        player.y -= paddle.speed;
    }
    if (player.keys['ArrowDown'] && player.y + paddle.height < canvas.height) {
        player.y += paddle.speed;
    }
}

function updateBall() {
    ball.x += ball.speedX;
    ball.y += ball.speedY;

    // Rebote en arriba/abajo
    if (ball.y - ball.size < 0 || ball.y + ball.size > canvas.height) {
        ball.speedY *= -1;
    }

    // Colisión con paletas
    if (
        ball.x - ball.size < player1.x + paddle.width &&
        ball.y > player1.y &&
        ball.y < player1.y + paddle.height
    ) {
        ball.speedX *= -1;
        player1.score++;
    }

    if (
        ball.x + ball.size > player2.x &&
        ball.y > player2.y &&
        ball.y < player2.y + paddle.height
    ) {
        ball.speedX *= -1;
        player2.score++;
    }

    // Fin de juego
    if (ball.x < 0 || ball.x > canvas.width) {
        gameRunning = false;
        const winner = ball.x < 0 ? 'Jugador 2' : 'Jugador 1';
        alert(winner + ' gana con ' + Math.max(player1.score, player2.score) + ' puntos!');
        gameStarted = false;
        document.getElementById('startBtn').textContent = 'Iniciar Juego';
    }
}

function drawPaddle(player) {
    ctx.fillStyle = '#00d4ff';
    ctx.fillRect(player.x, player.y, paddle.width, paddle.height);
}

function drawBall() {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fill();
}

function drawScore() {
    ctx.fillStyle = '#fff';
    ctx.font = '30px Arial';
    ctx.fillText(player1.score, canvas.width / 4, 40);
    ctx.fillText(player2.score, (canvas.width * 3) / 4, 40);
}

console.log('🎮 Pong Intervenido - En desarrollo');
