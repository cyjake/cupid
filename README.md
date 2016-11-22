# Cupid

An alternative of venus the feed aggregator.

```bash
$ npm install cupid -g
$ cat > planet.json <<EOF
{
  "title": "Example Planet",
  "uri": "http://planet.example.com",
  "feeds": [
    { "uri": "http://cyj.me/feed/atom.xml" }
  ]
}
EOF
$ mkdir views
$ touch views/index.html
$ touch views/feed.xml
$ cupid build               # will render views/{index.html,feed.xml} into cwd.
$ DEBUG=cupid cupid build   # enable debugging logs
```


## cupid-build

```bash
$ cupid-build --help

  Examples:

  $ cupid-build
  $ cupid-build -c 20
  $ cupid-build some-planet -d /path/to/webroot
  $ cupid-build --timeout 5000
```


### -c, --count

### -d, --destination

### -t, --timeout