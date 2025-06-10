<template>
	<!-- 主容器：高度动态适配屏幕 -->
	<view class="container" :style="{ height: `${safeScreenHeight}px` }" @touchmove.prevent="handleTouchMove">
		<CustomNavBar title="车辆绑定" />
			
	</view>

</template>

<script>
	import {
		u_logo,
		u_bannerlist,
		u_midMenulist,
		u_rightMenulist,
	} from '@/api'
	import {
		info_screen
	} from '@/utils/scheme/screen.js'
	import 'url-search-params-polyfill';
	import CustomNavBar from "@/components/custom-header/index.vue";
	// 常量定义
	const DEFAULT_BANNER_RATIO = 671 / 2090; // 轮播图默认宽高比
	const MENU_ITEMS_PER_PAGE = 5; // 每页菜单项数量
	const DEFAULT_MENU_ICON = '/static/public/default-icon.png';
	const SCROLL_THRESHOLD = 10; // 滚动激活阈值(px)

	export default {
		components: {
			CustomNavBar
		},
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
				uni.navigateTo({
					url: '/pages/carRental/vehicleList/index',
					success: () => {
						console.log('跳转成功');
					},
					fail: (err) => {
						console.error('跳转失败', err);
					}
				});
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
					this.initialMenuList(),
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
	.record-container {
	  width: 98%;
	  height: 100%;
	  margin: auto;
	  position: relative;
	  border-radius: 12rpx;
	  background-color: #fff;
	  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}
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
		width: 96%;
		display: flex;
		flex-direction: column;
		padding-top: var(--navbar-height);
		overflow: hidden;
		margin: auto;
		border: 1px solid red;
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
</style>