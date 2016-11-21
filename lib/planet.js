'use strict'

const debug = require('debug')('cupid')
const fs = require('fs')
const Liquid = require('liquid-node')
const path = require('path')

const Feed = require('./feed')

const { R_OK, W_OK } = fs.constants


function access(fpath, mode) {
  return new Promise(function(resolve, reject) {
    fs.access(fpath, mode, function(err) {
      if (err) reject(err)
      else resolve()
    })
  })
}

function readFile(fpath, encoding = 'utf8') {
  return new Promise(function(resolve, reject) {
    fs.readFile(fpath, encoding, function(err, content) {
      if (err) reject(err)
      else resolve(content)
    })
  })
}

function writeFile(fpath, content) {
  return new Promise(function(resolve, reject) {
    fs.writeFile(fpath, content, function(err) {
      if (err) reject(err)
      else resolve()
    })
  })
}

function byPublishedDesc(a, b) {
  if (a.published.getTime() < b.published.getTime()) {
    return 1
  }
  else if (a.published.getTime() > b.published.getTime()) {
    return -1
  }
  else {
    return 0
  }
}


class Planet {
  constructor(root) {
    if (!root) {
      throw new TypeError('Please specify planet root!')
    }
    root = path.resolve(process.cwd(), root)
    const data = require(path.join(root, 'planet.json'))

    this.root = root
    this.title = data.title
    this.description = data.description
    this.uri = data.uri
    this.feeds = data.feeds.map(feed => {
      return new Feed(feed.uri, { author: feed.author })
    })

    const pkg = require('../package')
    this.generator = {
      name: pkg.name,
      version: pkg.version,
      uri: pkg.url
    }
  }

  get link() {
    return this.uri
  }

  * parse() {
    yield this.feeds.map(feed => feed.parse())

    this.posts = this.feeds
      .reduce(function(result, feed) {
        return result.concat(feed.posts)
      }, [])
      .sort(byPublishedDesc)
      .slice(0, 20)

    debug('sorted posts')
    this.updated = new Date()
  }

  * write(dest = '.') {
    dest = path.resolve(this.root, dest)

    try {
      yield access(dest, R_OK | W_OK)
    } catch (err) {
      throw new Error(`Cannot access destination folder ${dest}`)
    }

    debug('writing to %s', dest)
    yield ['feed.xml', 'index.html'].map(name => this.writeView(name, dest))
  }

  * writeView(name, dest) {
    const engine = new Liquid.Engine

    engine.registerFileSystem(
      new Liquid.LocalFileSystem(path.join(this.root, 'views', '_includes'))
    )
    const view = yield readFile(path.join(this.root, 'views', name), 'utf8')
    const template = yield engine.parse(view)
    const result = yield template.render(this)

    yield writeFile(path.join(dest, name), result)
    debug('wrote %s', name, dest)
  }
}


module.exports = Planet