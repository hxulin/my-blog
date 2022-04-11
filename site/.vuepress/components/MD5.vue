<template>
  <div>
    <a-textarea
        v-model="input"
        placeholder="请输入内容"
        :auto-size="{minRows: 10}"
        style="font-size: 1rem"
        @change="computeMd5"
    />
    <div style="padding: 1rem 0; text-align: right">
      <a-button @click="clear" type="danger" size="large" icon="delete">清空</a-button>
    </div>
    <a-textarea
        style="color: #333; cursor: text; font-size: 1rem"
        v-model="result"
        :disabled="true"
        placeholder="计算结果"
        :auto-size="{minRows: 2}"
    />
    <div style="padding: 1rem 0; text-align: right">
      <a-button @click="copy" type="primary" size="large" icon="copy">复制到剪切板</a-button>
    </div>
  </div>
</template>

<script>

export default {
  data() {
    return {
      input: '',
      result: ''
    }
  },
  methods: {
    // 计算 MD5 值
    computeMd5() {
      this.result = md5(this.input)
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