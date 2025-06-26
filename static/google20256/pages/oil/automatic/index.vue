<template>
	<!-- 主容器：设置高度为安全区域高度 -->
	<view class="container" :style="{ height: `${safeScreenHeight}px` }">
		<!-- 自定义导航栏组件 -->
		<CustomNavBar title="油量自动检测" />

		<!-- 记录容器：顶部留出导航栏高度 -->
		<view class="record-container" :style="'margin-top: ' + navbarTotalHeight + 'px;'">
			<!-- 车辆信息卡片 -->
			<view class="card">
				<!-- 头部区域：车牌和车辆型号信息 -->
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
					<!-- 重新选择车辆按钮 -->
					<view class="reselect" @tap="handleJumpVehicle">{{vehicle_info?.platenumber?'重新选择':'选择车辆'}}</view>
				</view>

				<!-- 详细信息区域：车架号和油箱容积 -->
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

			<!-- 滚动容器：显示油量检测记录 -->
			<scroll-view scroll-y class="scroll-container"
				:style="{ height:'80vh' }">
				<!-- 遍历显示每一条油量检测记录 -->
				<block v-for="(item,index) in g_items">
					<view class="record-card">
						<!-- 记录头部：车牌和车型信息 -->
						<view class="record-header">
							<view class="vehicle-display">
								<image src="/static/public/car_icon.png" class="small-car-icon" />
								<text>{{item?.platenumber}}</text>
								<text
									class="vehicle-model">{{vehicle_info.vehicleSerialName||'-'}}{{vehicle_info.vehicleModeName||''}}</text>
							</view>
						</view>

						<!-- 油量检测详情：左右分栏显示 -->
						<view class="content-item-info">
							<!-- 左侧：起租信息 -->
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

							<!-- 右侧：还租信息 -->
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

						<!-- 底部信息：油量差额和收费情况 -->
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
			<!-- 检测油量按钮 -->
			<view class="detection_button" @tap="handleGetOilButtonTap" v-if="vehicle_info?.platenumber">
				<text>检测油量</text>
			</view>
		</view>



		<!-- 油量检测结果弹窗 -->
		<view class="modal-base-map" v-if="c_send_key_show_momal">
			<form>
				<view class="modal-container">
					<view class="modal-container-head">
						<text>检测完毕,请选择检测状态</text>
						<image src="/static/public/close.png" @tap="handleHideSengKeyModal" />
					</view>
					<view class="modal-container-middle">
						<!-- 圆形进度条组件：显示油量百分比 -->
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
								{{ Math.round(proportion * 100) }}%
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

		<!-- 还租订单选择弹窗 -->
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
								<!-- 遍历显示可用订单 -->
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

		<!-- 油号选择弹窗 -->
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
								<!-- 遍历显示油号选项 -->
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
	// 导入API方法
	import {
		u_oilDipstickapiDipsticHistory, // 获取油量检测历史记录
		u_dzBussinessMobileApiGetCarStatus, // 获取车辆状态
		u_dzBussinessMobileApiRentStart, // 开始租车
		u_oilDipstickapiRentEnd, // 结束租车
		u_oilDipstickapiGetOilPriceList // 获取油号列表
	} from '@/api'

	// 导入自定义组件
	import CustomNavBar from "@/components/custom-header/index.vue"; // 自定义导航栏
	import CircleProgressBar from '@/components/circle-progress-bar/circle-progress-bar.vue' // 圆形进度条

	// 导入屏幕信息工具
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
				g_items: [], // 油量检测记录列表
				vehicle_info: {}, // 当前车辆信息
				c_send_key_show_momal: false, // 控制油量检测弹窗显示
				c_order_key_show_momal: false, // 控制订单选择弹窗显示
				c_oilNumber_key_show_momal: false, // 控制油号选择弹窗显示
				g_uesr_details: {}, // 用户详情（未使用）
				remaining_oil_quantity: 0, // 当前检测的剩余油量（单位：升）
				proportion: 0, // 油量百分比（0-1之间的小数）
				c_order_items: [], // 可选的订单列表
				c_oil_items: [], // 可选的油号列表
				rentSignId: 0, // 选中的订单ID
				rentOilSignId: 0 // 选中的油号ID
			};
		},
		onLoad(options) {
			// 页面加载时处理传递的车辆信息
			this.vehicle_info = JSON.parse(options?.info || '{}')
			if (options?.info) {
				this.initDipsticHistory() // 初始化检测历史
			}
		},
		onShow() {
			this.initialScreenInfo() // 初始化屏幕信息
		},
		computed: {
			// 当前用户信息（从本地存储获取）
			userInfo() {
				return uni.getStorageSync('user_info') || null
			},
			// 用户公司名称
			userCompanyName() {
				return this.userInfo?.companyName?.trim() || '未知'
			},
			// 状态栏高度
			statusBarHeight() {
				return this.screenInfo.statusBarHeight || 0;
			},
			// 导航栏高度（根据平台区分）
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

			// 跳转到车辆选择页面
			handleJumpVehicle() {
				uni.redirectTo({
					url: `/pages/carRental/vehicleList/index?souce=/pages/oil/automatic/index`
				});
			},

			// 初始化油量检测历史记录
			async initDipsticHistory() {
				try {
					const temp = {
						vehId: this.vehicle_info?.id // 使用车辆ID查询
					}
					const res = await u_oilDipstickapiDipsticHistory(temp);
					this.g_items = res?.content || [] // 更新检测记录列表
				} catch (error) {
					console.error('[History] 获取记录失败:', error);
					uni.showToast({
						title: '获取记录失败',
						icon: 'none'
					});
				}
			},

			// 处理油量检测按钮点击
			async handleGetOilButtonTap() {
				this.c_send_key_show_momal = true; // 显示检测结果弹窗
				try {
					// 调用API获取车辆当前状态
					const res = await u_dzBussinessMobileApiGetCarStatus({
						sn: this.vehicle_info?.xsgw // 使用油箱容积作为参数
					});

					const info = res?.content || {};
					let calculatedOil = 0;

					// 根据油量类型计算实际油量
					if (info?.typeOfReMailOil === 1) { // 百分比类型
						const oilPercentage = Math.max(0, Number(info?.confirmOilRemainA || 0));
						calculatedOil = Number(this.vehicle_info?.xsgw || 0) * (oilPercentage / 100);
					} else { // 直接数值类型
						calculatedOil = Math.max(0, Number(info?.confirmOilRemainA || 0));
					}

					// 更新油量数据（保留1位小数）
					this.remaining_oil_quantity = Number(calculatedOil.toFixed(1));

					// 计算油量百分比
					const total = this.vehicle_info?.xsgw || 0;
					const oilProgress = total > 0 ? this.remaining_oil_quantity / total : 0;
					this.proportion = Math.max(0, Math.min(1, oilProgress)); // 确保在0-1范围内

				} catch (error) {
					console.error('[Oil Detection] 油量检测失败', error);
					uni.showToast({
						title: '油量检测失败，请重试',
						icon: 'none',
						duration: 3000
					});
					this.proportion = 0; // 出错时重置百分比
				}
			},

			// 隐藏油量检测弹窗
			handleHideSengKeyModal() {
				this.c_send_key_show_momal = false
			},

			// 隐藏订单选择弹窗
			handleHideOrderModal() {
				this.c_order_key_show_momal = false
			},

			// 处理起租操作
			async handleStartingLease() {
				try {
					const temp = {
						vehId: this.vehicle_info?.id, // 车辆ID
						sn: this.vehicle_info?.sn, // 设备序列号
						oil: this.remaining_oil_quantity, // 当前油量
						checkerName: this.userCompanyName // 检测人（公司名称）
					}

					const res = await u_dzBussinessMobileApiRentStart(temp);
					if (res?.code == 1000) { // 成功代码
						this.initDipsticHistory() // 刷新历史记录
						this.c_send_key_show_momal = false // 关闭弹窗
						uni.showModal({
							title: '提示',
							content: '起租成功',
							showCancel: false,
						});
					}
				} catch (error) {
					console.error('[Rent Start] 起租失败:', error);
					uni.showToast({
						title: '起租失败',
						icon: 'none'
					});
				}
			},

			// 处理还租操作
			async handleStillRenting() {
				this.c_order_key_show_momal = true // 显示订单选择弹窗
				this.c_send_key_show_momal = false // 关闭油量检测弹窗

				try {
					const temp = {
						vehId: this.vehicle_info?.id, // 车辆ID
						companyId: this.userInfo?.fin3CompanyId, // 公司ID
						rentStatus: 0, // 租赁状态
					}

					// 获取可用订单列表
					const res = await u_oilDipstickapiDipsticHistory(temp);
					this.c_order_items = res?.content || []
				} catch (error) {
					console.error('[Order List] 获取订单失败:', error);
					uni.showToast({
						title: '获取订单失败',
						icon: 'none'
					});
				}
			},

			// 处理订单选择变化
			handleRadioChange(evt) {
				this.rentSignId = evt?.detail?.value // 更新选中的订单ID
			},

			// 处理油号选择变化
			handleOilRadioChange(evt) {
				this.rentOilSignId = evt?.detail?.value // 更新选中的油号ID
			},

			// 直接还租（不选择订单）
			async handleStartRentingAgain() {
				try {
					const temp = {
						vehId: this.vehicle_info?.id, // 车辆ID
						oil: this.remaining_oil_quantity, // 当前油量
						checkerName: this.userCompanyName // 检测人
					}

					const res = await u_oilDipstickapiRentEnd(temp);
					if (res?.code == 1000) { // 成功代码
						this.c_order_key_show_momal = false // 关闭订单弹窗
						uni.showModal({
							title: '提示',
							content: res?.msg || '还租成功',
							showCancel: false,
						});
					}
				} catch (error) {
					console.error('[Rent End] 还租失败:', error);
					uni.showToast({
						title: '还租失败',
						icon: 'none'
					});
				}
			},

			// 处理选择订单还租
			async handleStartOrder() {
				if (this.rentSignId) {
					try {
						// 获取油号列表
						const res = await u_oilDipstickapiGetOilPriceList();
						if (res?.code == 1000) { // 成功代码
							this.c_order_key_show_momal = false // 关闭订单弹窗
							this.c_oilNumber_key_show_momal = true // 打开油号选择弹窗
							this.c_oil_items = res?.content || []
						}
					} catch (error) {
						console.error('[Oil List] 获取油号失败:', error);
						uni.showToast({
							title: '获取油号失败',
							icon: 'none'
						});
					}
				} else {
					uni.showToast({
						title: '请选择订单',
						icon: 'none',
						duration: 2000
					});
				}
			},

			// 处理油号选择后的还租操作
			async handleOilStartRentingAgain() {
				if (this.rentOilSignId) {
					try {
						const temp = {
							vehId: this.vehicle_info?.id, // 车辆ID
							oil: this.remaining_oil_quantity, // 当前油量
							id: this.rentSignId, // 订单ID
							checkerName: this.userCompanyName, // 检测人
							oilPrice: this.rentOilSignId // 油号ID
						}

						const res = await u_oilDipstickapiRentEnd(temp);
						if (res?.code == 1000) { // 成功代码
							this.c_oilNumber_key_show_momal = false // 关闭油号弹窗
							uni.showModal({
								title: '提示',
								content: res?.msg || '还租成功',
								showCancel: false,
							});
						}
					} catch (error) {
						console.error('[Rent End] 还租失败:', error);
						uni.showToast({
							title: '还租失败',
							icon: 'none'
						});
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
	/* 主容器样式 */
	.container {
		padding: 10rpx 0rpx;
		background-image: url(/static/public/car-bg.png);
		/* 背景图片 */
		background-size: cover;
	}

	/* 记录容器样式 */
	.record-container {
		width: 98%;
		margin: auto;
		border-radius: 12rpx;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		/* 阴影效果 */
		display: flex;
		flex-direction: column;
		gap: 10rpx;
		position: relative;
	}

	/* 滚动容器样式 */
	.scroll-container {
		background-color: aliceblue;
		width: 98%;

	}

	/* 卡片通用样式 */
	.card {
		width: 98%;
		background-color: #fff;
		border-radius: 8rpx;
		margin: 0 auto;
	}

	/* 头部区域样式 */
	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-bottom: 1rpx solid #f0f0f0;
		/* 底部分隔线 */
		font-size: 28rpx;
		padding: 10rpx 0;
	}

	/* 车辆信息区域样式 */
	.vehicle-info {
		display: flex;
		align-items: center;
		gap: 15rpx;
		padding: 20rpx;
	}

	/* 车牌区域样式 */
	.license-plate {
		display: flex;
		align-items: center;
		gap: 5rpx;
	}

	/* 车辆图标样式 */
	.car-icon {
		width: 40rpx;
		height: 30rpx;
	}

	/* 分隔线样式 */
	.divider {
		border-left: 1rpx solid #f0f0f0;
		height: 30rpx;
	}

	/* 重新选择按钮样式 */
	.reselect {
		color: #007AFF;
		/* 蓝色文字 */
		padding-right: 20rpx;
	}

	/* 详情区域样式 */
	.details {
		display: flex;
		gap: 30rpx;
		padding: 20rpx;
		font-size: 28rpx;
	}

	/* 详情项样式 */
	.detail-item {
		display: flex;
		gap: 10rpx;
	}

	/* 标题样式 */
	.info-item-title {
		font-weight: bold;
		font-size: 26rpx;
		color: #4587FD;
		/* 蓝色文字 */
	}

	/* 长文本项样式 */
	.long-info-item {
		flex-basis: 100%;
		/* 占据整行 */
	}

	/* 记录卡片样式 */
	.record-card {
		background-color: #fff;
		border-radius: 10rpx;
		margin-bottom: 20rpx;
	}

	/* 记录头部样式 */
	.record-header {
		display: flex;
		padding: 20rpx;
		font-size: 28rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	/* 车辆显示区域样式 */
	.vehicle-display {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	/* 小车辆图标样式 */
	.small-car-icon {
		width: 40rpx;
		height: 30rpx;
	}

	/* 油量信息区域样式（左右分栏） */
	.content-item-info {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-start;
		padding: 10rpx;
		gap: 20rpx;
		border-bottom: 1px solid #f0f0f0;
		font-size: 28rpx;
	}

	/* 左侧信息区域样式 */
	.content-item-info-left,
	.content-item-info-right {
		width: 48%;
		/* 左右各占48%宽度 */
		display: flex;
		flex-direction: column;
		gap: 15rpx;
	}

	/* 底部区域样式 */
	.content-item-footer {
		display: flex;
		padding: 10rpx;
		justify-content: space-between;
		/* 左右分布 */
	}

	/* 底部文本样式 */
	.footer-text {
		font-weight: 500;
		font-size: 24rpx;
		color: #333333;
	}

	/* 底部左侧区域样式 */
	.footer-left {
		font-weight: bold;
		font-size: 24rpx;
		color: #333333;
		display: flex;
		gap: 30rpx;
	}

	/* 底部右侧按钮样式 */
	.footer-right-btn {
		display: flex;
		align-items: center;
		font-weight: bold;
		font-size: 22rpx;
		color: #ffffff;
		background-color: #1B64B1;
		/* 深蓝色背景 */
		border-radius: 8rpx;
		padding: 4rpx 15rpx;
	}

	/* 检测按钮样式 */
	.detection_button {
		position: absolute;
		bottom: 30rpx;
		width: 100%;
		display: flex;
		justify-content: center;
	}

	/* 检测按钮文字样式 */
	.detection_button text {
		background: linear-gradient(88deg, #1576DC, #1B64B1);
		/* 渐变背景 */
		box-shadow: 0rpx 1rpx 13rpx 0rpx rgba(51, 63, 92, 0.31);
		/* 阴影效果 */
		border-radius: 50rpx;
		/* 圆角 */
		font-family: PingFang SC;
		padding: 0rpx 100rpx;
		font-weight: bold;
		font-size: 30rpx;
		color: #FFFFFF;
		line-height: 76rpx;
	}

	/* 模态框基础样式 */
	.modal-base-map {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		background: #fff;
		border-radius: 20rpx;
		z-index: 998;
		/* 较高层级 */
		padding: 20rpx;
	}

	/* 模态框容器样式 */
	.modal-container {
		height: 40vh;
		/* 40%视口高度 */
		display: flex;
		flex-direction: column;
	}

	/* 模态框头部样式 */
	.modal-container-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 60rpx;
	}

	/* 模态框中间区域样式 */
	.modal-container-middle {
		flex: 1;
		/* 占据剩余空间 */
		overflow-y: auto;
		/* 允许垂直滚动 */
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		gap: 20rpx;
	}

	/* 模态框底部样式 */
	.modal-container-footer {
		height: 80rpx;
		display: flex;
		justify-content: space-around;
		/* 按钮均匀分布 */
		align-items: center;
	}

	/* 模态框按钮样式 */
	.modal-container-footer button {
		box-shadow: 0rpx 1rpx 13rpx 0rpx rgba(51, 63, 92, 0.31);
		/* 阴影效果 */
		border-radius: 36rpx;
		/* 大圆角 */
		font-weight: bold;
		font-size: 34rpx;
		color: #ffffff;
		width: 40%;
		/* 宽度40% */
		height: 90%;
		/* 高度90% */
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.modal-container-head image {
			width: 24rpx;
			height: 24rpx;
		}
</style>