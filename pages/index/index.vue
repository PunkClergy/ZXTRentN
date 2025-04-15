<template>
	<view class="container">
		<view class="intro">本项目已包含uni ui组件，无需import和注册，可直接使用。在代码区键入字母u，即可通过代码助手列出所有可用组件。光标置于组件名称处按F1，即可查看组件文档。</view>
		<text class="intro">详见：</text>
		<view v-for="(evt,index) in products">1</view>
		<uni-link :href="href" :text="href"></uni-link>
		<view @click.stop="handleNavigateToTargetPage">去登录</view>
	</view>
</template>

<script>
	import {
		u_navlist
	} from '@/api'
	export default {
		data() {
			return {
				href: 'https://k1sw.wiselink.net.cn/deskapi/navlist',
				products: []
			}
		},
		methods: {

			async loadProducts() {
				uni.showToast({ title:'111222222' }); // 弹窗测试
				const response = await u_navlist({
					page: 1,
					pageSize: 10
				})
				uni.showToast({ title: response.code||'111' }); // 弹窗测试
				try {
					const response = await u_navlist({
						page: 1,
						pageSize: 10
					})
					this.products = response.content
					uni.showToast({ title: response.code }); // 弹窗测试
				} catch (error) {
					console.error('获取商品失败', error)
				}
			},
			handleNavigateToTargetPage() {
				uni.navigateTo({
					url: '/pages/login/login'
				});
			}
		},
		onLoad() {
			
		
		},
		onShow() {
			this.loadProducts()

		}
	}
</script>

<style>
	.container {
		padding: 20px;
		font-size: 14px;
		line-height: 24px;
	}
</style>