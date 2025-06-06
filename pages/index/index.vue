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
								<view :class="{ currentActive: currentQuick === item.id }" class="menu-item-current">
									<image :src="getMenuIconUrl(item.icon)" mode="scaleToFill" class="menu-icon"
										@error="handleMenuIconError(item.id)" />
									<text class="menu-text">{{ item.name }}</text>
								</view>

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
			<view class="main-content-container">
				<!-- 左侧导航 -->
				<scroll-view scroll-y class="left-nav">
					<view v-for="(item, index) in main_coverage" :key="index" class="category-item"
						:class="{ active: activeIndex === index }" @tap="switchCategory(index)">
						{{ item.name }}
					</view>
				</scroll-view>

				<!-- 右侧内容 -->
				<scroll-view scroll-y class="right-content" :scroll-top="scrollTop" @scroll="onScroll"
					scroll-with-animation>
					<view v-for="(item, index) in main_coverage" :key="index" class="right-category"
						:id="`category-${index}`">
						<view class="category-title">{{ item.name }}</view>
						<view class="child-grid">
							<view v-for="(citem, cindex) in item.children" :key="cindex" class="child-item"
								@tap="handleChildItemTap(citem)">
								<view class="child-content">
									<image :src="`${baseLink}/img/${citem.icon}`" class="child-icon" />
									<text class="child-text">{{ citem.name }}</text>
								</view>
							</view>
						</view>
					</view>
				</scroll-view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		u_logo,
		u_bannerlist,
		u_midMenulist,
		u_rightMenulist
	} from '@/api'
	import {
		info_screen
	} from '@/utils/scheme/screen.js'
	import 'url-search-params-polyfill';

	// 常量定义
	const DEFAULT_BANNER_RATIO = 671 / 2090; // 轮播图默认宽高比
	const MENU_ITEMS_PER_PAGE = 5; // 每页菜单项数量
	const DEFAULT_MENU_ICON = '/static/public/default-icon.png';
	const SCROLL_THRESHOLD = 10; // 滚动激活阈值(px)

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
				main_coverage: [], // 主内容区域数据
				activeIndex: 0, // 当前激活的分类索引
				scrollTop: 0, // 右侧滚动位置
				categoryTopPositions: [], // 分类位置数组
				currentQuick: '', //当前点击快捷入口ID
			};
		},

		computed: {
			// 当前用户信息
			userInfo() {
				return uni.getStorageSync('user_info') || null;
			},

			// 安全的公司名称显示
			userCompanyName() {
				return this.userInfo?.companyName?.trim() || '未知';
			},

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
			},

			// 安全的Logo地址
			safeLogo() {
				return this.logo || '/static/default-logo.png';
			},

			// 轮播图高度
			swiperHeight() {
				const screenWidth = this.screenInfo.screenWidth || 150;
				return screenWidth * DEFAULT_BANNER_RATIO;
			},

			// 有效的轮播图数据
			validBanners() {
				return this.bannerList.filter(item => item?.img?.trim());
			},

			// 是否有轮播图数据
			hasBannerData() {
				return this.validBanners.length > 0 && !this.isLoading;
			},

			// 有效的菜单数据
			validMenuItems() {
				return this.menuList.filter(item => item?.name?.trim());
			},

			// 菜单分页数据
			menuPages() {
				const pages = [];
				const items = [...this.validMenuItems];

				while (items.length) {
					pages.push(items.splice(0, MENU_ITEMS_PER_PAGE));
				}

				return pages;
			},

			// 是否有菜单数据
			hasMenuData() {
				return this.validMenuItems.length > 0 && !this.isLoading;
			}
		},

		methods: {
			// 阻止默认滚动行为
			handleTouchMove() {
				return false;
			},
			// 切换分类
			switchCategory(index) {
				if (index >= 0 && index < this.categoryTopPositions.length) {
					this.activeIndex = index;
					this.scrollTop = this.categoryTopPositions[index];
				}
			},

			// 计算分类位置
			calculateCategoryPositions() {
				return new Promise(resolve => {
					if (!this.main_coverage.length) {
						resolve();
						return;
					}

					const query = uni.createSelectorQuery().in(this);
					query.selectAll('.right-category').boundingClientRect(rects => {
						if (rects && rects.length) {
							const positions = [];
							let currentTop = 0;

							rects.forEach((rect, index) => {
								positions[index] = currentTop;
								currentTop += rect.height;
							});

							this.categoryTopPositions = positions;
						}
						resolve();
					}).exec();
				});
			},

			// 滚动事件处理
			onScroll(e) {
				const scrollTop = e.detail.scrollTop;
				const positions = this.categoryTopPositions;

				if (!positions.length) return;

				// 查找当前激活的分类
				let activeIndex = 0;
				for (let i = positions.length - 1; i >= 0; i--) {
					if (scrollTop >= positions[i] - SCROLL_THRESHOLD) {
						activeIndex = i;
						break;
					}
				}

				if (this.activeIndex !== activeIndex) {
					this.activeIndex = activeIndex;
				}
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

			// 初始化应用Logo
			async initialLogo() {
				try {
					const res = await u_logo();
					if (res?.content?.img) {
						this.logo = `${this.baseLink}/img/${res.content.img}`;
					} else {
						throw new Error('无效的Logo响应结构');
					}
				} catch (error) {
					console.error('[Logo] 获取失败:', error);
					this.logo = '/static/fallback-logo.png';
				}
			},

			// 初始化轮播图数据
			async initialBannerList() {
				this.isLoading = true;

				try {
					const response = await u_bannerlist({
						terminalId: 0
					});
					this.bannerList = Array.isArray(response?.content) ?
						response.content : [];
				} catch (error) {
					console.error('[Banner] 获取失败:', error);
					uni.showToast({
						title: '轮播图加载失败',
						icon: 'none'
					});
					this.bannerList = [];
				} finally {
					this.isLoading = false;
				}
			},

			// 初始化快捷菜单数据
			async initialMenuList() {
				this.isLoading = true;

				try {
					const response = await u_midMenulist({
						terminalId: -1
					});
					let menuItems = Array.isArray(response?.content) ?
						response.content : [];

					// 处理菜单数据
					this.menuList = menuItems.map((item, index) => ({
						...item,
						id: item.id || `menu-${Date.now()}-${index}`,
						icon: item.icon ?
							`${this.baseLink}/img/${item.icon}` : DEFAULT_MENU_ICON
					}));
				} catch (error) {
					console.error('[Menu] 获取失败:', error);
					uni.showToast({
						title: '菜单加载失败',
						icon: 'none'
					});
					this.menuList = [];
				} finally {
					this.isLoading = false;
				}
			},

			// 获取安全的轮播图URL
			getBannerUrl(imgPath) {
				return imgPath ?
					`${this.baseLink}/img/${imgPath.trim()}` :
					'/static/default-banner.jpg';
			},

			// 获取安全的菜单图标URL
			getMenuIconUrl(iconPath) {
				return (!iconPath || this.iconErrors.has(iconPath)) ?
					DEFAULT_MENU_ICON :
					iconPath;
			},

			// 轮播图加载错误处理
			handleImageError(index) {
				const banner = this.validBanners[index];
				if (banner?.img) {
					this.imageErrors.add(banner.img);
					console.warn(`[Banner] 加载失败: ${banner.img}`);
				}
			},

			// 菜单图标加载错误处理
			handleMenuIconError(id) {
				const menuItem = this.menuList.find(item => item.id === id);
				if (menuItem) {
					this.iconErrors.add(menuItem.icon);
					console.warn(`[MenuIcon] 加载失败: ${menuItem.icon}`);
				}
			},

			// 菜单项点击处理
			async handleMenuItemTap(item) {
				try {
					const response = await u_rightMenulist({
						menuId: item?.id,
						isDir: 1
					});

					// 更新数据并计算位置
					this.main_coverage = response?.content || [];
					await this.$nextTick();

					// 重置滚动位置
					this.activeIndex = 0;
					this.scrollTop = 0;
					this.currentQuick = item?.id
					// 计算新位置
					await this.calculateCategoryPositions();
				} catch (error) {
					console.error('[MainCoverage] 获取失败:', error);
					uni.showToast({
						title: '内容加载失败',
						icon: 'none'
					});
				}
			},

			// 子项点击处理
			handleChildItemTap(item) {
				console.log('子项点击:', item);
				// 这里添加实际跳转逻辑
			},

			// 跳转首页
			handleJumpHome() {
				uni.reLaunch({
					url: '/pages/index/index'
				});
			},

			// 跳转登录页
			handleNavigateToLogin() {
				uni.navigateTo({
					url: '/pages/login/login'
				});
			}
		},

		// 生命周期钩子
		async onShow() {
			this.isLoading = true;

			try {
				// 并行初始化任务
				await Promise.allSettled([
					this.initialScreenInfo(),
					this.initialLogo(),
					this.initialBannerList(),
					this.initialMenuList()
				]);

				// 初始化后计算位置
				await this.calculateCategoryPositions();
			} catch (error) {
				console.error('初始化失败:', error);
			} finally {
				this.isLoading = false;
			}
		}
	};
</script>

<style scoped>
	/* ===== 基础变量 ===== */
	:root {
		--primary-color: #007aff;
		--text-dark: #1a1a1a;
		--text-gray: #666;
		--text-light: #999;
		--bg-light: #f9f9f9;
		--border-radius: 12rpx;
		--box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
		--transition: all 0.3s ease;
	}

	/* ===== 基础布局 ===== */
	.container {
		width: 100%;
		display: flex;
		flex-direction: column;
		background: url('/static/public/bg.png') no-repeat center / cover;
		overflow-x: hidden;
	}

	.content-container {
		flex: 1;
		width: 100%;
		display: flex;
		flex-direction: column;
		padding-top: var(--navbar-height);
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
		box-shadow: var(--box-shadow);
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
		color: var(--text-dark);
		flex-grow: 1;
		letter-spacing: 0.5rpx;
	}

	.login-info {
		color: var(--text-gray);
		font-size: 26rpx;
		white-space: nowrap;
		padding: 0 12rpx;
		max-width: 40vw;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.login-btn {
		color: var(--primary-color);
		font-size: 26rpx;
		padding: 8rpx 20rpx;
		border: 1rpx solid var(--primary-color);
		border-radius: 28rpx;
		transition: var(--transition);
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
		border-radius: var(--border-radius);
		overflow: hidden;
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
		border-radius: var(--border-radius);
		box-shadow: var(--box-shadow);
		overflow: hidden;
		z-index: 5;
	}

	.menu-swiper {
		height: 200rpx;
	}

	.menu-grid {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-start;
		padding: 10rpx 0;
	}

	.menu-item {
		width: 20%;
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 20rpx;
		padding: 5rpx;
		box-sizing: border-box;
		transition: var(--transition);
	}

	.menu-item:active {
		transform: scale(0.95);

	}

	.menu-item-current {
		display: flex;
		flex-direction: column;
		align-items: center;
		line-height: 30rpx;
		padding: 10rpx 0;
	}

	.currentActive {
		background: rgb(169, 169, 169);
		height: 100%;
		color: #fff;
		border-radius: 8rpx;

	}

	.menu-icon {
		width: 60rpx;
		height: 60rpx;
		margin-bottom: 10rpx;
	}

	.menu-text {
		font-size: 22rpx;
		color: var(--text-dark);
		text-align: center;
		line-height: 1.2;
	}

	/* ===== 主内容区域 ===== */
	.main-content-container {
		flex: 1;
		width: 98%;
		margin: 10rpx auto 20rpx;
		display: flex;
		background: #fff;
		border-radius: var(--border-radius);
		box-shadow: var(--box-shadow);
		overflow: hidden;
	}

	.left-nav {
		width: 30%;
		background: url('/static/public/car-bg.png') no-repeat center / cover;
	}

	.right-content {
		width: 70%;
		padding: 20rpx;
		box-sizing: border-box;
	}

	.category-item {
		padding: 24rpx 20rpx;
		font-size: 28rpx;
		color: var(--text-gray);
		text-align: center;
		transition: var(--transition);
		position: relative;
	}

	.category-item.active {
		background-color: #fff;
		color: var(--primary-color);
		font-weight: bold;
	}

	.category-item.active::after {
		content: '';
		position: absolute;
		left: 0;
		top: 50%;
		transform: translateY(-50%);
		width: 6rpx;
		height: 60%;
		background-color: var(--primary-color);
		border-radius: 0 6rpx 6rpx 0;
	}

	.right-category {
		padding-bottom: 30rpx;
		margin-bottom: 20rpx;
	}

	.category-title {
		font-size: 30rpx;
		font-weight: 500;
		margin-bottom: 24rpx;
		padding-bottom: 12rpx;
		border-bottom: 1rpx solid #eee;
	}

	.child-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
	}

	.child-item {
		width: calc((100% - 32rpx) / 3);
		box-sizing: border-box;
	}

	.child-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 16rpx;
		border-radius: 8rpx;
		transition: var(--transition);
	}

	.child-content:active {
		background-color: var(--bg-light);
	}

	.child-icon {
		width: 60rpx;
		height: 60rpx;
		margin-bottom: 12rpx;
	}

	.child-text {
		font-size: 26rpx;
		text-align: center;
		line-height: 1.3;
	}

	/* ===== 通用占位符样式 ===== */
	.loading-placeholder,
	.empty-placeholder {
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: var(--bg-light);
		color: var(--text-light);
		font-size: 28rpx;
		border-radius: var(--border-radius);
	}

	.empty-placeholder {
		border: 1rpx dashed #eee;
	}

	.quick-container .loading-placeholder,
	.quick-container .empty-placeholder {
		height: 180rpx;
	}
</style>