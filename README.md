# Cupid

An alternative of venus the feed aggregator.

## Usage

See [planet alibaba](https://github.com/dotnil/cupid-alibaba) for example.

Or if you want to build your own:

```bash
$ sudo npm install cupid -g
$ cupid build :folder
$ cupid server :folder
```

The `:folder` argument that need to be supplied shall be a directory and have these
files:

- index.jade
- atom.jade
- planet.json

See files under [planet alibaba](https://github.com/dotnil/cupid-alibaba) for example:

```bash
planet/alibaba
├── atom.jade
├── favicon.ico
├── index.jade
├── planet.css
├── planet.json
└── solarized-light.css
```

## Misnomer

Cupid think itself as an alternative of [venus](http://www.intertwingly.net/code/venus/)
the feed aggregator. The latter was quite popular. There are numerous sites use it
for company/group feed aggregation. Such as:

- Planet Mozilla
- Planet GNOME
- etc.

Venus project is kinda ancient. It requires Python 2.4, which won't be seen often
on Mac OS X systems. So here's this project. We use Node.js and NPM.

Writing JavaScript is fun. Use morden tools like NPM is a bless. And JavaScript
community have done quite a lot of work. Most of the modules required for developing
a feed aggregator can be found in NPM registry.

But why the name, why Cupid?

Venus project named itself venus possibly because of planet venus, as we can tell
from the names of those venus based sites. The names of the rest planets in our solar
system are not as interesting though. Mars and Mercury are taken. Saturn and
Jupiter might be available. Uranus and Neptune are not as famous. And no one shall
name his project Earth. That'll make him godly, right?

The point is, this project, as an alternative of veuns, won't have ambitions as
big as venus. Both the codebase and mission are all quite smaller.

We just want to serve [Planet Alibaba](http://planet.alibaba-inc.com) well. And
make sure we are having fun while maintaining it.