<template>
	<view class="custom-navbar" :style="{ height: navbarTotalHeight + 'px' }">
		<!-- 状态栏占位视图 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
		<!-- 导航栏主体 -->
		<view class="nav-bar" :style="{ height: navBarHeight + 'px' }"
			style="display: flex;gap: 100rpx;justify-content: flex-start">
			<view style="display: flex;align-items: center;gap: 30rpx;">
				<image src="/static/public/left.png" style="width: 50rpx;height: 50rpx;"></image>
				<image src="/static/public/home.png" style="width: 50rpx;height: 50rpx;"></image>
			</view>
			<view>{{title}}</view>
		</view>
	</view>
</template>

<script>
	import {
		info_screen
	} from '@/utils/scheme/screen.js'
	export default {
		name: 'CustomHeader',
		props: {
			title: { // 更明确的属性名
				type: String,
				default: '首页'
			}

		},
		data() {
			return {
				screenInfo: {}, // 屏幕信息对象
				baseLink: 'https://k1sw.wiselink.net.cn', // 基础域名

			};
		},
		methods: {
			// 初始化屏幕信息
			async initialScreenInfo() {
				try {
					this.screenInfo = await info_screen();
				} catch (error) {
					console.error('[ScreenInfo] 获取屏幕信息失败:', error);
					uni.showToast({
						title: '设备信息获取失败',
						icon: 'none'
					});
				}
			},
		},
		computed: {
			// 当前用户信息
			userInfo() {
				return uni.getStorageSync('user_info') || null;
			},



			// 状态栏高度
			statusBarHeight() {
				return this.screenInfo.statusBarHeight || 0;
			},

			// 导航栏主体高度
			navBarHeight() {
				return this.screenInfo.platform === 'ios' ? 49 : 44;
			},

			// 导航栏总高度
			navbarTotalHeight() {
				return this.statusBarHeight + this.navBarHeight;
			},

			// 安全的屏幕高度
			safeScreenHeight() {
				return this.screenInfo.screenHeight || 667;
			},



		},
		mounted() { // 使用mounted替代onShow
			this.initialScreenInfo();
		}
	};
</script>

<style scoped>
	/* ===== 基础变量 ===== */
	:root {
		--primary-color: #007aff;
		--text-dark: #1a1a1a;
		--text-gray: #666;
		--text-light: #999;
		--bg-light: #f9f9f9;
		--border-radius: 12rpx;
		--box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
		--transition: all 0.3s ease;
	}

	/* ===== 基础布局 ===== */
	.container {
		width: 100%;
		display: flex;
		flex-direction: column;
		background: url('/static/public/bg.png') no-repeat center / cover;
		overflow-x: hidden;
	}

	.content-container {
		flex: 1;
		width: 100%;
		display: flex;
		flex-direction: column;
		padding-top: var(--navbar-height);
		overflow: hidden;
	}

	/* ===== 导航栏样式 ===== */
	.custom-navbar {
		width: 100%;
		position: fixed;
		top: 0;
		left: 0;
		z-index: 1000;
		background: rgba(255, 255, 255, 0.98);
		box-shadow: var(--box-shadow);
		backdrop-filter: blur(10rpx);
	}

	.nav-bar {
		display: flex;
		align-items: center;
		padding: 0 24rpx;
		box-sizing: border-box;
	}

	.title-container {
		display: flex;
		align-items: center;
		gap: 20rpx;
		height: 100%;
		width: 100%;
	}
</style>