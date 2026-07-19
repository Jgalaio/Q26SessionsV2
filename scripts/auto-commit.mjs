import { execFileSync } from 'node:child_process'

const args = process.argv.slice(2)
const shouldPush = args.includes('--push')
const dryRun = args.includes('--dry-run')
const messageParts = args.filter((arg) => arg !== '--push' && arg !== '--dry-run')
const message =
  messageParts.join(' ').trim() || `chore: auto commit ${formatDate(new Date())}`

const blockedPatterns = [
  /^\.env($|\.)/,
  /(^|\/)\.env($|\.)/,
  /^\.next\//,
  /^\.vercel\//,
  /^node_modules\//,
  /(^|\/).*\.(key|pem|p12|pfx)$/i,
]

function run(command, commandArgs, options = {}) {
  return execFileSync(command, commandArgs, {
    encoding: 'utf8',
    stdio: options.stdio || ['ignore', 'pipe', 'pipe'],
  })
}

function getChangedFiles() {
  return run('git', ['status', '--porcelain=v1', '--untracked-files=all'])
    .split('\n')
    .map((line) => line.slice(3).replace(/^"|"$/g, '').trim())
    .filter(Boolean)
}

function getStagedFiles() {
  return run('git', ['diff', '--cached', '--name-only'])
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function assertSafeFiles(files) {
  const blocked = files.filter((file) =>
    blockedPatterns.some((pattern) => pattern.test(file))
  )

  if (blocked.length === 0) {
    return
  }

  console.error('Auto commit bloqueado por ficheiros sensiveis:')
  for (const file of blocked) {
    console.error(`- ${file}`)
  }
  process.exit(1)
}

function formatDate(date) {
  return date
    .toISOString()
    .replace('T', ' ')
    .replace(/\.\d{3}Z$/, ' UTC')
}

const changedFiles = getChangedFiles()

if (changedFiles.length === 0) {
  console.log('Nada para commitar.')
  process.exit(0)
}

assertSafeFiles(changedFiles)

if (dryRun) {
  console.log(`Mensagem: ${message}`)
  console.log('Ficheiros que seriam incluidos:')
  for (const file of changedFiles) {
    console.log(`- ${file}`)
  }
  process.exit(0)
}

run('git', ['add', '-A'])

const stagedFiles = getStagedFiles()

if (stagedFiles.length === 0) {
  console.log('Nada para commitar depois do stage.')
  process.exit(0)
}

assertSafeFiles(stagedFiles)

run('git', ['commit', '-m', message], { stdio: 'inherit' })

if (shouldPush) {
  run('git', ['push'], { stdio: 'inherit' })
}
