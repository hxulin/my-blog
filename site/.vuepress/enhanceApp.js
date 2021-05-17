/**
 * 扩展 VuePress 应用
 */
import eventBus from '@oak-tree-house/vuepress-plugin-encrypt/event'
import {notification} from 'ant-design-vue'
import VueClipboard from 'vue-clipboard2'

export default ({
                  Vue, // VuePress 正在使用的 Vue 构造函数
                  options, // 附加到根实例的一些选项
                  router, // 当前应用的路由实例
                  siteData // 站点元数据
                }) => {

  // 复制到剪切板工具
  Vue.use(VueClipboard)

  // 全局消息通知
  eventBus.$on('notify', action => {
    if (typeof action === 'string') {
      notification.open({
        message: action,
        placement: 'bottomRight'
      })
    } else {
      notification.open({
        message: action.message,
        icon: h => {
          return h(
            'a-icon', {
              props: {
                type: action.icon,
              },
              style: {
                color: action.iconColor
              }
            }
          )
        },
        placement: action.placement || 'bottomRight',
        key: action.key
      })
    }
  })

  // 加密文档解密失败
  eventBus.$on('decrypt-failed', () => {
    eventBus.$emit('notify', {
      message: '解密失败！',
      icon: 'close-circle',
      iconColor: '#F5222D',
      key: 'encrypt'
    })
  })

  // 加密文档解密成功
  eventBus.$on('decrypt-succeed', () => {
    eventBus.$emit('notify', {
      message: '解密成功！',
      icon: 'check-circle',
      iconColor: '#52C41A',
      key: 'encrypt'
    })
  })
}
