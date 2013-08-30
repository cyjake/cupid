var User = require('../lib/user')

require('should')


describe('User', function() {

  it('should support full format', function() {
    var user = new User('Jake Chen <jakeplus@gmail.com> (http://cyj.me)')

    user.name.should.equal('Jake Chen')
    user.email.should.equal('jakeplus@gmail.com')
    user.site.should.equal('http://cyj.me')
  })

  it('should make site optional', function() {
    var user = new User('Jake Chen <jakeplus@gmail.com>')

    user.name.should.equal('Jake Chen')
    user.email.should.equal('jakeplus@gmail.com')
    user.site.should.be.empty
  })

  it('should make email optional', function() {
    var user = new User('Jake Chen (http://cyj.me)')

    user.email.should.be.empty
    user.site.should.equal('http://cyj.me')
  })

  it('should make both email and site optional', function() {
    var user = new User('Jake Chen')

    user.name.should.equal('Jake Chen')
    user.email.should.be.empty
    user.site.should.be.empty
  })
})