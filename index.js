var request = require('superagent')
var Parser = require('xml2js').Parser
var Q = require('q')
var fs = require('fs')
var path = require('path')
var url = require('url')
var _ = require('underscore')
var cheerio = require('cheerio')
var path = require('path')
var moment = require('moment')
var jade = require('jade')
var log = require('./lib/utils').log
var error = require('./lib/utils').error
var User = require('./lib/user')


Object.defineProperties(Object.prototype, {
  flat: {
    value: function(p) {
      var obj = this[p]

      if (_.isArray(obj)) obj = obj[0]

      return _.isObject(obj) && obj.hasOwnProperty('_') ? obj._ : obj
    },
    enumerable: false,
    writable: false
  }
})

exports.read = function(feeds) {
  var reqs = feeds.map(function(feed, i) {
    var d = Q.defer()

    setImmediate(function() {
      log('fetch', feed.link)
    })
    // force buffer
    // - http://visionmedia.github.io/superagent/#buffering-responses
    // - https://github.com/visionmedia/superagent/issues/225
    // - http://feed.cnblogs.com/blog/u/102213/rss
    //
    // for now, superagent does not buffer response if content-type does not include:
    // - text
    // - json
    // - x-www-form-urlencoded
    //
    // but atom feeds typically have content-type set to application/atom+xml
    // so let's just force buffer
    request.get(feed.link).buffer().end(function(err, res) {
      if (err) {
        error('failed', err.message + ' on ' + feed.link)
        d.reject(err)
        return
      }

      var parser = new Parser()

      log('parse', feed.link)

      parser.parseString(res.text.trim(), function(err, result) {
        if (err) {
          d.reject(err)
          return
        }

        feed = _.extend({}, feed)
        feed.data = result

        d.resolve(feed)
      })
    })

    return d.promise
  })

  return Q.all(reqs)
}

exports.unify = function(feed) {
  var data = feed.data
  var obj

  log('unify', feed.link)

  if ('rss' in data) {
    obj = exports.unifyRSS(data.rss, feed)
  }
  else if ('feed' in data) {
    obj = exports.unifyAtom(data.feed, feed)
  }

  return _.extend({}, feed, obj)
}

exports.unifyRSS = function(rss, feed) {
  var channel = rss.channel[0]
  var author = feed.author || channel.flat('author') || channel.flat('title')
  var obj = {
    title: channel.flat('title'),
    subtitle: channel.flat('description'),
    link: channel.flat('link'),
    site: channel.flat('link'),
    author: new User(author),
    rights: channel.flat('copyright'),
    id: channel.flat('guid'),
    updated: moment(channel.flat('lastBuildDate'))
  }

  obj.entry = channel.item.map(function(item) {
    return {
      title: item.flat('title'),
      content: item.flat('description'),
      updated: moment(item.flat('pubDate')),
      id: item.flat('guid'),
      link: item.flat('link'),
      author: new User(item.flat('author') || author)
    }
  })

  return obj
}

exports.unifyAtom = function(atom, feed) {
  var author = feed.author || atom.flat('author')
  var title = atom.flat('title')

  var site
  var link

  if (atom.link) {
    atom.link.forEach(function(lk) {
      var attrs = lk.$
      var href = attrs.href || lk._

      if (attrs.rel === 'self') link = href
      else site = href
    })
  }

  // http://feed.cnblogs.com/blog/u/102213/rss
  // ziyunfei has its blog's link specified in author.uri
  if (author.uri) site = author.uri

  var obj = {
    title: title,
    subtitle: atom.flat('subtitle'),
    link: link,
    site: site || atom.flat('id'),
    author: new User(author),
    rights: atom.flat('rights'),
    id: atom.flat('id'),
    updated: moment(atom.flat('updated'))
  }

  obj.entry = atom.entry.map(function(entry) {
    var link = entry.flat('link') || entry.flat('id')

    // ziyunfei's fedd has entry.link in array, each object is like:
    //
    //     {
    //       $: {
    //         rel: 'alternative',
    //         href: 'http://...'
    //       }
    //     }
    //
    if (_.isObject(link)) link = link.$.href

    return {
      title: entry.flat('title'),
      content: entry.flat('content'),
      updated: moment(entry.flat('updated')),
      id: entry.flat('id'),
      link: link,
      author: new User(entry.flat('author') || author)
    }
  })

  return obj
}


/*
 * make site and $ global, methods such as exports.normalizeImage and
 * exports.normalizeAnchor will be simpler for this.
 */
var protocol = /^https?:\/\//
var site
var $

exports.normalize = function(feed) {
  site = feed.site
  author = feed.author

  if (!author.site) author.site = feed.site
  if (!author.name) author.name = feed.title

  feed.entry.forEach(function(entry) {
    log('normalize', entry.title + ' from ' + feed.title)

    exports.normalizeAuthor(entry, feed)

    $ = cheerio.load(entry.content)

    $('a').each(exports.normalizeAnchor)
    $('img').each(exports.normalizeImage)

    $('style').remove()
    $('script').remove()
    $('link').remove()

    entry.content = $.html()
  })

  return feed
}

exports.normalizeAuthor = function(entry, feed) {
  var author = entry.author

  if (!author.site) author.site = feed.site
  if (!author.name) author.name = feed.title
}

exports.normalizeImage = function(i, img) {
  img = $(img)
  var src = img.attr('src')

  if (!src) {
    log('remove', 'img with empty @src')
    img.remove()
  }
  else if (!protocol.test(src)) {
    img.attr('src', url.resolve(site, src))
  }
}

exports.normalizeAnchor = function(i, a) {
  a = $(a)
  var href = a.attr('href')

  if (!protocol.test(href)) {
    a.attr('href', href ? url.resolve(site, href) : site)
  }
}

exports.aggregate = function(feeds) {
  var posts = []

  feeds.forEach(function(feed) {
    posts = posts.concat(feed.entry)
  })

  log('sort', feeds.length + ' feeds, ' + posts.length + ' posts')

  posts.sort(function(a, b) {
    return a.updated < b.updated ? 1 : -1
  })

  return posts.slice(0, 20)
}

exports.write = function(data) {
  data.pretty = true
  data.updated = moment()
  data.site = data.site.replace(/\/$/, '')

  log('write', 'index.html')
  fs.writeFileSync(data.dir + '/index.html', jade.renderFile(data.dir + '/index.jade', data))

  log('write', 'atom.xml')
  fs.writeFileSync(data.dir + '/atom.xml', jade.renderFile(data.dir + '/atom.jade', data))

  return data
}

exports.User = User