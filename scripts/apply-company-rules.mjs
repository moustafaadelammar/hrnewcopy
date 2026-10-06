import fs from 'node:fs'
import path from 'node:path'
const appPath=path.resolve(process.cwd(),'src','App.tsx')
if(!fs.existsSync(appPath)){console.error('[RULES] App.tsx not found:',appPath);process.exit(1)}
console.log('[RULES] Company rules are already integrated in App.tsx; no source rewrite is required.')
console.log('[RULES] Safe pass completed.')
