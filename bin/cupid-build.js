#!/usr/bin/env node

'use strict'

const co = require('co')
const path = require('path')
const program = require('commander')

const Planet = require('../lib/planet')

program
  .option('-d, --destination [dir]', 'Destination directory (defaults to ./target)', 'target')

program.on('--help', function() {
  console.log(`
  Examples:

  $ cupid-build
  $ cupid-build some-planet -d /path/to/webroot
`.trim())
})

program.parse(process.argv)

const cwd = process.cwd()
const root = program.args.length
  ? path.resolve(cwd, program.args.shift())
  : cwd


co(function* () {
  const planet = new Planet(root)

  yield planet.parse()
  yield planet.write(program.destination)
})
  .catch(function(err) {
    console.error(`Failed to build planet at [${root}]: ${err.stack}`)
  })