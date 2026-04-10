/* eslint-disable @typescript-eslint/no-require-imports */
const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const svgPath = path.join(__dirname, '../public/logo.svg')
const svg = fs.readFileSync(svgPath)

async function generate() {
  const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-48x48.png', size: 48 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'icon-192.png', size: 192 },
    { name: 'icon-512.png', size: 512 },
    { name: 'og-image.png', size: 1200, height: 630 },
  ]

  for (const { name, size, height } of sizes) {
    const img = sharp(svg)
    if (height) {
      // OG image: center logo on dark background
      const logoBuffer = await sharp(svg).resize(400, 400).png().toBuffer()
      await sharp({
        create: { width: 1200, height: 630, channels: 4, background: { r: 5, g: 5, b: 7, alpha: 1 } },
      })
        .composite([{ input: logoBuffer, gravity: 'center' }])
        .png()
        .toFile(path.join(__dirname, '../public', name))
    } else {
      await img.resize(size, size).png().toFile(path.join(__dirname, '../public', name))
    }
    console.log(`✓ ${name}`)
  }

  // favicon.ico — use 32x32 PNG (browsers handle it fine)
  await sharp(svg).resize(32, 32).png().toFile(path.join(__dirname, '../public/favicon.ico'))
  console.log('✓ favicon.ico')
}

generate().catch(err => {
  console.error(err)
  process.exit(1)
})
