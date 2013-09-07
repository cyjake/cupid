KISSY.use('ajax,node,event,sizzle', function(S, IO, Node) {

  S.one('form').on('submit', function(e) {
    var form = Node(e.currentTarget)
    var link = S.one('[name="link"]').val()

    e.preventDefault()

    if (!link || !/http:\/\//.test(link)) {
      alert('invalid link')
      return
    }

    var data = {
      link: link,
      author: S.one('[name="author"]').val()
    }

    IO.post('/feeds', data, function(res, status, io) {
      alert(res.message)

      if (io.status < 300) location.href = '/'
    })
  })
})