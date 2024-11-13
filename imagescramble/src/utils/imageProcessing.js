import { stringToSeed, seededRandom, shuffleArray } from './seedUtils';

export const processImage = (canvas, image, seed, isScramble = true) => {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0);

  const { width, height } = canvas;
  const cols = 8;
  const rows = 8;
  const pieceWidth = Math.floor(width / cols);
  const pieceHeight = Math.floor(height / rows);

  const pieces = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      pieces.push({ x, y });
    }
  }

  const seedValue = stringToSeed(seed.toString());
  const random = seededRandom(seedValue);
  shuffleArray(pieces, random);

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext('2d');

  pieces.forEach((piece, i) => {
    const targetX = (i % cols) * pieceWidth;
    const targetY = Math.floor(i / cols) * pieceHeight;
    const sourceX = isScramble ? piece.x * pieceWidth : targetX;
    const sourceY = isScramble ? piece.y * pieceHeight : targetY;
    const destX = isScramble ? targetX : piece.x * pieceWidth;
    const destY = isScramble ? targetY : piece.y * pieceHeight;

    tempCtx.drawImage(
      canvas,
      sourceX, sourceY,
      pieceWidth, pieceHeight,
      destX, destY,
      pieceWidth, pieceHeight
    );
  });

  ctx.drawImage(tempCanvas, 0, 0);
  return canvas.toDataURL();
}; 