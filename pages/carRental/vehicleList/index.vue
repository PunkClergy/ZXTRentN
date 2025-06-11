<template>
	<view class="container" :style="{ height: `${safeScreenHeight}px` }">
		<CustomNavBar title="车辆绑定" />
		<!-- 主容器 -->
		<view class="record-container" :style="'margin-top: ' + (navbarTotalHeight) + 'px;'">
			<!-- 标签切换区域 -->
			<view class="record-tabs">
				<view class="record-tabs-item" :class="(g_activeTab==1? 'tabs-active-1' : 'tabs-no-active-1')"
					@tap="handleSwitchTab(1)">车辆列表</view>
				<view class="record-tabs-item" :class="(g_activeTab==2? 'tabs-active-2' : 'tabs-no-active-2')"
					@tap="handleSwitchTab(2)">
					{{ btnState }}车辆
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
									<view class="left-brand">短租</view>
								</view>
								<view class="head-right">
									<image src="/static/public/_edit.png" @tap="handleEdit(item)" />
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
									<view class="footer-right-btn" :data-item="item">
										<text>选择此车</text>
									</view>
									<view>
										<checkbox-group :data-item="item">
											<checkbox style="transform: scale(0.7)" />
										</checkbox-group>
									</view>
								</view>
							</view>
						</view>
					</block>
				</scroll-view>
			</block>

			<!-- 新增车辆区域 -->
			<block v-if="g_activeTab == 2">
				<scroll-view scroll-y style="height: 100vh">
					<view class="card-info">
						<!-- 车牌号 -->
						<view class="card-info-item">
							<label class="form-label">
								车牌号<text class="required-mark">*</text>
							</label>
							<input class="form-input" placeholder="请输入车牌号" :value="params?.platenumber" maxlength="10"
								placeholder-style="color: #999;" @input="(e)=>handleBindinput(e,'platenumber')" />
						</view>
						<!-- 设备号 -->
						<view class="card-info-item">
							<label class="form-label">
								设备号<text class="required-mark">*</text>
							</label>
							<input class="form-input" placeholder="请输入设备号" :value="params?.sn" maxlength="20"
								placeholder-style="color: #999;" @input="(e)=>handleBindinput(e,'sn')" />
						</view>
						<!-- 车系 -->
						<view class="card-info-item">
							<label>车系</label>
							<input class="form-input" placeholder="请输入车系" :value="params?.vehicleSerialName"
								placeholder-style="color: #999;" @input="(e)=>handleBindinput(e,'vehicleSerialName')" />
						</view>
						<!-- 车型 -->
						<view class="card-info-item">
							<label>车型</label>
							<input class="form-input" placeholder="请输入车型" :value="params?.vehicleModeName"
								placeholder-style="color: #999;" @input="(e)=>handleBindinput(e,'vehicleModeName')" />
						</view>
						<!-- 年款 -->
						<view class="card-info-item">
							<label>年款</label>
							<input class="form-input" placeholder="请输入年款" :value="params?.ccdate"
								placeholder-style="color: #999;" @input="(e)=>handleBindinput(e,'ccdate')" />
						</view>

						<!-- 车架号 -->
						<view class="card-info-item">
							<label>车架号</label>
							<input class="form-input" placeholder="请输入车架号" :value="params?.vin"
								placeholder-style="color: #999;" @input="(e)=>handleBindinput(e,'vin')" />
						</view>
						<!-- 油箱容积 -->
						<view class="card-info-item">
							<label>油箱容积</label>
							<input class="form-input" placeholder="请输入油箱容积" :value="params?.xsgw"
								placeholder-style="color: #999;" @input="(e)=>handleBindinput(e,'xsgw')" />
						</view>
						<!-- 启动方式 -->
						<view class="card-info-item">
							<label>启动方式</label>

							<view class="card-info-item-tabs">
								<view class="card-info-item-tabs-btn">
									<text :class="batterylift == '一键启动' ? 'tabs-active' : ''"
										@tap="handleBatterylift('一键启动')">一键启动</text>
									<text :class="batterylift == '机械钥匙' ? 'tabs-active' : ''"
										@tap="handleBatterylift('机械钥匙')">机械钥匙</text>
									<text :class="batterylift == '其他' ? 'tabs-active' : ''"
										@tap="handleBatterylift('其他')">其他</text>
								</view>
								<view class="tabs-footer">
									<view>说明：</view>
									<view class="card-info-item-tips">
										<view>[一键启动]为使用按键按下启动；</view>
										<view>[机械钥匙]为使用钥匙片拧动启动；</view>
									</view>
								</view>
							</view>

						</view>
					</view>
					<view class="card-footer">
						<view @tap="handleSubmit">确认{{ btnState }}</view>
					</view>
				</scroll-view>

			</block>
		</view>
	</view>
</template>

<script>
	import {
		u_getCarList,
		u_addOrUpdateCar
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
				g_page: 1, // 当前页码
				g_items: [], // 车辆列表数据
				g_activeTab: 1, // 当前激活的标签页(1:车辆列表 2:新增车辆)
				btnState: '新增', // 按钮显示文本
				params: {},
				batterylift: '一键启动'
			};
		},
		onLoad(options) {
			// 页面加载时逻辑
		},
		onShow() {
			// 页面显示时初始化
			this.initialCarList()
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

			// 编辑车辆信息
			handleEdit(evt) {
				this.btnState = '修改'
				this.params = evt
				this.g_activeTab = 2
			},

			// 切换标签页
			handleSwitchTab(evt) {
				this.g_activeTab = evt
				if (evt == 1) {
					this.params = {}
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
			handleBindinput(evt, text) {
				console.log(evt, text)
				this.params[text] = evt.detail.value
			},
			// 确认修改
			async handleSubmit() {
				const {
					params
				} = this;
				const {
					id,
					ccdate,
					platenumber,
					sn,
					vehicleModeName,
					vehicleSerialName,
					vin,
					xsgw
				} = params;

				if (!platenumber || !sn) {
					uni.showToast({
						title: '车牌号或设备号不能为空',
						icon: 'none'
					});
					return;
				}

				const submitData = {
					id: id || '',
					ccdate,
					platenumber,
					sn,
					vehicleModeName,
					vehicleSerialName,
					vin,
					xsgw,
					batterylift: this.batterylift
				};

				try {
					const res = await u_addOrUpdateCar(submitData);
					if (res.code === 1000) {
						uni.showToast({
							title: '提交成功',
							icon: 'success'
						});

						// 更新状态并重置分页
						this.g_activeTab = 1;
						this.g_items = [];
						this.g_page = 1;
						this.$nextTick(() => {
							this.initialCarList();
						});
					} else {
						uni.showToast({
							title: res.msg || '提交失败',
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('提交出错:', error);
					uni.showToast({
						title: '网络异常，请重试',
						icon: 'none'
					});
				}
			},
			handleBatterylift(evt) {
				console.log(evt)
				this.batterylift = evt
			}

		}
	};
</script>
<style>
	@import './carList.css';

	.required-mark {
		color: #f56c6c;
		margin-left: 8rpx;
	}

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
		height: 28rpx;
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
</style>