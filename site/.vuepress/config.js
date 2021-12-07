const base = '/'
const baseUrl = process.env.NODE_ENV === 'production'
  ? 'https://cdn.jsdelivr.net/gh/hxulin/hxulin.github.io' + base
  : base

module.exports = {
  title: "黄小鱼的个人博客",
  description: "日常笔记，个人随笔",
  port: "80",
  base,
  head: [
    ["link", {rel: "icon", href: baseUrl + "assets/img/favicon.png"}],
    ["link", {rel: "stylesheet", href: "https://cdn.jsdelivr.net/npm/@mdi/font@4.x/css/materialdesignicons.min.css"}],
    ["script", {type: "text/javascript", src: "https://cdn.jsdelivr.net/npm/md5-js@0.0.3/md5.min.js"}],
    ["script", {type: "text/javascript", src: "https://hm.baidu.com/hm.js?7416f9f03c8c29e159637a2b26fa47ac"}]
  ],
  locales: {
    "/": {
      lang: "zh-CN"
    }
  },
  markdown: {
    lineNumbers: false,
  },
  permalink: "/:year/:month/:day/:slug",
  themeConfig: {
    backToTop: true,
    smoothScroll: true,
    nav: [{
      text: "首页",
      link: "/"
    }, {
      text: "文章",
      link: "/guide/"
    }, {
      text: "花絮",
      link: "/tidbits/"
    }, {
      text: "留言",
      link: "/message/"
    }],
    sidebar: require("../sidebar"),
    sidebarDepth: 0,
    lastUpdated: "上次更新",
    repo: "https://github.com/hxulin/my-blog",
    editLinks: true,
    editLinkText: "在 GitHub 上编辑此页",
    docsDir: 'site',
    docsBranch: 'master'
  },
  plugins: [
    ['vuepress-plugin-config', {
      baseUrl
    }],
    ['@oak-tree-house/encrypt', {
      contentTitle: '加密的内容',
      unencryptedText: '内容已显示在下方，发布时应当加密。',
      encryptedText: '这部分内容已被加密，你需要输入正确的密钥才能查看。',
      decryptedText: '内容被成功解密并显示在下方。',
      decryptButtonText: '解密',
      unencryptedIcon: 'mdi mdi-lock-alert',
      encryptedIcon: 'mdi mdi-lock',
      decryptedIcon: 'mdi mdi-lock-open'
    }],
    ['vuepress-plugin-comment', {
      choosen: 'valine',
      // options 选项中的所有参数, 会传给 Valine 的配置
      options: {
        el: '#valine-comment',
        verify: false,
        notify: false,
        appId: 'AUYB8OzTPOaAq8AcovUkhJBR-gzGzoHsz',
        appKey: 'SLMMcpwb5IvwVMyR60R0uLjd',
        placeholder: '在此留言...',
        path: '<%- window.location.pathname %>',
        serverURLs: "https://comment.huangxulin.cn"
      }
    }],
    ['@vuepress/last-updated', {
      transformer: (timestamp, lang) => {
        const moment = require('moment-timezone')
        moment.locale(lang)
        moment.tz.setDefault('Asia/Shanghai')
        return moment(timestamp).format('YYYY-MM-DD HH:mm:ss')
      }
    }]
  ],
  /*chainWebpack (config, isServer) {

  },*/
  configureWebpack: (config, isServer) => {
    return {
      output: {
        publicPath: baseUrl
      }
    }
  }
}
