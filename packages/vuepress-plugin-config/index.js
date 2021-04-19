module.exports = (options = {}, ctx) => ({
  extendPageData($page) {
    $page.baseUrl = options.baseUrl
  }
})
