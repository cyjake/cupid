# Cupid

An alternative of venus the feed aggregator.

## Usage

```bash
$ sudo npm install cupid -g
$ cupid build :folder
$ cupid server :folder
```

The provided `:folder` should be a directory that contain these files:

- index.jade
- atom.jade
- planet.json

## Misnomer

Cupid think itself as an alternative of [venus](http://www.intertwingly.net/code/venus/)
the feed aggregator. The latter was quite popular. There are numerous sites use it
for company/group feed aggregation. Such as:

- Planet Mozilla
- Planet GNOME
- etc.

But venus project is kinda ancient. It requires Python 2.4, which won't be seen often
on Mac OS X systems. We'd prefer Node.js and NPM. So here's this project.

Writing in JavaScript is fun. Use morden tools like NPM is a bless. And JavaScript
community have done quite a lot of work. Most of the modules required for developing
a feed aggregator can be found in NPM registry.

But why the name, why Cupid?

Venus project named itself venus possibly because of planet venus, as we can tell
from the names of those venus based sites. The names of the rest planets in our solar
system are not as interesting though. Mars and Mercury are taken. Saturn and
Jupiter might be available. Uranus and Neptune are not as famous. And no one shall
name his project Earth. That'll make him godly, right?

The point is, this project, as an alternative of venus, won't have any ambitions as
big. Both the codebase and mission are all quite smaller.
