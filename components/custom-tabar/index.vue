<template>
	<view class="tabr-container">
		<block v-for="(item, index) in navList" :key="item.id || index">
			<view class="tabr-item" @click="handleTabClick(item)">
				<image :src="`${baseLink}/img/${item.text === selectedTab ? item.selectedIconPath : item.iconPath}`"
					class="tabr-icon" />
				<text :class="{ 'tabrActive': item.text === selectedTab }" class="tabr-text">{{ item.text }}</text>
			</view>
		</block>
	</view>
</template>

<script>
	import {
		u_navlist
	} from '@/api'

	export default {
		name: 'CustomTabar',
		props: {
			selectedTab: { // 更明确的属性名
				type: String,
				default: '首页'
			}
		},
		data() {
			return {
				navList: [],
				baseLink: 'https://k1sw.wiselink.net.cn', // 基础域名
			};
		},
		methods: {
			async handleNavlist() {
				try {
					const response = await u_navlist();
					this.navList = response.content || [];
				} catch (error) {
					console.error('获取导航数据失败:', error);
					this.navList = [];
				}
			},
			handleTabClick(item) {
				// 触发父组件事件
				this.$emit('tab-change', item);
				// 如果需要页面跳转可以在这里添加逻辑
				// uni.switchTab({ url: item.pagePath });
			}
		},
		mounted() { // 使用mounted替代onShow
			this.handleNavlist();
		}
	};
</script>

<style lang="scss" scoped>
	.tabr-container {

		display: flex;
		flex-direction: row;
		height: 100rpx;
		justify-content: space-between;
		width: 98%;
		align-items: center;
		margin: auto;
		background-color: #fff;
		padding: 10rpx;
	}

	.tabr-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		flex: 1;
	}

	.tabr-icon {
		width: 50rpx;
		height: 50rpx;
		margin-bottom: 8rpx;
	}

	.tabr-text {
		font-size: 24rpx; // 稍小字号
		color: #666;
	}

	.tabrActive {
		color: #007aff !important;
	}
</style>