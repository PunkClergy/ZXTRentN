<template>
	<view class="container">
		<CustomNavBar title="油价设定" />

		<!-- 汽油价格区域 -->
		<view class="section-header" :style="'margin-top: ' + (navbarTotalHeight) + 'px;'">
			<view class="title">汽油价格</view>
			<view class="add-btn" @tap="addOilItem">
				<image src="/static/public/add.png" style="width: 30rpx;height: 30rpx;"></image>
			</view>
		</view>

		<view v-for="(item, index) in oilSetItems" :key="index" class="input-row">
			<input class="name-input" :value="item.name" placeholder="油号"
				@input="handleInput($event, 'oilSetItems', index, 'name')" />
			<input class="price-input" type="digit" :value="item.value" placeholder="元/升"
				@input="handleInput($event, 'oilSetItems', index, 'value')" />
			<view v-if="index > 0" class="del-btn" @tap="removeItem('oilSetItems', index)">
				<image src="/static/public/reduce.png" style="width: 30rpx;height: 30rpx;"></image>
			</view>
		</view>

		<!-- 服务价格区域 -->
		<view class="section-header">
			<view class="title">服务价格</view>
			<view class="add-btn" @tap="addFwItem">
				<image src="/static/public/add.png" style="width: 30rpx;height: 30rpx;"></image>
			</view>
		</view>

		<view v-for="(item, index) in fwSetItems" :key="index" class="input-row">
			<input class="name-input" :value="item.name" placeholder="服务名称"
				@input="handleInput($event, 'fwSetItems', index, 'name')" />
			<input class="price-input" type="digit" :value="item.value" placeholder="服务价格"
				@input="handleInput($event, 'fwSetItems', index, 'value')" />
			<view v-if="index > 0" class="del-btn" @tap="removeItem('fwSetItems', index)">
				<image src="/static/public/reduce.png" style="width: 30rpx;height: 30rpx;"></image>
			</view>
		</view>

		<!-- 操作按钮 -->
		<view class="save-btn" @tap="saveSettings">
			<uni-icons type="checkmarkempty" size="24" color="#fff"></uni-icons>
			<text>保存设置</text>
		</view>

		<!-- 计算公式说明 -->
		<view class="formula-section">
			<view class="title">补差价计算公式</view>
			<view class="formula">服务费1+服务费2+服务费3+油号单价×升数</view>

			<view class="title">补退计算公式</view>
			<view class="formula">油号单价×升数</view>
		</view>
	</view>
</template>

<script>
	import CustomNavBar from "@/components/custom-header/index.vue";
	import {
		info_screen
	} from '@/utils/scheme/screen.js'
	import {
		u_getOilSet,
		u_saveOilSet
	} from '@/api'
	export default {
		components: {
			CustomNavBar,
		},
		data() {
			return {
				oilSetItems: [],
				fwSetItems: [{
					name: '服务费',
					value: '10'
				}, {
					name: '配送费',
					value: '5'
				}],
				screenInfo: {}, // 屏幕信息对象
			};
		},
		onShow() {
			this.initialScreenInfo()
			this.initOilSet()
		},
		computed: {
			// 当前用户信息（从本地存储获取）
			userInfo() {
				return uni.getStorageSync('user_info') || null
			},
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
			// 保存设置
			async saveSettings() {
				const temp = {
					companyId: this.userInfo?.fin3CompanyId,
					fwSet: this.fwSetItems,
					oilSet: this.oilSetItems
				}
				console.log(temp)
				try {
					const res = await u_saveOilSet(temp);
					if (res?.code == 1000) {
						uni.showToast({
							title: res?.msg,
							icon: 'none'
						});
						uni.reLaunch({
							url: '/pages/desk/desk'
						})
					}
				} catch (error) {
					console.error('保存失败:', error);
				}
			},
			// 获取油价
			async initOilSet() {
				try {
					const res = await u_getOilSet();
					if (res?.code == 1000) {
						const oilSet = res?.content?.oilSet;
						const fwSet = res?.content?.fwSet;
						this.oilSetItems = Object.entries(oilSet).map(([key, value]) => ({
							name: parseInt(key, 10),
							value: value
						}))
						this.fwSetItems = Object.entries(fwSet).map(([key, value]) => ({
							name: key,
							value: value
						}))
					}
				} catch (error) {
					console.error('获取数据失败:', error);
				}
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
			// 统一处理输入事件
			handleInput(e, dataset, index, field) {
				const value = e.detail.value;
				this[dataset][index][field] = value;
				this.setData({
					[dataset]: this[dataset]
				});
			},

			// 添加汽油条目
			addOilItem() {
				this.oilSetItems.push({
					name: '',
					value: ''
				});
				this.setData({
					oilSetItems: this.oilSetItems
				});
			},

			// 添加服务条目
			addFwItem() {
				this.fwSetItems.push({
					name: '',
					value: ''
				});
				this.setData({
					fwSetItems: this.fwSetItems
				});
			},

			// 删除条目
			removeItem(dataset, index) {
				uni.showModal({
					title: '确认删除',
					content: '确定要删除这项内容吗？',
					success: (res) => {
						if (res.confirm) {
							this[dataset].splice(index, 1);
							this.setData({
								[dataset]: this[dataset]
							});
						}
					}
				});
			},

		}
	};
</script>

<style lang="scss">
	.container {
		padding: 20rpx 30rpx;
		background-color: #f5f7fa;
		min-height: 100vh;
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin: 40rpx 0 20rpx;
		padding: 0 10rpx;

		.title {
			font-size: 34rpx;
			font-weight: bold;
			color: #333;
			position: relative;
			padding-left: 20rpx;

			&::before {
				content: '';
				position: absolute;
				left: 0;
				top: 50%;
				transform: translateY(-50%);
				width: 8rpx;
				height: 30rpx;
				background: #007aff;
				border-radius: 4rpx;
			}
		}

		.add-btn {
			width: 50rpx;
			height: 50rpx;
			border-radius: 50%;
			background: #07c160;
			display: flex;
			align-items: center;
			justify-content: center;
			box-shadow: 0 4rpx 12rpx rgba(7, 193, 96, 0.3);
		}
	}

	.input-row {
		display: flex;
		align-items: center;
		margin-bottom: 25rpx;
		background: #fff;
		border-radius: 16rpx;
		padding: 20rpx 25rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.03);
		position: relative;
		gap: 10rpx;

		&::after {
			content: '';
			position: absolute;
			left: 25rpx;
			right: 25rpx;
			bottom: 0;
			height: 1px;
			background: #f0f0f0;
		}

		&:last-child::after {
			display: none;
		}
	}

	.name-input,
	.price-input {
		flex: 1;
		height: 80rpx;
		padding: 0 20rpx;
		font-size: 30rpx;
		border-radius: 10rpx;
	}

	.name-input {
		background: #f9f9f9;
		border: 1rpx solid #e8e8e8;
	}

	.price-input {
		background: #f0f8ff;
		border: 1rpx solid #d1e8ff;
	}

	.del-btn {
		width: 50rpx;
		height: 50rpx;
		border-radius: 50%;
		background: #ff3b30;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-left: 20rpx;
		box-shadow: 0 4rpx 12rpx rgba(255, 59, 48, 0.2);
	}

	.save-btn {
		width: 90%;
		height: 90rpx;
		line-height: 90rpx;
		background: linear-gradient(135deg, #007aff, #0062cc);
		color: white;
		border-radius: 50rpx;
		font-size: 32rpx;
		font-weight: 500;
		margin: 60rpx auto 40rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 8rpx 24rpx rgba(0, 122, 255, 0.3);

		text {
			margin-left: 15rpx;
		}
	}

	.formula-section {
		margin-top: 40rpx;
		padding: 30rpx;
		background: #fff;
		border-radius: 20rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);

		.title {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
			margin-bottom: 20rpx;
			position: relative;
			padding-left: 30rpx;

			&::before {
				content: '•';
				position: absolute;
				left: 0;
				color: #007aff;
			}
		}

		.formula {
			font-size: 30rpx;
			color: #666;
			background: #f9f9f9;
			padding: 25rpx;
			border-radius: 12rpx;
			margin: 0 0 40rpx;
			line-height: 1.6;
			border-left: 4rpx solid #007aff;
		}
	}
</style>