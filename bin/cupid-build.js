#!/usr/bin/env node

'use strict'

const co = require('co')
const path = require('path')
const program = require('commander')

const Planet = require('../lib/planet')

const cwd = process.cwd()
const root = program.args.length
  ? path.resolve(cwd, program.args.shift())
  : cwd


co(function* () {
  const planet = new Planet(root)

  yield planet.parse()
  yield planet.write()
})
  .catch(function(err) {
    console.error(`Failed to build planet at [${root}]: ${err.stack}`)
  })