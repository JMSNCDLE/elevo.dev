/* eslint-disable @typescript-eslint/no-require-imports */
const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const svgPath = path.join(__dirname, '../public/logo-large.svg')
const svg = fs.readFileSync(svgPath)

async function generate() {
  const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-48x48.png', size: 48 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'icon-192.png', size: 192 },
    { name: 'icon-512.png', size: 512 },
  ]

  for (const { name, size } of sizes) {
    await sharp(svg).resize(size, size).png().toFile(path.join(__dirname, '../public', name))
    console.log(`✓ ${name} (${size}x${size})`)
  }

  // favicon.ico — 32x32 PNG (browsers accept this)
  await sharp(svg).resize(32, 32).png().toFile(path.join(__dirname, '../public/favicon.ico'))
  console.log('✓ favicon.ico')

  // OG image: 1200x630, dark background, 200x200 cube centered
  const ogWidth = 1200
  const ogHeight = 630
  const logoSize = 200
  const logoBuffer = await sharp(svg).resize(logoSize, logoSize).png().toBuffer()
  await sharp({
    create: { width: ogWidth, height: ogHeight, channels: 4, background: { r: 10, g: 10, b: 20, alpha: 1 } },
  })
    .composite([{ input: logoBuffer, gravity: 'center' }])
    .png()
    .toFile(path.join(__dirname, '../public/og-image.png'))
  console.log('✓ og-image.png (1200x630)')

  console.log('\n🎉 All icons regenerated with 3D cube logo!')
}

generate().catch(err => {
  console.error(err)
  process.exit(1)
})
