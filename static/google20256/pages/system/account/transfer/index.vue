<template>
	<view class="container" :style="{ height: `${safeScreenHeight}px` }">
		<CustomNavBar :title="langs.transferadmin" />
		<!-- 主容器 -->
		<view class="record-container" :style="'margin-top: ' + (navbarTotalHeight) + 'px;'">
			<scroll-view style="height: 100vh" scroll-y>
				<block v-for="(item, index) in g_items" :key="index">
					<view class="content-item">
						<view class="content-item-head">
							<view class="head-left">
								<view class="left-category">
									<text>{{ item?.realname }}</text>
								</view>
							</view>
						</view>

						<view class="content-item-info">
							<view :class="'info-item  ' + (item?.username?.length > 15 ? 'long-info-item' : '')">
								<label>{{langs.account}} ：</label>
								<text>{{ item?.username || '-' }}</text>
							</view>
							<view :class="'info-item  ' + (item?.roleName?.length > 15 ? 'long-info-item' : '')">
								<label>{{langs.role}} ：</label>
								<text>{{ item?.roleName}}</text>
							</view>
							<view :class="'info-item  ' + (item?.mobile?.length > 15 ? 'long-info-item' : '')">
								<label>{{langs.mobile}} ：</label>
								<text>{{ item?.mobile || '-' }}</text>
							</view>
						</view>
						<view class="content-item-footer">
							<view class="footer-right">
								<view class="footer-right-btn" :data-item="item" @tap="handleTransfer">
									<text>{{langs.transferadmin}}</text>
								</view>
							</view>
						</view>
					</view>
				</block>
			</scroll-view>
		</view>
	</view>
</template>

<script>
	import {
		u_childUserList,
		u_transferAdminUser
	} from '@/api'
	import CustomNavBar from "@/components/custom-header/index.vue";
	import {
		info_screen
	} from '@/utils/scheme/screen.js'
	import {
		langs,
	} from '@/utils/i18n/index.js'
	export default {
		components: {
			CustomNavBar
		},
		data() {
			return {
				screenInfo: {}, // 屏幕信息对象
				g_items: [], // 车辆列表数据
				langs: {}
			};
		},
		onLoad(options) {
			// 页面加载时逻辑
		},
		onShow() {
			// 页面显示时初始化
			this.initialPersonnelList()
			this.initialScreenInfo()
			this.handleGetCurrentLanguage()
		},
		computed: {
			// 状态栏高度
			statusBarHeight() {
				return this.screenInfo.statusBarHeight || 0;
			},
			// 导航栏高度
			navBarHeight() {
				return this.screenInfo.platform === 'ios' ? 49 : 44;
			},
			// 导航栏总高度（状态栏+导航栏）
			navbarTotalHeight() {
				return this.statusBarHeight + this.navBarHeight;
			},
			// 安全区域高度
			safeScreenHeight() {
				return this.screenInfo.screenHeight || 667;
			}
		},
		methods: {
			handleGetCurrentLanguage() {
				let currentLang = uni.getStorageSync('lang') || 'zh-CN';
				this.langs = langs[currentLang]
			},
			// 获取屏幕信息
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

			// 获取人员列表
			async initialPersonnelList() {
				try {
					const res = await u_childUserList({});
					// 合并新数据
					this.g_items = this.g_items.concat(res?.content || [])
				} catch (error) {
					console.error('获取人员列表失败:', error);
				}
			},

			// 移交管理员
			async handleTransfer(evt) {
				const targetUserId = evt?.currentTarget?.dataset?.item?.id
				try {
					const res = await u_transferAdminUser({
						targetUserId
					});
					if (res.code === 1000) {
						uni.showToast({
							title: res.msg || '操作成功',
							icon: 'success'
						});
						this.g_items = [];
						this.$nextTick(() => {
							this.initialPersonnelList();
						});

					} else {
						uni.showToast({
							title: res.msg || '提交失败',
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('提交出错:', error);
					uni.showToast({
						title: '网络异常，请重试',
						icon: 'none'
					});
				}

			},

		}
	};
</script>
<style>
	.required-mark {
		color: #f56c6c;
		margin-left: 8rpx;
	}

	/* 容器样式 */
	.container {
		height: 100vh;
		padding: 10rpx 0rpx;
		background-image: url(/static/public/car-bg.png);
		background-size: cover;
	}

	/* 记录容器 */
	.record-container {
		width: 98%;
		margin: auto;
		position: relative;
		border-radius: 12rpx;
		background-color: #fff;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}

	/* 标签栏样式 */
	.record-tabs {
		display: flex;
		height: 50px;
	}

	.record-tabs-item {
		border-radius: 12rpx;
		width: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		background-size: cover;
		background-position: center;
		font-family: PingFang SC;
		font-weight: bold;
		font-size: 28rpx;
		color: #010101;
	}

	/* 内容项样式 */
	.content-item {
		margin: 10rpx;
		background-color: #ffffff;
		border-radius: 8px;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}

	.content-item-head {
		display: flex;
		justify-content: space-between;
		border-bottom: 1px solid #f0f0f0;
		padding: 20rpx 15rpx;
	}

	.head-left {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	.left-category {
		display: flex;
		align-items: center;
		font-family: PingFang SC;
		font-weight: bold;
		font-size: 26rpx;
		color: #333333;
		gap: 10rpx;
	}

	.left-category image {
		width: 43rpx;
		height: 35rpx;
	}

	.left-split_line {
		width: 1rpx;
		height: 28rpx;
		border-left: 1px solid #797979;
	}

	.left-brand {
		font-family: PingFang SC;
		font-weight: 500;
		font-size: 24rpx;
		color: #4587fd;
		border: 1px solid #4587fd;
		border-radius: 8rpx;
		padding: 0 15rpx;
	}

	.left-model {
		font-family: PingFang SC;
		font-weight: 500;
		font-size: 24rpx;
		color: #333333;
	}

	.head-right {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.head-right image {
		width: 30rpx;
		height: 30rpx;
	}

	/* 信息区域样式 */
	.content-item-info {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-start;
		padding: 10rpx;
		gap: 20rpx;
		border-bottom: 1px solid #f0f0f0;
	}

	.info-item {
		flex: 0 0 48%;
		box-sizing: border-box;
		word-wrap: break-word;
		font-family: PingFang SC;
		font-weight: 500;
		font-size: 24rpx;
		color: #333333;
	}

	.long-info-item {
		flex-basis: 100% !important;
		/* 长内容占满整行 */
	}

	/* 底部区域样式 */
	.content-item-footer {
		display: flex;
		padding: 15rpx;
		justify-content: flex-end;
		/* 右对齐 */
	}

	.footer-right {
		display: flex;
		align-items: center;
	}

	.footer-right-btn {
		display: flex;
		align-items: center;
		font-family: PingFang SC;
		font-weight: bold;
		font-size: 22rpx;
		color: #ffffff;
		background-color: #1b64b1;
		border-radius: 8rpx;
		padding: 4rpx 15rpx;
		margin-right: 10rpx;
	}

	/* 标签激活状态样式 */
	.tabs-active-1 {
		background-image: url(/static/tabs/2-1.png);
	}

	.tabs-no-active-1 {
		background-image: url(/static/tabs/1-1.png);
	}

	.tabs-active-2 {
		background-image: url(/static/tabs/1-2.png);
	}

	.tabs-no-active-2 {
		background-image: url(/static/tabs/2-2.png);
	}
</style>