'use strict'

const co = require('co')
const debug = require('debug')('cupid')
const fs = require('fs')
const Liquid = require('liquid-node')
const mkdirp = require('mkdirp')
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

function readdir(dir) {
  return new Promise(function(resolve, reject) {
    fs.readdir(dir, function(err, files) {
      if (err) reject(err)
      else resolve(files)
    })
  })
}

function mkdirpAsync(dir, opts = {}) {
  return new Promise(function(resolve, reject) {
    mkdirp(dir, opts, function(err) {
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

  * parse({ count, timeout }) {
    yield this.feeds.map(feed => {
      return co(feed.parse({ timeout }))
        .catch(err => {
          feed.status = 'error'
          debug('skipped feed %s because %s', feed.uri, err.stack)
        })
    })

    this.posts = this.feeds
      .filter(feed => feed.status !== 'error' && feed.posts)
      .reduce(function(result, feed) {
        return feed.posts ? result.concat(feed.posts) : result
      }, [])
      .sort(byPublishedDesc)
      .slice(0, count)

    debug('sorted posts')
    this.updated = new Date()
  }

  * write(dest = 'target') {
    dest = path.resolve(this.root, dest)
    yield mkdirpAsync(dest)

    try {
      yield access(dest, R_OK | W_OK)
    } catch (err) {
      throw new Error(`Cannot access destination folder ${dest}`)
    }

    debug('writing to %s', dest)
    const files = yield readdir(path.join(this.root, 'src'))

    for (const file of files) {
      if (['.html', '.xml'].includes(path.extname(file))) {
        yield this.writeView(file, dest)
      } else if (!file.startsWith('_')) {
        yield this.writeFile(file, dest)
      }
    }
  }

  * writeView(name, dest) {
    if (!dest) {
      throw new Error('Please specify destination folder')
    }
    const src = path.join(this.root, 'src')
    const engine = new Liquid.Engine

    engine.registerFileSystem(
      new Liquid.LocalFileSystem(path.join(src, '_includes'))
    )
    const view = yield readFile(path.join(src, name), 'utf8')
    const template = yield engine.parse(view)
    const result = yield template.render(this)

    yield writeFile(path.join(dest, name), result)
    debug('wrote %s', name)
  }

  * writeFile(name, dest) {
    if (!dest) {
      throw new Error('Please specify destination folder')
    }
    const content = yield readFile(path.join(this.root, 'src', name), 'utf8')
    yield writeFile(path.join(dest, name), content)
    debug('wrote %s', name)
  }
}


module.exports = Planet