const canvas = document.getElementById('gameCanvas');
const startBtn = document.getElementById('startBtn');
const ctx = canvas ? canvas.getContext('2d') : null;

const gameState = {
	isRunning: false,
	lastTime: 0,
	rounds: 1,
	lastScorer: null,
	scoreLeft: 0,
	scoreRight: 0,
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
		radius: 8,
		vx: 0,
		vy: 0
	}
};

const input = {
	up1: false,
	down1: false,
	up2: false,
	down2: false
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

	// Velocidad inicial de la pelota en px/s (aleatoria hacia izquierda o derecha)
	const speed = 220;
	const angle = (Math.random() * 0.6 - 0.3); // -0.3..0.3 radians para variar eje Y
	const dir = Math.random() > 0.5 ? 1 : -1;
	gameState.ball.vx = dir * speed;
	gameState.ball.vy = speed * Math.sin(angle);
}

function resetRound(direction) {
	gameState.ball.x = canvas.width / 2;
	gameState.ball.y = canvas.height / 2;
	gameState.ball.vx = direction * 220;
	gameState.ball.vy = (Math.random() * 200) - 100;
	gameState.leftPaddle.y = canvas.height / 2 - gameState.leftPaddle.height / 2;
	gameState.rightPaddle.y = canvas.height / 2 - gameState.rightPaddle.height / 2;

	// Aumentar contador de rondas
	gameState.rounds += 1;
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

	// Movimiento básico de la pelota (sin colisiones con paletas aún)
	const b = gameState.ball;
	b.x += b.vx * deltaTime;
	b.y += b.vy * deltaTime;

	// Rebote en borde superior e inferior
	if (b.y - b.radius < 0) {
		b.y = b.radius;
		b.vy *= -1;
	}

	if (b.y + b.radius > canvas.height) {
		b.y = canvas.height - b.radius;
		b.vy *= -1;
	}

	// Si llega a izquierda o derecha, sumamos punto y reiniciamos la ronda
	if (b.x - b.radius < 0 || b.x + b.radius > canvas.width) {
		if (b.x - b.radius < 0) {
			gameState.scoreRight += 1;
			gameState.lastScorer = 'Right';
			resetRound(1);
		} else {
			gameState.scoreLeft += 1;
			gameState.lastScorer = 'Left';
			resetRound(-1);
		}

		return;
	}

	// Mover paletas según input
	const speed = 300; // px/s

	if (input.up1) {
		gameState.leftPaddle.y -= speed * deltaTime;
	}
	if (input.down1) {
		gameState.leftPaddle.y += speed * deltaTime;
	}
	if (input.up2) {
		gameState.rightPaddle.y -= speed * deltaTime;
	}
	if (input.down2) {
		gameState.rightPaddle.y += speed * deltaTime;
	}

	// Limitar paletas dentro del canvas
	gameState.leftPaddle.y = Math.max(0, Math.min(gameState.leftPaddle.y, canvas.height - gameState.leftPaddle.height));
	gameState.rightPaddle.y = Math.max(0, Math.min(gameState.rightPaddle.y, canvas.height - gameState.rightPaddle.height));

	// Detectar colisiones pelota-paletas
	checkPaddleCollision(gameState.leftPaddle);
	checkPaddleCollision(gameState.rightPaddle);
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

	// Marcador
	ctx.fillStyle = '#e2e8f0';
	ctx.font = 'bold 28px Arial';
	ctx.textAlign = 'center';
	ctx.fillText(gameState.scoreLeft, canvas.width / 4, 40);
	ctx.fillText(gameState.scoreRight, (canvas.width * 3) / 4, 40);

	// Información adicional: ronda y servicio
	ctx.font = '16px Arial';
	const server = gameState.ball.vx > 0 ? 'Derecha' : 'Izquierda';
	ctx.fillText(`Ronda ${gameState.rounds} • Servicio: ${server}`, canvas.width / 2, 70);

	// Último punto
	if (gameState.lastScorer) {
		ctx.font = '14px Arial';
		ctx.fillText(`Último punto: ${gameState.lastScorer}`, canvas.width / 2, 92);
	}
}

function checkPaddleCollision(paddle) {
	const b = gameState.ball;
	const p = paddle;

	// Encontrar punto más cercano del rectángulo al círculo
	const closestX = Math.max(p.x, Math.min(b.x, p.x + p.width));
	const closestY = Math.max(p.y, Math.min(b.y, p.y + p.height));

	// Distancia entre punto más cercano y centro del círculo
	const dx = b.x - closestX;
	const dy = b.y - closestY;
	const dist = Math.sqrt(dx * dx + dy * dy);

	// Si la distancia es menor que el radio, hay colisión
	if (dist < b.radius) {
		// Asegurar que la pelota quede fuera de la paleta (evitar pegado)
		if (p.x < canvas.width / 2) {
			b.x = p.x + p.width + b.radius;
		} else {
			b.x = p.x - b.radius;
		}

		// Invertir velocidad horizontal
		b.vx = -b.vx;

		// Variación en Y según posición de impacto
		const hitPos = (b.y - p.y) / p.height;
		b.vy += (hitPos - 0.5) * 200;

		// Aumentar ligeramente la velocidad y normalizar el vector
		let speed = Math.hypot(b.vx, b.vy);
		const maxSpeed = 900;
		const speedUp = 1.06; // 6% por rebote
		speed = Math.min(speed * speedUp, maxSpeed);
		const angle = Math.atan2(b.vy, b.vx);
		b.vx = Math.cos(angle) * speed;
		b.vy = Math.sin(angle) * speed;
	}
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

// Listeners de teclado para controlar paletas
window.addEventListener('keydown', (e) => {
	if (!e) return;
	switch (e.key) {
		case 'w':
		case 'W':
			input.up1 = true;
			break;
		case 's':
		case 'S':
			input.down1 = true;
			break;
		case 'ArrowUp':
			input.up2 = true;
			break;
		case 'ArrowDown':
			input.down2 = true;
			break;
	}
});

window.addEventListener('keyup', (e) => {
	if (!e) return;
	switch (e.key) {
		case 'w':
		case 'W':
			input.up1 = false;
			break;
		case 's':
		case 'S':
			input.down1 = false;
			break;
		case 'ArrowUp':
			input.up2 = false;
			break;
		case 'ArrowDown':
			input.down2 = false;
			break;
	}
});
