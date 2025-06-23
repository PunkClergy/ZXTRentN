<template>
	<view class="container" :style="{ height: `${safeScreenHeight}px` }">
		<CustomNavBar title="智信通商铺" />
		<!-- 主容器 -->
		<view class="record-container" :style="'margin-top: ' + (navbarTotalHeight) + 'px;'">
			<view class="title">使用「抖音APP」扫码查看店铺</view>

			<!-- 二维码容器，添加点击事件 -->
			<view class="qrcode-container" @click="previewQrcode">
				<image :src="info?.qrcode" class="qrcode-img"></image>
				<view class="zoom-hint">点击查看大图</view>
			</view>

			<view class="action-buttons">
				<button class="action-btn" @click="copyLink">复制链接</button>
				<button class="action-btn contact-btn" @click="contactUs">联系我们</button>
			</view>

			<view class="tip-text">
				<text>可点击二维码放大长按保存到本地</text>
				<text>分享给朋友、客户，二维码长期有效</text>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		u_shopapiList
	} from '@/api'
	import CustomNavBar from "@/components/custom-header/index.vue";
	import {
		info_screen
	} from '@/utils/scheme/screen.js'
	import 'url-search-params-polyfill';

	export default {
		components: {
			CustomNavBar
		},
		data() {
			return {
				screenInfo: {}, // 屏幕信息对象
				info: {}
			};
		},
		onLoad(options) {

		},
		onShow() {
			this.initialScreenInfo()
			this.initShops()
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
			// 预览二维码大图
			previewQrcode() {
				if (this.info?.qrcode) {
					uni.previewImage({
						urls: [this.info.qrcode],
						longPressActions: {
							itemList: ['保存图片到相册'],
							success: (data) => {
								if (data.tapIndex === 0) {
									this.saveImage();
								}
							}
						}
					});
				}
			},

			// 保存图片到相册
			saveImage() {
				uni.downloadFile({
					url: this.info.qrcode,
					success: (res) => {
						if (res.statusCode === 200) {
							uni.saveImageToPhotosAlbum({
								filePath: res.tempFilePath,
								success: () => {
									uni.showToast({
										title: '保存成功',
										icon: 'success'
									});
								},
								fail: () => {
									uni.showToast({
										title: '保存失败',
										icon: 'none'
									});
								}
							});
						}
					}
				});
			},

			// 复制链接
			copyLink() {
				// 这里假设接口返回了店铺链接字段，实际使用时替换为正确字段名
				const link = this.info?.link || '';
				uni.setClipboardData({
					data: link,
					success: () => {
						uni.showToast({
							title: '链接已复制',
							icon: 'success'
						});
					}
				});
			},

			// 联系我们
			contactUs() {
				uni.makePhoneCall({
					phoneNumber: '133 3106 6554' // 替换为实际客服电话
				});
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

			// 获取车辆列表
			async initShops() {
				try {
					const res = await u_shopapiList();
					if (res?.code == 1000) {
						this.info = res?.content
					}
				} catch (error) {
					console.error('获取车辆列表失败:', error);
				}
			},
		}
	};
</script>

<style>
	/* 容器样式 */
	.container {
		height: 100vh;
		background-image: url(/static/public/car-bg.png);
		background-size: cover;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	/* 记录容器 */
	.record-container {
		width: 90%;
		height: auto;
		min-height: 83vh;
		margin: 20rpx auto;
		border-radius: 24rpx;
		background-color: rgba(255, 255, 255, 0.95);
		box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.15);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		padding: 40rpx 30rpx;
		gap: 50rpx;
	}

	.title {
		font-size: 36rpx;
		color: #333;
		font-weight: bold;
		text-align: center;
		margin-bottom: 20rpx;
	}

	.qrcode-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		background: #fff;
		padding: 30rpx;
		border-radius: 20rpx;
		box-shadow: 0 4rpx 15rpx rgba(64, 158, 255, 0.2);
		transition: all 0.3s ease;
	}

	.qrcode-container:active {
		transform: scale(0.98);
		box-shadow: 0 2rpx 8rpx rgba(64, 158, 255, 0.3);
	}

	.qrcode-img {
		width: 400rpx;
		height: 400rpx;
		border: 1rpx solid #f1f1f1;
		border-radius: 16rpx;
	}

	.zoom-hint {
		margin-top: 20rpx;
		font-size: 26rpx;
		color: #409EFF;
	}

	.action-buttons {
		display: flex;
		flex-direction: column;
		gap: 30rpx;
		width: 80%;
	}

	.action-btn {
		background: #fff;
		color: #409EFF;
		border: 1px solid #409EFF;
		border-radius: 30rpx;
		padding: 0rpx 100rpx;
		font-size: 28rpx;
		transition: all 0.3s;
	}

	.action-btn:active {
		background: #ecf5ff;
	}

	.contact-btn {
		background: #409EFF;
		color: #fff;
		border: none;
	}

	.tip-text {
		display: flex;
		flex-direction: column;
		font-size: 26rpx;
		color: #999;
		text-align: center;
		line-height: 1.6;
		margin-top: 20rpx;
	}
</style>