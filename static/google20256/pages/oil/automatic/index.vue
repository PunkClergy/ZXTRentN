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
			<scroll-view scroll-y class="scroll-container"
				:style="{ height: vehicle_info?.platenumber ? '70vh' : '80vh' }">
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
		<!-- 检测油量 -->
		<view class="modal-base-map" v-if="c_send_key_show_momal">
			<form>
				<view class="modal-container">
					<view class="modal-container-head">
						<text>检测完毕,请选择检测状态</text>
						<image src="/static/public/close.png" @tap="handleHideSengKeyModal" />
					</view>
					<view class="modal-container-middle">
						<circle-progress-bar :pro="proportion" :border_back_color="'#297DFE'" :border_color="'#FB8F23'">
							<view style="font-size: 28rpx;color: #333width: 100%;text-align: center;margin: 20rpx 0;">
								本次检测油量
							</view>
							<view
								style=" font-weight: bold;color: #333;font-size: 42rpx;width: 100%;text-align: center;margin: 20rpx 0;">
								{{remaining_oil_quantity}}L
							</view>
							<view
								style=" font-weight: bold;color: #333;font-size: 28rpx;width: 100%;text-align: center;margin-top: 20rpx;">
								20%
							</view>
						</circle-progress-bar>
					</view>
					<view class="modal-container-footer">
						<button style="background-color: #fff;color:#297DFE;" @tap="handleStartingLease">起租</button>
						<button style="background-color: #297DFE;color: #fff;" @tap="handleStillRenting">还租</button>
					</view>
				</view>
			</form>
		</view>
		<!-- 还租选择订单 -->
		<view class="modal-base-map" v-if="c_order_key_show_momal">
			<form>
				<view class="modal-container">
					<view class="modal-container-head">
						<text>请选择起租订单：</text>
						<image src="/static/public/close.png" @tap="handleHideOrderModal" />
					</view>
					<view class="modal-container-middle">
						<radio-group @change="handleRadioChange"
							style="display: flex;align-items: center;flex-direction:column;gap: 30rpx;justify-content: center;">
							<scroll-view scroll-y style="height: 100%;">
								<block v-for="(item, index) in c_order_items" :key="item.id">
									<label
										style="display: flex;flex-direction: row;align-items: center;justify-content: center;">
										<radio style="transform:scale(0.8)" :value="item.id" />
										<view style="font-size: 28rpx;">
											{{item.startdate + '   油量：'+item.startoil+'L'}}
										</view>
									</label>
								</block>
							</scroll-view>
						</radio-group>
					</view>
					<view class="modal-container-footer">
						<button style="background-color: #fff;color:#297DFE;"
							@tap="handleStartRentingAgain">直接还租</button>
						<button style="background-color: #297DFE;color: #fff;" @tap="handleStartOrder">选订单还租</button>
					</view>
				</view>
			</form>
		</view>
		<!-- 选择油号 -->
		<view class="modal-base-map" v-if="c_oilNumber_key_show_momal">
			<form>
				<view class="modal-container">
					<view class="modal-container-head">
						<text>请选择油号</text>
						<image src="/static/public/close.png" @tap="handleHideOilNumberModal" />
					</view>
					<view class="modal-container-middle">
						<radio-group @change="handleOilRadioChange"
							style="display: flex;align-items: center;flex-direction:column;gap: 30rpx;justify-content: center;">
							<scroll-view scroll-y style="height: 100%;">
								<block v-for="(item, index) in c_oil_items" :key="item.id">
									<label
										style="display: flex;flex-direction: row;align-items: center;justify-content: center;">
										<radio style="transform:scale(0.8)" :value="item.id" />
										<view style="font-size: 28rpx;">
											{{item?.name}}
										</view>
									</label>
								</block>
							</scroll-view>
						</radio-group>
					</view>
					<view class="modal-container-footer">
						<button style="background-color: #297DFE;color: #fff;"
							@tap="handleOilStartRentingAgain">确认</button>
					</view>
				</view>
			</form>
		</view>

	</view>

</template>


<script>
	import {
		u_oilDipstickapiDipsticHistory,
		u_dzBussinessMobileApiGetCarStatus,
		u_dzBussinessMobileApiRentStart,
		u_oilDipstickapiRentEnd,
		u_oilDipstickapiGetOilPriceList
	} from '@/api'
	import CustomNavBar from "@/components/custom-header/index.vue";
	import CircleProgressBar from '@/components/circle-progress-bar/circle-progress-bar.vue'
	import {
		info_screen
	} from '@/utils/scheme/screen.js'

	export default {
		components: {
			CustomNavBar,
			CircleProgressBar
		},
		data() {
			return {
				screenInfo: {}, // 屏幕信息对象
				g_items: [], // 车辆列表数据
				vehicle_info: {},
				c_send_key_show_momal: false, //检测油量
				c_order_key_show_momal: false, //选择订单
				c_oilNumber_key_show_momal: false, //选择油号
				g_uesr_details: {},
				remaining_oil_quantity: 0,
				proportion: 0,
				c_order_items: [],
				c_oil_items: [],
				rentSignId: 0,
				rentOilSignId: 0
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
			// 当前用户信息
			userInfo() {
				return uni.getStorageSync('user_info') || null
			},
			userCompanyName() {
				return this.userInfo?.companyName?.trim() || '未知'
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
					const res = await u_oilDipstickapiDipsticHistory(temp);
					this.g_items = res?.content
				} catch (error) {
					console.error('[ScreenInfo] 获取记录失败:', error);

				}
			},
			async handleGetOilButtonTap() {
				this.c_send_key_show_momal = true;
				try {
					const res = await u_dzBussinessMobileApiGetCarStatus({
						sn: this.vehicle_info?.xsgw
					});

					const info = res?.content || {};
					let calculatedOil = 0;

					// 统一处理逻辑，避免重复代码
					if (info?.typeOfReMailOil === 1) {
						const oilPercentage = Math.max(0, Number(info?.confirmOilRemainA || 0));
						calculatedOil = Number(this.vehicle_info?.xsgw || 0) * (oilPercentage / 100);
					} else {
						calculatedOil = Math.max(0, Number(info?.confirmOilRemainA || 0));
					}

					// 更新油量数据（保留1位小数）
					this.remaining_oil_quantity = Number(calculatedOil.toFixed(1));

					// 计算并更新百分比值 (pr)
					const total = this.vehicle_info?.xsgw || 0;
					const oilProgress = total > 0 ? this.remaining_oil_quantity / total : 0;
					this.proportion = Math.max(0, oilProgress); // 确保在0-100范围内
					console.log(this.vehicle_info)
					console.log(5656567675, total, Math.max(0, Math.round(oilProgress * 100)))

				} catch (error) {
					console.error('[Oil Detection] 油量检测失败', error);
					uni.showToast({
						title: '油量检测失败，请重试',
						icon: 'none',
						duration: 3000
					});
					// 出错时重置pr值
					this.proportion = 0;
				}
			},
			handleHideSengKeyModal() {
				this.c_send_key_show_momal = false
			},
			handleHideOrderModal() {
				this.c_order_key_show_momal = false
			},
			// 起租
			async handleStartingLease() {
				try {
					const temp = {
						vehId: this.vehicle_info?.id,
						sn: this.vehicle_info?.sn,
						oil: this.remaining_oil_quantity,
						checkerName: this.userCompanyName
					}

					const res = await u_dzBussinessMobileApiRentStart(temp);
					if (res?.code == 1000) {
						this.initDipsticHistory()
						this.c_send_key_show_momal = false
						uni.showModal({
							title: '提示',
							content: '起租成功',
							showCancel: false,
						});
					}
				} catch (error) {
					console.error('[ScreenInfo] 获取记录失败:', error);

				}
			},
			async handleStillRenting() {
				this.c_order_key_show_momal = true
				this.c_send_key_show_momal = false

				try {
					const temp = {
						vehId: this.vehicle_info?.id,
						companyId: this.userInfo?.fin3CompanyId,
						rentStatus: 0,
					}

					const res = await u_oilDipstickapiDipsticHistory(temp);
					this.c_order_items = res?.content
				} catch (error) {
					console.error('[ScreenInfo] 获取记录失败:', error);

				}
			},
			handleRadioChange(evt) {
				this.rentSignId = evt?.detail?.value
			},
			handleOilRadioChange(evt) {
				this.rentOilSignId = evt?.detail?.value
			},
			// 直接还租
			async handleStartRentingAgain() {
				try {
					const temp = {
						vehId: this.vehicle_info?.id,
						oil: this.remaining_oil_quantity,
						checkerName: this.userCompanyName
					}

					const res = await u_oilDipstickapiRentEnd(temp);
					if (res?.code == 1000) {
						this.c_order_key_show_momal = false
						uni.showModal({
							title: '提示',
							content: res?.msg,
							showCancel: false,
						});
					}
				} catch (error) {
					console.error('[ScreenInfo] 获取记录失败:', error);

				}

			},

			async handleStartOrder() {
				if (this.rentSignId) {
					try {
						const res = await u_oilDipstickapiGetOilPriceList();
						if (res?.code == 1000) {
							this.c_order_key_show_momal = false
							this.c_oilNumber_key_show_momal = true
							this.c_oil_items = res?.content
						}
					} catch (error) {
						console.error('[ScreenInfo] 获取记录失败:', error);
					}

				} else {
					uni.showToast({
						title: '请选择订单',
						icon: 'none',
						duration: 2000
					});
				}
			},
			async handleOilStartRentingAgain() {
				console.log(this.rentOilSignId)
				if (this.rentOilSignId) {
					try {
						const temp = {
							vehId: this.vehicle_info?.id,
							oil: this.remaining_oil_quantity,
							id: this.rentSignId,
							checkerName: this.userCompanyName,
							oilPrice: this.rentOilSignId
						}

						const res = await u_oilDipstickapiRentEnd(temp);
						if (res?.code == 1000) {
							this.c_oilNumber_key_show_momal = false
							uni.showModal({
								title: '提示',
								content: res?.msg,
								showCancel: false,
							});
						}
					} catch (error) {
						console.error('[ScreenInfo] 获取记录失败:', error);

					}
				} else {
					uni.showToast({
						title: '请选择油号',
						icon: 'none',
						duration: 2000
					})
				}
			},
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
		/* position: absolute;
		bottom: 60px; */
		margin-top: 30rpx;
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