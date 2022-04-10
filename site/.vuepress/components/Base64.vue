<template>
  <div>
    <a-textarea
        v-model="input"
        placeholder="请输入内容"
        :auto-size="{minRows: 10}"
        style="font-size: 1rem"
    />
    <div style="padding: 1rem 0; text-align: right">
      <a-button @click="encode" type="primary" size="large" icon="lock">编码</a-button>
      <a-button @click="decode" type="primary" size="large" icon="unlock">解码</a-button>
      <a-button @click="urlEncode" type="primary" size="large" icon="ie">URI 编码</a-button>
      <a-button @click="clear" type="danger" size="large" icon="delete">清空</a-button>
    </div>
    <a-textarea
        style="color: #333; cursor: text; font-size: 1rem"
        v-model="result"
        :disabled="true"
        placeholder="计算结果"
        :auto-size="{minRows: 10}"
    />
    <div style="padding: 1rem 0; text-align: right">
      <a-button @click="copy" type="primary" size="large" icon="copy">复制到剪切板</a-button>
    </div>
  </div>
</template>

<script>
import {Base64} from 'js-base64'

export default {
  data() {
    return {
      input: '',
      result: ''
    }
  },
  methods: {
    // Base64 编码
    encode() {
      this.result = Base64.encode(this.input)
    },
    // Base64 解码
    decode() {
      this.result = Base64.decode(this.input)
    },
    // Base64 URI 编码
    urlEncode() {
      this.result = Base64.encodeURI(this.input)
    },
    // 清空文本框
    clear() {
      this.input = ''
      this.result = ''
    },
    // 复制到剪切板
    copy() {
      this.$copyText(this.result)
      this.$notification.open({
        message: '已复制到剪切板。',
        icon: h => {
          return h(
              'a-icon', {
                props: {
                  type: 'check-circle',
                  theme: 'twoTone',
                  twoToneColor: '#52C41A'
                }
              }
          )
        }
      })
    }
  }
}
</script>
