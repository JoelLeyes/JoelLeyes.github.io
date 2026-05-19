const canvas = document.getElementById('gameCanvas');
const startBtn = document.getElementById('startBtn');

startBtn.addEventListener('click', () => {
	console.log('Commit 1: estructura base lista.');
});

if (canvas) {
	const ctx = canvas.getContext('2d');
	ctx.fillStyle = '#111827';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}
