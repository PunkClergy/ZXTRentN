<template>
	<!-- 主容器：高度动态适配屏幕 -->
	<view class="container" :style="{ height: `${safeScreenHeight}px` }">
		<CustomNavBar title="车辆绑定" />
		<view class="content-container" :style="{ '--navbar-height': `${navbarTotalHeight+10}px` }">
			<!-- 优化后的标签切换 -->
			<view class="record-tabs">
				<view class="record-tabs-item" :class="{ 'active-tab': activeTab === 1 }" @tap="handleSwitchTab(1)">
					车辆列表
				</view>
				<view class="record-tabs-item" :class="{ 'active-tab': activeTab === 2 }" @tap="handleSwitchTab(2)">
					{{ btnState }}车辆
				</view>
			</view>

			<!-- 添加内容区域占位 -->
			<view class="content-placeholder">
				<scroll-view scroll-y :refresher-enabled="true" :refresher-triggered="triggered"
					@refresherrefresh="onRefresh" @scrolltolower="onScrollToLower" v-if="activeTab === 1">
					<!-- 列表内容 -->
					<view v-for="(item, index) in list" :key="index">
						{{ item.name }}
					</view>

					<!-- 加载状态 -->
					<view v-if="loading">加载中...</view>
					<view v-if="noMore">没有更多数据了</view>
				</scroll-view>

				<view v-else>{{ btnState }}车辆表单区域</view>
			</view>
		</view>
	</view>
</template>

<script>
	import CustomNavBar from "@/components/custom-header/index.vue";
	import {
		info_screen
	} from '@/utils/scheme/screen.js';
	import {
		u_getCarList
	} from '@/api'

	export default {
		components: {
			CustomNavBar
		},
		data() {
			return {
				screenInfo: {}, // 屏幕信息对象
				activeTab: 1, // 默认激活第一个标签
				btnState: "绑定", // 按钮状态文本
				list:[{}]
			};
		},
		computed: {
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
			}
		},
		methods: {
			// 切换标签页
			handleSwitchTab(tabIndex) {
				this.activeTab = tabIndex;
				// 根据业务需要更新按钮状态
				this.btnState = tabIndex === 1 ? "绑定" : "添加";
			},

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
			async initialGetCarList() {
				try {
					const res = await u_getCarList({
						page: 1
					});
					console.log(res)
				} catch (error) {

				}
			},
		},
		async onShow() {
			await this.initialScreenInfo();
			await this.initialGetCarList()
		}
	};
</script>

<style scoped>
	/* ===== 基础布局 ===== */
	.container {
		width: 100%;
		display: flex;
		flex-direction: column;
		background: url('/static/public/car-bg.png') no-repeat center / cover;
		overflow: hidden;
	}

	.content-container {
		flex: 1;
		width: 96%;
		display: flex;
		flex-direction: column;
		padding-top: var(--navbar-height);
		overflow: hidden;
		margin: auto;
	}

	/* ===== 标签页样式 ===== */
	.record-tabs {
		display: flex;
		height: 88rpx;
		padding: 0rpx;

	}

	.record-tabs-item {
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		background-color: rgba(255, 255, 255, 0.7);
		transition: all 0.3s ease;
	}

	.record-tabs-item:first-child {
		border-top-left-radius: 16rpx;
		border-bottom-left-radius: 16rpx;
	}

	.record-tabs-item:last-child {
		border-top-right-radius: 16rpx;
		border-bottom-right-radius: 16rpx;
	}

	.active-tab {
		background-color: #1890ff;
		color: white;
	}

	/* ===== 内容区域 ===== */
	.content-placeholder {
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: rgba(255, 255, 255, 0.85);
		margin: 0rpx;
		font-size: 36rpx;
		color: #666;
		text-align: center;
	}
</style>