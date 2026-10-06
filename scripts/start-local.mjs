import net from 'node:net'
import { spawn } from 'node:child_process'
import { mkdirSync, openSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const logs = resolve(root, 'logs')
mkdirSync(logs, { recursive: true })

function portOpen(port, host = '127.0.0.1') {
  return new Promise(resolveResult => {
    const socket = new net.Socket()
    let finished = false
    const finish = value => {
      if (finished) return
      finished = true
      socket.destroy()
      resolveResult(value)
    }
    socket.setTimeout(700)
    socket.once('connect', () => finish(true))
    socket.once('timeout', () => finish(false))
    socket.once('error', () => finish(false))
    socket.connect(port, host)
  })
}

function start(command, args, logName) {
  const logPath = resolve(logs, logName)
  const fd = openSync(logPath, 'a')
  const child = spawn(command, args, {
    cwd: root,
    detached: true,
    windowsHide: true,
    stdio: ['ignore', fd, fd],
  })
  child.unref()
  return child
}

async function waitForPort(port, attempts = 30) {
  for (let i = 0; i < attempts; i += 1) {
    if (await portOpen(port)) return true
    await new Promise(resolveResult => setTimeout(resolveResult, 300))
  }
  return false
}

console.log('[LOCAL] Starting fingerprint gateway...')
if (!(await portOpen(8787))) {
  start(process.execPath, ['scripts/fingerprint-gateway.mjs'], 'fingerprint-gateway.log')
}
const gatewayReady = await waitForPort(8787)
console.log(gatewayReady ? '[LOCAL] Fingerprint gateway: OK (8787)' : '[LOCAL] Fingerprint gateway: FAILED (8787)')

console.log('[LOCAL] Starting Vite...')
if (!(await portOpen(5173))) {
  const viteCli = resolve(root, 'node_modules', 'vite', 'bin', 'vite.js')
  start(process.execPath, [viteCli, '--host', '127.0.0.1', '--port', '5173'], 'vite.log')
}
const viteReady = await waitForPort(5173)
console.log(viteReady ? '[LOCAL] HR System: OK (5173)' : '[LOCAL] HR System: FAILED (5173)')

if (!gatewayReady || !viteReady) {
  console.log('[LOCAL] Check logs in: ' + logs)
  process.exitCode = 1
} else {
  console.log('[LOCAL] Open http://localhost:5173/')
}
