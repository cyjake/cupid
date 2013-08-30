var cupid = require('../')
var cheerio = require('cheerio')
var path = require('path')
var fs = require('fs')
var moment = require('moment')

require('should')


// for quicker test driven development, this test is comment out temperarily.
//
// describe('.read', function() {
//   var data = require('../planet/alibaba/planet.json')
//   var feeds

//   before(function(done) {
//     this.timeout(60000)
//     cupid.read(data.feeds)
//       .then(function(_feeds) {
//         feeds = _feeds
//         done()
//       })
//       .done()
//   })

//   it('should keep parsed xml object', function() {
//     feeds.forEach(function(result, i) {
//       var feed = result.value
//       var fpath = path.join(__dirname, 'fixtures', feed.nickname + '.json')

//       fs.writeFileSync(fpath, JSON.stringify(feed.data, null, '  '))
//     })
//   })

//   it('should match number of links in planet.json', function() {
//     feeds.length.should.equal(3)
//   })
// })

describe('.unifyRSS', function() {
  var feed

  before(function() {
    feed = cupid.unify({
      value: {
        data: require('./fixtures/mozhi.json'),
        link: 'http://nuysoft.com/rss.xml',
        author: 'nuysoft <nuysoft@gmail.com>'
      }
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
      value: {
        data: require('./fixtures/yicai.json'),
        link: 'http://cyj.me/feed/atom.xml'
      }
    })
  })

  it('should unify atom into simplified format', function() {
    feed.title.should.equal('Everything Jake')
  })

  it('should fabricate author', function() {
    var author = feed.author

    author.should.be.an.instanceOf(cupid.User)
    author.name.should.equal('Jake Chen')
    author.email.should.be.empty
  })

  it('should fabricate updated date', function() {
    feed.updated.year().should.equal(2013)
    feed.entry[0].updated.year().should.equal(2013)
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
      value: {
        data: require('./fixtures/yicai.json'),
        link: 'http://cyj.me/feed/atom.xml',
        author: 'Chen Yicai <yicai.cyj@taobao.com>'
      }
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
      return cupid.unify({ value: feed })
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
      var feed = cupid.unify({ value: feed })

      return cupid.normalize(feed)
    })

    data.posts = cupid.aggregate(feeds)
    cupid.write(data)

    fpath = path.join(__dirname, '../planet/alibaba/index.html')
  })

  it('should write down index.html', function() {
    fs.existsSync(fpath).should.be.true
  })

  it('should order posts by updated at', function() {
    var $ = cheerio.load(fs.readFileSync(fpath, 'utf-8'))

    var updated = $('section').map(function(section) {
      return moment($(section).find('time').attr('datetime'))
    })

    updated[0].diff(updated[1], 'days').should.not.be.below(0)
  })
})