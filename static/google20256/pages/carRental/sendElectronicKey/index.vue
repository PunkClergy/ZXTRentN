<template>
	<view class="container" :style="{ height: `${safeScreenHeight}px` }">
		<CustomNavBar title="发送电子钥匙" />
		<!-- 主容器 -->
		<view class="record-container" :style="'margin-top: ' + (navbarTotalHeight) + 'px;'">
			<!-- 标签切换区域 -->
			<view class="record-tabs">
				<view class="record-tabs-item" :class="(g_activeTab==1? 'tabs-active-1' : 'tabs-no-active-1')"
					@tap="handleSwitchTab(1)">发送钥匙</view>
				<view class="record-tabs-item" :class="(g_activeTab==2? 'tabs-active-2' : 'tabs-no-active-2')"
					@tap="handleSwitchTab(2)">
					使用记录
				</view>
			</view>

			<!-- 车辆列表区域 -->
			<block v-if="g_activeTab == 1">
				<scroll-view style="height: 100vh" scroll-y @scrolltolower="lower">
					<block v-for="(item, index) in g_items" :key="index">
						<view class="content-item">
							<view class="content-item-head">
								<view class="head-left">
									<view class="left-category">
										<image src="/static/public/car_icon.png" />
										<text>{{ item?.platenumber }}</text>
									</view>
									<view class="left-split_line"></view>
									<view class="left-model">
										{{ item?.vehicleSerialName || '-' }}{{ item?.vehicleModeName || '' }}
									</view>
								</view>
							</view>

							<view class="content-item-info">
								<view :class="'info-item  ' + (item?.vin?.length > 15 ? 'long-info-item' : '')">
									<label>车架号 ：</label>
									<text>{{ item?.vin || '-' }}</text>
								</view>
								<view :class="'info-item  ' + (item?.xsgw?.length > 15 ? 'long-info-item' : '')">
									<label>油箱容积 ：</label>
									<text>{{ item?.xsgw ? item.xsgw + 'L' : '-' }}</text>
								</view>
								<view class="info-item">
									<label>车辆类型 ：</label>
									<text>{{ item?.sn ? '自助取还' : '非自助取还' }}</text>
								</view>
								<view
									:class="'info-item  ' + (item?.carOwnerName?.length > 15 ? 'long-info-item' : '')">
									<label>设备平台 ：</label>
									<text>{{ item?.carOwnerName || '-' }}</text>
								</view>
								<view :class="'info-item  ' + (item?.sn?.length > 15 ? 'long-info-item' : '')">
									<label>设备号 ：</label>
									<text>{{ item?.sn || '-' }}</text>
								</view>
							</view>
							<view class="content-item-footer">
								<view class="footer-right">
									<view class="footer-right-btn" :data-item="item" @tap="handleSelectVehicle">
										<text>发送钥匙</text>
									</view>
								</view>
							</view>
						</view>
					</block>
				</scroll-view>
			</block>

			<!-- 新增车辆区域 -->
			<block v-if="g_activeTab == 2">
				<scroll-view style="height: 100vh" scroll-y @scrolltolower="lower">
					<block v-for="(item, index) in r_items" :key="index">
						<view class="content-item">
							<view class="content-item-head">
								<view class="head-left">
									<view class="left-category">
										<text>{{ item?.platenumber }}</text>
										<text>{{ item?.personname }}</text>
									</view>
									<view class="left-split_line"></view>
									<view class="left-model">
										{{ item?.mobile }}
									</view>
								</view>
								<view class="head-right">
									<text style="color: #333;opacity: 0.4;font-size: 26rpx;"
										v-if="item.status">已取消</text>
									<text style="color: #333;opacity: 1;font-size: 26rpx;" v-else>使用中</text>
								</view>
							</view>

							<view class="content-item-info">
								<view class="timeline">
									<view v-for="(itemTime, indexTime) in item?.list" :key="index"
										class="timeline-item">
										<!-- 左侧时间线 -->
										<view class="timeline-left">
											<view class="timeline-node"></view>
											<view v-if="indexTime !== item?.list.length - 1" class="timeline-line">
											</view>
										</view>

										<!-- 右侧内容 -->
										<view class="timeline-content">
											<view class="timeline-time">{{ itemTime.time }}</view>
											<view class="timeline-title">{{ itemTime.title }}</view>
										</view>
									</view>
								</view>
							</view>
							<view class="content-item-footer" v-if="!item.status">
								<view class="footer-right" style="display: flex;gap: 20rpx;">
									<view class="footer-right-btn" :data-item="item" @tap="handleModify">
										<text>修改</text>
									</view>
									<view class="footer-right-btn" :data-item="item" @tap="handleCopy">
										<text>复制链接</text>
									</view>
									<view class="footer-right-btn" :data-item="item" @tap="handleCance">
										<text>取消用车</text>
									</view>
								</view>
							</view>
						</view>
					</block>
				</scroll-view>
			</block>
		</view>
		<view class="modal-mask" v-if="c_send_key_show_momal" @tap="handleHideSengKeyModal"></view>
		<view class="modal-base-map" v-if="c_send_key_show_momal">
			<form @submit="handleFormSubmit">
				<view class="modal-container">
					<view class="modal-container-head">
						<text>{{whether?'修改':'发送钥匙'}}</text>
						<image src="/static/public/close.png" @tap="handleHideSengKeyModal" />
					</view>
					<view class="modal-container-middle">
						<view class="middle-form-item">
							<label>车牌号</label>
							<view class="modal-form-region">
								{{g_uesr_details?.platenumber}}
							</view>
						</view>
						<view class="middle-form-item">
							<label>使用人</label>
							<view class="modal-form-region">
								<input placeholder="请输入使用人" :value="g_uesr_details.personName" name="personName"
									style="text-align: right; font-size: 28rpx" />
							</view>
						</view>
						<view class="middle-form-item">
							<label>手机号</label>
							<view class="modal-form-region">

								<text v-if="whether">{{g_uesr_details.mobile}}</text>
								<input v-else placeholder="请输入手机号" :value="g_uesr_details.mobile" name="mobile"
									style="text-align: right; font-size: 28rpx" />
							</view>
						</view>
						<view class="middle-form-item">
							<label>开始时间</label>
							<view class="modal-form-region">

								<picker mode="date" data-index="startDate" @change="bindTimeChange">
									<view class="form-item-text">
										<text>{{ startDate }}</text>
									</view>
								</picker>
								<picker mode="time" data-index="startTime" @change="bindTimeChange">
									<view class="form-item-text">
										<text>{{ startTime }}</text>
									</view>
								</picker>
							</view>

						</view>
						<view class="middle-form-item">
							<label>结束时间</label>
							<view class="modal-form-region">
								<picker mode="date" data-index="endDate" @change="bindTimeChange">
									<view class="form-item-text">
										<text>{{ endDate }}</text>
									</view>
								</picker>
								<picker mode="time" data-index="endTime" @change="bindTimeChange">
									<view class="form-item-text">
										<text>{{ endTime }}</text>
									</view>
								</picker>
							</view>
						</view>
					</view>
					<view class="modal-container-footer">
						<button formType="submit">确认</button>
					</view>
				</view>
			</form>
		</view>

	</view>
</template>

<script>
	import {
		u_getCarList,
		u_addOrUpdateCar,
		u_rentRecord,
		u_updateRentKey,
		u_sendRentKey,
		u_cancelRentKey
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
				g_page: 1, // 当前页码
				g_items: [], // 车辆列表数据
				r_items: [], //使用记录列表
				g_activeTab: 1, // 当前激活的标签页(1:车辆列表 2:新增车辆)
				btnState: '新增', // 按钮显示文本
				c_send_key_show_momal: false, //发送钥匙弹窗
				g_uesr_details: {}, //弹窗From参数
				startDate: '2025-03-20', //钥匙使用开始日期
				startTime: '19:00', //钥匙使用开始时间
				endDate: '2025-03-20', //钥匙开始使用日期
				endTime: '19:00', //钥匙结束使用时间
				whether: false
			};
		},
		onLoad(options) {

		},
		onShow() {
			// 页面显示时初始化
			this.initialCarList()
			this.initialScreenInfo()
			this.initRentRecord()
			this.handleCurrentDate()
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
			handleHideSengKeyModal() {
				this.c_send_key_show_momal = false
				this.g_uesr_details = {}
			},
			async handleCance(evt) {
				try {
					const res = await u_cancelRentKey({
						controlcode: evt?.currentTarget?.dataset?.item?.controlcode,
					});
					if (res.code == 1000) {
						this.$nextTick(() => {
							this.initialCarList()
							this.initRentRecord()
						});
					} else {
						uni.showToast({
							title: res?.msg,
							icon: 'none',
							duration: 2000
						});
					}
				} catch (error) {
					console.error('取消失败:', error);

				}
			},
			handleModify(evt) {
				this.whether = true;
				this.c_send_key_show_momal = true;

				// 提取公共数据源避免重复访问
				const itemData = evt?.currentTarget?.dataset?.item || {};

				// 使用对象合并更新用户详情
				this.g_uesr_details = {
					...this.g_uesr_details,
					...itemData,
					platenumber: itemData.platenumber,
					personName: itemData.personname, // 注意大小写匹配
					mobile: itemData.mobile
				};

				// 封装日期时间拆分逻辑
				const splitDateTime = (datetime, fallback = ["", ""]) => {
					if (!datetime) return fallback;
					const parts = datetime.split(" ");
					return [parts[0] || fallback[0], parts[1] || fallback[1]];
				};

				// 统一处理日期时间字段
				[this.startDate, this.startTime] = splitDateTime(itemData.startdate);
				[this.endDate, this.endTime] = splitDateTime(itemData.enddate);
			},
			// 获取当前年月日 时分
			handleCurrentDate() {
				// 日期格式化函数
				const formatDate = date => {
					const year = date.getFullYear();
					const month = date.getMonth() + 1;
					const day = date.getDate();
					return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
				};

				// 时间格式化函数
				const formatTime = date => {
					const hours = date.getHours();
					const minutes = date.getMinutes();
					return `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}`;
				};

				const now = new Date();
				const tomorrow = new Date(now);
				tomorrow.setDate(now.getDate() + 1); // 获取明天

				const currentDate = formatDate(now);
				const tomorrowDate = formatDate(tomorrow);
				const currentTime = formatTime(now);

				this.startDate = currentDate;
				this.endDate = tomorrowDate;
				this.startTime = currentTime;
				this.endTime = currentTime;
			},
			handleCopy(evt) {
				const text = evt?.currentTarget.dataset?.item?.simplecode
				uni.setClipboardData({
					data: text,
					success: () => {
						uni.showToast({
							title: '复制成功',
							icon: 'none'
						});
					},
					fail: (err) => {
						console.error('复制失败', err);
						uni.showToast({
							title: '复制失败，请重试',
							icon: 'none'
						});
					}
				});
			},
			async handleFormSubmit(evt) {
				if (this.whether) {
					try {
						console.log({
							controlcode: this.g_uesr_details?.controlcode,
							startDate: this.startDate + '' + this.startTime,
							endDate: this.endDate + '' + this.endTime,
						})
						const res = await u_updateRentKey({
							controlcode: this.g_uesr_details?.controlcode,
							startDate: this.startDate + ' ' + this.startTime,
							endDate: this.endDate + ' ' + this.endTime,
						});
						console.log(res)
						if (res.code == 1000) {
							this.g_uesr_details = {}
							this.c_send_key_show_momal = false
							this.$nextTick(() => {
								this.initialCarList()
								this.initRentRecord()
							});
						} else {
							uni.showToast({
								title: res?.msg,
								icon: 'none',
								duration: 2000
							});
						}
					} catch (error) {
						console.error('获取车辆列表失败:', error);

					}
				} else {
					try {
						const res = await u_sendRentKey({
							vehId: this.g_uesr_details?.id,
							startDate: `${this.startDate} ${this.startTime}`, 
							 endDate: `${this.endDate} ${this.endTime}`,
							personName: evt?.detail?.value?.personName,
							mobile: evt?.detail?.value?.mobile
						});
						if (res.code == 1000) {
							this.g_uesr_details = {}
							this.c_send_key_show_momal = false
							this.$nextTick(() => {
								this.initialCarList()
								this.initRentRecord()
							});
						} else {
							uni.showToast({
								title: res?.msg,
								icon: 'none',
								duration: 2000
							});
						}
					} catch (error) {
						console.error('获取车辆列表失败:', error);

					}
				}

			},
			bindTimeChange(evt) {
				const category = evt.currentTarget.dataset.index;
				const value = evt.detail.value;
				this[category] = value
			},
			handleSelectVehicle(evt) {
				const items = evt.currentTarget.dataset.item
				this.c_send_key_show_momal = true;
				this.g_uesr_details = {
					...this.g_uesr_details, // 保留原对象所有属性
					...items
				};
			},
			// 滚动到底部加载更多
			lower(e) {
				if (!this.loading) {
					this.loading = true;
					this.g_page++;
					setTimeout(() => {
						this.initialCarList();
						this.loading = false;
					}, 1000);
				}
			},


			// 切换标签页
			handleSwitchTab(evt) {
				this.g_activeTab = evt
				if (evt == 1) {
					this.btnState = '新增'
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

			// 获取车辆列表
			async initialCarList() {
				try {
					const res = await u_getCarList({
						page: this.g_page
					});

					// 已加载全部数据的提示
					if (this.g_page > 1 && res.content.length === 0) {
						uni.showToast({
							title: `已加载全部数据：共${this.g_items.length}条`,
							icon: 'none'
						});
					}

					// 合并新数据
					this.g_items = this.g_items.concat(res?.content || [])
				} catch (error) {
					console.error('获取车辆列表失败:', error);
				}
			},
			// 获取车辆使用记录
			async initRentRecord() {
				u_rentRecord
				try {
					const res = await u_rentRecord();
					let resp = res?.content
					const temp = resp.map(ele => {
						let list = []
						list?.push({
							time: ele?.startdate || "",
							title: ele?.startAddress || '',
						})
						list?.push({
							time: ele?.enddate || "",
							title: ele?.endAddress || '',
						})
						ele.list = list
						return ele
					})
					this.r_items = temp

				} catch (error) {
					console.error('获取车辆列表失败:', error);
				}
			}
		}
	};
</script>
<style>
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
		height: 26rpx;
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

	.timeline {
		padding: 0rpx 20rpx;
	}

	.timeline-item {
		display: flex;
		padding-bottom: 30rpx;
	}

	.timeline-left {
		position: relative;
		width: 40rpx;
	}

	.timeline-node {
		width: 24rpx;
		height: 24rpx;
		background-color: #42b983;
		border-radius: 50%;
		z-index: 2;
		position: relative;
	}

	.timeline-line {
		position: absolute;
		top: 24rpx;
		left: 11rpx;
		height: calc(100% - 10rpx);
		width: 2rpx;
		background-color: #e0e0e0;
	}

	.timeline-content {
		flex: 1;
		margin-left: 30rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.timeline-time {
		color: #888;
		font-size: 26rpx;
	}

	.timeline-title {
		font-size: 26rpx;
		margin: 10rpx 0;
		color: #333;
	}

	.timeline-desc {
		font-size: 28rpx;
		color: #666;
	}

	/* 弹窗蒙版 */
	.modal-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.4);
		z-index: 998;
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
		justify-content: center;
		align-items: center;
	}

	.modal-container-footer button {
		background: linear-gradient(88deg, #1576dc, #1b64b1);
		box-shadow: 0rpx 1rpx 13rpx 0rpx rgba(51, 63, 92, 0.31);
		border-radius: 36rpx;
		font-weight: bold;
		font-size: 34rpx;
		color: #ffffff;
		width: 50%;
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

	.form-item-text {
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-radius: 4rpx;
		padding: 4rpx 2rpx 4rpx 10rpx;
		gap: 20rpx;
	}

	.form-item-text text {
		font-family: PingFang SC;
		font-weight: 500;
		font-size: 28rpx;
		color: #7b7c7c;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.form-item-text image {
		width: 30rpx;
		height: 30rpx;
	}
</style>