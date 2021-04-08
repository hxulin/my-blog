<template>
  <div class="post-meta">
    <a-icon type="calendar"/>
    <span class="date">发表于 {{ date }}</span>
  </div>
</template>

<script>
export default {
  props: {
    date: {
      type: String
    }
  }
}
</script>

<style lang="less" scoped>
.post-meta {
  color: #999;
  font-size: 0.9rem;

  .date {
    margin-left: 0.3rem;
  }
}
</style>
