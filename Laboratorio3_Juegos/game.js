const canvas = document.getElementById('gameCanvas');
const startBtn = document.getElementById('startBtn');

function drawStaticScene() {
	if (!canvas) {
		return;
	}

	const ctx = canvas.getContext('2d');

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
	ctx.fillRect(24, canvas.height / 2 - 45, 12, 90);
	ctx.fillRect(canvas.width - 36, canvas.height / 2 - 45, 12, 90);

	ctx.beginPath();
	ctx.arc(canvas.width / 2, canvas.height / 2, 8, 0, Math.PI * 2);
	ctx.fillStyle = '#f8fafc';
	ctx.fill();
}

if (startBtn) {
	startBtn.addEventListener('click', () => {
		drawStaticScene();
		console.log('Commit 2: dibujo estatico de escena listo.');
	});
}

drawStaticScene();
