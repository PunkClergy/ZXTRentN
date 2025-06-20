<!-- pages/login/login.vue -->
<template>
	<view class="container">
		<view class="form-item">
			<text>用户名</text>
			<input type="text" v-model="username" placeholder="请输入用户名" />
		</view>
		<view class="form-item">
			<text>密码</text>
			<input type="password" v-model="password" placeholder="请输2入密码" />
		</view>
		<button @click="handleLogin">登录</button>
	</view>
</template>

<script>
	import {
		login
	} from '@/api'
	export default {
		data() {
			return {
				username: '',
				password: ''
			}
		},
		methods: {
			async handleLogin() {
				if (!this.username || !this.password) {
					uni.showToast({
						title: '请输入用户名和密码',
						icon: 'none'
					});
					return;
				}

				try {
					const response = await login({
						username: this.username,
						password: this.password,
						type: 2
					})
					uni.setStorageSync('token', response.content.token)
					uni.setStorageSync('user_info', response.content)

					// 跳转到首页或其他页面
					uni.reLaunch({
						url: '/pages/index/index'
					});
				} catch (error) {
					uni.showToast({
						title: '登录失败，请检查用户名和密码',
						icon: 'none'
					});
				}
			}
		}
	}
</script>

<style>
	/* 样式代码 */
	.container {
		padding: 20px;
	}

	.form-item {
		margin-bottom: 20px;
	}
</style>