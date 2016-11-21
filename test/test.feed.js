'use strict'

const expect = require('expect.js')
require('co-mocha')

const Feed = require('../lib/feed')


describe('Feed', function() {
  it('parses RSS feed', function* () {
    const feed = new Feed('http://limu.iteye.com/rss', {
      author: { name: '李牧' }
    })

    yield feed.parse()

    expect(feed.title).to.equal('limu的砖篮儿')
    expect(feed.uri).to.equal('http://limu.iteye.com/rss')
    expect(feed.author.name).to.equal('李牧')
    expect(feed.author.uri).to.equal('http://limu.iteye.com')
  })

  it('parses RSS feed of nuysoft.com', function* () {
    const feed = new Feed('http://nuysoft.com/rss.xml', {
      author: { name: '墨智' }
    })

    yield feed.parse()

    expect(feed.title).to.equal("nuysoft's blog")
    expect(feed.uri).to.equal('http://nuysoft.com/rss.xml')
    expect(feed.author.name).to.equal('墨智')
    expect(feed.author.uri).to.equal('http://nuysoft.github.com')
  })

  it('parses Atom feed', function* () {
    const feed = new Feed('http://feed.cnblogs.com/blog/u/102213/rss')

    yield feed.parse()

    expect(feed.title).to.contain('紫云飞')
    expect(feed.uri).to.equal('http://feed.cnblogs.com/blog/u/102213/rss')
    expect(feed.author.name).to.equal('紫云飞')
    expect(feed.author.uri).to.equal('http://www.cnblogs.com/ziyunfei/')
  })
})