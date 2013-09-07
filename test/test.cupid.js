var cupid = require('../')
var cheerio = require('cheerio')
var path = require('path')
var fs = require('fs')
var moment = require('moment')
var han = require('han')

require('should')


// for quicker test driven development, this test is comment out temperarily.

describe('.read', function() {
  var data = require('./alibaba/planet.json')
  var feeds

  before(function(done) {
    this.timeout(60000)
    cupid.read(data.feeds)
      .then(function(_feeds) {
        feeds = _feeds
        done()
      })
      .done()
  })

  it('should keep parsed xml object', function() {
    feeds.forEach(function(feed, i) {
      if (!feed.nickname) return

      var fpath = path.join(__dirname, 'fixtures', han.letter(feed.nickname) + '.json')
      fs.writeFileSync(fpath, JSON.stringify(feed.data, null, '  '))
    })
  })

  it('should match number of links in planet.json', function() {
    feeds.length.should.equal(7)
  })
})

describe('.unifyRSS', function() {
  var feed

  before(function() {
    feed = cupid.unify({
      data: require('./fixtures/mozhi.json'),
      link: 'http://nuysoft.com/rss.xml',
      author: 'nuysoft <nuysoft@gmail.com>'
    })
  })

  it('should flatten attributes', function() {
    feed.title.should.equal("nuysoft's blog")
  })

  it('should fabricate author', function() {
    var author = feed.author

    author.should.be.an.instanceOf(cupid.User)
    author.name.should.equal('nuysoft')
    author.email.should.equal('nuysoft@gmail.com')
  })

  it('should set site', function() {
    feed.site.should.not.be.empty
  })
})

describe('.unifyAtom', function() {
  var feed

  before(function() {
    feed = cupid.unify({
      data: require('./fixtures/ketuo.json'),
      link: 'http://feed.cnblogs.com/blog/u/102213/rss'
    })
  })

  it('should unify atom into simplified format', function() {
    feed.title.should.equal('博客园_紫云飞')
  })

  it('should fabricate author', function() {
    var author = feed.author

    author.should.be.an.instanceOf(cupid.User)
    author.name.should.equal('紫云飞')
    author.email.should.be.empty
  })

  it('should fabricate updated date', function() {
    feed.updated.year().should.equal(2013)
    feed.entry[0].updated.year().should.equal(2013)
  })

  it('should flat link', function() {
    var link = feed.entry[0].link

    link.should.be.a('string')
    link.should.match(/^http/)
  })

  it('should set site', function() {
    feed.site.should.not.be.empty
  })
})

describe('.normalize', function() {
  var feed
  var $

  before(function() {
    feed = cupid.unify({
      data: require('./fixtures/yicai.json'),
      link: 'http://cyj.me/feed/atom.xml',
      author: 'Chen Yicai <yicai.cyj@taobao.com>'
    })
    feed = cupid.normalize(feed)
    $ = cheerio.load(feed.entry[0].content)
  })

  it('should normalize anchors', function() {
    $('a').each(function(i, a) {
      $(a).attr('href').should.match(/^http:\/\//)
    })
  })

  it('should normalize imgs', function() {
    $('img').each(function(i, img) {
      $(img).attr('src').should.match(/^http:\/\//)
    })
  })

  it('should remove 3rd part assets', function() {
    $('script').should.be.empty
    $('style').should.be.empty
    $('link').should.be.empty
  })
})

describe('.aggregate', function() {
  var posts

  before(function() {
    var feeds = [{
      data: require('./fixtures/mozhi.json'),
      link: 'http://nuysoft.com/rss.xml',
      author: 'nuysoft <nuysoft@gmail.com>'
    }, {
      data: require('./fixtures/yicai.json'),
      link: 'http://cyj.me/feed/atom.xml'
    }]

    feeds = feeds.map(function(feed) {
      return cupid.unify(feed)
    })

    posts = cupid.aggregate(feeds)
  })

  it('should sort by updated date', function() {
    posts[0].updated.should.be.above(posts[1].updated)
  })
})

describe('.write', function() {

  var fpath

  before(function() {
    var data = {
      title: "Planet Cupid",
      site: "http://planet.alibaba-inc.com",
      dir: path.join(__dirname, 'alibaba'),
      feeds: [{
        data: require('./fixtures/mozhi.json'),
        link: 'http://nuysoft.com/rss.xml',
        author: 'nuysoft <nuysoft@gmail.com>'
      }, {
        data: require('./fixtures/yicai.json'),
        link: 'http://cyj.me/feed/atom.xml'
      }]
    }

    feeds = data.feeds.map(function(feed) {
      var feed = cupid.unify(feed)

      return cupid.normalize(feed)
    })

    data.posts = cupid.aggregate(feeds)
    cupid.write(data)

    htmlPath = path.join(__dirname, './alibaba/index.html')
    atomPath = path.join(__dirname, './alibaba/atom.xml')
  })

  it('should write down index.html', function() {
    fs.existsSync(htmlPath).should.be.true
  })

  it('should write down atom.xml', function() {
    fs.existsSync(atomPath).should.be.true
  })

  it('should order posts by updated at', function() {
    var $ = cheerio.load(fs.readFileSync(htmlPath, 'utf-8'))

    var updated = $('section').map(function(section) {
      return moment($(section).find('time').attr('datetime'))
    })

    updated[0].diff(updated[1], 'days').should.not.be.below(0)
  })
})