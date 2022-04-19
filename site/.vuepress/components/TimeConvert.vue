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
        <a-form-model :labelCol="{span: 6}">
          <a-row>
            <a-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
              <a-form-model-item label="开始时间" :wrapperCol="{span: 18}">
                <a-date-picker
                    v-model="diff.startDate"
                    type="date"
                    :locale="locale"
                    @change="computeTimeDiff"
                    style="width: 100%"
                    dropdownClassName="time-convert"/>
              </a-form-model-item>
            </a-col>
            <a-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
              <a-form-model-item :wrapperCol="{offset: 2, span: 18}">
                <a-time-picker
                    v-model="diff.startTime"
                    :locale="locale"
                    @change="computeTimeDiff"
                    style="width: 100%"/>
              </a-form-model-item>
            </a-col>
            <a-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
              <a-form-model-item label="结束时间" :wrapperCol="{span: 18}">
                <a-date-picker
                    v-model="diff.endDate"
                    type="date"
                    :locale="locale"
                    @change="computeTimeDiff"
                    style="width: 100%"
                    dropdownClassName="time-convert"/>
              </a-form-model-item>
            </a-col>
            <a-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
              <a-form-model-item :wrapperCol="{offset: 2, span: 18}">
                <a-time-picker
                    v-model="diff.endTime"
                    :locale="locale"
                    @change="computeTimeDiff"
                    style="width: 100%"/>
              </a-form-model-item>
            </a-col>
          </a-row>
        </a-form-model>
        <table>
          <tr>
            <td style="width: 10%">两个时间相差</td>
            <td style="width: 30%">{{ diff.timeText }}</td>
          </tr>
          <tr>
            <td>按天计算相差</td>
            <td>{{ diff.dayText }}</td>
          </tr>
          <tr>
            <td>按时计算相差</td>
            <td>{{ diff.hourText }}</td>
          </tr>
          <tr>
            <td>按分计算相差</td>
            <td>{{ diff.minuteText }}</td>
          </tr>
          <tr>
            <td>按秒计算相差</td>
            <td>{{ diff.secondText }}</td>
          </tr>
        </table>
      </div>
    </a-card>
  </div>
</template>

<script>
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN'
import moment from 'moment-timezone'

export default {
  data() {
    return {
      locale,
      key: 'unit',
      tabList: [{
        key: 'unit',
        tab: '时间单位换算'
      }, {
        key: 'diff',
        tab: '时间差计算'
      }],
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
      }],
      diff: {
        startDate: moment(),
        startTime: moment("00:00:00", "HH:mm:ss"),
        endDate: moment(),
        endTime: moment("23:59:59", "HH:mm:ss"),
        timeText: '',
        dayText: '',
        hourText: '',
        minuteText: '',
        secondText: ''
      }
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
    },
    computeTimeDiff() {
      if (this.diff.startDate && this.diff.startTime && this.diff.endDate && this.diff.endTime) {
        const start = moment(
            this.diff.startDate.format(moment.HTML5_FMT.DATE) + 'T' + this.diff.startTime.format(moment.HTML5_FMT.TIME_SECONDS),
            moment.HTML5_FMT.DATETIME_LOCAL_SECONDS
        )
        const end = moment(
            this.diff.endDate.format(moment.HTML5_FMT.DATE) + 'T' + this.diff.endTime.format(moment.HTML5_FMT.TIME_SECONDS),
            moment.HTML5_FMT.DATETIME_LOCAL_SECONDS
        )
        this.diff.dayText = end.diff(start, 'days', true) + '天'
        this.diff.hourText = end.diff(start, 'hours', true) + '时'
        this.diff.minuteText = end.diff(start, 'minutes', true) + '分'
        this.diff.secondText = end.diff(start, 'seconds', true) + '秒'
        const days = end.diff(start, 'days')
        this.diff.timeText = days + '天'
        let startTmp = start.add(days, 'days')
        const hours = end.diff(startTmp, 'hours');
        this.diff.timeText += hours + '时'
        startTmp = startTmp.add(hours, 'hours')
        const minutes = end.diff(startTmp, 'minutes');
        this.diff.timeText += minutes + '分'
        startTmp = startTmp.add(minutes, 'minutes')
        const seconds = end.diff(startTmp, 'seconds');
        this.diff.timeText += seconds + '秒'
      } else {
        this.diff.timeText = ''
        this.diff.dayText = ''
        this.diff.hourText = ''
        this.diff.minuteText = ''
        this.diff.secondText = ''
      }
    }
  }
}
</script>

<style>
.time-convert tr {
  background-color: transparent;
  border: none
}
</style>

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

/deep/ .ant-form-item {
  margin-bottom: 0.5rem
}

/deep/ .ant-card-body {
  min-height: 420px
}
</style>