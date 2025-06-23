<template>
	<view class="container" :style="{ height: `${safeScreenHeight}px` }">
		<CustomNavBar title="税务和发票资料" />
		<!-- 主容器 -->
		<view class="record-container" :style="'margin-top: ' + (navbarTotalHeight) + 'px;'">



			<!-- 新增车辆区域 -->
			<scroll-view scroll-y style="height: 100vh">
				<view class="card-info">
					<!-- 企业名称 -->

					<view class="card-info-item">
						<label class="form-label">
							企业名称
						</label>
						<input class="form-input" placeholder="请输入企业名称" :value="params?.name" maxlength="10"
							placeholder-style="color: #999;" @input="(e)=>handleBindinput(e,'name')" />
					</view>
					<!-- 联系人 -->
					<view class="card-info-item">
						<label class="form-label">
							联系人
						</label>
						<input class="form-input" placeholder="请输入联系人" :value="params?.chargename" maxlength="20"
							placeholder-style="color: #999;" @input="(e)=>handleBindinput(e,'chargename')" />
					</view>
					<!-- 联系电话 -->
					<view class="card-info-item">
						<label>联系电话</label>
						<input class="form-input" placeholder="请输入联系电话" :value="params?.chargemobile"
							placeholder-style="color: #999;" @input="(e)=>handleBindinput(e,'chargemobile')" />
					</view>
					<!-- 备注 -->
					<view class="card-info-item">
						<label>备注</label>
						<input class="form-input" placeholder="请输入备注" :value="params?.bak"
							placeholder-style="color: #999;" @input="(e)=>handleBindinput(e,'bak')" />
					</view>
					<!-- 开票名称 -->
					<view class="card-info-item">
						<label>开票名称</label>
						<input class="form-input" placeholder="请输入开票名称" :value="params?.invoiceHeader"
							placeholder-style="color: #999;" @input="(e)=>handleBindinput(e,'invoiceHeader')" />
					</view>

					<!-- 纳税人识别号 -->
					<view class="card-info-item">
						<label>纳税人识别号</label>
						<input class="form-input" placeholder="请输入识别号" :value="params?.invoiceNum"
							placeholder-style="color: #999;" @input="(e)=>handleBindinput(e,'invoiceNum')" />
					</view>
					<!-- 电话 -->
					<view class="card-info-item">
						<label>电话</label>
						<input class="form-input" placeholder="请输入油箱电话" :value="params?.invoiceMobile"
							placeholder-style="color: #999;" @input="(e)=>handleBindinput(e,'invoiceMobile')" />
					</view>
					<!-- 电话 -->
					<view class="card-info-item">
						<label>电话</label>
						<input class="form-input" placeholder="请输入油箱电话" :value="params?.invoiceMobile"
							placeholder-style="color: #999;" @input="(e)=>handleBindinput(e,'invoiceMobile')" />
					</view>
					<!-- 地址 -->
					<view class="card-info-item">
						<label>地址</label>
						<input class="form-input" placeholder="请输入地址" :value="params?.invoiceAddress"
							placeholder-style="color: #999;" @input="(e)=>handleBindinput(e,'invoiceAddress')" />
					</view>
					<!-- 开户行 -->
					<view class="card-info-item">
						<label>开户行</label>
						<input class="form-input" placeholder="请输入开户行" :value="params?.accountsBank"
							placeholder-style="color: #999;" @input="(e)=>handleBindinput(e,'accountsBank')" />
					</view>
					<!-- 开户账号 -->
					<view class="card-info-item">
						<label>开户账号</label>
						<input class="form-input" placeholder="请输入开户账号" :value="params?.bankCardNumber"
							placeholder-style="color: #999;" @input="(e)=>handleBindinput(e,'bankCardNumber')" />
					</view>
				</view>
				<view class="card-footer">
					<view @tap="handleSubmit">确认提交</view>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
	import {
		u_companyInfo,
		u_companyImprove
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
				params: {}
			};
		},
		onLoad(options) {
			// 页面加载时逻辑
			this.souce = options?.souce
		},
		onShow() {
			this.initialScreenInfo()
			this.initGetInfo()
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
					uni.showToast({
						title: '设备信息获取失败',
						icon: 'none'
					});
				}
			},
			async initGetInfo() {
				try {
					const res = await u_companyInfo();
					this.params = res?.content
				} catch (error) {
					uni.showToast({
						title: '信息获取失败',
						icon: 'none'
					});
				}
			},

			handleBindinput(evt, text) {
				this.params[text] = evt.detail.value
			},
			// 确认修改
			async handleSubmit() {
				const {
					params
				} = this;

				const info = {
					name: params?.name || '',
					chargename: params?.chargename || '',
					chargemobile: params?.chargemobile || '',
					bak: params?.bak || '',
					invoiceHeader: params?.invoiceHeader || '',
					invoiceNum: params?.invoiceNum || '',
					invoiceMobile: params?.invoiceMobile || '',
					invoiceAddress: params?.invoiceAddress || '',
					accountsBank: params?.accountsBank || '',
					bankCardNumber: params?.bankCardNumber || '',
				}

				try {
					const res = await u_companyImprove({
						...info
					});
					if (res.code === 1000) {
						uni.showToast({
							title: '提交成功',
							icon: 'success'
						});


						this.$nextTick(() => {
							this.initGetInfo();
						});
					} else {
						uni.showToast({
							title: res.msg || '提交失败',
							icon: 'none'
						});
					}
				} catch (error) {
					uni.showToast({
						title: '网络异常，请重试',
						icon: 'none'
					});
				}
			},
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