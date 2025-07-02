<!-- pages/register/register.vue -->
<template>
	<view class="container">
		<CustomNavBar title="注册账号" />
		<view class="register-area">
			<!-- Logo 区域 -->
			<view class="logo-container fade-in">
				<view class="logo-wrapper">
					<image src="/static/public/logo.png" class="logo-img" />
					<text class="logo-text">智信通wiselink</text>
				</view>
				<text class="slogan">智信通汽车出行技术服务运营提供商</text>
			</view>

			<!-- 注册表单 -->
			<view class="input-group">
				<view class="input-item">
					<view class="input-label">{{langs.mobile}}</view>
					<input class="input-field" :placeholder="langs.pleasemobile" v-model="phone" type="number" />
				</view>
				<view class="input-item">
					<view class="input-label">{{langs.password}}</view>
					<input class="input-field" :placeholder="langs.pleasepassword" v-model="password" :password="true" />
				</view>
				<view class="input-item">
					<view class="input-label">{{langs.confirmpassword}}</view>
					<input class="input-field" :placeholder="langs.Reenterpassword" v-model="confirmPassword" :password="true" />
				</view>

				<view class="input-item">
					<view class="input-label">{{langs.verificationcode}}</view>
					<input class="input-field" :placeholder="langs.verificationcode" v-model="smsCode" />
					<button class="sms-btn" :disabled="smsDisabled" @tap="getSmsCode">
						{{ smsBtnText||langs.verificationcode }}
					</button>
				</view>
				
				<button class="register-btn" :disabled="isSubmitting" @tap="handleRegister">{{langs.signup}}</button>
				
				<view class="login-link">
					<text>{{langs.haveanaccount}}</text>
					<text class="link-text" @tap="goToLogin">{{langs.loginnow}}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { u_register, u_getSmsCode } from '@/api';
	import CustomNavBar from "@/components/custom-header/index.vue";
	import {
		langs
	} from '@/utils/i18n/index.js'
	export default {
		data() {
			return {
				username: '',
				password: '',
				confirmPassword: '',
				phone: '',
				smsCode: '',
				isSubmitting: false,
				smsDisabled: false,
				smsBtnText: '',
				countdown: 60,
				langs: {},
			};
		},
		components: {
			CustomNavBar
		},
		onShow() {
			this.handleGetCurrentLanguage()
		},
		methods: {
			handleGetCurrentLanguage() {
				let currentLang = uni.getStorageSync('lang') || 'zh-CN';
				this.langs = langs[currentLang]
			},
			// 获取短信验证码
			async getSmsCode() {
				if (!this.phone) {
					uni.showToast({ title: '请输入手机号', icon: 'none' });
					return;
				}
				if (!/^1[3-9]\d{9}$/.test(this.phone)) {
					uni.showToast({ title: '手机号格式错误', icon: 'none' });
					return;
				}
				
				try {
					// 调用获取验证码API
					await u_getSmsCode({ mobile: this.phone });
					uni.showToast({ title: '验证码已发送', icon: 'none' });
					
					// 开始倒计时
					this.smsDisabled = true;
					this.startCountdown();
				} catch (error) {
					uni.showToast({ title: '验证码发送失败', icon: 'none' });
				}
			},
			
			// 倒计时
			startCountdown() {
				let timer = setInterval(() => {
					this.countdown--;
					this.smsBtnText = `${this.countdown}秒后重发`;
					
					if (this.countdown <= 0) {
						clearInterval(timer);
						this.smsBtnText = '获取验证码';
						this.smsDisabled = false;
						this.countdown = 60;
					}
				}, 1000);
			},
			
			// 表单验证
			validateForm() {
				if (!this.password) {
					uni.showToast({ title: '请输入密码', icon: 'none' });
					return false;
				}
				if (this.password.length < 6 || this.password.length > 20) {
					uni.showToast({ title: '密码长度需在6-20位之间', icon: 'none' });
					return false;
				}
				if (this.password !== this.confirmPassword) {
					uni.showToast({ title: '两次输入的密码不一致', icon: 'none' });
					return false;
				}
				if (!this.phone) {
					uni.showToast({ title: '请输入手机号', icon: 'none' });
					return false;
				}
				if (!/^1[3-9]\d{9}$/.test(this.phone)) {
					uni.showToast({ title: '手机号格式错误', icon: 'none' });
					return false;
				}
				if (!this.smsCode) {
					uni.showToast({ title: '请输入验证码', icon: 'none' });
					return false;
				}
				return true;
			},
			
			// 注册处理
			async handleRegister() {
				if (this.isSubmitting) return;
				if (!this.validateForm()) return;
				
				this.isSubmitting = true;
				
				try {
					const response = await u_register({
						password: this.password,
						mobile: this.phone,
						yzcode: this.smsCode
					});
					console.log(response)
					if (response.code === 1000) {
						uni.showToast({ title: '注册成功' });
						setTimeout(() => {
							uni.navigateBack();
						}, 3000);
					} else {
						uni.showToast({ title: response.msg || '注册失败', icon: 'none' });
					}
				} catch (error) {
					uni.showToast({ title: '请求失败，请稍后重试', icon: 'none' });
				} finally {
					this.isSubmitting = false;
				}
			},
			
			// 跳转到登录页面
			goToLogin() {
				uni.navigateBack();
			}
		}
	};
</script>

<style>
	page {
		background-color: #252c3b;
		height: 100%;
	}

	.container {
		display: flex;
		flex-direction: column;
		height: 100vh;
	}

	.register-area {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 40rpx 0;
		justify-content: center;
	}

	.logo-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 60rpx;
	}

	.logo-wrapper {
		display: flex;
		align-items: center;
		gap: 10rpx;
	}

	.logo-img {
		width: 60rpx;
		height: 60rpx;
		border-radius: 22rpx;
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
	}

	.logo-text {
		color: white;
		font-size: 32rpx;
	}

	.slogan {
		font-size: 30rpx;
		color: #a3a1a1;
		font-weight: 500;
		margin-top: 20rpx;
	}

	.input-group {
		width: 90%;
		display: flex;
		flex-direction: column;
		gap: 30rpx;
	}

	.input-item {
		display: flex;
		flex-direction: row;
		height: 90rpx;
		background: white;
		border-radius: 10rpx;
		align-items: center;
		position: relative;
	}

	.input-label {
		min-width: 150rpx;
		font-size: 30rpx;
		margin-left: 25rpx;
		color: #a4a4a4;
	}

	.input-field {
		margin-left: 10rpx;
		width: 100%;
		height: 100%;
		text-align: left;
		color: #4a4a4a;
		font-size: 30rpx;
		padding-right: 20rpx;
	}

	.sms-btn {
		position: absolute;
		right: 10rpx;
		height: 70rpx;
		line-height: 70rpx;
		padding: 0 20rpx;
		font-size: 26rpx;
		background: #4cd964;
		color: white;
		border-radius: 8rpx;
	}
	
	.sms-btn[disabled] {
		background: #cccccc;
	}

	.register-btn {
		width: 100%;
		background: #4cd964;
		color: white;
		margin-top: 20rpx;
	}
	
	.register-btn[disabled] {
		background: #a0e6ad;
	}

	.login-link {
		text-align: center;
		margin-top: 30rpx;
		font-size: 28rpx;
		color: #a3a1a1;
	}

	.link-text {
		color: #4cd964;
		margin-left: 10rpx;
		text-decoration: underline;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.fade-in {
		animation: fadeIn 0.6s ease-in;
	}
</style>