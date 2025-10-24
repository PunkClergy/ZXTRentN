<template>
	<view class="container"
		:style="'background-image: url(' + s_background_picture_of_the_front_page + ');height: ' + c_screen_height + 'px;'">
		<CustomNavBar title="角色列表与权限绑定" />
		<!-- index.wxml -->
		<view class="record-container"
			:style="'height: ' + (c_screen_height - (navBarHeight + statusBarHeight)) + 'px;margin-top: ' + (navBarHeight + statusBarHeight) + 'px;'">
			<!-- 切换部分 -->
			<view class="record-tabs" @tap="handleSwitchTab">
				<view class="record-tabs-item"
					:style="'background-image: url(' + (c_activeTab == 1 ? s_background_tabs_active_1 : s_background_tabs_1) + ');'">
					角色列表</view>
				<view class="record-tabs-item"
					:style="'background-image: url(' + (c_activeTab == 2 ? s_background_tabs_2 : s_background_tabs_active_2) + ');'">
					{{ btnState }}角色
				</view>
			</view>
			<!-- 详情区域部分 -->
			<block v-if="c_activeTab == 1">
				<scroll-view scroll-y
					:style="'height:' + (c_screen_height - (navBarHeight + statusBarHeight + 10 + 50)) + 'px;'"
					@scrolltolower="handleLower" @refresherrefresh="handleRefresh" :refresher-enabled="true"
					:refresher-triggered="g_triggered">
					<block v-for="(item, index) in g_items" :key="index">
						<view class="content-item">
							<view class="content-item-head">
								<view class="head-left">
									<view class="left-category">
										<text>{{ item.name }}</text>
									</view>
								</view>
								<view class="head-right">
									<image src="/static/assets/images/home/_edit.png" :data-item="item"
										@tap="handleEdit" />
									<!-- <image src="/assets/images/home/SetUp.png" data-item="{{item}}" bindtap="handleSetUp" /> -->
									<image src="/static/assets/images/home/_delete.png" :data-id="item.id"
										@tap="handleDelete" />
								</view>
							</view>
							<view class="content-item-info">
								<view :class="'info-item  ' + (item.bak.length > 15 ? 'long-info-item' : '')">
									<label>说明 ：</label>
									<text>{{ item.bak || '-' }}</text>
								</view>
							</view>
						</view>
					</block>
				</scroll-view>
			</block>
			<block v-if="c_activeTab == 2">
				<scroll-view scroll-y
					:style="'height:' + (c_screen_height - (navBarHeight + statusBarHeight + 10 + 50)) + 'px;'">
					<view class="long-range-control-car">
						<block>
							<view class="card-head">
								<text>基础信息</text>
							</view>
							<!-- 标题 -->
							<view class="long-range-control-car-subitem">
								<label>
									角色名称
									<text>*</text>
								</label>
								<view class="card-info-item-input">
									<input placeholder="请输入角色名称" :value="params.name" data-item="name"
										@input="handleBindinput" />
								</view>
							</view>
							<!-- 密码 -->
							<view class="long-range-control-car-subitem">
								<label>说明</label>
								<view class="card-info-item-input">
									<input placeholder="请输入说明" :value="params.bak" data-item="bak"
										@input="handleBindinput" />
								</view>
							</view>
						</block>

						<view style="height: 30rpx"></view>
						<block>
							<view class="card-head">
								<text>权限设置</text>
							</view>
							<view class="long-range-control-car-subitem">
								<view class="tree-container">
									<block v-for="(item, index) in tree" :key="index">
										<view class="node">
											<!-- 一级节点 -->
											<view class="node-header">
												<view :class="'arrow ' + (item.isExpanded ? 'expanded' : '')"
													v-if="item.children.length" @tap="toggleExpand" :data-id="item.id">
													▶
												</view>
												<view
													:class="'checkbox ' + (item.checked ? 'checked' : '') + ' ' + (item.indeterminate ? 'indeterminate' : '')"
													:data-id="item.id" @tap="handleCheck">
													<view class="checkmark" v-if="item.checked">✓</view>
													<view class="indeterminate-line" v-if="item.indeterminate"></view>
												</view>
												<text class="node-name">{{ item.name }}</text>
											</view>

											<!-- 二级节点 -->
											<view class="children" v-if="item.children.length && item.isExpanded">
												<block v-for="(item, index1) in item.children" :key="index1">
													<view class="child-node">
														<view class="node-header">
															<view
																:class="'arrow ' + (item.isExpanded ? 'expanded' : '')"
																v-if="item.children.length" @tap="toggleExpand"
																:data-id="item.id">
																▶
															</view>
															<view
																:class="'checkbox ' + (item.checked ? 'checked' : '') + ' ' + (item.indeterminate ? 'indeterminate' : '')"
																:data-id="item.id" @tap="handleCheck">
																<view class="checkmark" v-if="item.checked">✓</view>
																<view class="indeterminate-line"
																	v-if="item.indeterminate"></view>
															</view>
															<text class="node-name">{{ item.name }}</text>
														</view>

														<!-- 三级节点 -->
														<view class="children"
															v-if="item.children.length && item.isExpanded">
															<block v-for="(item, index2) in item.children"
																:key="index2">
																<view class="child-node">
																	<view class="node-header">
																		<view
																			:class="'arrow ' + (item.isExpanded ? 'expanded' : '')"
																			v-if="item.children.length"
																			@tap="toggleExpand" :data-id="item.id">
																			▶
																		</view>
																		<view :class="
                                                                                'checkbox ' + (item.checked ? 'checked' : '') + ' ' + (item.indeterminate ? 'indeterminate' : '')
                                                                            " :data-id="item.id" @tap="handleCheck">
																			<view class="checkmark" v-if="item.checked">
																				✓</view>
																			<view class="indeterminate-line"
																				v-if="item.indeterminate"></view>
																		</view>
																		<text class="node-name">{{ item.name }}</text>
																	</view>

																	<!-- 四级节点 -->
																	<view class="children"
																		v-if="item.children.length && item.isExpanded">
																		<block v-for="(item, index3) in item.children"
																			:key="index3">
																			<view class="child-node">
																				<view class="node-header">
																					<view
																						:class="'arrow ' + (item.isExpanded ? 'expanded' : '')"
																						v-if="item.children.length"
																						@tap="toggleExpand"
																						:data-id="item.id">
																						▶
																					</view>
																					<view :class="
                                                                                            'checkbox ' +
                                                                                            (item.checked ? 'checked' : '') +
                                                                                            ' ' +
                                                                                            (item.indeterminate ? 'indeterminate' : '')
                                                                                        " :data-id="item.id"
																						@tap="handleCheck">
																						<view class="checkmark"
																							v-if="item.checked">✓</view>
																						<view class="indeterminate-line"
																							v-if="item.indeterminate">
																						</view>
																					</view>
																					<text
																						class="node-name">{{ item.name }}</text>
																				</view>

																				<!-- 五级节点 -->
																				<view class="children"
																					v-if="item.children.length && item.isExpanded">
																					<block
																						v-for="(item, index4) in item.children"
																						:key="index4">
																						<view class="child-node">
																							<view class="node-header">
																								<view
																									:class="'checkbox ' + (item.checked ? 'checked' : '')"
																									:data-id="item.id"
																									@tap="handleCheck">
																									<view
																										class="checkmark"
																										v-if="item.checked">
																										✓</view>
																								</view>
																								<text
																									class="node-name">{{ item.name }}</text>
																							</view>
																						</view>
																					</block>
																				</view>
																			</view>
																		</block>
																	</view>
																</view>
															</block>
														</view>
													</view>
												</block>
											</view>
										</view>
									</block>
								</view>
							</view>
						</block>
						<view class="card-footer">
							<view @tap="handleSubmit">确认{{ btnState }}</view>
						</view>
					</view>
				</scroll-view>
			</block>
		</view>
	</view>
</template>

<script>
	import CustomNavBar from "@/components/custom-header/index.vue";

	import {
		u_user_roleapidel,
		u_user_getMenuTree,
		u_user_roleapiaddOrUpdate,
		u_user_roleapiList,
		u_setMenuTree
	} from '@/api';
	
	export default {
		components: {
			CustomNavBar
		},
		data() {
			return {




				// 导航栏高度，默认值
				s_background_tabs_1: '',

				//tabs背景
				s_background_tabs_2: '',

				//tabs背景
				s_background_tabs_active_1: '',

				//tabs背景
				s_background_tabs_active_2: '',

				//tabs背景
				searchBarHeight: 80,


				// 总导航高度 = 状态栏高度 + 导航栏高度
				g_page: 1,

				//列表页码
				g_items: [],

				//列表数据
				g_triggered: false,

				//下拉刷新状态
				c_tabs: [{
						name: '账号列表',
						value: '1'
					},
					{
						name: '新增账号',
						value: '2'
					}
				],

				//tabs切换签
				c_activeTab: 2,

				// 默认选中的Tab索引
				params: {
					name: '',
					bak: ''
				},

				//新增管控数据部分字段
				btnState: '新增',

				id: '',

				//修改标志
				tree: [],

				g_total: '',
				s_background_picture_of_the_front_page: ''
			};
		},
		onLoad(options) {
			if (options.status) {
				this.setData({
						c_activeTab: 2
					},
					() => {
						this.inittMenuTree();
					}
				);
			}
			this.initList();
		},
		onShow() {
			this.initialiImageBaseConversion();
			this.inittMenuTree();
		},
		methods: {
			// 切换复选框状态
			handleCheck(e) {
				const id = e.currentTarget.dataset.id;
				const tree = this.tree;
				this.toggleCheck(tree, id);
				this.updateParentStates(tree);
				this.setData({
					tree: [...tree]
				});
			},

			// 切换展开状态
			toggleExpand(e) {
				const id = e.currentTarget.dataset.id;
				const tree = this.tree;
				this.toggleNodeExpand(tree, id);
				this.setData({
					tree: [...tree]
				});
			},

			// 递归切换节点展开状态
			toggleNodeExpand(nodes, targetId) {
				nodes.forEach((node) => {
					if (node.id === targetId) {
						node.isExpanded = !node.isExpanded;
					} else if (node.children) {
						this.toggleNodeExpand(node.children, targetId);
					}
				});
			},

			// 递归切换选中状态
			toggleCheck(nodes, targetId) {
				nodes.forEach((node) => {
					if (node.id === targetId) {
						node.checked = !node.checked;
						this.toggleChildren(node.children, node.checked);
					} else if (node.children) {
						this.toggleCheck(node.children, targetId);
					}
				});
			},

			// 切换子节点状态
			toggleChildren(children, checked) {
				if (!children) {
					return;
				}
				children.forEach((child) => {
					child.checked = checked;
					this.toggleChildren(child.children, checked);
				});
			},

			// 更新所有父节点状态
			updateParentStates(nodes) {
				nodes.forEach((node) => {
					if (node.children && node.children.length) {
						this.checkParentState(node);
						this.updateParentStates(node.children);
					}
				});
			},

			// 计算父节点状态
			checkParentState(node) {
				const children = node.children;
				const allChecked = children.every((child) => child.checked);
				const someChecked = children.some((child) => child.checked || child.indeterminate);
				node.checked = allChecked;
				node.indeterminate = !allChecked && someChecked;
			},

			// 全屏背景图
			initialiImageBaseConversion() {
				const _this = this;
				const imageMap = [{
						path: '/static/assets/images/home/car-bg.png',
						key: 's_background_picture_of_the_front_page'
					},
					{
						path: '/static/assets/images/home/1-1.png',
						key: 's_background_tabs_1'
					},
					{
						path: '/static/assets/images/home/2-1.png',
						key: 's_background_tabs_active_1'
					},
					{
						path: '/static/assets/images/home/1-2.png',
						key: 's_background_tabs_2'
					},
					{
						path: '/static/assets/images/home/2-2.png',
						key: 's_background_tabs_active_2'
					}
				];
				const promises = imageMap.map(
					(item) =>
					new Promise((resolve, reject) => {
						uni.getFileSystemManager().readFile({
							filePath: item.path,
							encoding: 'base64',
							success: (res) => {
								resolve({
									[item.key]: `data:image/png;base64,${res.data}`
								});
							}
						});
					})
				);
				Promise.all(promises).then((results) => {
					const dataToUpdate = results.reduce(
						(acc, curr) => ({
							...acc,
							...curr
						}), {}
					);
					_this.setData(dataToUpdate);
				});
			},

			// 管控列表数据
			initList() {
				showLoading();
				const param = {
					// [u_roleapiList.page]: this.data.g_page,
				};
				byPost(
					`${getApp().globalData.data.k1swUrl}${u_roleapiList.URL}`,
					param,
					(response) => {
						if (response.data.code == 1000) {
							if (this.g_page > 1 && response.data.content.length === 0) {
								showToast(`已加载全部数据：共${this.g_items.length}条`);
							}
							this.setData({
									g_items: this.g_items.concat(response.data.content),
									g_total: Number(response.data.count || 0).toLocaleString()
								},
								() => {
									hideLoading();
								}
							);
						}
					},
					(error) => {
						hideLoading();
					}
				);
			},

			// 触底请求
			handleLower() {
				// this.setData({
				//   g_page: this.data.g_page + 1
				// }, () => {
				//   this.initList();
				// });
			},

			// 下拉刷新
			handleRefresh() {
				this.setData({
						g_triggered: false,
						g_page: 1,
						g_items: []
					},
					() => {
						this.initList();
					}
				);
			},

			// 新增账号字段输入回调
			handleBindinput(evt) {
				const {
					params
				} = this;
				params[evt.currentTarget.dataset.item] = evt.detail.value;
				this.setData({
					params: {
						...params
					}
				});
			},

			//  处理提交的权限树数据
			getCheckedIds(treeData) {
				const checkedIds = [];

				function traverse(nodes) {
					nodes.forEach((node) => {
						if (node.checked === true) {
							checkedIds.push(node.id);
						}
						if (node.children && node.children.length > 0) {
							traverse(node.children);
						}
					});
				}
				traverse(treeData);
				return checkedIds;
			},

			// 设置权限
			handleSetMenuTree(evt) {
				const checkedIds = this.getCheckedIds(this.tree).toString();
				const params = {
					[u_setMenuTree.roleId]: evt,
					[u_setMenuTree.menuIds]: checkedIds
				};
				byPost(
					`${getApp().globalData.data.k1swUrl}${u_setMenuTree.URL}`,
					params,
					(response) => {
						if (response.data.code == 1000) {}
					},
					(error) => {}
				);
			},

			//提交内容
			handleSubmit() {
				const {
					params,
					id
				} = this;
				const requiredFields = [{
					key: 'name',
					message: '请输入角色名称'
				}];

				// 检查必填字段
				for (const {
						key,
						message
					}
					of requiredFields) {
					if (!params?.[key]) {
						showToast(message);
						return;
					}
				}
				showLoading();
				byPost(
					`${getApp().globalData.data.k1swUrl}${u_roleapiaddOrUpdate.URL}`, {
						...params,
						id
					},
					(response) => {
						hideLoading();
						if (response?.data?.code != 1000) {
							showToast(response?.data?.msg);
							return;
						}
						showToast('添加成功');
						this.setData({
								c_activeTab: 1,
								params: {},
								btnState: '新增',
								g_triggered: false,
								g_page: 1,
								g_items: []
							},
							() => {
								this.initList();
								// 设置权限
								this.handleSetMenuTree(response?.data?.content?.id);
							}
						);
					},
					(error) => {
						hideLoading();
						showToast('提交失败，请稍后重试');
					}
				);
			},

			// 修改管控
			handleEdit(evt) {
				const info = evt.currentTarget.dataset.item;
				console.log(info);
				this.setData({
						...info,
						c_activeTab: 2,
						btnState: '修改',
						id: info?.id,
						params: {
							name: info.name,
							bak: info.bak
						}
					},
					() => {
						this.inittMenuTree();
					}
				);
			},

			// 设置
			handleSetUp(evt) {
				console.log(evt.currentTarget.dataset);
				const info = evt.currentTarget.dataset.item;
				uni.navigateTo({
					url: `/pages/system/roleSeparation/index?type=${info?.id}&name=${info.name}`
				});
			},

			// 切换tabs标签
			handleSwitchTab(e) {
				const flag = e._relatedInfo.anchorTargetText;
				if (flag == '角色列表') {
					this.setData({
						c_activeTab: 1,
						btnState: '新增',
						params: {},
						id: ''
					});
				}
				if (flag == '新增角色' || flag == '修改角色') {
					if (this.c_activeTab != 2) {
						this.setData({
								c_activeTab: 2
							},
							() => {
								this.inittMenuTree();
							}
						);
					}
				}
			},

			// 删除列表数据
			handleDelete(evt) {
				const _this = this;
				const id = evt?.currentTarget.dataset.id;
				const params = {
					[u_roleapidel.id]: id
				};
				byGet(`${getApp().globalData.data.k1swUrl}${u_roleapidel.URL}`, params).then((allRes) => {
					if (allRes?.data?.code == 1000) {
						_this.setData({
								g_triggered: false,
								g_page: 1,
								g_items: []
							},
							() => {
								_this.initList();
							}
						);
					}
				});
			},

			// 处理权限数据
			convertMenuData(originalData) {
				const convertNode = (node) => {
					// if (node.isdelete === 1) return null;
					const converted = {
						id: node.id,
						name: node.name,
						checked: node?.checked,
						indeterminate: false,
						isExpanded: true,
						children: []
					};
					if (node.children && node.children.length > 0) {
						node.children.forEach((child) => {
							const convertedChild = convertNode(child);
							if (convertedChild) {
								converted.children.push(convertedChild);
							}
						});
					}
					return converted;
				};
				const result = [{
					id: 1,
					name: '全部',
					checked: false,
					indeterminate: false,
					isExpanded: true,
					children: []
				}];
				originalData.forEach((item) => {
					if (item.parentid === -1 && item.isdelete === 0) {
						const converted = convertNode(item);
						if (converted) {
							result[0].children.push(converted);
						}
					}
				});
				return result;
			},

			// 获取权限树数据
			inittMenuTree() {
				byGet(getApp().globalData.data.k1swUrl + u_getMenuTree.URL, {
					roleId: this.id || ''
				}).then((response) => {
					if (response.statusCode == 200) {
						const list = response.data.content;
						const convertedData = this.convertMenuData(list);
						this.setData({
							tree: convertedData
						});
					} else {
						showToast('请求失败，请稍后再试');
						hideLoading();
					}
				});
			}
		}
	};
</script>
<style>
	.container {
		height: 100vh;
		padding: 10rpx 4rpx;
	}

	.record-container {
		width: 96%;
		margin: auto;
		position: relative;
		border-radius: 12rpx;
		background-color: #fff;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}

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
		background-repeat: no-repeat;
		background-size: cover;
		background-position: center;
		touch-action: pan-x;
		font-family: PingFang SC;
		font-weight: bold;
		font-size: 28rpx;
		color: #010101;
	}

	.record-tabs-1 {
		display: flex;
		padding: 10rpx;
		justify-content: space-between;
		align-items: center;
	}

	.tabs-1-title {
		display: flex;
		align-items: center;
		gap: 6rpx;
	}

	.tabs-1-title text {
		font-family: PingFang SC;
		font-weight: bold;
		font-size: 26rpx;
		color: #333333;
	}

	.tabs-1-title image {
		width: 42rpx;
		height: 46rpx;
	}

	/* 内容项 */
	.content-item {
		margin: 10rpx;
		background-color: #ffffff;
		border-radius: 8px;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}

	.content-item-head {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		border-bottom: 1px solid #f0f0f0;
		padding: 20rpx 15rpx;
	}

	.head-left {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	.left-model {
		font-family: PingFang SC;
		font-weight: 500;
		font-size: 24rpx;
		color: #333333;
	}

	.head-right {
		display: flex;
		flex-direction: row;
		gap: 40rpx;
		align-items: center;
		justify-content: center;
	}

	.head-right image {
		width: 30rpx;
		height: 30rpx;
	}

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
		transition: all 0.3s;
		font-family: PingFang SC;
		font-weight: 500;
		font-size: 24rpx;
		color: #333333;
	}

	.long-info-item {
		flex-basis: 100% !important;
		/* 长内容时占满整行 */
	}

	/* alarm-add.wxss （保持相同） */

	.form-item {
		margin-bottom: 10rpx;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		gap: 20rpx;
	}

	.label {
		display: block;
		font-size: 28rpx;
		color: #666;
	}

	.picker {
		background: #fff;
		border-radius: 8rpx;
		font-size: 28rpx;
	}

	.days-container {
		display: flex;
		justify-content: space-between;
	}

	.day-item {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		background: #f5f5f5;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
		color: #333;
	}

	.day-item.active {
		background: #07c160;
		color: #fff;
	}

	.input {
		padding: 20rpx;
		background: #fff;
		border-radius: 8rpx;
	}

	.save-btn {
		margin-top: 60rpx;
		background: #07c160;
		color: #fff;
	}

	.container {
		width: 100%;
		height: 95vh;
		display: flex;
		flex-direction: column;
		background-repeat: no-repeat;
		background-size: cover;
		background-position: center;
		touch-action: pan-x;
		position: relative;
	}

	/* 主要内容容器 */
	.content-container {
		background-color: #fff;
		position: absolute;
		bottom: 10rpx;
		left: 0;
		right: 0;
		width: 96%;
		margin: auto;
		border-radius: 10rpx;
		display: flex;
		flex-direction: column;
		/* 子元素垂直排列 */
	}

	.card-head {
		display: flex;
		align-items: center;
		gap: 20rpx;
		padding: 0 20rpx;
		height: 30px;
	}

	.card-head image {
		width: 40rpx;
		height: 30rpx;
	}

	.card-head text {
		font-family: PingFang SC;
		font-weight: bold;
		font-size: 28rpx;
		color: #333333;
	}

	.long-range-control-car {
		flex: 1;
		overflow-y: auto;
		box-shadow: 4rpx 4px 8px rgba(0, 0, 0, 0.1);
	}

	.long-range-control-car-subitem {
		display: flex;
		justify-content: space-between;
		border-bottom: 1px solid #f0f0f0;
		padding: 20rpx;
	}

	.long-range-control-car-subitem label {
		font-family: PingFang SC;
		font-weight: 500;
		font-size: 26rpx;
		color: #333333;
		display: flex;
		gap: 6rpx;
		align-items: flex-start;
	}

	.long-range-control-car-subitem label text {
		color: red;
	}

	.picker {
		font-family: PingFang SC;
		font-weight: 500;
		font-size: 26rpx;
		color: #333333;
		display: flex;
		align-items: center;
	}

	.picker image {
		width: 30rpx;
		height: 30rpx;
	}

	.long-range-control-car-subitem input {
		text-align: right;
		font-family: PingFang SC;
		font-weight: 500;
		font-size: 26rpx;
		color: #333333;
	}

	.viewText {
		text-align: right;
		font-family: PingFang SC;
		font-weight: 500;
		font-size: 26rpx;
		color: #333333;
	}

	.card-info-item-tabs {}

	.card-info-item-tabs-btn {
		display: flex;
		gap: 10rpx;
		justify-content: flex-end;
	}

	.card-info-item-tabs-btn text {
		border-radius: 7rpx;
		border: 1px solid #7b7c7c;
		font-family: PingFang SC;
		font-weight: 500;
		padding: 6rpx 20rpx;
		font-size: 24rpx;
		color: #333333;
	}

	.tabs-footer {
		font-family: PingFang SC;
		font-weight: 500;
		font-size: 22rpx;
		color: #7b7c7c;
		display: flex;
	}

	.card-info-item-tips {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
	}

	.tabs-active {
		background: #1b64b1;
		border-radius: 7rpx;
		color: #ffffff !important;
	}

	.card-footer {
		/* position: absolute; */
		text-align: center;
		margin: 20rpx 0;
		/* bottom: 120rpx; */
		width: 100%;
		display: flex;
		justify-content: center;
		font-family: PingFang SC;
		font-weight: bold;
		font-size: 34rpx;
		color: #ffffff;
	}

	.card-footer view {
		width: 40%;
		background-color: #2196f3;
		padding: 10rpx;
		background: linear-gradient(88deg, #1576dc, #1b64b1);
		box-shadow: 0rpx 1rpx 13rpx 0rpx rgba(51, 63, 92, 0.31);
		border-radius: 36rpx;
	}

	/* index.wxss */
	.tree-container {
		padding: 0rpx;
	}

	.node {
		margin: 0rpx 0;
	}

	.node-header {
		display: flex;
		align-items: center;
		padding: 10rpx 0;
	}

	.arrow {
		font-size: 24rpx;
		color: #666;
		margin-right: 10rpx;
		transition: transform 0.3s;
	}

	.arrow.expanded {
		transform: rotate(90deg);
	}

	.checkbox {
		min-width: 36rpx;
		min-height: 36rpx;
		border: 2rpx solid #ccc;
		border-radius: 6rpx;
		margin-right: 15rpx;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.checkbox.checked {
		background: #07c160;
		border-color: #07c160;
		width: 36rpx;
		height: 36rpx;
	}

	.child-node {
		margin-top: 5rpx;
	}

	.checkbox.indeterminate {
		background: #fff;
		border-color: #07c160;
	}

	.checkmark {
		color: white;
		font-size: 28rpx;
	}

	.indeterminate-line {
		width: 20rpx;
		height: 4rpx;
		background: #07c160;
	}

	.children {
		margin-left: 20rpx;
		border-left: 2rpx solid #eee;
		padding-left: 20rpx;
	}

	.node-name {
		font-size: 24rpx;
		color: #333;
	}
</style>