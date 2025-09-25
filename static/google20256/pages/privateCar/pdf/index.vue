<template>
	<view class="container">
		<!-- 滚动区域 -->
		<scroll-view :scroll-y="true" class="scroll-container" @scrolltolower="onScrollToLower">
			<view class="image-container">
				<image src="https://k3a.wiselink.net.cn/img/video/blueinstall.png" class="image"
					:style="'width:750rpx; height: ' + imageHeight + 'rpx;'" />
			</view>
		</scroll-view>

		<!-- 固定在底部的按钮和提示 -->
		<view class="bottom-section"
			:style="'background-color: ' + (!isBottomReached && !flag ? 'rgba(75, 72, 72, 0.8)' : 'transparent') + ';'">
			<!-- 开始使用按钮，仅当滑动到底部后才可点击 -->
			<button type="primary" class="start-button" @tap="startUsing" v-if="isBottomReached || flag">开始使用</button>

			<!-- 提示信息，仅当未滑动到底部时显示 -->
			<view class="scroll-hint" v-if="!isBottomReached && !flag">请滑动到底部，才可以点击“开始使用”</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				imageWidth: '加载中...',
				imageHeight: '加载中...',
				isBottomReached: false,
				// 全高度
				flag: 0
			};
		},
		onLoad(options) {
			this.flag = options?.flag || 0
			setTimeout(() => {
				this.hadleImage();
			}, 500)
		},
		methods: {
			// 当滚动到 scroll-view 底部时触发
			onScrollToLower() {
				this.isBottomReached = true

			},

			// “开始使用”按钮点击事件
			startUsing() {
				uni.redirectTo({
					url: '/pages/privateCar/index'
				});
			},

			hadleImage() {
				uni.showLoading({
					title: '加载中...'
				});
				const imgUrl = 'https://k3a.wiselink.net.cn/img/video/blueinstall.png';
				// 使用 wx.getImageInfo 获取图片信息
				uni.getImageInfo({
					src: imgUrl,
					success: (res) => {
						const proportion = res?.width / 750;
						this.imageWidth = res.width
						this.imageHeight = res.height / proportion
						uni.hideLoading()
					},
					fail: (err) => {
						console.error('获取图片信息失败', err);

						this.imageWidth = '加载失败'
						this.imageHeight = '加载失败'

					}
				});
			}
		}
	};
</script>
<style>
	/* container 样式 */
	.container {
		position: relative;
		height: 100%;
	}

	/* 滚动区域样式 */
	.scroll-container {
		overflow: hidden;
	}

	/* 图片容器样式 */
	.image-container {
		width: 100%;
		position: relative;
	}

	/* 图片样式（保留 width 和 height 的动态绑定） */
	.image {
		display: block;
		margin: 0 auto;
	}

	/* 底部按钮和提示的容器 */
	.bottom-section {
		position: fixed;
		bottom: 0rpx;
		width: 100%;
		text-align: center;
		/* background-color: rgba(75, 72, 72, 0.8); */
		padding: 20rpx 0;
		box-sizing: border-box;
	}

	/* 开始使用按钮样式 */
	.start-button {
		width: 90%;
		font-size: 16px;
		color: #fff;
		background: linear-gradient(88deg, #1576dc, #1b64b1);
		border-radius: 40px;
	}

	/* 滚动提示文字样式 */
	.scroll-hint {
		color: #fff;
		font-size: 14px;
		padding: 10px;
	}
</style>