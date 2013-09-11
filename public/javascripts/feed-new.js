KISSY.use('ajax,node,json,event,sizzle', function(S, IO, Node, JSON) {

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

    function handler(res, status, io) {
      if (res) {
        alert(res.message)
      }
      else {
        res = JSON.parse(io.responseText)
        alert(res.message)
      }

      if (io.status < 300) location.href = '/'
    }

    IO({
      url: '/feeds',
      type: 'post',
      data: data,
      dataType: 'json',
      success: handler,
      error: handler
    })
  })
})