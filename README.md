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