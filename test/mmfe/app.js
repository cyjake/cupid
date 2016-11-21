/* eslint-env browser */
/* eslint strict: [2, "function"] */
(function() {

  'use strict'

  function toggleClass(el, cls) {
    if (el.classList.contains(cls)) {
      el.classList.remove(cls)
    } else {
      el.classList.add(cls)
    }
  }

  function toggleAside(e) {
    toggleClass(document.body, 'aside-revealed')
  }

  function toggleContent(e) {
    var expandedArticles = document.querySelectorAll('article.expanded')

    if (expandedArticles.length) {
      Array.from(expandedArticles).forEach(function(el) {
        el.classList.remove('expanded')
      })
    } else {
      toggleClass(document.querySelector('#page'), 'collapsed')
    }
  }

  function goUp(e) {
    var current = document.querySelector('article.expanded')
    var el = current && current.previousElementSibling
      ? current.previousElementSibling
      : document.querySelector('article')

    if (current) current.classList.remove('expanded')
    document.querySelector('#page').classList.add('collapsed')
    el.classList.add('expanded')
    el.scrollIntoView()
  }

  function goDown(e) {
    var current = document.querySelector('article.expanded')
    var el = current && current.nextElementSibling
      ? current.nextElementSibling
      : document.querySelector('article')

    if (current) current.classList.remove('expanded')
    document.querySelector('#page').classList.add('collapsed')
    el.classList.add('expanded')
    el.scrollIntoView()
  }

  function dispatch(e) {
    var h1 = e.target.closest('article h1')

    if (h1) {
      var el = h1.closest('article')
      var page = document.querySelector('#page')

      Array.from(document.querySelectorAll('article.expanded')).forEach(function(article) {
        if (article !== el) article.classList.remove('expanded')
      })
      toggleClass(el, 'expanded')
      if (el.classList.contains('expanded') && !page.classList.contains('collapsed')) {
        page.classList.add('collapsed')
      }
    }
  }

  document.querySelector('.btn-menu').addEventListener('click', toggleAside)
  document.querySelector('.btn-collapse').addEventListener('click', toggleContent)
  document.querySelector('.btn-previous').addEventListener('click', goUp)
  document.querySelector('.btn-next').addEventListener('click', goDown)

  document.querySelector('#page').addEventListener('click', dispatch)

  document.querySelector('article').classList.add('expanded')
})()