const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Créer les icônes PWA
async function generateIcons() {
  const publicDir = path.join(__dirname, '..', 'public');

  // SVG de base avec le logo OneStock
  const svg = `
    <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
      <rect width="512" height="512" fill="#3b82f6"/>
      <text x="256" y="290" font-family="Arial, sans-serif" font-size="200" font-weight="bold" text-anchor="middle" fill="white">OS</text>
    </svg>
  `;

  const svgBuffer = Buffer.from(svg);

  // Générer icon-192.png
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'));

  console.log('✅ icon-192.png créé');

  // Générer icon-512.png
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'));

  console.log('✅ icon-512.png créé');
}

generateIcons().catch(console.error);
