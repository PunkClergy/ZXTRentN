<template>
	<view class="container" :style="{ height: `${safeScreenHeight}px` }">
		<CustomNavBar title="修改用户名密码" />
		<!-- 主容器 -->
		<view class="record-container" :style="'margin-top: ' + (navbarTotalHeight) + 'px;'">
			<view class="form-container">
				<view class="input-group">
					<text class="label">原密码</text>
					<view class="input-wrapper">
						<input class="input" :type="showOldPassword ? 'text' : 'password'" v-model="form.oldPassword"
							placeholder="请输入原密码" placeholder-class="placeholder" password-icon />
						<image :src="showOldPassword ? '/static/public/eye-open.png' : '/static/public/eye-close.png'"
							class="eye-icon" @click="showOldPassword = !showOldPassword" />
					</view>
				</view>

				<view class="input-group">
					<text class="label">新密码</text>
					<view class="input-wrapper">
						<input class="input" :type="showNewPassword ? 'text' : 'password'" v-model="form.newPassword"
							placeholder="8-20位字母数字组合" placeholder-class="placeholder" password-icon />
						<image :src="showNewPassword ? '/static/public/eye-open.png' : '/static/public/eye-close.png'"
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
		u_updatePassword
	} from '@/api' // 密码修改API

	export default {
		components: {
			CustomNavBar
		},
		data() {
			return {
				screenInfo: {}, // 屏幕信息对象
				form: {
					oldPassword: '',
					newPassword: '',
					confirmPassword: ''
				},
				showOldPassword: false, // 控制原密码显示
				showNewPassword: false, // 控制新密码显示
				showConfirmPassword: false, // 控制确认密码显示
				submitting: false // 防止重复提交
			};
		},
		onLoad(options) {

		},
		onShow() {
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
				if (!this.validateForm()) return;

				this.submitting = true;

				try {
					const params = {
						oldPassword: this.form.oldPassword,
						newPassword: this.form.newPassword
					};

					const res = await u_updatePassword(params);

					if (res.code === 200) {
						uni.showToast({
							title: '密码修改成功',
							icon: 'success',
							duration: 1500,
							success: () => {
								setTimeout(() => {
									uni.navigateBack();
								}, 1500);
							}
						});
					} else {
						uni.showToast({
							title: res.message || '密码修改失败',
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('修改密码失败:', error);
					uni.showToast({
						title: '请求失败，请稍后重试',
						icon: 'none'
					});
				} finally {
					this.submitting = false;
				}
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
		align-items: center;
		justify-content: center;
	}

	/* 记录容器 */
	.record-container {
		width: 90%;
		height: auto;
		min-height: 83vh;
		margin: 20rpx auto;
		border-radius: 24rpx;
		background-color: rgba(255, 255, 255, 0.95);
		box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.15);
		display: flex;
		align-items: center;
		flex-direction: column;
		padding: 40rpx 30rpx;
		gap: 50rpx;
	}

	.form-container {
		width: 100%;
		display: flex;
		flex-direction: column;
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
</style>