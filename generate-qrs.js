const QRCode = require('qrcode')
const fs = require('fs')
const path = require('path')

const DJs = [
  'dj-001',
  'dj-002',
  'dj-003',
  'dj-004',
  'dj-005',
  'dj-006',
  'dj-007',
  'dj-008',
  'dj-009',
  'dj-010',
]

// ALTERA ESTE LINK DEPOIS PARA O TEU DOMÍNIO REAL
const BASE_URL = 'https://purificacaosessions.vercel.app'

const outputDir = path.join(__dirname, 'public', 'qrs')

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

async function generate() {
  for (const dj of DJs) {
    const url = `${BASE_URL}/votar/${dj}`
    const filePath = path.join(outputDir, `${dj}.png`)

    await QRCode.toFile(filePath, url, {
      width: 500,
      margin: 2,
    })

    console.log(`QR criado: ${filePath}`)
  }
}

generate()