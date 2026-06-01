const fs = require('fs')
const path = require('path')

const TOTAL_CODES = 20000 // muda aqui

const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function randomBlock(length = 4) {
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}

function generateCode(index) {
  return `PS-${randomBlock(4)}-${String(index).padStart(6, '0')}`
}

const used = new Set()
const codes = []

// 🔥 NOVO FORMATO (compatível com Supabase)
const csvRows = ['code,used']

for (let i = 1; i <= TOTAL_CODES; i++) {
  let code
  do {
    code = generateCode(i)
  } while (used.has(code))

  used.add(code)
  codes.push(code)

  // usado = false por default
  csvRows.push(`${code},false`)
}

// caminhos
const projectRoot = process.cwd()
const dataDir = path.join(projectRoot, 'data')
const jsonPath = path.join(dataDir, 'codes.json')
const csvPath = path.join(projectRoot, 'vote_codes.csv')

try {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  // JSON (opcional)
  fs.writeFileSync(jsonPath, JSON.stringify(codes, null, 2), 'utf8')

  // CSV (para importar no Supabase)
  fs.writeFileSync(csvPath, csvRows.join('\n'), 'utf8')

  console.log('-----------------------------------')
  console.log('Códigos gerados com sucesso!')
  console.log(`CSV: ${csvPath}`)
  console.log(`Total: ${TOTAL_CODES}`)
  console.log('-----------------------------------')
} catch (error) {
  console.error('ERRO:', error)
}