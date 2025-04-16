<template>
	<view class="container">

		<view v-for="(evt,index) in products">
			<view>{{evt.text}}</view>
		</view>
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
			handleNavlist() {
				console.log(u_navlist)
				const response = u_navlist().then(response => {
					console.log(response)
					this.products = response.content

				})

			},
			handleNavigateToTargetPage() {
				uni.navigateTo({
					url: '/pages/login/login'
				});
			}
		},
		onLoad() {
			this.handleNavlist()
		},
		onShow() {


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