const canvas = document.getElementById('gameCanvas');
const startBtn = document.getElementById('startBtn');
const ctx = canvas ? canvas.getContext('2d') : null;

const gameState = {
	isRunning: false,
	lastTime: 0,
	leftPaddle: {
		x: 24,
		y: 0,
		width: 12,
		height: 90
	},
	rightPaddle: {
		x: 0,
		y: 0,
		width: 12,
		height: 90
	},
	ball: {
		x: 0,
		y: 0,
		radius: 8
	}
};

function initializeScene() {
	if (!canvas) {
		return;
	}

	gameState.leftPaddle.y = canvas.height / 2 - gameState.leftPaddle.height / 2;
	gameState.rightPaddle.x = canvas.width - 36;
	gameState.rightPaddle.y = canvas.height / 2 - gameState.rightPaddle.height / 2;
	gameState.ball.x = canvas.width / 2;
	gameState.ball.y = canvas.height / 2;
}

function startGame() {
	if (!canvas || gameState.isRunning) {
		return;
	}

	gameState.isRunning = true;
	gameState.lastTime = performance.now();
	requestAnimationFrame(gameLoop);
}

function update(deltaTime) {
	if (!gameState.isRunning) {
		return;
	}

	// Paso 3: logica de movimiento se implementa en el siguiente commit.
	void deltaTime;
}

function draw() {
	if (!canvas || !ctx) {
		return;
	}


	ctx.fillStyle = '#111827';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	ctx.strokeStyle = '#334155';
	ctx.setLineDash([8, 8]);
	ctx.beginPath();
	ctx.moveTo(canvas.width / 2, 0);
	ctx.lineTo(canvas.width / 2, canvas.height);
	ctx.stroke();
	ctx.setLineDash([]);

	ctx.fillStyle = '#60a5fa';
	ctx.fillRect(
		gameState.leftPaddle.x,
		gameState.leftPaddle.y,
		gameState.leftPaddle.width,
		gameState.leftPaddle.height
	);
	ctx.fillRect(
		gameState.rightPaddle.x,
		gameState.rightPaddle.y,
		gameState.rightPaddle.width,
		gameState.rightPaddle.height
	);

	ctx.beginPath();
	ctx.arc(gameState.ball.x, gameState.ball.y, gameState.ball.radius, 0, Math.PI * 2);
	ctx.fillStyle = '#f8fafc';
	ctx.fill();
}

function gameLoop(currentTime) {
	if (!gameState.isRunning) {
		return;
	}

	const deltaTime = (currentTime - gameState.lastTime) / 1000;
	gameState.lastTime = currentTime;

	update(deltaTime);
	draw();
	requestAnimationFrame(gameLoop);
}

if (startBtn) {
	startBtn.addEventListener('click', startGame);
}

initializeScene();
draw();
