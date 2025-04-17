<template>
  <view class="list">
    <view v-for="(item, index) in listData" :key="index" class="list-item">
      <slot :item="item"></slot>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ListComponent',
  props: {
    listData: {
      type: Array,
      required: true
    }
  }
};
</script>

<style lang="scss" scoped>
.list {
  .list-item {
    padding: 10px;
    border-bottom: 1px solid #eee;
  }
}
</style>