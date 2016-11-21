'use strict'

const expect = require('expect.js')
require('co-mocha')

const Planet = require('../lib/planet')


describe('Planet', function() {
  it('parses feeds', function* () {
    const planet = new Planet(`${__dirname}/mmfe`)
    yield planet.parse()
    expect(planet.title).to.equal('Alimama FE')
    expect(planet.uri).to.equal('http://fe.alimama.net')
    expect(planet.posts.length).to.be.above(0)
  })

  it('writes feeds', function* () {
    const planet = new Planet(`${__dirname}/mmfe`)
    yield planet.parse()
    yield planet.write()
  })
})