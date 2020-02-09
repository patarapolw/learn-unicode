const fs = require('fs')
const glob = require('glob')

const { spawnSafe } = require('./utils')

;(async () => {
  await spawnSafe('git', [
    'branch',
    'heroku'
  ])

  await spawnSafe('git', [
    'worktree',
    'add',
    'heroku-dist',
    'heroku'
  ])

  await spawnSafe('git', ['rm', '-rf', '.'], {
    cwd: 'heroku-dist'
  })

  glob.sync('**/*', {
    cwd: 'heroku/public',
    dot: true
  }).map((f) => {
    fs.copyFileSync(`heroku/public/${f}`, `heroku-dist/${f}`)
  })

  const pkg = require('../packages/server/package.json')

  delete pkg.dependencies
  delete pkg.devDependencies
  delete pkg.scripts.build

  fs.writeFileSync('./heroku-dist/package.json', JSON.stringify(pkg, null, 2))
  await spawnSafe('yarn', [], {
    cwd: 'heroku-dist'
  })
})().catch(console.error)