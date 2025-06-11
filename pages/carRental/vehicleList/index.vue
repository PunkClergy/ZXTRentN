<template>
	<view class="container" :style="{ height: `${safeScreenHeight}px` }">
		<CustomNavBar title="车辆绑定" />
		<!-- index.wxml -->
		<view class="record-container" :style="'margin-top: ' + (navbarTotalHeight) + 'px;'">
			<!-- 切换部分 -->
			<view class="record-tabs">
				<view class="record-tabs-item" :class=" (g_activeTab==1? 'tabs-active-1' : 'tabs-no-active-1')"
					@tap="handleSwitchTab(1)">车辆列表</view>
				<view class="record-tabs-item" :class=" (g_activeTab==2? 'tabs-active-2' : 'tabs-no-active-2')"
					@tap="handleSwitchTab(2)">
					{{ btnState }}车辆
				</view>
			</view>
			<!-- 详情区域部分 -->
			<block v-if="g_activeTab == 1">
				<scroll-view style="height: 100vh" scroll-y @scrolltolower="lower">
					<block v-for="(item, index) in g_items" :key="index">
						<view class="content-item">
							<view class="content-item-head">
								<view class="head-left">
									<view class="left-category">
										<image src="/static/public/car_icon.png" />
										<text>{{ item.platenumber }}</text>
									</view>
									<view class="left-split_line"></view>
									<view class="left-model">
										{{ item.vehicleSerialName || '-' }}{{ item.vehicleModeName || '' }}
									</view>
									<view class="left-brand">短租</view>
								</view>
								<view class="head-right">
									<image src="/static/assets/images/home/_edit.png" @tap="handleEdit" />
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
								<view class="footer-left"></view>
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
			<block v-if="g_activeTab == 2">
				<scroll-view scroll-y>
					暂时占位
				</scroll-view>
			</block>
		</view>
	</view>
</template>

<script>
	import {
		u_getCarList
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
				screenInfo: {},//屏幕信息
				g_page: 1,//车辆列表页码
				g_items: [],//车辆列表数据
				g_activeTab: 1,//当前Tabs页签
				btnState: '新增',
			};
		},
		onLoad(options) {


		},
		onShow() {
			this.initialCarList()
			this.initialScreenInfo()
		},
		computed: {
			// 状态栏高度
			statusBarHeight() {
				return this.screenInfo.statusBarHeight || 0;
			},
			// 导航栏主体高度
			navBarHeight() {
				return this.screenInfo.platform === 'ios' ? 49 : 44;
			},
			// 导航栏总高度
			navbarTotalHeight() {
				return this.statusBarHeight + this.navBarHeight;
			},
			// 安全的屏幕高度
			safeScreenHeight() {
				return this.screenInfo.screenHeight || 667;
			}
		},
		methods: {

			lower(e) {
				if (!this.loading) {
					this.loading = true;
					this.g_page = this.g_page + 1
					setTimeout(() => {
						this.initialCarList()
						this.loading = false;

					}, 1000);
				}
			},

			// 修改车辆
			handleEdit() {},
			handleSwitchTab(evt) {
				this.g_activeTab = evt
			},
			// 初始化屏幕信息
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
			// 请求车辆列表
			async initialCarList() {
				try {
					const res = await u_getCarList({
						page: this.g_page
					});
					if (this.g_page > 1 && res.content.length === 0) {
						uni.showToast({
							title: `已加载全部数据：共${this.g_items.length}条`,
							icon: 'none'
						});
					}
					this.g_items = this.g_items.concat(res?.content)
				} catch (error) {

				}
			},

		}
	};
</script>
<style>
	.container {
		height: 100vh;
		padding: 10rpx 0rpx;
		background-image: url(/static/public/car-bg.png);
	}
	
	.record-container {
		width: 98%;
		margin: auto;
		position: relative;
		border-radius: 12rpx;
		background-color: #fff;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}
	
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
		background-repeat: no-repeat;
		background-size: cover;
		background-position: center;
		touch-action: pan-x;
		font-family: PingFang SC;
		font-weight: bold;
		font-size: 28rpx;
		color: #010101;
	}
	
	.record-tabs-1 {
		display: flex;
		padding: 10rpx;
		justify-content: space-between;
		align-items: center;
	}
	
	.tabs-1-title {
		display: flex;
		align-items: center;
		gap: 6rpx;
	}
	
	.tabs-1-title text {
		font-family: PingFang SC;
		font-weight: bold;
		font-size: 26rpx;
		color: #333333;
	}
	
	.tabs-1-title image {
		width: 42rpx;
		height: 46rpx;
	}
	
	/* 内容项 */
	.content-item {
		margin: 10rpx;
		background-color: #ffffff;
		border-radius: 8px;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}
	
	.content-item-head {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		border-bottom: 1px solid #f0f0f0;
		padding: 20rpx 15rpx;
	}
	
	.head-left {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}
	
	.left-model {
		font-family: PingFang SC;
		font-weight: 500;
		font-size: 24rpx;
		color: #333333;
	}
	
	.head-right {
		display: flex;
		flex-direction: row;
		gap: 20rpx;
		align-items: center;
		justify-content: center;
	}
	
	.head-right image {
		width: 30rpx;
		height: 30rpx;
	}
	
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
		transition: all 0.3s;
		font-family: PingFang SC;
		font-weight: 500;
		font-size: 24rpx;
		color: #333333;
	}
	
	.long-info-item {
		flex-basis: 100% !important;
		/* 长内容时占满整行 */
	}
	
	/* alarm-add.wxss （保持相同） */
	
	.form-item {
		margin-bottom: 10rpx;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		gap: 20rpx;
	}
	
	.label {
		display: block;
		font-size: 28rpx;
		color: #666;
	}
	
	.picker {
		background: #fff;
		border-radius: 8rpx;
		font-size: 28rpx;
	}
	
	.days-container {
		display: flex;
		justify-content: space-between;
	}
	
	.day-item {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		background: #f5f5f5;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
		color: #333;
	}
	
	.day-item.active {
		background: #07c160;
		color: #fff;
	}
	
	.input {
		padding: 20rpx;
		background: #fff;
		border-radius: 8rpx;
	}
	
	.save-btn {
		margin-top: 60rpx;
		background: #07c160;
		color: #fff;
	}
	
	.container {
		width: 100%;
		height: 95vh;
		display: flex;
		flex-direction: column;
		background-repeat: no-repeat;
		background-size: cover;
		background-position: center;
		touch-action: pan-x;
		position: relative;
	}
	
	/* 主要内容容器 */
	.content-container {
		background-color: #fff;
		position: absolute;
		bottom: 10rpx;
		left: 0;
		right: 0;
		width: 96%;
		margin: auto;
		border-radius: 10rpx;
		display: flex;
		flex-direction: column;
		/* 子元素垂直排列 */
	}
	
	.card-head {
		display: flex;
		align-items: center;
		gap: 20rpx;
		padding: 0 20rpx;
		height: 30px;
	}
	
	.card-head image {
		width: 40rpx;
		height: 30rpx;
	}
	
	.card-head text {
		font-family: PingFang SC;
		font-weight: bold;
		font-size: 28rpx;
		color: #333333;
	}
	
	.long-range-control-car {
		flex: 1;
		overflow-y: auto;
		box-shadow: 4rpx 4px 8px rgba(0, 0, 0, 0.1);
	}
	
	.long-range-control-car-subitem {
		display: flex;
		justify-content: space-between;
		border-bottom: 1px solid #f0f0f0;
		padding: 20rpx;
	}
	
	.long-range-control-car-subitem label {
		font-family: PingFang SC;
		font-weight: 500;
		font-size: 26rpx;
		color: #333333;
		display: flex;
		gap: 6rpx;
		align-items: flex-start;
	}
	
	.long-range-control-car-subitem label text {
		color: red;
	}
	
	.picker {
		font-family: PingFang SC;
		font-weight: 500;
		font-size: 26rpx;
		color: #333333;
		display: flex;
		align-items: center;
	}
	
	.picker image {
		width: 30rpx;
		height: 30rpx;
	}
	
	.long-range-control-car-subitem input {
		text-align: right;
		font-family: PingFang SC;
		font-weight: 500;
		font-size: 26rpx;
		color: #333333;
	}
	
	.viewText {
		text-align: right;
		font-family: PingFang SC;
		font-weight: 500;
		font-size: 26rpx;
		color: #333333;
	}
	
	.card-info-item-tabs {}
	
	.card-info-item-tabs-btn {
		display: flex;
		gap: 10rpx;
		justify-content: flex-end;
	}
	
	.card-info-item-tabs-btn text {
		border-radius: 7rpx;
		border: 1px solid #7b7c7c;
		font-family: PingFang SC;
		font-weight: 500;
		padding: 6rpx 20rpx;
		font-size: 24rpx;
		color: #333333;
	}
	
	.tabs-footer {
		font-family: PingFang SC;
		font-weight: 500;
		font-size: 22rpx;
		color: #7b7c7c;
		display: flex;
	}
	
	.card-info-item-tips {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
	}
	
	.tabs-active {
		background: #1b64b1;
		border-radius: 7rpx;
		color: #ffffff !important;
	}
	
	.card-footer {
		/* position: absolute; */
		text-align: center;
		margin: 20rpx 0;
		/* bottom: 120rpx; */
		width: 100%;
		display: flex;
		justify-content: center;
		font-family: PingFang SC;
		font-weight: bold;
		font-size: 34rpx;
		color: #ffffff;
	}
	
	.card-footer view {
		width: 40%;
		background-color: #2196f3;
		padding: 10rpx;
		background: linear-gradient(88deg, #1576dc, #1b64b1);
		box-shadow: 0rpx 1rpx 13rpx 0rpx rgba(51, 63, 92, 0.31);
		border-radius: 36rpx;
	}
	
	/* index.wxss */
	.tree-container {
		padding: 0rpx;
	}
	
	.node {
		margin: 0rpx 0;
	}
	
	.node-header {
		display: flex;
		align-items: center;
		padding: 10rpx 0;
	}
	
	.arrow {
		font-size: 24rpx;
		color: #666;
		margin-right: 10rpx;
		transition: transform 0.3s;
	}
	
	.arrow.expanded {
		transform: rotate(90deg);
	}
	
	.checkbox {
		min-width: 36rpx;
		min-height: 36rpx;
		border: 2rpx solid #ccc;
		border-radius: 6rpx;
		margin-right: 15rpx;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.checkbox.checked {
		background: #07c160;
		border-color: #07c160;
		width: 36rpx;
		height: 36rpx;
	}
	
	.child-node {
		margin-top: 5rpx;
	}
	
	.checkbox.indeterminate {
		background: #fff;
		border-color: #07c160;
	}
	
	.checkmark {
		color: white;
		font-size: 28rpx;
	}
	
	.indeterminate-line {
		width: 20rpx;
		height: 4rpx;
		background: #07c160;
	}
	
	.children {
		margin-left: 20rpx;
		border-left: 2rpx solid #eee;
		padding-left: 20rpx;
	}
	
	.node-name {
		font-size: 24rpx;
		color: #333;
	}
	
	/* 内容项 */
	.content-item {
		margin: 15rpx;
		background-color: #ffffff;
		border-radius: 8px;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}
	
	.content-item-head {
		display: flex;
		flex-direction: row;
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
		flex-direction: row;
		gap: 20rpx;
		align-items: center;
		justify-content: center;
	}
	
	.head-right image {
		width: 30rpx;
		height: 30rpx;
	}
	
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
		transition: all 0.3s;
		font-family: PingFang SC;
		font-weight: 500;
		font-size: 24rpx;
		color: #333333;
	}
	
	.long-info-item {
		flex-basis: 100% !important;
		/* 长内容时占满整行 */
	}
	
	.content-item-footer {
		display: flex;
		padding: 15rpx;
		justify-content: space-between;
	}
	
	.footer-left {
		font-family: PingFang SC;
		font-weight: bold;
		font-size: 26rpx;
		color: #333333;
	}
	
	.footer-right {
		display: flex;
		flex-direction: row;
		align-items: center;
	}
	
	.footer-right-btn {
		display: flex;
		flex-direction: row;
		align-items: center;
		font-family: PingFang SC;
		font-weight: bold;
		font-size: 22rpx;
		color: #ffffff;
		background-color: #1b64b1;
		border-radius: 8rpx;
		padding: 4rpx 15rpx;
	}
	
	.levitation-button {
		position: absolute;
		bottom: 50rpx;
		width: 100%;
		display: flex;
		justify-content: center;
	}
	
	.levitation-button text {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 75rpx;
		width: 40%;
		background: linear-gradient(88deg, #1576dc, #1b64b1);
		box-shadow: 0rpx 1rpx 13rpx 0rpx rgba(51, 63, 92, 0.31);
		border-radius: 36rpx;
		font-family: PingFang SC;
		font-weight: bold;
		font-size: 32rpx;
		color: #ffffff;
	}
	
	.card-info {
		flex: 1;
		overflow-y: auto;
	}
	
	.card-info-item {
		display: flex;
		justify-content: space-between;
		border-bottom: 1px solid #f0f0f0;
		padding: 20rpx;
	}
	
	.card-info-item label {
		font-family: PingFang SC;
		font-weight: 500;
		font-size: 26rpx;
		color: #333333;
		display: flex;
		gap: 6rpx;
		align-items: flex-start;
	}
	
	.card-info-item label text {
		color: red;
	}
	
	.picker {
		font-family: PingFang SC;
		font-weight: 500;
		font-size: 26rpx;
		color: #333333;
		display: flex;
		align-items: center;
	}
	
	.picker image {
		width: 30rpx;
		height: 30rpx;
	}
	
	.card-info input {
		text-align: right;
		font-family: PingFang SC;
		font-weight: 500;
		font-size: 26rpx;
		color: #333333;
	}
	
	.viewText {
		text-align: right;
		font-family: PingFang SC;
		font-weight: 500;
		font-size: 26rpx;
		color: #333333;
	}
	
	.card-info-item-tabs {}
	
	.card-info-item-tabs-btn {
		display: flex;
		gap: 10rpx;
		justify-content: flex-end;
	}
	
	.card-info-item-tabs-btn text {
		border-radius: 7rpx;
		border: 1px solid #7b7c7c;
		font-family: PingFang SC;
		font-weight: 500;
		padding: 6rpx 20rpx;
		font-size: 24rpx;
		color: #333333;
	}
	
	.tabs-footer {
		font-family: PingFang SC;
		font-weight: 500;
		font-size: 22rpx;
		color: #7b7c7c;
		display: flex;
	}
	
	.card-info-item-tips {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
	}
	
	.tabs-active {
		background: #1b64b1;
		border-radius: 7rpx;
		color: #ffffff !important;
	}
	
	.card-footer {
		height: 50px;
		color: white;
		text-align: center;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		font-family: PingFang SC;
		font-weight: bold;
		font-size: 34rpx;
		color: #ffffff;
	}
	
	.card-footer view {
		width: 40%;
		background-color: #2196f3;
		padding: 10rpx;
		background: linear-gradient(88deg, #1576dc, #1b64b1);
		box-shadow: 0rpx 1rpx 13rpx 0rpx rgba(51, 63, 92, 0.31);
		border-radius: 36rpx;
	}

	.tabs-active-1 {
		background-image: url(/static/tabs/2-1.png);
		background-size: cover;
		/* 图片覆盖整个容器，可能裁剪 */
		background-position: center;
		/* 居中显示 */
		background-repeat: no-repeat;
	}

	.tabs-no-active-1 {
		background-image: url(/static/tabs/1-1.png);
		background-size: cover;
		/* 图片覆盖整个容器，可能裁剪 */
		background-position: center;
		/* 居中显示 */
		background-repeat: no-repeat;
	}

	.tabs-active-2 {
		background-image: url(/static/tabs/1-2.png);
		background-size: cover;
		/* 图片覆盖整个容器，可能裁剪 */
		background-position: center;
		/* 居中显示 */
		background-repeat: no-repeat;
	}

	.tabs-no-active-2 {
		background-image: url(/static/tabs/2-2.png);
		background-size: cover;
		/* 图片覆盖整个容器，可能裁剪 */
		background-position: center;
		/* 居中显示 */
		background-repeat: no-repeat;
	}
</style>