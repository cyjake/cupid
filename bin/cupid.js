#!/usr/bin/env node

'use strict'

const program = require('commander')
const pkg = require('../package.json')


program
  .version(pkg.version)
  .command('build', 'Aggregate feeds')

program.on('--help', function() {
  console.log(`
  Examples:

    $ cupid
    $ cupid build
`.trim())
})

program.parse(process.argv)