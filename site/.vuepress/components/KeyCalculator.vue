<template>
  <div>
    <a-input-search
        size="large"
        :allowClear="true"
        placeholder="请输入页面链接"
        @search="computeKey">
      <a-button
          slot="enterButton"
          icon="key"
          type="primary">生成密钥</a-button>
    </a-input-search>
  </div>
</template>

<script>
export default {
  props: {
    encryptFunctionCode: String
  },
  mounted() {
    eval(this.encryptFunctionCode)
  },
  methods: {
    computeKey(value, event) {
      if (event.target.tagName === 'BUTTON') {
        const secretKey = hxlComputeKey(value)
        this.$copyText(secretKey)
        this.$notification.open({
          message: '密钥生成成功：' + secretKey + '，并已复制到剪切板。',
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
}
</script>
