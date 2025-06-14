<template>
	<view class="container" :style="{ height: `${safeScreenHeight}px` }">
		<CustomNavBar title="个性化角色" />
		<!-- 主容器 -->
		<view class="record-container" :style="'margin-top: ' + (navbarTotalHeight) + 'px;'">
			<!-- 标签切换区域 -->
			<view class="record-tabs">
				<view class="record-tabs-item" :class="(g_activeTab==1? 'tabs-active-1' : 'tabs-no-active-1')"
					@tap="handleSwitchTab(1)">角色列表</view>
				<view class="record-tabs-item" :class="(g_activeTab==2? 'tabs-active-2' : 'tabs-no-active-2')"
					@tap="handleSwitchTab(2)">
					{{ btnState }}角色
				</view>
			</view>

			<!-- 角色列表区域 -->
			<block v-if="g_activeTab == 1">
				<scroll-view style="height: 100vh" scroll-y>
					<block v-for="(item, index) in g_items" :key="index">
						<view class="content-item">
							<view class="content-item-head">
								<view class="head-left">
									<view class="left-category">
										<text>{{ item.name }}</text>
									</view>
								</view>
								<view class="head-right">
									<image src="/static/public/_edit.png" :data-item="item" @tap="handleEdit(item)" />
									<image src="/static/public/SetUp.png" :data-item="item" @tap="handleSetUp(item)" />
									<image src="/static/public/_delete.png" :data-id="item.id"
										@tap="handleDelete(item)" />
								</view>
							</view>

							<view class="content-item-info">
								<view :class="'info-item  ' + (item?.bak?.length > 15 ? 'long-info-item' : '')">
									<label>说明:</label>
									<text>{{ item?.bak || '-' }}</text>
								</view>
							</view>
						</view>
					</block>
				</scroll-view>
			</block>

			<!-- 新增车辆区域 -->
			<block v-if="g_activeTab == 2">
				<scroll-view scroll-y style="height: 100vh">
					<view class="card-info">

						<view class="card-head">
							<text>基础信息</text>
						</view>
						<!-- 角色名称 -->
						<view class="card-info-item">
							<label class="form-label">
								角色名称<text class="required-mark">*</text>
							</label>
							<input class="form-input" placeholder="请输入角色名称" :value="params?.name" maxlength="10"
								placeholder-style="color: #999;" @input="(e)=>handleBindinput(e,'name')" />
						</view>
						<!-- 说明 -->
						<view class="card-info-item">
							<label>说明</label>
							<input class="form-input" placeholder="请输入说明" :value="params?.bak"
								placeholder-style="color: #999;" @input="(e)=>handleBindinput(e,'bak')" />
						</view>
						<view class="card-head">
							<text>权限设置</text>
						</view>

						<ly-tree ref="tree" :props="props" :tree-data="treeData" node-key="id" show-checkbox
							expand-on-check-node default-expand-all :check-strictly="false" :defaultCheckedKeys=[1]
							@check-change="handleCheckChange" />


					</view>
					<view class="card-footer">
						<view @tap="handleSubmit">确认{{ btnState }}</view>
					</view>
				</scroll-view>

			</block>
		</view>
	</view>
</template>

<script>
	import {
		u_getCarList,
		u_addOrUpdateCar,
		u_roleapiList,
		u_getMenuTree,
		u_roleapidel
	} from '@/api'
	import CustomNavBar from "@/components/custom-header/index.vue";

	import LyTree from '@/components/ly-tree/ly-tree.vue'
	import {
		info_screen
	} from '@/utils/scheme/screen.js'

	export default {
		components: {
			CustomNavBar,
			LyTree
		},
		data() {
			return {
				screenInfo: {}, // 屏幕信息对象
				g_page: 1, // 当前页码
				g_items: [], // 角色列表数据
				g_activeTab: 1, // 当前激活的标签页(1:角色列表 2:新增觉)
				btnState: '新增', // 按钮显示文本
				params: {},
				props: function() {
					return {
						// 这里的label就可以使用函数进行自定义的渲染了
						label(data, node) {
							return node.data.name;
						},

					}
				},
				treeData: []

			};
		},
		onLoad(options) {
			// 页面加载时逻辑
		},
		onShow() {
			// 页面显示时初始化
			this.initialRoleList()
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
			handleCheckChange(evt) {
				console.log(evt)
			},
			handleSetUp(evt) {
				uni.navigateTo({
					url: '/pages/system/role/reserve/index?name=' + evt?.name
				})
			},
			// 编辑角色信息
			handleEdit(evt) {
				this.btnState = '修改'
				this.params = evt
				this.g_activeTab = 2
				this.$nextTick(() => {
					this.initGetMenuTree();
				});
			},

			// 切换标签页
			handleSwitchTab(evt) {
				this.g_activeTab = evt
				if (evt == 1) {
					this.params = {}
					this.btnState = '新增'
				} else {
					this.$nextTick(() => {
						this.initGetMenuTree();
					});
				}
			},
			async initGetMenuTree() {
				try {
					const res = await u_getMenuTree({});
					// 合并新数据
					this.treeData = res?.content || []
				} catch (error) {
					console.error('获取权限列表失败:', error);
				}
			},
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

			// 获取角色列表
			async initialRoleList() {
				try {
					const res = await u_roleapiList({});
					// 合并新数据
					this.g_items = res?.content || []
				} catch (error) {
					console.error('获取角色列表失败:', error);
				}
			},

			// 编辑角色信息回调
			handleBindinput(evt, text) {
				this.params[text] = evt.detail.value
			},

			// 确认修改
			async handleSubmit() {},
			// 删除角色
			async handleDelete(evt) {
				console.log(evt)
				try {
					const res = await u_roleapidel({
						id: evt?.id
					});
					this.$nextTick(() => {
						this.initialRoleList();
					});

				} catch (error) {
					console.log('删除失败')
				}

			}
		}
	};
</script>
<style>
	@import './index.css';

	.required-mark {
		color: #f56c6c;
		margin-left: 8rpx;
	}

	/* 容器样式 */
	.container {
		height: 100vh;
		padding: 10rpx 0rpx;
		background-image: url(/static/public/car-bg.png);
		background-size: cover;
	}

	/* 记录容器 */
	.record-container {
		width: 98%;
		margin: auto;
		position: relative;
		border-radius: 12rpx;
		background-color: #fff;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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

	/* 内容项样式 */
	.content-item {
		margin: 10rpx;
		background-color: #ffffff;
		border-radius: 8px;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}

	.content-item-head {
		display: flex;
		justify-content: space-between;
		border-bottom: 1px solid #f0f0f0;
		padding: 20rpx 15rpx;
	}

	.head-left {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	.left-category {
		display: flex;
		align-items: center;
		font-family: PingFang SC;
		font-weight: bold;
		font-size: 26rpx;
		color: #333333;
		gap: 10rpx;
	}

	.left-category image {
		width: 43rpx;
		height: 35rpx;
	}

	.left-split_line {
		width: 1rpx;
		height: 28rpx;
		border-left: 1px solid #797979;
	}

	.left-brand {
		font-family: PingFang SC;
		font-weight: 500;
		font-size: 24rpx;
		color: #4587fd;
		border: 1px solid #4587fd;
		border-radius: 8rpx;
		padding: 0 15rpx;
	}

	.left-model {
		font-family: PingFang SC;
		font-weight: 500;
		font-size: 24rpx;
		color: #333333;
	}

	.head-right {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 50rpx;
	}

	.head-right image {
		width: 30rpx;
		height: 30rpx;
	}

	/* 信息区域样式 */
	.content-item-info {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-start;
		padding: 10rpx;
		gap: 20rpx;
		border-bottom: 1px solid #f0f0f0;
	}

	.info-item {
		flex: 0 0 48%;
		box-sizing: border-box;
		word-wrap: break-word;
		font-family: PingFang SC;
		font-weight: 500;
		font-size: 24rpx;
		color: #333333;
	}

	.long-info-item {
		flex-basis: 100% !important;
		/* 长内容占满整行 */
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