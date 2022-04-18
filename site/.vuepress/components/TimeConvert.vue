<template>
  <div style="padding: 1rem 0">
    <a-card
        :tab-list="tabList"
        :active-tab-key="key"
        @tabChange="onTabChange">
      <div v-if="key === 'unit'">
        <template v-for="(item, index) in timeUnits">
          <a-input
              @change="timeUnitConvert(index)"
              v-model="item.val"
              :style="index > 0 ? 'margin-top: 1rem' : ''"
              :addon-before="item.text + '（' + item.unit + '）'"/>
        </template>
      </div>
      <div v-else-if="key === 'diff'">
        暂未开通
      </div>
    </a-card>
  </div>
</template>

<script>
const moment = require('moment-timezone')

export default {
  data() {
    return {
      tabList: [{
        key: 'unit',
        tab: '时间单位换算'
      }, {
        key: 'diff',
        tab: '时间差计算'
      }],
      key: 'unit',
      timeUnits: [{
        unit: 'years',
        text: '年',
        val: ''
      }, {
        unit: 'months',
        text: '月',
        val: ''
      }, {
        unit: 'weeks',
        text: '周',
        val: ''
      }, {
        unit: 'days',
        text: '天',
        val: ''
      }, {
        unit: 'hours',
        text: '小时',
        val: ''
      }, {
        unit: 'minutes',
        text: '分',
        val: ''
      }, {
        unit: 'seconds',
        text: '秒',
        val: ''
      }, {
        unit: 'milliseconds',
        text: '毫秒',
        val: ''
      }]
    }
  },
  methods: {
    onTabChange(tab) {
      this.key = tab
    },
    timeUnitConvert(index) {
      const current = this.timeUnits[index];
      if (current.val === '') {
        for (const timeUnit of this.timeUnits) {
          timeUnit.val = ''
        }
      } else {
        const duration = moment.duration(current.val, current.unit)
        for (const timeUnit of this.timeUnits) {
          timeUnit.val = duration.as(timeUnit.unit)
        }
      }
    }
  }
}
</script>

<style scoped>
@media (max-width: 475px) {
  /deep/ .ant-input-group-addon {
    width: 50%
  }
}

@media (min-width: 476px) {
  /deep/ .ant-input-group-addon {
    width: 30%
  }
}
</style>