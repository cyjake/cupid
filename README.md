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
$ mkdir src
$ touch src/index.html
$ touch src/feed.xml
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

The maximum number of articles per feed.


### -C, --copy

Build in copy mode. In this mode, `.html` and `.xml` files are skipped while
renderring the site. Only the static files will be copied into destination
folder.

```bash
➜  planet git:(master) DEBUG=cupid cupid build -C
  cupid writing to /tmp/planet/target +0ms
  cupid wrote app.css +6ms
  cupid wrote app.js +3ms
```


### -d, --destination

The destination folder of the build result, which defaults to `./target`.


### -t, --timeout

The timeout on fetching and parsing combined per feed.