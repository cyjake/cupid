var _ = require('underscore')
var gravatar = require('gravatar')


var PTN = /^([^<(]+)(?: +<([^>]+)>)?(?: +\(([^\)]+)\))?$/

function User(str) {
  if (_.isObject(str)) {
    this.name = str.flat('name')
    this.email = str.flat('email') || ''
    this.site = str.flat('uri')
  }
  else {
    str = str.trim()

    var match = str.trim().match(PTN)

    this.name = match[1]
    this.email = match[2] || ''
    this.site = match[3] || ''
  }
}

Object.defineProperties(User.prototype, {
  link: {
    get: function() {
      return this.site ? this.site : (this.email ? 'mailto:' + this.email : '')
    }
  },
  gravatar: {
    get: function() {
      return gravatar.url(this.email, { s: 80 })
    }
  }
})

module.exports = User