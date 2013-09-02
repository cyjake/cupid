var exists = require('fs').existsSync
var join = require('path').join


module.exports = function(path) {
  var cwd = process.cwd()

  if (!path && join(cwd, 'planet.json')) {
    return cwd
  }

  var dir = join(cwd, path)

  if (exists(join(dir, 'planet.json'))) {
    return dir
  }

  dir = join(__dirname, '../planet', path)

  if (exists(join(dir, 'planet.json'))) {
    return dir
  }
}