<template>
	<view class="container" :style="{ height: `${safeScreenHeight}px` }">
		<CustomNavBar :title="langs.sendkey" />
		<!-- 主容器 -->
		<view class="record-container" :style="'margin-top: ' + (navbarTotalHeight) + 'px;'">
			<!-- 标签切换区域 -->
			<view class="record-tabs">
				<view class="record-tabs-item" :class="(g_activeTab==1? 'tabs-active-1' : 'tabs-no-active-1')"
					@tap="handleSwitchTab(1)">{{langs.sendkey}}</view>
				<view class="record-tabs-item" :class="(g_activeTab==2? 'tabs-active-2' : 'tabs-no-active-2')"
					@tap="handleSwitchTab(2)">
					{{langs.usagelog}}
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
									<label>{{langs.vin}} ：</label>
									<text>{{ item?.vin || '-' }}</text>
								</view>
								<view :class="'info-item  ' + (item?.xsgw?.length > 15 ? 'long-info-item' : '')">
									<label>{{langs.fuel}} ：</label>
									<text>{{ item?.xsgw ? item.xsgw + 'L' : '-' }}</text>
								</view>
								<view class="info-item">
									<label>{{langs.cartype}} ：</label>
									<text>{{ item?.sn ? langs.selfserve : langs.fullservice }}</text>
								</view>
								<view
									:class="'info-item  ' + (item?.carOwnerName?.length > 15 ? 'long-info-item' : '')">
									<label>{{langs.platform}} ：</label>
									<text>{{ item?.carOwnerName || '-' }}</text>
								</view>
								<view :class="'info-item  ' + (item?.sn?.length > 15 ? 'long-info-item' : '')">
									<label>{{langs.devID}} ：</label>
									<text>{{ item?.sn || '-' }}</text>
								</view>
							</view>
							<view class="content-item-footer">
								<view class="footer-right">
									<view class="footer-right-btn" :data-item="item" @tap="handleSelectVehicle">
										<text>{{langs.sendkey}}</text>
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
										v-if="item.status">{{langs.cancelled}}</text>
									<text style="color: #333;opacity: 1;font-size: 26rpx;" v-else>{{langs.inuse}}</text>
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
										<text>{{langs.update}}</text>
									</view>
									<view class="footer-right-btn" :data-item="item" @tap="handleCopy">
										<text>{{langs.copylink}}</text>
									</view>
									<view class="footer-right-btn" :data-item="item" @tap="handleCance">
										<text>{{langs.cancelride}}</text>
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
						<text>{{whether?langs.update:langs.sendkey}}</text>
						<image src="/static/public/close.png" @tap="handleHideSengKeyModal" />
					</view>
					<view class="modal-container-middle">
						<view class="middle-form-item">
							<label>{{langs.plate}}</label>
							<view class="modal-form-region">
								{{g_uesr_details?.platenumber}}
							</view>
						</view>
						<view class="middle-form-item">
							<label>{{langs.user}}</label>
							<view class="modal-form-region">
								<input :placeholder="langs.pleasename" :value="g_uesr_details.personName"
									name="personName" style="text-align: right; font-size: 28rpx" />
							</view>
						</view>
						<view class="middle-form-item">
							<label>{{langs.mobile}}</label>
							<view class="modal-form-region">

								<text v-if="whether">{{g_uesr_details.mobile}}</text>
								<input v-else :placeholder="langs.pleasemobile" :value="g_uesr_details.mobile"
									name="mobile" style="text-align: right; font-size: 28rpx" />
							</view>
						</view>
						<view class="middle-form-item">
							<label>{{langs.starttime}}</label>
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
							<label>{{langs.endtime}}</label>
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
						<button formType="submit">{{langs.confirm}}</button>
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
	import 'url-search-params-polyfill'; // 兼容URLSearchParams的polyfill
	import {
		langs,
	} from '@/utils/i18n/index.js'

	export default {
		components: {
			CustomNavBar
		},
		data() {
			return {
				screenInfo: {}, // 屏幕信息对象
				g_page: 1, // 当前页码
				g_items: [], // 车辆列表数据
				r_items: [], // 使用记录列表数据
				g_activeTab: 1, // 当前激活的标签页 (1:车辆列表 2:新增车辆)
				btnState: '新增', // 按钮显示文本
				c_send_key_show_momal: false, // 发送钥匙弹窗显示状态
				g_uesr_details: {}, // 弹窗表单参数
				startDate: '', // 钥匙使用开始日期
				startTime: '', // 钥匙使用开始时间
				endDate: '', // 钥匙使用结束日期
				endTime: '', // 钥匙使用结束时间
				whether: false, // 标识当前操作是修改(true)还是新增(false)
				loading: false, // 加载状态标识（用于防止重复加载）
				langs: {}
			};
		},
		onLoad(options) {
			// 页面加载生命周期，暂无操作
		},
		onShow() {
			// 页面显示时初始化数据
			this.initialCarList(); // 初始化车辆列表
			this.initialScreenInfo(); // 获取屏幕信息
			this.initRentRecord(); // 初始化租赁记录
			this.handleCurrentDate(); // 设置当前日期时间
			this.handleGetCurrentLanguage()
		},
		computed: {
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
			handleGetCurrentLanguage() {
				let currentLang = uni.getStorageSync('lang') || 'zh-CN';
				this.langs = langs[currentLang]
			},
			// 关闭发送钥匙弹窗
			handleHideSengKeyModal() {
				this.c_send_key_show_momal = false;
				this.g_uesr_details = {};
			},

			// 取消钥匙授权
			async handleCance(evt) {
				const controlCode = evt?.currentTarget?.dataset?.item?.controlcode;
				if (!controlCode) return;

				try {
					const res = await u_cancelRentKey({
						controlCode
					});
					if (res.code === 1000) {
						this.g_page = 1
						this.g_items = []
						// 操作成功后刷新数据
						this.$nextTick(() => {
							this.initialCarList();
							this.initRentRecord();
						});
					} else {
						uni.showToast({
							title: res?.msg || '操作失败',
							icon: 'none',
							duration: 2000
						});
					}
				} catch (error) {
					console.error('取消失败:', error);
					uni.showToast({
						title: '取消失败，请重试',
						icon: 'none'
					});
				}
			},

			// 修改钥匙授权信息
			handleModify(evt) {
				const itemData = evt?.currentTarget?.dataset?.item || {};
				this.whether = true; // 标记为修改操作
				this.c_send_key_show_momal = true;

				// 更新表单数据
				this.g_uesr_details = {
					...itemData,
					platenumber: itemData.platenumber,
					personName: itemData.personname,
					mobile: itemData.mobile
				};

				// 拆分日期时间字符串
				const splitDateTime = (datetime, fallback = ["", ""]) => {
					if (!datetime) return fallback;
					const [date = "", time = ""] = datetime.split(" ");
					return [date, time.split(":").slice(0, 2).join(":")]; // 只取小时和分钟
				};

				// 设置开始/结束日期时间
				[this.startDate, this.startTime] = splitDateTime(itemData.startdate);
				[this.endDate, this.endTime] = splitDateTime(itemData.enddate);
			},

			// 设置当前日期时间为默认值
			handleCurrentDate() {
				const now = new Date();
				const tomorrow = new Date(now);
				tomorrow.setDate(now.getDate() + 1); // 明天日期

				// 日期格式化 (YYYY-MM-DD)
				const formatDate = date =>
					`${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;

				// 时间格式化 (HH:mm)
				const formatTime = date =>
					`${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

				this.startDate = formatDate(now);
				this.startTime = formatTime(now);
				this.endDate = formatDate(tomorrow);
				this.endTime = formatTime(now);
			},

			// 复制简单码到剪贴板
			handleCopy(evt) {
				const text = evt?.currentTarget.dataset?.item?.simplecode || '';
				if (!text) return;

				uni.setClipboardData({
					data: text,
					success: () => uni.showToast({
						title: '复制成功',
						icon: 'none'
					}),
					fail: () => uni.showToast({
						title: '复制失败',
						icon: 'none'
					})
				});
			},

			// 表单提交处理（发送/更新钥匙）
			async handleFormSubmit(evt) {
				// 构建日期时间字符串
				const buildDateTime = (date, time) =>
					`${date} ${time ? `${time}:00` : '00:00:00'}`.trim();

				const startDateTime = buildDateTime(this.startDate, this.startTime);
				const endDateTime = buildDateTime(this.endDate, this.endTime);

				try {
					let res;
					if (this.whether) {
						// 更新钥匙授权
						res = await u_updateRentKey({
							controlCode: this.g_uesr_details?.controlcode,
							startDate: startDateTime,
							endDate: endDateTime
						});
					} else {
						// 发送新钥匙授权
						const formData = evt?.detail?.value || {};
						res = await u_sendRentKey({
							vehId: this.g_uesr_details?.id,
							startDate: startDateTime,
							endDate: endDateTime,
							personName: formData.personName,
							mobile: formData.mobile
						});
					}

					if (res.code === 1000) {
						this.handleHideSengKeyModal(); // 关闭弹窗
						this.g_page = 1
						this.g_items = []
						// 刷新数据
						this.$nextTick(() => {
							this.initialCarList();
							this.initRentRecord();
						});
					} else {
						uni.showToast({
							title: res?.msg || '操作失败',
							icon: 'none',
							duration: 2000
						});
					}
				} catch (error) {
					console.error('操作失败:', error);
					uni.showToast({
						title: '操作失败，请重试',
						icon: 'none'
					});
				}
			},

			// 时间选择器变更处理
			bindTimeChange(evt) {
				const type = evt.currentTarget.dataset.index; // 获取时间类型(start/end)
				const value = evt.detail.value;
				this[type] = value; // 动态更新对应的时间字段
			},

			// 选择车辆打开弹窗
			handleSelectVehicle(evt) {
				const itemData = evt.currentTarget.dataset.item || {};
				this.whether = false; // 标记为新增操作
				this.c_send_key_show_momal = true;
				this.g_uesr_details = {
					...itemData
				};
			},

			// 滚动到底部加载更多
			lower() {
				if (!this.loading) {
					this.loading = true;
					this.g_page++;
					setTimeout(async () => {
						await this.initialCarList();
						this.loading = false;
					}, 1000);
				}
			},

			// 切换标签页
			handleSwitchTab(tabIndex) {
				this.g_activeTab = tabIndex;
				this.btnState = tabIndex === 1 ? '新增' : '其他状态'; // 根据需求调整
			},

			// 获取屏幕信息
			async initialScreenInfo() {
				try {
					this.screenInfo = await info_screen();
				} catch (error) {
					console.error('获取屏幕信息失败:', error);
					uni.showToast({
						title: '设备信息获取失败',
						icon: 'none'
					});
				}
			},

			// 获取车辆列表（带分页）
			async initialCarList() {
				try {
					const res = await u_getCarList({
						page: this.g_page
					});

					// 首次加载直接赋值，后续加载追加数据
					if (this.g_page === 1) {
						this.g_items = res?.content || [];
					} else {
						this.g_items = [...this.g_items, ...(res?.content || [])];
					}

					// 数据加载完毕提示
					if (this.g_page > 1 && res.content.length === 0) {
						uni.showToast({
							title: `已加载全部数据，共${this.g_items.length}条`,
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('获取车辆列表失败:', error);
					uni.showToast({
						title: '数据加载失败',
						icon: 'none'
					});
				}
			},

			// 获取车辆使用记录
			async initRentRecord() {
				try {
					const res = await u_rentRecord();
					const records = res?.content || [];

					// 格式化记录数据
					this.r_items = records.map(item => ({
						...item,
						list: [{
								time: item.startdate,
								title: item.startAddress
							},
							{
								time: item.enddate,
								title: item.endAddress
							}
						].filter(entry => entry.time) // 过滤空数据
					}));
				} catch (error) {
					console.error('获取使用记录失败:', error);
					uni.showToast({
						title: '记录加载失败',
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