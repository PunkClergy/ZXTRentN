<template>
	<view class="map-container" style="position: relative;">
		<!-- 地图容器 -->
		// #ifdef H5
		<view id="map" style="width:100%;height:100vh;"></view>
		// #endif

		<iframe src="https://k3a.wiselink.net.cn/img/index.html#/pages/maps/index" width="100%" height="100%"
			frameborder="0" allowfullscreen>
		</iframe>
		
		<view style="position: absolute;bottom: 100rpx;display: flex;flex-direction: row;width: 100%;justify-content: space-around;margin: auto;font-size: 28rpx;">
				<view style="background-color: rgb(169, 169, 169);padding: 10rpx 20rpx;border-radius: 10rpx;color: #fff;">归还车辆</view>
				<view style="background-color: rgb(169, 169, 169);padding: 10rpx 20rpx;border-radius: 10rpx;color: #fff;">开锁</view>
				<view style="background-color: rgb(169, 169, 169);padding: 10rpx 20rpx;border-radius: 10rpx;color: #fff;">关锁</view>
				<view style="background-color: rgb(169, 169, 169);padding: 10rpx 20rpx;border-radius: 10rpx;color: #fff;">寻车</view>
				<view style="background-color: rgb(169, 169, 169);padding: 10rpx 20rpx;border-radius: 10rpx;color: #fff;">查看照片</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				map: null,
				markers: [], // 改为数组存储多个标记
				infoWindows: [] // 存储多个信息窗口
			}
		},
		mounted() {
			this.loadGoogleMapsAPI().then(() => {
				this.initMap();
			});
		},
		methods: {
			init() {},
			loadGoogleMapsAPI() {
				return new Promise((resolve) => {
					if (window.google && window.google.maps) {
						resolve();
						return;
					}

					const script = document.createElement('script');
					script.src =
						`https://maps.googleapis.com/maps/api/js?key=AIzaSyA-1O3BpXj7BKBt8oJeMpzXy0DKxKVpPx4&callback=initMap`;
					script.async = true;
					script.defer = true;

					// 全局回调函数
					window.initMap = () => resolve();

					document.head.appendChild(script);
				});
			},

			initMap() {
				// 多个位置点数据
				const locations = [{
						id: 1,
						name: "悉尼歌剧院",
						position: {
							lat: -33.8569,
							lng: 151.2152
						},
						description: "世界著名表演艺术中心",
						icon: null // 使用默认图标
					},
					{
						id: 2,
						name: "皇家植物园",
						position: {
							lat: -33.8642,
							lng: 151.2165
						},
						description: "悉尼市中心的热带绿洲",
						icon: {
							url: "/static/public/g_location.png",
							scaledSize: new google.maps.Size(17, 36)
						}
					},
					{
						id: 3,
						name: "悉尼海港大桥",
						position: {
							lat: -33.8523,
							lng: 151.2108
						},
						description: "世界最大的钢拱桥",
						icon: {
							url: "/static/public/g_location.png",
							scaledSize: new google.maps.Size(17, 36)
						}
					}
				];

				// 创建地图实例
				this.map = new google.maps.Map(document.getElementById('map'), {
					center: locations[0].position, // 以第一个位置为中心
					zoom: 14, // 缩小一点以显示所有标记
					disableDefaultUI: true,
					zoomControl: false,
					mapTypeControl: false,
					streetViewControl: false,
					fullscreenControl: false
				});

				// 为每个位置创建标记和信息窗口
				locations.forEach(location => {
					this.createMarker(location);
				});
			},

			createMarker(location) {
				// 创建标记
				const marker = new google.maps.Marker({
					position: location.position,
					map: this.map,
					title: location.name,
					icon: location.icon // 自定义图标
				});

				// 创建信息窗口内容 - 美化版本
				const content = `
     
				<p>Jingsss</p>
				<p>${location.description}</p>
				`;

				// 创建信息窗口
				const infoWindow = new google.maps.InfoWindow({
					content: content,
					maxWidth: 250,
				});

				// 点击标记时打开信息窗口
				marker.addListener('click', () => {
					// 关闭其他信息窗口
					this.infoWindows.forEach(iw => iw.close());
					infoWindow.open(this.map, marker);
				});

				// 保存到数组
				this.markers.push(marker);
				this.infoWindows.push(infoWindow);

				// 初始打开第一个标记的信息窗口
				if (location.id === 1) {
					setTimeout(() => {
						infoWindow.open(this.map, marker);
					}, 500);
				}
			}
		}
	}
</script>

<style scoped>
	.map-container {
		position: relative;
		width: 100%;
		height: 100vh;
	}

	.gm-style-iw>div>button {
		display: none !important;
	}

	/* === 美化后的信息窗口样式 === */
	.info-window {
		/* padding: 100rpx;
		min-width: 500px;
		font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		border-radius: 16px;
		overflow: hidden;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
		background: white;
		border: 1px solid #e0e7ff;
		animation: popIn 0.3s ease-out; */
	}

	.info-header {
		background: linear-gradient(135deg, #1a2980, #26d0ce);
		padding: 15px 20px;
		color: white;
		position: relative;
	}

	.info-header h3 {
		margin: 0;
		font-size: 18px;
		font-weight: 600;
		padding-right: 30px;
	}

	.location-icon {
		position: absolute;
		top: 15px;
		right: 15px;
		font-size: 24px;
		opacity: 0.8;
	}

	.info-body {
		padding: 15px 20px;
	}

	.info-body p {
		margin: 0;
		font-size: 14px;
		color: #555;
		line-height: 1.5;
	}

	.action-buttons {
		display: flex;
		gap: 12px;
		padding: 0 20px 20px 20px;
	}

	.action-buttons button {
		flex: 1;
		padding: 10px;
		border: none;
		border-radius: 10px;
		cursor: pointer;
		font-size: 14px;
		font-weight: 500;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		transition: all 0.3s ease;
	}

	.nav-btn {
		background: linear-gradient(135deg, #1a2980, #26d0ce);
		color: white;
	}

	.fav-btn {
		background: #f0f4ff;
		color: #1a2980;
	}

	.action-buttons button:hover {
		transform: translateY(-3px);
		box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
	}

	.action-buttons button:active {
		transform: translateY(0);
	}

	.btn-icon {
		font-size: 16px;
	}

	/* 弹出动画 */
	@keyframes popIn {
		from {
			opacity: 0;
			transform: scale(0.8);
		}

		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	/* === 原始标记点样式保留 === */
	.custom-marker {
		position: relative;
		width: 40px;
		height: 40px;
		background: #1a73e8;
		border-radius: 50% 50% 50% 0;
		transform: rotate(-45deg);
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
	}

	.custom-marker::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%) rotate(45deg);
		width: 20px;
		height: 20px;
		background: white;
		border-radius: 50%;
	}

	.marker-label {
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		white-space: nowrap;
		font-weight: bold;
		color: #1a73e8;
		background: white;
		padding: 2px 6px;
		border-radius: 4px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}
</style>