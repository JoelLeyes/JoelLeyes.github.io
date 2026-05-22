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
	paused: false,
	gameOver: false,
	winner: null,
	scarletThreshold: 0,
	leftPaddle: {
		x: 24,
		y: 0,
		width: 12,
		height: 90,
		normalHeight: 90
	},
	rightPaddle: {
		x: 0,
		y: 0,
		width: 12,
		height: 90,
		normalHeight: 90
	},
	ball: {
		x: 0,
		y: 0,
		radius: 8,
		vx: 0,
		vy: 0,
		scarlet: false,
		scarletTimer: 0,
		rebounds: 0
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

	// Generar alturas aleatorias solo la primera vez
	if (gameState.leftPaddle.normalHeight === 90 && gameState.rounds === 1) {
		const randomHeightLeft = Math.random() * 30 + 60;
		const randomHeightRight = Math.random() * 30 + 60;
		gameState.leftPaddle.height = randomHeightLeft;
		gameState.leftPaddle.normalHeight = randomHeightLeft;
		gameState.rightPaddle.height = randomHeightRight;
		gameState.rightPaddle.normalHeight = randomHeightRight;
	}

	gameState.leftPaddle.y = canvas.height / 2 - gameState.leftPaddle.height / 2;
	gameState.rightPaddle.x = canvas.width - 36;
	gameState.rightPaddle.y = canvas.height / 2 - gameState.rightPaddle.height / 2;
	gameState.ball.x = canvas.width / 2;
	gameState.ball.y = canvas.height / 2;
	gameState.ball.scarlet = false;
	gameState.ball.scarletTimer = 0;
	gameState.ball.rebounds = 0;

	// Generar threshold de Escarlata para esta ronda
	gameState.scarletThreshold = Math.floor(Math.random() * 3) + 3;

	// Velocidad inicial de la pelota en px/s (aleatoria hacia izquierda o derecha)
	const speed = 220;
	const angle = (Math.random() * 0.6 - 0.3); // -0.3..0.3 radians para variar eje Y
	const dir = Math.random() > 0.5 ? 1 : -1;
	gameState.ball.vx = dir * speed;
	gameState.ball.vy = speed * Math.sin(angle);
}

function triggerScarlet() {
	gameState.ball.scarlet = true;
	gameState.ball.scarletTimer = 8; // dura 8 segundos
	gameState.ball.rebounds = 0;
}

function updateScarlet(deltaTime) {
	if (!gameState.ball.scarlet) {
		return;
	}

	gameState.ball.scarletTimer -= deltaTime;
	if (gameState.ball.scarletTimer <= 0) {
		gameState.ball.scarlet = false;
		gameState.ball.scarletTimer = 0;
	}
}

function resetRound(direction) {
	gameState.ball.x = canvas.width / 2;
	gameState.ball.y = canvas.height / 2;
	gameState.ball.vx = direction * 220;
	gameState.ball.vy = (Math.random() * 200) - 100;
	gameState.leftPaddle.y = canvas.height / 2 - gameState.leftPaddle.height / 2;
	gameState.rightPaddle.y = canvas.height / 2 - gameState.rightPaddle.height / 2;

	// Desactivar Tiempo Escarlata al reiniciar
	gameState.ball.scarlet = false;
	gameState.ball.scarletTimer = 0;
	gameState.ball.rebounds = 0;

	// Generar nuevo threshold de Escarlata para esta ronda
	gameState.scarletThreshold = Math.floor(Math.random() * 3) + 3;

	// Aumentar contador de rondas
	gameState.rounds += 1;
}

function startGame() {
	if (!canvas || gameState.isRunning) {
		return;
	}

	gameState.isRunning = true;
	gameState.paused = false;
	gameState.lastTime = performance.now();
	requestAnimationFrame(gameLoop);
}

function resetGame() {
	// Limpiar estado completo
	gameState.isRunning = false;
	gameState.gameOver = false;
	gameState.winner = null;
	gameState.paused = false;
	gameState.rounds = 1;
	gameState.scoreLeft = 0;
	gameState.scoreRight = 0;
	gameState.lastScorer = null;

	// Reiniciar posiciones
	gameState.leftPaddle.y = canvas.height / 2 - gameState.leftPaddle.height / 2;
	gameState.rightPaddle.y = canvas.height / 2 - gameState.rightPaddle.height / 2;
	gameState.ball.x = canvas.width / 2;
	gameState.ball.y = canvas.height / 2;
	const speed = 220;
	const angle = (Math.random() * 0.6 - 0.3);
	const dir = Math.random() > 0.5 ? 1 : -1;
	gameState.ball.vx = dir * speed;
	gameState.ball.vy = speed * Math.sin(angle);
}

function startGame() {
	if (!canvas || gameState.isRunning) {
		return;
	}

	gameState.isRunning = true;
	gameState.paused = false;
	gameState.lastTime = performance.now();
	requestAnimationFrame(gameLoop);
}

function pauseGame() {
	gameState.paused = true;
}

function resumeGame() {
	if (!gameState.isRunning) return;
	gameState.paused = false;
	// reset lastTime to avoid big delta
	gameState.lastTime = performance.now();
}

function togglePause() {
	if (!gameState.isRunning) return;
	gameState.paused = !gameState.paused;
	if (!gameState.paused) {
		// when resuming, avoid jump in time
		gameState.lastTime = performance.now();
	}
}

function update(deltaTime) {
	if (!gameState.isRunning) {
		return;
	}

	// Actualizar Tiempo Escarlata
	updateScarlet(deltaTime);

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
			if (gameState.scoreRight >= 10) {
				gameState.gameOver = true;
				gameState.winner = 'Right';
			} else {
				resetRound(1);
			}
		} else {
			gameState.scoreLeft += 1;
			gameState.lastScorer = 'Left';
			if (gameState.scoreLeft >= 10) {
				gameState.gameOver = true;
				gameState.winner = 'Left';
			} else {
				resetRound(-1);
			}
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

	// Actualizar botón según estado
	if (startBtn) {
		startBtn.textContent = gameState.gameOver ? 'Reiniciar Partida' : 'Iniciar Juego';
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

	// Calcular altura de paletas: achicadas si Escarlata está activo
	const paletteHeightLeft = gameState.ball.scarlet ? gameState.leftPaddle.normalHeight * 0.7 : gameState.leftPaddle.height;
	const paletteHeightRight = gameState.ball.scarlet ? gameState.rightPaddle.normalHeight * 0.7 : gameState.rightPaddle.height;
	const offsetLeft = (gameState.leftPaddle.height - paletteHeightLeft) / 2;
	const offsetRight = (gameState.rightPaddle.height - paletteHeightRight) / 2;

	ctx.fillRect(
		gameState.leftPaddle.x,
		gameState.leftPaddle.y + offsetLeft,
		gameState.leftPaddle.width,
		paletteHeightLeft
	);
	ctx.fillRect(
		gameState.rightPaddle.x,
		gameState.rightPaddle.y + offsetRight,
		gameState.rightPaddle.width,
		paletteHeightRight
	);

	ctx.beginPath();
	ctx.arc(gameState.ball.x, gameState.ball.y, gameState.ball.radius, 0, Math.PI * 2);
	ctx.fillStyle = gameState.ball.scarlet ? '#ff0000' : '#f8fafc';
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

	// Indicador de Tiempo Escarlata
	if (gameState.ball.scarlet) {
		ctx.fillStyle = '#ff0000';
		ctx.font = 'bold 18px Arial';
		ctx.fillText('TIEMPO ESCARLATA ⚡', canvas.width / 2, canvas.height - 15);
		ctx.font = '12px Arial';
		ctx.fillText(`${gameState.ball.scarletTimer.toFixed(1)}s`, canvas.width / 2, canvas.height + 3);
	}

	// Overlay de pausa
	if (gameState.paused) {
		ctx.fillStyle = 'rgba(0,0,0,0.5)';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = '#ffffff';
		ctx.font = 'bold 36px Arial';
		ctx.textAlign = 'center';
		ctx.fillText('PAUSA', canvas.width / 2, canvas.height / 2 - 10);
		ctx.font = '16px Arial';
		ctx.fillText('Pulsa P para reanudar', canvas.width / 2, canvas.height / 2 + 24);
	}

	// Overlay de fin de partida
	if (gameState.gameOver) {
		ctx.fillStyle = 'rgba(0,0,0,0.7)';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = '#00ff00';
		ctx.font = 'bold 48px Arial';
		ctx.textAlign = 'center';
		const winnerText = gameState.winner === 'Right' ? 'JUGADOR 2 GANA' : 'JUGADOR 1 GANA';
		ctx.fillText(winnerText, canvas.width / 2, canvas.height / 2 - 20);
		ctx.font = '18px Arial';
		ctx.fillStyle = '#e2e8f0';
		ctx.fillText(`${gameState.scoreLeft} - ${gameState.scoreRight}`, canvas.width / 2, canvas.height / 2 + 30);
		ctx.font = '14px Arial';
		ctx.fillText('Reinicia la partida con el botón para jugar de nuevo', canvas.width / 2, canvas.height / 2 + 60);
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
		// Contar rebotes
		b.rebounds += 1;

		// Activar Tiempo Escarlata cuando se alcanza el threshold
		if (b.rebounds >= gameState.scarletThreshold && !b.scarlet) {
			triggerScarlet();
		}

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

		// Si está en Escarlata, duplicar velocidad
		let speedMultiplier = 1.0;
		if (b.scarlet) {
			speedMultiplier = 2.0;
		}

		// Aumentar ligeramente la velocidad y normalizar el vector
		let speed = Math.hypot(b.vx, b.vy);
		const maxSpeed = 900;
		const speedUp = 1.06; // 6% por rebote
		speed = Math.min(speed * speedUp * speedMultiplier, maxSpeed);
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

	if (!gameState.paused && !gameState.gameOver) {
		update(deltaTime);
	}
	draw();
	requestAnimationFrame(gameLoop);
}

if (startBtn) {
	startBtn.addEventListener('click', () => {
		if (gameState.gameOver) {
			// Si la partida terminó, reiniciar y empezar de nuevo
			resetGame();
			startGame();
		} else {
			// Si no está corriendo, iniciar normalmente
			startGame();
		}
	});
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
		case 'p':
		case 'P':
			// Pausa / Reanuda
			togglePause();
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
