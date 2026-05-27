const sharp = require('sharp');
const path = require('path');

async function makeIcon(size, outputPath) {
  const logo = await sharp(path.join(__dirname, 'src/assets/logo.jpeg')).toBuffer();
  const logoMeta = await sharp(logo).metadata();

  const cropSize = logoMeta.height;
  const left = Math.round((logoMeta.width - cropSize) / 2);

  const cropped = await sharp(logo)
    .extract({ left, top: 0, width: cropSize, height: cropSize })
    .resize(size, size, { fit: 'fill' })
    .toBuffer();

  const fontSize = Math.round(size * 0.045);
  const coverY = Math.round(size * 0.78);
  const coverH = size - coverY;
  const textY = Math.round(size * 0.92);
  const svgOverlay = `<svg width="${size}" height="${size}">
    <rect x="0" y="${coverY}" width="${size}" height="${coverH}" fill="#0A1628"/>
    <text x="${size/2}" y="${textY}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="800" fill="#8BBDE8" letter-spacing="1.5">COMMUNITY AWARENESS SYSTEM</text>
  </svg>`;

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 10, g: 22, b: 40, alpha: 1 }
    }
  })
  .composite([
    { input: cropped, left: 0, top: 0 },
    { input: Buffer.from(svgOverlay), left: 0, top: 0 },
  ])
  .png()
  .toFile(outputPath);

  console.log(`Created ${outputPath} (${size}x${size})`);
}

async function main() {
  await makeIcon(192, path.join(__dirname, 'public/icon-192.png'));
  await makeIcon(512, path.join(__dirname, 'public/icon-512.png'));
}

main().catch(console.error);
