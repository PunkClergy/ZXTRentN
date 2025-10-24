<template>
	<view class="container">
		<!-- 自定义头部 -->
		<CustomNavBar title="视频播放" />
		<view class="content-container">
			<view class="video-wrapper">
				<video 
					id="myVideo" 
					v-if="mp4_url" 
					:src="mp4_url" 
					@error="videoErrorCallback" 
					:danmu-list="danmuList"
					enable-danmu 
					danmu-btn 
					:show-center-play-btn="false" 
					:show-play-btn="true" 
					controls
					:picture-in-picture-mode="['push', 'pop']" 
					@enterpictureinpicture="bindVideoEnterPictureInPicture"
					@leavepictureinpicture="bindVideoLeavePictureInPicture"
					@loadedmetadata="onVideoLoaded"
					class="video-player">
				</video>
				<view class="video-duration" v-if="duration">时长: {{ formatDuration(duration) }}</view>
			</view>
		</view>
	</view>
</template>

<script>
	import CustomNavBar from "@/components/custom-header/index.vue";
	export default {
		components: {
			CustomNavBar
		},
		data() {
			return {
				mp4_url: '',
				title: '',
				danmuList: [],
				duration: 0
			};
		},
		onLoad(options) {
			console.log(options.url);
			if (options.url) {
				this.mp4_url = options.url
				this.title = options.title
			}
		},
		
		methods: {
			// 视频元数据加载完成时获取时长
			onVideoLoaded(e) {
				const videoContext = uni.createVideoContext('myVideo', this);
				setTimeout(() => {
					videoContext.getDuration({
						success: (res) => {
							this.duration = res.duration;
						}
					});
				}, 100);
			},
			
			// 格式化时长显示
			formatDuration(seconds) {
				const mins = Math.floor(seconds / 60);
				const secs = Math.floor(seconds % 60);
				return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
			},
			
			videoErrorCallback(e) {
				console.log('视频播放错误:', e);
			},

			bindVideoEnterPictureInPicture() {
				console.log('进入画中画模式');
			},

			bindVideoLeavePictureInPicture() {
				console.log('退出画中画模式');
			}
		}
	};
</script>

<style>
	.container {
		display: flex;
		flex-direction: column;
		height: 100vh;
	}
	
	.content-container {
		flex: 1;
		padding: 20rpx;
	}
	

	
	.video-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		margin-top: 200rpx;
	}
	
	.video-player {
		width: 100%;
		max-width: 750rpx;
		height: 422rpx; /* 16:9 比例 */
		border-radius: 12rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
	}
	
	.video-duration {
		margin-top: 20rpx;
		font-size: 28rpx;
		color: #666;
	}
</style>