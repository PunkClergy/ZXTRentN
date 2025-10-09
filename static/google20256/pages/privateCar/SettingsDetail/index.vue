<template>
	<view class="settings-container">
		<CustomNavBar title="手机钥匙控车" />
		<!-- 设置项列表 -->
		<scroll-view class="settings-list" scroll-y :style="'margin-top: ' + (navbarTotalHeight) + 'px;'">
			<!-- 感应设置 -->
			<view class="settings-group">
				<view class="settings-item" data-sign="1" @tap="navigateToUserInfo">
					<view class="item-left">
						<text class="item-text">感应开关锁设置</text>
						<text class="item-tips">配置蓝牙自动感应参数，如开锁、关锁，感应灵敏度</text>
					</view>
					<image class="item-arrow" src="/static/privateCar/right_1.png"></image>
				</view>
			</view>
			<!-- 个性设置 -->
			<view class="settings-group">
				<view class="settings-item" data-sign="4" @tap="navigateToUserInfo">
					<view class="item-left">
						<text class="item-text">钥匙功能配置</text>
						<text class="item-tips">开启：功能图标显示在主界面；关闭：图标隐藏</text>
					</view>
					<image class="item-arrow" src="/static/privateCar/right_1.png"></image>
				</view>
			</view>
			<!-- 按键设置 -->
			<view class="settings-group">
				<view class="settings-item" data-sign="3" @tap="navigateToUserInfo">
					<view class="item-left">
						<text class="item-text">按键功能设置</text>
						<text class="item-tips">该设置用于配置钥匙各项指令对应的按键、时间、流程等</text>
					</view>
					<image class="item-arrow" src="/static/privateCar/right_1.png"></image>
				</view>
			</view>
			<!-- 工程模式 -->
			<view class="settings-group" style="display: none">
				<view class="settings-item" data-sign="2" @tap="navigateToUserInfo">
					<view class="item-left">
						<text class="item-text">工程模式</text>
					</view>
					<image class="item-arrow" src="/static/privateCar/right_1.png"></image>
				</view>
			</view>
			<view class="settings-group">
				<view class="settings-item" data-sign="5" @tap="navigateToUserInfo">
					<view class="item-left">
						<text class="item-text">其他个性设置</text>
					</view>
					<image class="item-arrow" src="/static/privateCar/right_1.png"></image>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import CustomNavBar from "@/components/custom-header/index.vue";
	import {
		info_screen
	} from '@/utils/scheme/screen.js'
	export default {
		components: {
			CustomNavBar
		},
		data() {
			return {
				screenInfo: {}, // 屏幕信息对象
				deviceIDC: '',
				orgKey: [51, 105, 69, 34, 131, 120],
			};
		},
		onLoad: function(options) {
			this.deviceIDC = `${options?.sn}`
			this.orgKey = options?.bluetoothKey
			setTimeout(() => {
				if (options?.flag == 1) {
					this.navigateToUserInfo(1);
				}
			}, 500)
		},
		onShow() {
			// 获取设备屏幕信息
			this.initialScreenInfo()
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
			// 获取屏幕信息
			async initialScreenInfo() {
				try {
					this.screenInfo = await info_screen();
				} catch (error) {
					uni.showToast({
						title: '设备信息获取失败',
						icon: 'none'
					});
				}
			},

			handleTransformation(number) {
				const numStr = number.toString();
				// 分割成每两个字符一组
				const bytes = [];
				for (let i = 0; i < numStr.length; i += 2) {
					const byteStr = numStr.substring(i, i + 2);
					bytes.push(parseInt(byteStr, 16)); // 按16进制解析
				}

				return bytes;
			},

			// 导航到各个设置页面
			navigateToUserInfo(evt) {
				const sign = evt?.currentTarget?.dataset?.sign || evt;
				const actionMap = {
					2: {
						title: '工程模式',
						placeholderText: '请输入操作密码',
						callback: (content) => {
							if (content == '666888') {
								uni.navigateTo({
									url: '/pages/listOfPrivateCars/engineering/index'
								});
							} else {
								uni.showToast({
									title: '密码错误',
									icon: 'none'
								});
							}
						},
						fallback: () => console.log('用户取消输入操作密码')
					},
					default: {
						url: `/pages/privateCar/btSettings/index?sign=${sign}&deviceIDC=${this.deviceIDC}&orgKey=${this.orgKey}`
					}
				};
				const action = actionMap[sign] || actionMap.default;
				if (action.url) {
					if (sign == 1) {
						uni.showModal({
							title: '提示',
							content: '如未与设备配对,请先执行蓝牙配对操作',
							complete: (res) => {
								if (res.confirm) {
									uni.navigateTo(action);
								}
							}
						});
					} else {
						uni.navigateTo(action);
					}
				} else {
					uni.showModal({
						title: action.title,
						editable: true,
						placeholderText: action.placeholderText,
						success(res) {
							res.confirm ? action.callback(res.content) : action.fallback();
						}
					});
				}
			}
		}
	};
</script>
<style>
	.settings-container {
		height: 100vh;
		display: flex;
		flex-direction: column;
		background-repeat: no-repeat;
		background-size: cover;
		background-position: center;
		touch-action: pan-x;
		position: relative;
		padding: 0 10rpx;
	}

	.settings-group {
		margin-bottom: 10px;
		background-color: #ffffff;
	}

	.group-title {
		padding: 10px 15px;
		font-size: 14px;
		color: #999999;
	}

	.settings-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 15px;
		border-bottom: 1px solid #f0f0f0;
	}

	.item-left {
		display: flex;
		/* align-items: center; */
		flex-direction: column;
		justify-content: center;
	}

	.item-tips {
		font-size: 24rpx;
		color: #999999;
	}

	.item-icon {
		width: 20px;
		height: 20px;
		margin-right: 10px;
	}

	.item-text {
		font-size: 28rpx;
		color: #333333;
	}

	.item-right {
		display: flex;
		align-items: center;
	}

	.item-value {
		font-size: 14px;
		color: #999999;
		margin-right: 5px;
	}

	.item-arrow {
		width: 16px;
		height: 16px;
	}

	/* 最后一个设置项去掉下划线 */
	.settings-item:last-child {
		/* border-bottom: none; */
	}
</style>