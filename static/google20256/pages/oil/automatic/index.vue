<template>
	<view class="container" :style="{ height: `${safeScreenHeight}px` }">
		<CustomNavBar title="油量自动检测" />
		<!-- 主容器 -->
		<view class="record-container" :style="'margin-top: ' + navbarTotalHeight + 'px;'">
			<view class="card">
				<view class="header">
					<view class="vehicle-info">
						<view class="license-plate">
							<image class="car-icon" src="/static/public/car_icon.png"></image>
							<text>{{vehicle_info?.platenumber||'-'}}</text>
						</view>
						<view class="divider"></view>
						<text
							class="vin-short">{{vehicle_info?.vehicleSerialName}}{{vehicle_info?.vehicleModeName||'-'}}</text>
					</view>
					<view class="reselect" @tap="handleJumpVehicle">{{vehicle_info?.platenumber?'重新选择':'选择车辆'}}</view>
				</view>
				<view class="details">
					<view class="detail-item">
						<label>车架号：</label>
						<text>{{vehicle_info?.vin||'-'}}</text>
					</view>
					<view class="detail-item">
						<label>油箱容积：</label>
						<text>{{vehicle_info?.xsgw||'-'}}</text>
					</view>
				</view>
			</view>
			<scroll-view scroll-y class="scroll-container">
				<block v-for="(item,index) in g_items">
					<view class="record-card">
						<view class="record-header">
							<view class="vehicle-display">
								<image src="/static/public/car_icon.png" class="small-car-icon" />
								<text>{{item?.platenumber}}</text>
								<text
									class="vehicle-model">{{vehicle_info.vehicleSerialName||'-'}}{{vehicle_info.vehicleModeName||''}}</text>
							</view>
						</view>
						<view class="content-item-info">
							<view class="content-item-info-left">
								<view class="info-item info-item-title"
									:class="{'long-info-item': item?.startoil?.length > 15}">
									<label>起租油量 ：</label>
									<text>{{item?.startoil||0}}L</text>
								</view>
								<view class="info-item" :class="{'long-info-item': item?.startusername?.length > 15}">
									<label>起租检测人 ：</label>
									<text>{{item.startusername||'-'}}</text>
								</view>
								<view class="info-item" :class="{'long-info-item': item?.startsn?.length > 15}">
									<label>检测设备 ：</label>
									<text>{{item?.startsn||'-'}}</text>
								</view>
								<view>
									<label>检测时间 ：</label>
									<text>{{item?.startdate||'-' }}</text>
								</view>
							</view>
							<view class="content-item-info-right">
								<view class="info-item info-item-title"
									:class="{'long-info-item': item?.endoil?.length > 15}">
									<label>还租油量 ：</label>
									<text>{{item?.endoil||0}}L</text>
								</view>
								<view class="info-item" :class="{'long-info-item': item?.endusername?.length > 15}">
									<label>还租检测人 ：</label>
									<text>{{item?.endusername||'-'}}</text>
								</view>
								<view class="long-info-item">
									<label>检测设备 ：</label>
									<text>{{item?.endsn||'-'}}</text>
								</view>
								<view class="long-info-item">
									<label>检测时间 ：</label>
									<text>{{item?.enddate||'-'}}</text>
								</view>
							</view>
						</view>
						<view class="content-item-footer">
							<view class="footer-left">
								<view class="footer-section">
									<view>油量差额：{{item?.diff||0}}L</view>
									<view class="footer-text">收费状态：{{item?.chargestatusname||'-'}}</view>
								</view>
								<view class="footer-section">
									<view>预估服务费：{{item.cost||0}}</view>
									<view class="footer-text">实收服务费：{{item?.realcost||0}}</view>
								</view>
							</view>
							<view class="footer-right">
								<view class="footer-right-btn" data-item="{{item}}" bindtap="handleMarkStatus">
									<text>标记状态</text>
								</view>
							</view>
						</view>
					</view>
				</block>
			</scroll-view>
		</view>
		<view class="detection_button" @tap="handleGetOilButtonTap" v-if="vehicle_info?.platenumber">
			<text>检测油量</text>
		</view>
		<view class="modal-base-map" v-if="c_send_key_show_momal">
			<form @submit="handleFormSubmit">
				<view class="modal-container">
					<view class="modal-container-head">
						<text>检测完毕,请选择检测状态</text>
						<image src="/static/public/close.png" @tap="handleHideSengKeyModal" />
					</view>
					<view class="modal-container-middle">
						
					</view>
					<view class="modal-container-footer">
						<button formType="submit">确认</button>
						<button formType="submit">确认</button>
					</view>
				</view>
			</form>
		</view>
	</view>
</template>


<script>
	import {
		u_oilDipstickapiDipsticHistory,
		u_dzBussinessMobileApiGetCarStatus
	} from '@/api'
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
				g_items: [], // 车辆列表数据
				vehicle_info: {},
				c_send_key_show_momal: true,
				g_uesr_details: {}
			};
		},
		onLoad(options) {
			// 页面加载时逻辑
			this.vehicle_info = JSON.parse(options?.info)
			if (options?.info) {
				this.initDipsticHistory()
			}
		},
		onShow() {
			// 页面显示时初始化

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
					console.error('[ScreenInfo] 获取屏幕信息失败:', error);
					uni.showToast({
						title: '设备信息获取失败',
						icon: 'none'
					});
				}
			},
			// 跳转车辆列表
			handleJumpVehicle() {
				uni.redirectTo({
					url: `/pages/carRental/vehicleList/index?souce=/pages/oil/automatic/index`
				});
			},
			async initDipsticHistory() {
				try {
					const temp = {
						vehId: this.vehicle_info?.id
					}
					console.log(temp)
					const res = await u_oilDipstickapiDipsticHistory(temp);
					console.log(88888888888, res?.content)
					this.g_items = res?.content
				} catch (error) {
					console.error('[ScreenInfo] 获取记录失败:', error);

				}
			},
			async handleGetOilButtonTap() {
				try {
					const res = await u_dzBussinessMobileApiGetCarStatus({
						sn: this.vehicle_info?.sn
					});
					console.log(12332323, res)
				} catch (error) {
					console.error('[ScreenInfo] 检测失败', error);
					uni.showToast({
						title: '设备信息获取失败',
						icon: 'none'
					});
				}
			}



		}
	};
</script>
<style>
	/* 容器样式 */
	.container {
		padding: 10rpx 0rpx;
		background-image: url(/static/public/car-bg.png);
		background-size: cover;
	}

	/* 记录容器 */
	.record-container {
		width: 98%;
		margin: auto;
		border-radius: 12rpx;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		display: flex;
		flex-direction: column;
		gap: 10rpx;
	}

	.scroll-container {
		background-color: aliceblue;
		min-height: 80vh;
		width: 98%;
	}

	/* 卡片样式 */
	.card {
		width: 98%;
		background-color: #fff;
		border-radius: 8rpx;
		margin: 0 auto;
	}

	/* 头部区域 */
	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-bottom: 1rpx solid #f0f0f0;
		font-size: 28rpx;
		padding: 10rpx 0;
	}

	/* 车辆信息区域 */
	.vehicle-info {
		display: flex;
		align-items: center;
		gap: 15rpx;
		padding: 20rpx;
	}

	/* 车牌区域 */
	.license-plate {
		display: flex;
		align-items: center;
		gap: 5rpx;
	}

	/* 车辆图标 */
	.car-icon {
		width: 40rpx;
		height: 30rpx;
	}

	/* 分隔线 */
	.divider {
		border-left: 1rpx solid #f0f0f0;
		height: 30rpx;
	}

	/* 车架号缩写 */
	.vin-short {
		word-break: keep-all;
	}

	/* 重新选择按钮 */
	.reselect {
		color: #007AFF;
		padding-right: 20rpx;
	}

	/* 详情区域 */
	.details {
		display: flex;
		gap: 30rpx;
		padding: 20rpx;
		font-size: 28rpx;
	}

	/* 详情项 */
	.detail-item {
		display: flex;
		gap: 10rpx;
	}

	.info-item-title {
		font-weight: bold;
		font-size: 26rpx;
		color: #4587FD;
	}

	.info-item {
		display: flex;
	}

	.long-info-item {
		flex-basis: 100%;
	}

	.record-card {
		background-color: #fff;
		border-radius: 10rpx;
		margin-bottom: 20rpx;
	}

	.record-header {
		display: flex;
		padding: 20rpx;
		font-size: 28rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.vehicle-display {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	.small-car-icon {
		width: 40rpx;
		height: 30rpx;
	}

	.vehicle-model {
		margin-left: 10rpx;
	}

	.content-item-info {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-start;
		padding: 10rpx;
		gap: 20rpx;
		border-bottom: 1px solid #f0f0f0;
		font-size: 28rpx;
	}

	.content-item-info-left,
	.content-item-info-right {
		width: 48%;
		display: flex;
		flex-direction: column;
		gap: 15rpx;
	}

	.content-item-footer {
		display: flex;
		padding: 10rpx;
		justify-content: space-between;
	}

	.footer-text {
		font-weight: 500;
		font-size: 24rpx;
		color: #333333;
	}

	.footer-left {
		font-weight: bold;
		font-size: 24rpx;
		color: #333333;
		display: flex;
		gap: 30rpx;
	}

	.footer-section {
		display: flex;
		flex-direction: column;
	}

	.footer-right {
		display: flex;
		align-items: center;
	}

	.footer-right-btn {
		display: flex;
		align-items: center;
		font-weight: bold;
		font-size: 22rpx;
		color: #ffffff;
		background-color: #1B64B1;
		border-radius: 8rpx;
		padding: 4rpx 15rpx;
	}

	.detection_button {
		position: absolute;
		bottom: 60px;
		width: 100%;
		display: flex;
		justify-content: center;
	}

	.detection_button text {
		background: linear-gradient(88deg, #1576DC, #1B64B1);
		box-shadow: 0rpx 1rpx 13rpx 0rpx rgba(51, 63, 92, 0.31);
		border-radius: 50rpx;
		font-family: PingFang SC;
		padding: 0rpx 100rpx;
		font-weight: bold;
		font-size: 30rpx;
		color: #FFFFFF;
		line-height: 76rpx;
	}


	.modal-base-map {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		background: #fff;
		border-radius: 20rpx;
		z-index: 998;
		padding: 20rpx;
	}

	.modal-container {
		height: 40vh;
		display: flex;
		flex-direction: column;
	}

	.modal-container-head {
		display: flex;
		justify-content: row;
		justify-content: space-between;
		align-items: center;
		height: 60rpx;
	}

	.modal-container-head text {
		font-weight: bold;
		font-size: 34rpx;
		color: #333333;
	}

	.modal-container-head image {
		width: 24rpx;
		height: 24rpx;
	}

	.modal-container-middle {
		flex: 1;
		overflow-y: auto;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		gap: 20rpx;
	}

	.modal-container-footer {
		height: 80rpx;
		display: flex;
		justify-content: space-around;
		align-items: center;
	}

	.modal-container-footer button {
		background: linear-gradient(88deg, #1576dc, #1b64b1);
		box-shadow: 0rpx 1rpx 13rpx 0rpx rgba(51, 63, 92, 0.31);
		border-radius: 36rpx;
		font-weight: bold;
		font-size: 34rpx;
		color: #ffffff;
		width: 40%;
		height: 90%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.middle-form-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 45rpx;
		width: 80%;
	}

	.middle-form-item label {
		font-family: PingFang SC;
		font-weight: 600;
		font-size: 28rpx;
		color: #333333;
	}

	.modal-form-region {
		display: flex;
		gap: 10rpx;
	}
</style>