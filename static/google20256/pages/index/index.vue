<template>
  <!-- 添加启动画面布局 -->
  <view class="launch-screen">
    <image 
      class="logo" 
      src="/static/logo.png" 
      mode="aspectFit"
    />
    <view class="text-area">
      <text class="title">{{ title }}</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      title: '欢迎使用',
      timer: null
    }
  },
  onLoad() {
    this.initLaunchScreen();
  },
  onUnload() {
    // 页面卸载时清除定时器
    if (this.timer) clearTimeout(this.timer);
  },
  methods: {
    initLaunchScreen() {
      // 设置1.5秒后跳转（兼顾体验与性能）
      this.timer = setTimeout(() => {
        this.handleJump();
      }, 1500);
    },
    handleJump() {
      // 添加跳转动画效果
      uni.navigateTo({
        url: '/pages/desk/desk',
        animationType: 'fade-in',
        animationDuration: 300
      });
    }
  }
}
</script>

<style>
/* 优化样式结构 */
.launch-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
}

.logo {
  width: 240rpx;
  height: 240rpx;
  margin-bottom: 40rpx;
  animation: pulse 1.5s infinite;
}

.text-area {
  margin-top: 20rpx;
}

.title {
  font-size: 36rpx;
  color: #ffffff;
  font-weight: 500;
  text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.1);
}

/* 添加加载动画 */
@keyframes pulse {
  0% { transform: scale(0.95); opacity: 0.9; }
  50% { transform: scale(1); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.9; }
}
</style>