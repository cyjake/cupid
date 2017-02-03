#!/usr/bin/env node

'use strict'

const co = require('co')
const path = require('path')
const program = require('commander')

const Planet = require('../lib/planet')

program
  .option('-c, --count [count]', 'Posts count', 50)
  .option('-C, --copy', 'Copy assets into destination directory', false)
  .option('-d, --destination [dir]', 'Destination directory (defaults to ./target)', 'target')
  .option('-t, --timeout [milliseconds]', 'Request timeout on feed', 10000)

program.on('--help', function() {
  console.log(`
  Examples:

  $ cupid-build
  $ cupid-build -c 20
  $ cupid-build some-planet -d /path/to/webroot
  $ cupid-build --timeout 5000
`.trim())
})

program.parse(process.argv)

const cwd = process.cwd()
const root = program.args.length
  ? path.resolve(cwd, program.args.shift())
  : cwd


co(function* () {
  const planet = new Planet(root)

  if (program.copy) {
    yield planet.write(program.destination, { skipView: true })
  } else {
    yield planet.parse({
      count: program.count,
      timeout: program.timeout
    })
    yield planet.write(program.destination)
  }

})
  .catch(function(err) {
    console.error(`Failed to build planet at [${root}]: ${err.stack}`)
  })