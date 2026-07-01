const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, size, size);

  // Orange circle
  const cx = size / 2, cy = size / 2, r = size * 0.42;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = '#ea580c';
  ctx.fill();

  // Letter م (meem)
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${size * 0.52}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('م', cx, cy + size * 0.03);

  return canvas.toBuffer('image/png');
}

try {
  fs.writeFileSync(path.join(__dirname, 'public', 'icon-192.png'), drawIcon(192));
  fs.writeFileSync(path.join(__dirname, 'public', 'icon-512.png'), drawIcon(512));
  console.log('Icons generated successfully');
} catch (e) {
  console.error('canvas not available:', e.message);
  process.exit(1);
}
