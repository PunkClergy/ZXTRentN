<template>
	<view class="container" :style="{ height: `${safeScreenHeight}px` }">
		<CustomNavBar title="修改用户名密码" />
		<!-- 主容器 -->
		<view class="record-container" :style="'margin-top: ' + (navbarTotalHeight) + 'px;'">
			<view class="record-tabs">
				<view class="record-tabs-item" :class="(g_activeTab==1? 'tabs-active-1' : 'tabs-no-active-1')"
					@tap="handleSwitchTab(1)">修改用户名</view>
				<view class="record-tabs-item" :class="(g_activeTab==2? 'tabs-active-2' : 'tabs-no-active-2')"
					@tap="handleSwitchTab(2)">
					修改密码
				</view>
			</view>
			<view class="form-container">
				<block v-if="g_activeTab == 1">
					<view class="input-group">
						<text class="label">用户名</text>
						<view class="input-wrapper">
							<input class="input" type="text" v-model="form.UserName" placeholder="请输入用户名"
								placeholder-class="placeholder" password-icon />
						</view>
					</view>
					<view class="input-group">
						<text class="label">确认用户名</text>
						<view class="input-wrapper">
							<input class="input" type="text" v-model="form.newUserName" placeholder="请再次输入用户名"
								placeholder-class="placeholder" password-icon />
						</view>
					</view>
				</block>
				<block v-else>
					<view class="input-group">
						<text class="label">原密码</text>
						<view class="input-wrapper">
							<input class="input" :type="showOldPassword ? 'text' : 'password'"
								v-model="form.oldPassword" placeholder="请输入原密码" placeholder-class="placeholder"
								password-icon />
							<image
								:src="showOldPassword ? '/static/public/eye-open.png' : '/static/public/eye-close.png'"
								class="eye-icon" @click="showOldPassword = !showOldPassword" />
						</view>
					</view>

					<view class="input-group">
						<text class="label">新密码</text>
						<view class="input-wrapper">
							<input class="input" :type="showNewPassword ? 'text' : 'password'"
								v-model="form.newPassword" placeholder="8-20位字母数字组合" placeholder-class="placeholder"
								password-icon />
							<image
								:src="showNewPassword ? '/static/public/eye-open.png' : '/static/public/eye-close.png'"
								class="eye-icon" @click="showNewPassword = !showNewPassword" />
						</view>
					</view>

					<view class="input-group">
						<text class="label">确认密码</text>
						<view class="input-wrapper">
							<input class="input" :type="showConfirmPassword ? 'text' : 'password'"
								v-model="form.confirmPassword" placeholder="请再次输入新密码" placeholder-class="placeholder"
								password-icon />
							<image
								:src="showConfirmPassword ? '/static/public/eye-open.png' : '/static/public/eye-close.png'"
								class="eye-icon" @click="showConfirmPassword = !showConfirmPassword" />
						</view>
					</view>


				</block>

				<button class="submit-btn" :disabled="submitting" @click="handleSubmit">
					{{ submitting ? '提交中...' : '确认修改' }}
				</button>
			</view>
		</view>
	</view>
</template>

<script>
	import CustomNavBar from "@/components/custom-header/index.vue";
	import {
		info_screen
	} from '@/utils/scheme/screen.js'
	import {
		u_updatePassword,
		u_updateUserName
	} from '@/api' // 密码修改API

	export default {
		components: {
			CustomNavBar
		},
		data() {
			return {
				screenInfo: {}, // 屏幕信息对象
				form: {},
				showOldPassword: false, // 控制原密码显示
				showNewPassword: false, // 控制新密码显示
				showConfirmPassword: false, // 控制确认密码显示
				submitting: false, // 防止重复提交
				g_activeTab: 1,
			};
		},
		onLoad(options) {

		},
		onShow() {
			this.initialScreenInfo()
		},
		computed: {
			// 当前用户信息
			userInfo() {
				return uni.getStorageSync('user_info') || null
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
			// 切换标签页
			handleSwitchTab(evt) {
				this.g_activeTab = evt
			},
			// 表单验证
			validateForm() {
				if (!this.form.oldPassword) {
					uni.showToast({
						title: '请输入原密码',
						icon: 'none'
					});
					return false;
				}

				if (!this.form.newPassword) {
					uni.showToast({
						title: '请输入新密码',
						icon: 'none'
					});
					return false;
				}

				if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/.test(this.form.newPassword)) {
					uni.showToast({
						title: '密码需8-20位字母数字组合',
						icon: 'none'
					});
					return false;
				}

				if (this.form.newPassword !== this.form.confirmPassword) {
					uni.showToast({
						title: '两次输入密码不一致',
						icon: 'none'
					});
					return false;
				}

				if (this.form.oldPassword === this.form.newPassword) {
					uni.showToast({
						title: '新密码不能与原密码相同',
						icon: 'none'
					});
					return false;
				}

				return true;
			},

			// 提交表单
			async handleSubmit() {
				if (this.submitting) return;
				this.submitting = true;

				try {
					if (this.g_activeTab === 1) {
						await this.handleUsernameUpdate();
					} else {
						await this.handlePasswordUpdate();
					}
				} finally {
					this.submitting = false;
				}
			},

			// 用户名修改逻辑
			async handleUsernameUpdate() {
				if (this.form?.UserName !== this.form?.newUserName) {
					uni.showToast({
						title: '两次输入用户名不一致',
						icon: 'none'
					});
					return;
				}

				const params = {
					newUserName: this.form.newUserName,
					userId: this.userInfo?.id
				};

				await this.executeUpdate(
					u_updateUserName,
					params,
					'用户名修改成功',
					'用户名修改失败'
				);
			},

			// 密码修改逻辑
			async handlePasswordUpdate() {
				if (!this.validateForm()) return;

				const params = {
					oldPassword: this.form.oldPassword,
					newPassword: this.form.newPassword,
					userId: this.userInfo?.id
				};

				await this.executeUpdate(
					u_updatePassword,
					params,
					'密码修改成功',
					'密码修改失败'
				);
			},

			// 统一请求处理器
			async executeUpdate(apiFunc, params, successMsg, errorMsg) {
				try {
					const res = await apiFunc(params);

					if (res.code === 1000) {
						this.showSuccessToast(successMsg);
					} else {
						uni.showToast({
							title: res.message || errorMsg,
							icon: 'none'
						});
					}
				} catch (error) {
					console.error(`${errorMsg}:`, error);
					uni.showToast({
						title: '请求失败，请稍后重试',
						icon: 'none'
					});
				}
			},

			// 成功提示通用逻辑
			showSuccessToast(message) {
				uni.showToast({
					title: message,
					icon: 'none',
					duration: 1500,
					success: () => {
						setTimeout(() => uni.navigateBack(), 1500);
					}
				});
			}
		}
	};
</script>

<style>
	/* 容器样式 */
	.container {
		height: 100vh;
		background-image: url(/static/public/car-bg.png);
		background-size: cover;
		display: flex;
		flex-direction: column;
		/* align-items: center; */
		/* justify-content: center; */
	}

	/* 记录容器 */
	.record-container {

		height: auto;
		min-height: 90vh;
		border-radius: 24rpx;
		background-color: rgba(255, 255, 255, 0.95);
		box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.15);
		display: flex;
		flex-direction: column;
		gap: 50rpx;
		width: 98%;
		position: relative;
		border-radius: 12rpx;

	}


	.form-container {
		width: 90%;
		display: flex;
		flex-direction: column;
		margin: 0 auto;
		gap: 40rpx;
	}

	.input-group {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	.label {
		font-size: 30rpx;
		color: #333;
		font-weight: 500;
	}

	.input-wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}

	.input {
		width: 100%;
		height: 90rpx;
		padding: 0 30rpx 0 30rpx;
		/* 右侧留出眼睛图标位置 */
		background: #f8f8f8;
		border-radius: 16rpx;
		font-size: 28rpx;
		border: 1rpx solid #eee;
		box-sizing: border-box;
	}

	.eye-icon {
		position: absolute;
		right: 30rpx;
		width: 40rpx;
		height: 40rpx;
		z-index: 10;
	}

	.placeholder {
		color: #999;
		font-size: 28rpx;
	}

	.submit-btn {
		width: 100%;
		margin-top: 60rpx;
		height: 90rpx;
		line-height: 90rpx;
		border-radius: 16rpx;
		background: #007AFF;
		color: white;
		font-size: 32rpx;
		font-weight: 500;
	}

	.submit-btn:disabled {
		background: #a0cfff;
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