<template>
	<!-- 主容器：高度动态适配屏幕 -->
	<view class="container" :style="{ height: `${safeScreenHeight}px` }" @touchmove.prevent="handleTouchMove">
		<!-- 自定义导航栏 -->
		<view class="custom-navbar" :style="{ height: navbarTotalHeight + 'px' }">
			<!-- 状态栏占位视图 -->
			<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

			<!-- 导航栏主体 -->
			<view class="nav-bar" :style="{ height: navBarHeight + 'px' }">
				<view class="title-container">
					<!-- Logo区域：点击返回首页 -->
					<image :src="safeLogo" mode="widthFix" @tap="handleJumpHome" class="logo-img" />

					<!-- 应用标题 -->
					<text class="title">智信通wiselink</text>

					<!-- 用户登录状态 -->
					<view v-if="userInfo" class="login-info">
						{{ userCompanyName }}(已登录)
					</view>
					<view v-else class="login-btn" @tap.stop="handleNavigateToLogin">
						去登录
					</view>
				</view>
			</view>
		</view>

		<!-- 内容容器：包裹所有可滚动内容 -->
		<view class="content-container" :style="{
			'--navbar-height': `${navbarTotalHeight}px`,
			'--swiper-height': `${swiperHeight}px`
		}">
			<!-- 轮播图区域 -->
			<view class="swiper-container">
				<!-- 轮播图组件：数据为空时不渲染 -->
				<swiper v-if="hasBannerData" :indicator-dots="false" :autoplay="true" :interval="3000" :duration="500"
					:circular="true" :style="{ height: `${swiperHeight}px` }">
					<swiper-item v-for="(item, index) in validBanners" :key="`banner-${item.id || index}`">
						<!-- 轮播图项：添加加载失败处理 -->
						<image :src="getBannerUrl(item.img)" mode="scaleToFill" @error="handleImageError(index)" />
					</swiper-item>
				</swiper>

				<!-- 轮播图加载状态提示 -->
				<view v-else-if="isLoading" class="loading-placeholder" :style="{ height: `${swiperHeight}px` }">
					<text>加载轮播图中...</text>
				</view>

				<!-- 轮播图空状态提示 -->
				<view v-else class="empty-placeholder" :style="{ height: `${swiperHeight}px` }">
					<text>暂无轮播图数据</text>
				</view>
			</view>

			<!-- 快捷菜单区域 -->
			<view class="quick-container">
				<!-- 快捷菜单轮播：数据为空时不渲染 -->
				<swiper v-if="hasMenuData" :indicator-dots="false" :autoplay="false" :circular="true"
					class="menu-swiper">
					<swiper-item v-for="(page, pageIndex) in menuPages" :key="`menu-page-${pageIndex}`">
						<view class="menu-grid">
							<view v-for="(item, itemIndex) in page" :key="`menu-${item.id || itemIndex}`"
								class="menu-item" @tap="handleMenuItemTap(item)">
								<!-- 菜单图标：带备用图和错误处理 -->
								<image :src="getMenuIconUrl(item.icon)" mode="scaleToFill" class="menu-icon"
									@error="handleMenuIconError(item.id)" />
								<text class="menu-text">{{ item.name }}</text>
							</view>
						</view>
					</swiper-item>
				</swiper>

				<!-- 快捷菜单加载状态 -->
				<view v-else-if="isLoading" class="loading-placeholder">
					<text>加载菜单中...</text>
				</view>

				<!-- 快捷菜单空状态 -->
				<view v-else class="empty-placeholder">
					<text>暂无菜单数据</text>
				</view>
			</view>

			<!-- 主内容区域：自动填充剩余空间 -->
			<view class="main-contentArea-container">
				<view style="width:34%;border: 1px solid red;">1</view>
				<view style="width: 64%;border: 1px solid gold;">2</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		u_logo,
		u_bannerlist,
		u_midMenulist
	} from '@/api'
	import {
		info_screen
	} from '@/utils/scheme/screen.js'
	import 'url-search-params-polyfill';
	// 常量定义
	const DEFAULT_BANNER_RATIO = 671 / 2090 // 轮播图默认宽高比 (16:9)
	const MENU_ITEMS_PER_PAGE = 5 // 每页菜单项数量
	const DEFAULT_MENU_ICON = '/static/public/default-icon.png'

	export default {
		data() {
			return {
				screenInfo: {}, // 屏幕信息对象
				logo: '', // Logo图片地址
				baseLink: 'https://k1sw.wiselink.net.cn', // 基础域名
				bannerList: [], // 轮播图原始数据
				menuList: [], // 菜单原始数据
				isLoading: false, // 全局加载状态
				imageErrors: new Set(), // 图片加载错误记录
				iconErrors: new Set(), // 图标加载错误记录
				contentData: [] // 主内容区域数据
			}
		},

		computed: {
			// 当前用户信息（响应式获取）
			userInfo() {
				return uni.getStorageSync('user_info') || null
			},

			// 安全的公司名称显示
			userCompanyName() {
				return this.userInfo?.companyName?.trim() || '未知'
			},

			// 状态栏高度（安全处理）
			statusBarHeight() {
				return this.screenInfo.statusBarHeight || 0
			},

			// 导航栏主体高度（iOS/Android适配）
			navBarHeight() {
				return this.screenInfo.platform === 'ios' ? 49 : 44
			},

			// 导航栏总高度（状态栏+导航栏）
			navbarTotalHeight() {
				return this.statusBarHeight + this.navBarHeight
			},

			// 安全的屏幕高度（带默认值）
			safeScreenHeight() {
				return this.screenInfo.screenHeight || 667 // 默认值
			},

			// 安全的Logo地址（带备用图）
			safeLogo() {
				return this.logo || '/static/default-logo.png'
			},

			// 轮播图高度（基于屏幕宽度和比例）
			swiperHeight() {
				const screenWidth = this.screenInfo.screenWidth || 150
				return screenWidth * DEFAULT_BANNER_RATIO
			},

			// 有效的轮播图数据（过滤空项）
			validBanners() {
				return this.bannerList.filter(
					item => item?.img?.trim()
				)
			},

			// 是否有轮播图数据
			hasBannerData() {
				return this.validBanners.length > 0 && !this.isLoading
			},

			// 有效的菜单数据（过滤空项）
			validMenuItems() {
				return this.menuList.filter(
					item => item?.name?.trim()
				)
			},

			// 菜单分页数据
			menuPages() {
				const pages = []
				const items = [...this.validMenuItems]

				while (items.length) {
					pages.push(items.splice(0, MENU_ITEMS_PER_PAGE))
				}

				return pages
			},

			// 是否有菜单数据
			hasMenuData() {
				return this.validMenuItems.length > 0 && !this.isLoading
			}
		},

		methods: {
			handleTouchMove(e) {
				// 阻止默认滚动行为
				return false;
			},
			/**
			 * 初始化屏幕信息
			 * 获取设备屏幕参数用于布局计算
			 */
			async initialScreenInfo() {
				try {
					this.screenInfo = await info_screen()
				} catch (error) {
					console.error('[ScreenInfo] 获取屏幕信息失败:', error)
					uni.showToast({
						title: '设备信息获取失败',
						icon: 'none'
					})
				}
			},

			/**
			 * 初始化应用Logo
			 * 从API获取Logo地址，失败时使用备用图
			 */
			async initialLogo() {
				try {
					const res = await u_logo()
					// 验证API响应结构
					if (res?.content?.img) {
						this.logo = `${this.baseLink}/img/${res.content.img}`
					} else {
						throw new Error('无效的Logo响应结构')
					}
				} catch (error) {
					console.error('[Logo] 获取失败:', error)
					this.logo = '/static/fallback-logo.png'
				}
			},

			/**
			 * 初始化轮播图数据
			 * 获取轮播图列表并处理异常情况
			 */
			async initialBannerList() {
				this.isLoading = true

				try {
					const response = await u_bannerlist({
						terminalId: 0
					})

					// 验证响应数据格式
					if (Array.isArray(response?.content)) {
						this.bannerList = response.content
					} else {
						console.warn('[Banner] 数据格式异常', response)
						this.bannerList = []
					}
				} catch (error) {
					console.error('[Banner] 获取失败:', error)
					uni.showToast({
						title: '轮播图加载失败',
						icon: 'none'
					})
					this.bannerList = []
				} finally {
					this.isLoading = false
				}
			},
			/**
			 * 初始化快捷菜单数据
			 * 获取菜单列表并处理异常情况
			 */
			async initialMenuList() {
				this.isLoading = true

				try {
					const response = await u_midMenulist({
						terminalId: -1
					})
					let menuItems = response?.content || []

					// 验证数据格式
					if (!Array.isArray(menuItems)) {
						console.warn('[Menu] 数据格式异常', response)
						menuItems = []
					}

					// 处理图标路径并添加唯一ID
					this.menuList = menuItems.map((item, index) => ({
						...item,
						id: item.id || `menu-${Date.now()}-${index}`,
						icon: item.icon ? `${this.baseLink}/img/${item.icon}` : DEFAULT_MENU_ICON
					}))
				} catch (error) {
					console.error('[Menu] 获取失败:', error)
					uni.showToast({
						title: '菜单加载失败',
						icon: 'none'
					})
					this.menuList = []
				} finally {
					this.isLoading = false
				}
			},

			/**
			 * 生成安全的轮播图URL
			 * @param {string} imgPath 图片路径
			 * @returns {string} 完整图片URL
			 */
			getBannerUrl(imgPath) {
				if (!imgPath) return '/static/default-banner.jpg'
				return `${this.baseLink}/img/${imgPath.trim()}`
			},

			/**
			 * 生成安全的菜单图标URL
			 * @param {string} iconPath 图标路径
			 * @returns {string} 完整图标URL
			 */
			getMenuIconUrl(iconPath) {
				// 如果已经标记为错误或无效路径，返回默认图标
				if (!iconPath || this.iconErrors.has(iconPath)) {
					return DEFAULT_MENU_ICON
				}
				return iconPath
			},

			/**
			 * 处理轮播图加载错误
			 * @param {number} index 图片索引
			 */
			handleImageError(index) {
				const banner = this.validBanners[index]
				if (banner?.img) {
					this.imageErrors.add(banner.img)
					console.warn(`[Banner] 加载失败: ${banner.img}`)
				}
			},

			/**
			 * 处理菜单图标加载错误
			 * @param {string} id 菜单项ID
			 */
			handleMenuIconError(id) {
				const menuItem = this.menuList.find(item => item.id === id)
				if (menuItem) {
					this.iconErrors.add(menuItem.icon)
					console.warn(`[MenuIcon] 加载失败: ${menuItem.icon}`)
				}
			},

			/**
			 * 菜单项点击处理
			 * @param {Object} item 菜单项对象
			 */
			handleMenuItemTap(item) {
				console.log('[Menu] 点击:', item)
				// TODO: 根据实际需求实现跳转逻辑
				// uni.navigateTo({ url: item.link })
			},

			// 跳转首页
			handleJumpHome() {
				uni.reLaunch({
					url: '/pages/index/index'
				})
			},

			// 跳转登录页
			handleNavigateToLogin() {
				uni.navigateTo({
					url: '/pages/login/login'
				})
			}
		},

		// 生命周期钩子
		onShow() {
			// 重置加载状态
			this.isLoading = true

			// 并行初始化任务（添加错误捕获）
			Promise.allSettled([
				this.initialScreenInfo(),
				this.initialLogo(),
				this.initialBannerList(),
				this.initialMenuList()
			]).then(results => {
				results.forEach((result, index) => {
					if (result.status === 'rejected') {
						console.error(`初始化任务${index}失败:`, result.reason)
					}
				})
				this.isLoading = false
			}).catch(() => {
				this.isLoading = false
			})
		}
	}
</script>

<style scoped>
	/* ===== 基础布局 ===== */
	.container {
		width: 100%;
		display: flex;
		flex-direction: column;
		background: url('/static/public/bg.png') no-repeat center / cover;
		align-items: center;
		overflow-x: hidden;
	}

	/* 新增：内容容器（弹性容器，填充剩余空间） */
	.content-container {
		flex: 1;
		width: 100%;
		display: flex;
		flex-direction: column;
		padding-top: var(--navbar-height);
		/* 使用变量传递导航栏高度 */
		overflow: hidden;
	}

	/* ===== 导航栏样式 ===== */
	.custom-navbar {
		width: 100%;
		position: fixed;
		top: 0;
		left: 0;
		z-index: 1000;
		background: rgba(255, 255, 255, 0.98);
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
		backdrop-filter: blur(10rpx);
	}

	.nav-bar {
		display: flex;
		align-items: center;
		padding: 0 24rpx;
		box-sizing: border-box;
	}

	.title-container {
		display: flex;
		align-items: center;
		gap: 20rpx;
		height: 100%;
		width: 100%;
	}

	.logo-img {
		width: 40rpx;
		height: 40rpx;
		flex-shrink: 0;
	}

	.title {
		font-family: 'PingFang SC', system-ui, sans-serif;
		font-weight: 700;
		font-size: 34rpx;
		color: #1a1a1a;
		flex-grow: 1;
		letter-spacing: 0.5rpx;
	}

	.login-info {
		color: #666;
		font-size: 26rpx;
		white-space: nowrap;
		padding: 0 12rpx;
		max-width: 40vw;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.login-btn {
		color: #007aff;
		font-size: 26rpx;
		padding: 8rpx 20rpx;
		border: 1rpx solid #007aff;
		border-radius: 28rpx;
		transition: all 0.2s;
	}

	.login-btn:active {
		background-color: rgba(0, 122, 255, 0.1);
	}

	/* ===== 轮播图区域 ===== */
	.swiper-container {
		width: 98%;
		margin: 10rpx auto 0;
		position: relative;
		z-index: 10;
	}

	swiper {
		width: 100%;
	}

	swiper image {
		width: 100%;
		height: 100%;
		display: block;
	}

	/* ===== 快捷菜单区域 ===== */
	.quick-container {
		width: 98%;
		margin: 10rpx auto 0;
		position: relative;
		background-color: #fff;
		border-radius: 12rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
		overflow: hidden;
		z-index: 5;
	}

	.menu-swiper {
		height: 200rpx;
		/* 固定高度确保布局稳定 */
	}

	.menu-grid {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		padding: 10rpx 0;
	}

	.menu-item {
		width: 20%;
		/* 5项每行 */
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 20rpx;
		padding: 10rpx;
		box-sizing: border-box;
	}

	.menu-icon {
		width: 60rpx;
		height: 60rpx;
		margin-bottom: 10rpx;
	}

	.menu-text {
		font-size: 22rpx;
		color: #333;
		text-align: center;
		line-height: 1.2;
	}

	/* 主内容区域：自动填充剩余空间 */
	.main-contentArea-container {
		flex: 1;
		width: 98%;
		margin: 10rpx auto;
		display: flex;
		flex-direction: row;
		background: #fff;
		border-radius: 12rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
		overflow: hidden;
		justify-content: space-between;
		min-height: 200rpx;
		/* 最小高度保证可见性 */
	}


	/* ===== 通用占位符样式 ===== */
	.loading-placeholder,
	.empty-placeholder {
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: #f9f9f9;
		color: #999;
		font-size: 28rpx;
		border-radius: 12rpx;
	}

	.empty-placeholder {
		border: 1rpx dashed #eee;
	}

	.quick-container .loading-placeholder,
	.quick-container .empty-placeholder {
		height: 180rpx;
	}
</style>