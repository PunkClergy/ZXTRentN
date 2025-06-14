<template>
	<view class="container" :style="{ height: `${safeScreenHeight}px` }">
		<CustomNavBar :title="title" />
		<!-- 主容器 -->
		<view class="record-container" :style="'margin-top: ' + (navbarTotalHeight) + 'px;'">
			<!-- 标签切换区域 -->
			<view class="record-tabs">
				<view class="record-tabs-item" :class="(g_activeTab==1? 'tabs-active-1' : 'tabs-no-active-1')"
					@tap="handleSwitchTab(1)">人员列表</view>
				<view class="record-tabs-item" :class="(g_activeTab==2? 'tabs-active-2' : 'tabs-no-active-2')"
					@tap="handleSwitchTab(2)">
					权限管理
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
										<text>{{ item.realname }}</text>
									</view>
								</view>
								<view class="head-right">
									<image src="/static/public/_edit.png" :data-item="item" @tap="handleEdit(item)" />
									<image src="/static/public/_delete.png" :data-id="item.id"
										@tap="handleDelete(item)" />
								</view>
							</view>

							<view class="content-item-info">
								<view :class="'info-item  ' + (item?.username?.length > 15 ? 'long-info-item' : '')">
									<label>账号:</label>
									<text>{{ item?.username || '-' }}</text>
								</view>
								<view :class="'info-item  ' + (item?.roleName?.length > 15 ? 'long-info-item' : '')">
									<label>角色:</label>
									<text>{{ item?.roleName || '-' }}</text>
								</view>
								<view :class="'info-item  ' + (item?.mobile?.length > 15 ? 'long-info-item' : '')">
									<label>手机号:</label>
									<text>{{ item?.mobile || '-' }}</text>
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
							<text>权限设置</text>
						</view>
						<ly-tree ref="tree" :props="props" :tree-data="treeData" node-key="id" show-checkbox
							expand-on-check-node default-expand-all :check-strictly="false" :defaultCheckedKeys=[1]
							@check-change="handleCheckChange" />
					</view>
					<view class="card-footer">
						<view @tap="handleSubmit">确认修改</view>
					</view>
				</scroll-view>

			</block>
		</view>
		<!-- 一键操作按钮 -->
		<view class="levitation-button" @tap="handleJumpInfo">
			<text>新增人员</text>
		</view>

		<view class="modal-mask" v-if="c_send_key_show_momal" @tap="handleHideSengKeyModal"></view>
		<view class="modal-base-map" v-if="c_send_key_show_momal">
			<form @submit="handleFormSubmit">
				<view class="modal-container">
					<view class="modal-container-head">
						<text>{{ user_text }}人员</text>
						<image src="/static/public/close.png" @tap="handleHideSengKeyModal" />
					</view>
					<view class="modal-container-middle">
						<view class="middle-form-item">
							<label>账号</label>
							<view class="modal-form-region">
								<input placeholder="请输入账号" :value="g_uesr_details.username" name="username"
									style="text-align: right; font-size: 28rpx" />
							</view>
						</view>
						<view class="middle-form-item">
							<label>密码</label>
							<view class="modal-form-region">
								<input placeholder="请输入密码" :value="g_uesr_details.password" name="password"
									style="text-align: right; font-size: 28rpx" />
							</view>
						</view>
						<view class="middle-form-item">
							<label>姓名</label>
							<view class="modal-form-region">
								<input placeholder="请输入姓名" :value="g_uesr_details.realname" name="realname"
									style="text-align: right; font-size: 28rpx" />
							</view>
						</view>
						<view class="middle-form-item">
							<label>手机号</label>
							<view class="modal-form-region">
								<input placeholder="请输入手机号" :value="g_uesr_details.mobile" name="mobile"
									style="text-align: right; font-size: 28rpx" />
							</view>
						</view>
					</view>
					<view class="modal-container-footer">
						<button formType="submit">确认</button>
					</view>
				</view>
			</form>
		</view>

	</view>
</template>

<script>
	import {
		u_roleapigetRole,
		u_childUserList,
		u_getMenuTree,
		u_addOrUpdateChildUser,
		u_delChildUser
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
				title: '角色与人员',
				screenInfo: {}, // 屏幕信息对象
				g_page: 1, // 当前页码
				g_items: [], // 角色列表数据
				g_activeTab: 1, // 当前激活的标签页(1:车辆列表 2:新增车辆)
				props: function() {
					return {
						// 这里的label就可以使用函数进行自定义的渲染了
						label(data, node) {
							return node.data.name;
						},

					}
				},
				treeData: [],
				c_send_key_show_momal: false,
				user_text: '新增',
				g_uesr_details: {
					username: '',
					password: '',
					realname: '',
					mobile: ''
				},
			};
		},
		onLoad(options) {
			// 页面加载时逻辑
			console.log(options)
			this.initGetTitle(options)
		},
		onShow() {
			// 页面显示时初始化
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
			// 获取当前角色信息
			initGetTitle(evt) {
				if (evt?.name) {
					this.title = evt?.name
					this.initialRoleList(evt?.name)
				}
			},
			async initGetMenuTree(evt) {
				try {
					const res = await u_getMenuTree({
						roleId: evt
					});
					// 合并新数据
					this.treeData = res?.content || []
				} catch (error) {
					console.error('获取权限列表失败:', error);
				}
			},
			// 编辑角色信息
			handleEdit(evt) {
				// 此处是修改人员
				this.g_uesr_details = evt
				this.c_send_key_show_momal = true
				this.user_text = "修改"
			},

			// 切换标签页
			handleSwitchTab(evt) {
				this.g_activeTab = evt
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

			// 根据角色名称获取角色ID
			async initialRoleList(evt) {
				try {
					const res = await u_roleapigetRole({
						roleName: evt,
						isAutoCreate: 1
					});
					this.role_id = res?.content?.id
					this.$nextTick(() => {
						this.initChildUser(res?.content?.id);
						this.initGetMenuTree(res?.content?.id)
					});

				} catch (error) {
					console.error('获取角色列表失败:', error);
				}
			},

			// 根据角色ID获取人员列表
			async initChildUser(evt) {
				try {
					const res = await u_childUserList({
						roleId: evt,
					});
					console.log(res)
					this.g_items = res?.content || []

				} catch (error) {
					console.error('获取角色列表失败:', error);
				}
			},

			// 确认修改
			async handleSubmit() {},
			// 点击出现弹窗
			handleJumpInfo() {
				this.c_send_key_show_momal = true
			},
			// 点击关闭弹窗
			handleHideSengKeyModal() {
				this.c_send_key_show_momal = false
				this.g_uesr_details = {}
				this.user_text = "新增"
			},
			// 删除人员
			async handleDelete(evt) {

				try {
					const res = await u_delChildUser({
						id: evt?.id
					});
					this.$nextTick(() => {
						this.initChildUser(this.role_id);
					});

				} catch (error) {
					console.error('删除失败:', error);
				}
			},
			// 新增人员
			async handleFormSubmit(evt) {
				const temp = {
					...evt.detail.value,
					roleId: this.role_id
				}
				console.log((temp))
				try {
					const res = await u_addOrUpdateChildUser(temp);
					console.log(res)
					if (res?.code == 1000) {
						uni.showToast({
							title: res.msg, // 提示的内容
							icon: 'none', // 图标类型，可选值有"success"、"loading"、"none"
							duration: 2000 // 提示的持续时间，单位为毫秒
						});
						this.c_send_key_show_momal = false
						this.g_uesr_details = {
							username: '',
							password: '',
							realname: '',
							mobile: ''
						}
						this.$nextTick(() => {
							this.initChildUser(this.role_id);
						});
					} else {
						uni.showToast({
							title: res.msg, // 提示的内容
							icon: 'none', // 图标类型，可选值有"success"、"loading"、"none"
							duration: 2000 // 提示的持续时间，单位为毫秒
						});
					}
				} catch (error) {
					console.error('获取角色列表失败:', error);
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