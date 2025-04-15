<template>
	<view class="container">
		<!-- 标题 -->
		<view class="title">登录</view>

		<!-- 用户名输入框 -->
		<input type="text" v-model="username" placeholder="请输入年龄" />

		<!-- 密码输入框 -->
		<input type="text" v-model="password" placeholder="请输入年龄" />

		<!-- 登录按钮 -->
		<button class="login-btn" @click="handleLogin">登录</button>

		<!-- 注册链接 -->
		<view class="register-link">
			<text>还没有账号？</text>
			<text class="link" @click="handleRegister">立即注册</text>
		</view>
	</view>
</template>

<script>
	import {
		login
	} from '@/api'
	export default {
		data() {
			return {
				username: "", // 用户名
				password: "", // 密码
			};
		},
		methods: {

			async handleLogin() {
				if (!this.username || !this.password) {
					uni.showToast({
						title: "请输入用户名和密码",
						icon: "none",
					});
					return;
				}
				try {
					const res = await login({
						username: 'admin',
						password: '123456'
					})
					uni.setStorageSync('token', res.token)
				} catch (error) {
					console.error('登录失败', error)
				}
			},


			handleRegister() {
				uni.navigateTo({
					url: "/pages/register/register", // 跳转到注册页面
				});
			},
		},
	};
</script>

<style scoped>
	/* 页面容器 */
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 40px;
		min-height: 100vh;
		background-color: #f5f5f5;
	}

	/* 标题样式 */
	.title {
		font-size: 28px;
		font-weight: bold;
		margin-bottom: 30px;
		color: #333;
	}

	/* 输入框组 */
	.input-group {
		width: 100%;
		margin-bottom: 20px;
	}

	/* 输入框样式 */
	.input {
		width: 100%;
		padding: 12px;
		font-size: 16px;
		border: 1px solid #ddd;
		border-radius: 8px;
		background-color: #fff;
		box-sizing: border-box;
	}

	/* 登录按钮 */
	.login-btn {
		width: 100%;
		padding: 12px;
		font-size: 18px;
		color: #fff;
		background-color: #007aff;
		border: none;
		border-radius: 8px;
		cursor: pointer;
	}

	.login-btn:hover {
		opacity: 0.9;
	}

	/* 注册链接 */
	.register-link {
		margin-top: 20px;
		font-size: 14px;
		color: #666;
		text-align: center;
	}

	/* 链接文字样式 */
	.link {
		color: #007aff;
		text-decoration: underline;
		cursor: pointer;
	}

	.link:hover {
		opacity: 0.8;
	}
</style>