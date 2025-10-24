<template>
	<view class="container">
		<CustomNavBar title="人员角色设定" />
		<view class="record-container">
			<scroll-view scroll-y @scrolltolower="handleLower" @refresherrefresh="handleRefresh"
				:refresher-enabled="true" :refresher-triggered="g_triggered">
				<view v-for="(item, index) in g_items" :key="index" class="content-item">
					<view class="content-item-head">
						<view class="head-left">
							<view class="left-category">
								<text>{{item.realname}}</text>
								<text v-if="item.acquiescent" class="admin-tag">超级管理员</text>
							</view>
						</view>
						<view class="head-right">
							<image src="/static/public/_edit.png" @click="handleEdit(item)" />
							<image src="/static/public/_delete.png" @click="handleDelete(item.id)" />
						</view>
					</view>
					<view class="content-item-info">
						<view class="info-item" :class="{'long-info-item': item.username && item.username.length > 15}">
							<label>账号 ：</label>
							<text>{{item.username||'-'}}</text>
						</view>
						<view class="info-item" :class="{'long-info-item': item.roleName && item.roleName.length > 15}"
							style="display: flex;flex-direction: row;">
							<label>角色 ：</label>
							<text v-if="item.roleName">{{item.roleName}}</text>
						</view>
						<view class="info-item" :class="{'long-info-item': item.mobile && item.mobile.length > 15}">
							<label>手机号 ：</label>
							<text>{{item.mobile||'-'}}</text>
						</view>
					</view>
				</view>
				<view v-if="g_items.length<1" class="no-data">
					无数据
				</view>
			</scroll-view>

			<view class="levitation-button" @click="handleJumpInfo">
				<text>新增人员</text>
			</view>
		</view>

		<!-- 新增人员弹窗 -->
		<view v-if="c_send_key_show_momal" class="modal-mask" @click="handleHideSengKeyModal"></view>
		<view v-if="c_send_key_show_momal" class="modal-base-map">
			<form @submit="handleFormSubmit">
				<view class="modal-container">
					<view class="modal-container-head">
						<text>{{user_text}}人员</text>
						<image src="/static/public/right.png" @click="handleHideSengKeyModal" />
					</view>
					<view class="modal-container-middle">
						<view class="middle-form-item">
							<label>姓名</label>
							<view class="modal-form-region">
								<input placeholder="请输入姓名" :value="g_uesr_details.realname" name="realname"
									style="text-align: right;font-size: 28rpx;" />
							</view>
						</view>
						<view class="middle-form-item">
							<label>手机号</label>
							<view class="modal-form-region">
								<input placeholder="请输入手机号" :value="g_uesr_details.mobile" name="mobile"
									style="text-align: right;font-size: 28rpx;" />
							</view>
						</view>
						<view class="middle-form-item">
							<label>角色</label>
							<view class="modal-form-region">
								<picker mode="selector" :range="roleArray" range-key="name"
									@change="handleBindPickerChange">
									<view class="picker" style="font-size: 28rpx;color: #575656;">
										{{new_role.name ? new_role.name : '请选择角色'}}
									</view>
								</picker>
							</view>
						</view>
					</view>
					<view class="modal-container-footer">
						<button form-type="submit">确认</button>
					</view>
				</view>
			</form>
		</view>
	</view>
</template>

<script>
	import {
		u_user_delChildUser,
		u_user_childUserList,
		u_user_addOrUpdateChildUser,
		u_user_roleapiList
	} from '@/api'
	import CustomNavBar from "@/components/custom-header/index.vue";

	export default {
		data() {
			return {
				navBarHeight: uni.getSystemInfoSync().platform == 'ios' ? 49 : 44,
				searchBarHeight: 80,
				g_page: 1,
				g_items: [],
				g_triggered: false,
				c_activeTab: 1,
				params: {},
				btnState: '新增',
				id: '',
				c_send_key_show_momal: false,
				g_uesr_details: {},
				user_text: '新增',
				new_role: {},
				roleArray: [],
				g_total: 0,
				s_background_picture_of_the_front_page: ''
			}
		},

		onLoad(options) {
			this.initList()
		},

		onShow() {
			this.handleRole()
		},
		components: {
			CustomNavBar
		},

		methods: {
			// 下拉刷新
			handleRefresh() {
				this.g_page = 1
				this.g_items = []
				this.initList()
			},

			// 加载更多
			handleLower() {
				// 加载更多逻辑
			},


			// 人员列表
			async initList() {
				const response = await u_user_childUserList({})
				console.log(response?.content)
				if (response?.code == 1000) {
					this.g_items = response?.content
					this.g_total = Number(response?.count || 0).toLocaleString()
				}
			},

			// 修改人员
			handleEdit(info) {
				this.c_send_key_show_momal = true
				this.g_uesr_details = info
				this.user_text = '修改'
				this.new_role = {
					id: info?.roleId,
					name: info?.roleName
				}
			},

			// 删除列表数据
			handleDelete(id) {
				const _this = this
				uni.showModal({
					title: '提示',
					content: '确认删除当前人员吗？',
					success: async (res) => {
						if (res.confirm) {
							const params = {
								id: id
							}
							u_user_delChildUser(params).then(allRes => {
								console.log(allRes,'9999')
								if (allRes?.code == 1000) {
									_this.g_triggered = false
									_this.g_page = 1
									_this.g_items = []
									_this.initList()
									uni.showToast({
										title: '删除成功'
									})
								}
							})

						}
					}
				})
			},

			// 新增人员
			handleJumpInfo() {
				this.c_send_key_show_momal = true
			},

			// 取消弹窗
			handleHideSengKeyModal() {
				this.c_send_key_show_momal = false
				this.user_text = '新增'
				this.g_uesr_details = {}
				this.new_role = {}
			},

			// 提交用户数据的统一方法
			async submitUserUpdate(params, successCallback = () => {}) {


				if (!params.realname && !this.new_role?.id) {
					uni.showToast({
						title: '用户信息不完整，无法保存'
					})
					return
				}

				const response = await u_user_addOrUpdateChildUser(params)
				console.log(response)
				if (response?.code == 1000) {
					successCallback(response)
				} else {

					uni.showToast({
						title: response?.msg
					})
				}
			},

			// 表单提交：新增或编辑用户
			handleFormSubmit(evt) {
				const formData = evt.detail.value
				const params = {
					...formData,
					id: this.g_uesr_details?.id || '',
					roleId: this.new_role?.id
				}

				this.submitUserUpdate(params, () => {
					this.c_send_key_show_momal = false
					this.g_uesr_details = {}
					this.new_role = {}
					this.initList()
					showToast('操作成功')
				})
			},

			// 选择角色时更新用户角色
			handleBindPickerChange(evt) {
				const roleIndex = evt.detail.value
				const role = this.roleArray[roleIndex]

				if (!role) {
					showToast('请选择有效的角色')
					return
				}

				this.new_role = role
			},

			// 请求角色列表
			async handleRole() {
				const response = await u_user_roleapiList({})
				if (response?.code == 1000) {
					this.roleArray = response?.content
				}
			}
		}
	}
</script>

<style scoped>
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
		height: 100vh;
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

	.levitation-button {
		position: absolute;
		bottom: 50rpx;
		width: 100%;
		display: flex;
		justify-content: center;
	}

	.levitation-button text {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 75rpx;
		width: 40%;
		background: linear-gradient(88deg, #1576DC, #1B64B1);
		box-shadow: 0rpx 1rpx 13rpx 0rpx rgba(51, 63, 92, 0.31);
		border-radius: 36rpx;
		font-family: PingFang SC;
		font-weight: bold;
		font-size: 32rpx;
		color: #FFFFFF;
	}

	/* 弹窗蒙版 */
	.modal-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.4);
		z-index: 998;
	}

	.modal-base-map {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		background: #fff;
		border-radius: 20rpx;
		z-index: 998;
		padding: 20rpx;
	}

	.modal-container {
		height: 40vh;
		display: flex;
		flex-direction: column;
	}

	.modal-container-head {
		display: flex;
		justify-content: row;
		justify-content: space-between;
		align-items: center;
		height: 60rpx;
	}

	.modal-container-head text {
		font-weight: bold;
		font-size: 34rpx;
		color: #333333;
	}

	.modal-container-head image {
		width: 24rpx;
		height: 24rpx;
	}

	.modal-container-middle {
		flex: 1;
		overflow-y: auto;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		gap: 20rpx;
	}

	.modal-container-footer {
		height: 80rpx;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.modal-container-footer button {
		background: linear-gradient(88deg, #1576dc, #1b64b1);
		box-shadow: 0rpx 1rpx 13rpx 0rpx rgba(51, 63, 92, 0.31);
		border-radius: 36rpx;
		font-weight: bold;
		font-size: 34rpx;
		color: #ffffff;
		width: 50%;
		height: 90%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.middle-form-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 45rpx;
		width: 80%;
	}

	.middle-form-item label {
		font-family: PingFang SC;
		font-weight: 600;
		font-size: 28rpx;
		color: #333333;
	}

	.modal-form-region {
		display: flex;
		gap: 10rpx;
	}

	.form-item-text {
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-radius: 4rpx;
		padding: 4rpx 2rpx 4rpx 10rpx;
		gap: 20rpx;
	}

	.form-item-text text {
		font-family: PingFang SC;
		font-weight: 500;
		font-size: 28rpx;
		color: #7b7c7c;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.form-item-text image {
		width: 30rpx;
		height: 30rpx;
	}

	.admin-tag {
		font-size: 22rpx;
		padding: 4rpx;
		border-radius: 6rpx;
		background: #f0f0f0;
		color: #575656;
		margin-left: 20rpx;
	}

	.no-data {
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 26rpx;
		color: #ccc;
		height: 80vh;
	}
</style>