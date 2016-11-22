'use strict'

const cheerio = require('cheerio')
const debug = require('debug')('cupid')
const request = require('superagent')
const url = require('url')
const util = require('util')
const { Parser } = require('xml2js')


function fetch(uri, { timeout }) {
  return new Promise(function(resolve, reject) {
    request.get(uri)
      .buffer()
      .timeout(timeout)
      .end(function(err, res) {
        if (err) {
          reject(err)
        } else {
          resolve(res)
        }
      })
  })
}

function read(nodelist) {
  if (!nodelist) return ''
  const el = nodelist.length > 0 ? nodelist[0] : nodelist
  const value = typeof el === 'object' ? el._ : el
  return typeof value === 'string' ? value.trim() : value
}


class Post {
  constructor({ title, content, summary, published, uri }) {
    this.title = title
    this.content = content
    this.uri = uri
    this.published = published
    this.summary = summary
  }

  get link() {
    return this.uri
  }

  static fromItem(item) {
    const data = {}
    const PROP_MAP = {
      title: 'title',
      description: 'content',
      pubDate: 'published',
      link: 'uri'
    }

    for (const name in PROP_MAP) {
      const alias = PROP_MAP[name]
      data[alias] = read(item[name])
    }

    data.published = new Date(data.published)

    return new Post(data)
  }

  static fromEntry(entry) {
    const data = {}

    for (const name of ['title', 'content', 'summary']) {
      data[name] = read(entry[name])
    }

    for (const name of ['published', 'updated']) {
      if (entry[name]) data[name] = new Date(read(entry[name]))
    }

    data.uri = read(entry.id)

    return new Post(data)
  }

  inspect() {
    return `${this.constructor.name} ${util.inspect({
      title: this.title,
      summary: this.summary,
      published: this.published,
      link: this.link
    })}`
  }
}


class Feed {
  constructor(uri, { author } = { author: {} }) {
    this.uri = uri
    this.author = author || {}

    // default values
    this.link = uri
    this.title = this.author.name || uri.split('/').slice(2).join('/')
  }

  static get Post() {
    return Post
  }

  rectify() {
    const rurl = /^(?:https?:)?\/\//

    this.author.name = this.author.name || this.title
    this.author.uri = this.author.uri || this.link

    for (const post of this.posts) {
      const $ = cheerio.load(`<div>${post.content}</div>`)
      const $el = $('div').first()

      if (!post.summary) {
        const summary = $el.text().trim().split(/[\r\n]+/)[0]
        post.summary = summary ? summary.trim() : ''
      }
      $('a').each((i, a) => {
        const $a = $(a)
        const href = $a.attr('href')
        if (href && !rurl.test(href)) {
          $a.attr('href', url.resolve(this.link, href))
        }
      })

      $('img').each((i, img) => {
        const $img = $(img)
        const src = $img.attr('src')
        if (!src) {
          $img.remove()
        }
        else if (!rurl.test(src)) {
          $img.attr('src', url.resolve(this.link, src))
        }
      })

      $('style').remove()
      $('script').remove()
      $('link').remove()

      post.content = $el.html()
      post.author = Object.assign({}, this.author)
    }
  }

  parseRSS(rss) {
    const channel = rss.channel[0]

    for (const name of ['title', 'description', 'link']) {
      this[name] = read(channel[name])
    }

    this.posts = channel.item.map(Post.fromItem)
  }

  parseAtom(atom) {
    this.title = read(atom.title)
    this.description = read(atom.subtitle)

    if (atom.link) {
      for (const link of atom.link) {
        const { rel, href } = link
        if (rel === 'alternate') this.link = href
      }
    }

    const author = atom.author ? atom.author[0] : null

    if (author)  {
      this.author.name = this.author.name || read(author.name)
      this.author.uri = this.author.uri || read(author.uri)
    }

    this.link = this.link || this.author.uri
    this.posts = atom.entry.map(Post.fromEntry)
  }

  * parse({ timeout }) {
    debug('fetching %s', this.uri)
    const res = yield fetch(this.uri, { timeout })
    debug('fetched %s', this.uri)
    const parser = new Parser()
    const xml = yield new Promise(function(resolve, reject) {
      parser.parseString(res.text.trim(), function(err, result) {
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      })
    })

    if (xml.rss && xml.rss.channel) {
      this.parseRSS(xml.rss)
    }
    else if (xml.feed) {
      this.parseAtom(xml.feed)
    }

    this.rectify()
    debug('parsed %s', this.uri)
  }
}


module.exports = Feed