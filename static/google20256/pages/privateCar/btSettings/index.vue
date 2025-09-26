<template>
	<view class="settings-container">

		<CustomNavBar :title="headerTitle" />
		<!-- 设置项列表 -->
		<scroll-view class="settings-list" scroll-y :style="'margin-top: ' + (navbarTotalHeight) + 'px;'">
			<!-- 感应设置 -->
			<block v-if="sign == 1 && !distance">
				<view
					style="font-size: 24rpx; display: flex; justify-content: center; flex-direction: column; align-items: center; padding: 20rpx; gap: 20rpx">
					<text>*请检查蓝牙是否连接，是否已经站在车辆旁。连接蓝牙后才可进行配对。</text>
					<view @tap="btnPair"
						style="background-color: #fff; padding: 15rpx 100rpx; font-size: 26rpx; border-radius: 10rpx">
						蓝牙配对</view>
					<text>发起系统蓝牙与车载设备进行配对，将会弹出配对请求对话框，请点击【配对】。如果在手机系统蓝牙取消了配对，感应将会失效，需重新点击【蓝牙配对】进行配对</text>
				</view>
				<view class="settings-group">
					<view class="settings-item">
						<view class="item-left">
							<text class="item-text">感应设置</text>
							<text class="item-tips">数值为信号档位，不代表实际距离</text>
						</view>
						<view style="display: flex; flex-direction: row; align-items: center; font-size: 26rpx"
							@tap="handleDistance">
							<text>开锁{{ parsedData.unlock || 0 }}，关锁{{ parsedData.lock || 0 }}</text>
							<image class="item-arrow" src="/static/assets/images/home/right_1.png"></image>
						</view>
					</view>
					<view class="settings-item">
						<view class="item-left">
							<text class="item-text">感应模式</text>
							<text class="item-tips">开启感应模式，将根据手机距离自动开锁/关锁（蓝牙连接有效），关闭则为手动模式需点击图标操作，两种模式离车均请注意锁车安全。</text>
						</view>
						<switch :checked="parsedData.induction == '感应模式'" @change="handleRadioChange" color="#07C160" />
					</view>
				</view>
			</block>
			<!-- 个性配置 -->
			<block v-if="sign == 4">
				<view class="settings-tip">请参照车辆原有功能设置功能按键</view>
				<view class="settings-group" v-for="(item, index) in controlItems" :key="index">
					<view class="settings-item">
						<view class="item-left">
							<text class="item-text">{{ item.name }}</text>
						</view>
						<switch :checked="item.enabled" @change="handleToggleControl" :data-index="index"
							color="#07C160" />
					</view>
				</view>
			</block>
			<!-- 自动校准 -->
			<block v-if="distance">
				<view class="controls" style="padding: 0" @tap="handleCalibration">
					<view class="settings-item">
						<view class="item-left">
							<text class="item-text" style="font-size: 30rpx">自动校准</text>
						</view>
						<view style="display: flex; flex-direction: row; align-items: center; font-size: 26rpx">
							<text style="font-size: 24rpx; color: #999">当前所在位置距离设备信号值 :
								{{ signalCache[signalCache.length - 1] }}</text>
							<image class="item-arrow" src="/static/assets/images/home/right_1.png"></image>
						</view>
					</view>
				</view>
				<view class="container">
					<!-- 大圈（B圆） -->
					<view class="circle big-circle"
						:style="'width: ' + bigRadius * 3 + 'px; height: ' + bigRadius * 3 + 'px;'"></view>

					<!-- 小圈（A圆） -->
					<view class="circle small-circle"
						:style="'width: ' + smallRadius * 3 + 'px; height: ' + smallRadius * 3 + 'px;'"></view>

					<!-- 车图标 -->
					<view class="car-icon">
						<image src="https://k3a.wiselink.net.cn/img/app/blue/car.png"
							style="width: 120px; height: 120px" />
					</view>
				</view>

				<!-- 动态调整滑块 -->
				<view class="controls">
					<view style="color: 28rpx">
						手动校准 :
						<text class="item-tips">左右滑动图中白点可调节距离信号</text>
					</view>
					<view class="slider-container">
						<text class="slider-label">开锁信号值：{{ smallRadius }} (范围:40-{{ bigRadius - 5 }})</text>
						<slider :value="smallRadius" min="40" :max="bigRadius - 5" activeColor="#e74c3c" block-size="12"
							@change="updateSmallRadius" />
					</view>
					<view class="slider-container">
						<text class="slider-label">关锁信号值：{{ bigRadius }} (范围:45-90)</text>
						<slider :value="bigRadius" min="45" max="90" activeColor="#3498db" block-size="12"
							@change="updateBigRadius" />
					</view>
				</view>
			</block>
			<!-- 按键设置 -->
			<block v-if="sign == 3" v-for="(item, index) in keyInstructions" :key="index">
				<view class="settings-group" :data-item="item" @tap="handleKeyCommands">
					<view class="settings-item">
						<view class="item-left">
							<text class="item-text">{{ item.name }}</text>
						</view>
						<view>
							<image class="item-arrow" src="/static/assets/images/home/down.png"
								v-if="instruction_type == item.id" />
							<image class="item-arrow" src="/static/assets/images/home/right_1.png" v-else />
						</view>
					</view>
				</view>

				<view class="key-control" v-if="instruction_type == item.id">
					<view class="settings-group">
						<picker :data-item="item" :data-index="index" @change="handleOutputMethod"
							:range="key_out_put[index]" range-key="name">
							<view class="settings-item">
								<view class="item-left">
									<text class="item-text text-color">控制方式</text>
								</view>
								<view class="key-control-picker">
									<text class="text-color">{{ item.useType }}</text>
									<image class="item-arrow" src="/static/assets/images/home/right_1.png"></image>
								</view>
							</view>
						</picker>
					</view>
				</view>
			</block>
			<!-- 其他个性设置 -->
			<block v-if="sign == 5">
				<view class="settings-group">
					<view class="settings-item">
						<view class="item-left">
							<text class="item-text">蓝牙断开自动锁车</text>
							<text class="item-tips">启用后，若在开锁状态下与车载蓝牙断开，设备将自动执行一次关锁</text>
						</view>
						<switch :checked="parsedData.toBreakOff" @change="handleToBreakOff" color="#07C160" />
					</view>
					<view class="settings-item">
						<view class="item-left">
							<text class="item-text">锁车自动升窗</text>
							<text class="item-tips">启用后，按关锁按钮将执行升窗。需提前配置升窗动作</text>
						</view>
						<switch :checked="parsedData.autoCloseWin" @change="handleAutoCloseTheWindow" color="#07C160" />
					</view>
					<view class="settings-item">
						<view class="item-left">
							<text class="item-text">启动状态蓝牙感应是否生效</text>
							<text class="item-tips">开启后，行车时将自动禁用感应开车门功能</text>
						</view>
						<switch :checked="!parsedData.startSense" @change="handleStartSense" color="#07C160" />
					</view>
				</view>
			</block>
		</scroll-view>
	</view>
</template>

<script>
	// 导入工具模块
	// const bleKeyManager = require('../../../utils/BleKeyFun-utils.js'); // 蓝牙钥匙功能工具
	import bleKeyManager from "@/utils/BleKeyFun-utils-single.js"
	import CustomNavBar from "@/components/custom-header/index.vue";
	import {
		info_screen
	} from '@/utils/scheme/screen.js'
	// 控制项常量数组
	const CONTROL_ITEMS = [{
			id: 3,
			name: '尾箱',
			enabled: true,
			icon: 'https://k3a.wiselink.net.cn/img/app/blue/box_off.png',
			evt: 'handleOpenTrunk'
		},
		{
			id: 4,
			name: '寻车',
			enabled: true,
			icon: 'https://k3a.wiselink.net.cn/img/app/blue/search_off.png',
			evt: 'handleFindCar'
		},
		{
			id: 5,
			name: '升窗',
			enabled: true,
			icon: 'https://k3a.wiselink.net.cn/img/app/blue/search_off.png',
			evt: 'handlRaiseTheWindow'
		},
		{
			id: 6,
			name: '降窗',
			enabled: true,
			icon: 'https://k3a.wiselink.net.cn/img/app/blue/search_off.png',
			evt: 'handleLowerTheWindow'
		}
	];
	// 指令集合
	const _INSTRUCTIONS = [{
			id: 1,
			name: '开锁功能指令配置',
			useType: '',
			useTypeId: ''
		},
		{
			id: 2,
			name: '关锁功能指令配置',
			useType: '',
			useTypeId: ''
		},
		{
			id: 3,
			name: '寻车功能指令配置',
			useType: '',
			useTypeId: ''
		},
		{
			id: 4,
			name: '尾箱功能指令配置',
			useType: '',
			useTypeId: ''
		},
		// { id: 5, name: '左中门功能指令配置', useType: '', useTypeId: '', },
		// { id: 6, name: '右中门功能指令配置', useType: '', useTypeId: '', },
		{
			id: 7,
			name: '升窗功能指令配置',
			useType: '',
			useTypeId: ''
		},
		{
			id: 8,
			name: '降窗功能指令配置',
			useType: '',
			useTypeId: ''
		}
	];
	// 输出方式
	const _OUTPUT = [
		// 开锁
		[{
				id: 1,
				name: '短按开锁键'
			},
			//输出次数1 输出时间500ms 输出间隔0
			{
				id: 2,
				name: '短按两次开锁键'
			} //输出次数2 输出时间500ms 输出间隔500ms
		],
		// 关锁
		[{
				id: 1,
				name: '短按关锁键'
			} //输出次数1 输出时间500ms 输出间隔0
		],
		// 寻车
		[{
				id: 1,
				name: '短按寻车键'
			},
			//寻车键：输出次数1 输出时间500ms 输出间隔0; 关锁键:输出次数3 输出时间500 输出间隔1000ms
			{
				id: 2,
				name: '短按关锁键'
			}
		],
		// 尾箱
		[{
				id: 1,
				name: '短按两次尾箱键'
			},
			//输出次数2 输出时间500ms 输出间隔1000ms
			{
				id: 2,
				name: '长按三秒尾箱键'
			} //输出次数1 输出时间3000ms 输出间隔0
		],
		// // 左中门
		// [{ id: 1, name: '短按左中门键' },//输出次数为1 输出时间为500ms 输出间隔0
		// { id: 2, name: '长按3秒左中门键' },//输出次数为1 输出时间为3000ms 输出间隔0
		// ],
		// // 右中门
		// [{ id: 1, name: '短按右中门键' },//输出次数为1 输出时间为500ms 输出间隔0
		// { id: 2, name: '长按3秒右中门键' },//输出次数为1 输出时间为3000ms 输出间隔0
		// ],
		// 升窗
		[{
				id: 1,
				name: '长按7秒关锁键'
			} //输出次数为1 输出时间为7000ms 输出间隔0
		],
		// 降窗
		[{
				id: 1,
				name: '长按7秒开锁键'
			} //输出次数为1 输出时间为7000ms 输出间隔0
		]
	];
	// 标题映射对象
	const TITLE_MAP = {
		1: '感应设置',
		// 类型1对应标题
		4: '个性配置',
		// 类型4对应标题
		3: '按键设置',
		default: '设置' // 默认标题
	};
	// 图片映射数组
	const IMAGE_MAP = [{
		path: '/static/assets/images/home/car-bg.png',
		// 图片路径
		key: 's_background_picture_of_the_front_page' // 对应的data键名
	}];

	// 页面定义
	export default {
		components: {
			CustomNavBar
		},
		// 页面加载生命周期
		data() {
			return {
				screenInfo: {},
				// 导航栏高度(iOS和Android不同)
				sign: '',

				// 页面标识
				chs: [],

				// 蓝牙特征值列表
				controlItems: CONTROL_ITEMS,

				// 控制项列表
				pageInterval: 0,

				// 页面定时器ID
				connectionID: '',

				// 蓝牙连接ID
				deviceIDC: '',

				// 默认设备ID
				orgKey: [],

				// 原始密钥
				Radiochecked: 0,

				//手动和感应模式切换
				distance: false,

				//显示自动校准模块
				bigRadius: 60,

				// 大圈默认半径（45-90）
				smallRadius: 40,

				// 小圈默认半径（40-85）
				signalCache: [],

				//信号值集合
				keyInstructions: _INSTRUCTIONS,

				//指令集合
				instruction_type: 0,

				//是否展开开始设置
				//输出方式集合
				key_out_put: _OUTPUT,

				headerTitle: '',
				consolemsg: '',
				scrollTo2: '',
				connectionState: '',
				connectionDisplay: '',
				msg: '',
				parseLen: 0,
				scrollTo: '',

				parsedData: {
					unlock: '',
					lock: '',
					induction: '',
					toBreakOff: '',
					autoCloseWin: '',
					startSense: ''
				},

				s_background_picture_of_the_front_page: ''
			};
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
		onLoad(options) {
			const sign = options?.sign || ''; // 从参数获取sign值
			if (options?.sign === '1' || options?.sign == '3' || options?.sign == '5') {
				// 如果sign为1则处理请求
				uni.showLoading({
					title: '蓝牙连接中...'
				})
				this.deviceIDC = options?.deviceIDC
				// 默认设备ID
				this.orgKey = this.keyToHexArray(options?.orgKey)
				setTimeout(() => {
					this.handleRequest(options);
				}, 500)
			}
			// 设置页面数据

			this.sign = sign
			// 设置sign值
			this.headerTitle = this.getHeaderTitle(sign) // 设置标题

		},
		// 页面显示生命周期
		onShow() {
// 蓝牙连接应该放在这里
			this.initToConfigureCache();
			// 获取设备屏幕信息
			this.initialScreenInfo()
		},
		// 页面卸载生命周期
		onUnload() {
			console.log('debug page unload'); // 调试日志
			setTimeout(() => {
				bleKeyManager.releaseBle(); // 释放蓝牙资源
			}, 500);
			clearInterval(this.pageInterval); // 清除定时器
			uni.setKeepScreenOn({
				keepScreenOn: false // 关闭屏幕常亮
			});
		},
		methods: {
			// 获取屏幕信息
			async initialScreenInfo() {
				try {
					this.screenInfo = await info_screen();
				} catch (error) {

					uni.showToast({
						title: '设备信息获取失败',
						icon: 'none',
						duration: 3000
					});
				}
			},
			// 数据处理
			keyToHexArray(key) {
				return key.match(/.{1,2}/g).map((byte) => '0x' + byte);
			},

			// 是否开启距离校准
			handleDistance() {
				console.log(this?.parsedData);
				if (this?.parsedData?.unlock > 0) {

					this.distance = true

				} else {
					uni.showModal({
						title: '提示',
						content: '请先执行蓝牙配对'
					});
				}
			},

			// 更新大圈半径
			updateBigRadius(e) {
				const newBigRadius = e.detail.value;
				this.bigRadius = newBigRadius
				this.smallRadius = Math.min(this.smallRadius, newBigRadius - 5)
				setTimeout(() => {
					this.btnCmdSend(17, 0, newBigRadius?.toString(16)); // 关锁值
				}, 500)


			},

			// 更新小圈半径
			updateSmallRadius(e) {
				this.smallRadius = Math.min(e.detail.value, this.bigRadius - 5)
				setTimeout(
					() => {
						this.btnCmdSend(17, 1, Math.min(e.detail.value, this.bigRadius - 5)?.toString(16)); // 开锁值
					}, 500
				);
			},

			// 初始化获取缓存内容
			initToConfigureCache() {
				uni.getStorage({
					key: 'controlItems',
					success: (res) => {
						const storedData = res?.data || [];
						// 提取 CONTROL_ITEMS 中不存在于 storedData 的项
						const newItems = CONTROL_ITEMS.filter((controlItem) => !storedData.some((storedItem) =>
							storedItem.id === controlItem.id));
						// 合并数据
						const mergedItems = [...storedData, ...newItems];

						this.controlItems = mergedItems

					},
					fail: () => {
						// 如果本地存储不存在，直接使用默认数据

						this.controlItems = CONTROL_ITEMS

					}
				});
			},

			// 配对按钮点击处理
			btnPair() {
				const platform = uni.getSystemInfoSync().platform;
				const that = this;
				const deviceInfo = uni.getDeviceInfo(); // 获取设备信息
				if (that.connectionState == '已连接') {
					// 判断Android系统
					if (deviceInfo.system.toLowerCase().includes('android')) {
						// 发送配对命令
						that.btnCmdSend(34, [1, 0, 0, 0, 0, 0, 0, 0]);
						uni.showModal({
							title: '提示',
							content: `请跳转系统蓝牙列表点击设备名称为${this.deviceIDC}的设备`,
							showCancel: true, // 是否显示取消按钮，默认 true
							cancelText: '取消', // 取消按钮文字（最多4个字符）
							cancelColor: '#000000', // 取消按钮颜色
							confirmText: '确定', // 确认按钮文字（最多4个字符）
							confirmColor: '#3CC51F', // 确认按钮颜色
							success: (res) => {
								if (res.confirm) {
									const Intent = plus.android.importClass("android.content.Intent");
									const Settings = plus.android.importClass("android.provider.Settings");
									const mainActivity = plus.android.runtimeMainActivity();
									const intent = new Intent(Settings.ACTION_BLUETOOTH_SETTINGS);
									mainActivity.startActivity(intent);
								}
							}
						});

					} else {
						// iOS系统处理流程
						that.btnCmdSend(34, [1, 0, 0, 0, 0, 0, 0, 0]);
						setTimeout(() => {
							that.btnCmdSend(34, [2, 0, 0, 0, 0, 0, 0, 0]);
							setTimeout(() => {
								that.btnEndConnect(); // 结束连接
								const pairInteval = setInterval(() => {
									if (!bleKeyManager.getBLEConnectionState()) {
										// 检查连接状态
										clearInterval(pairInteval); // 清除定时器
										setTimeout(() => {
											that.btnStartConnect(); // 重新开始连
										}, 500);
									}
								}, 500);
								setTimeout(() => {
									clearInterval(pairInteval); // 超时清除定时器
								}, 3000);
							}, 200);
						}, 200);
					}
				} else {
					uni.showToast({
						title: '请等待蓝牙初始化',
						icon: 'none'
					});
				}
			},

			// 数组转ArrayBuffer
			arrayToArrayBuffer(array, elementSize = 1) {
				const typedArray = new Uint8Array(array.length * elementSize); // 创建Uint8Array
				array.forEach((item, i) => {
					typedArray[i * elementSize] = item; // 填充数据
				});

				return typedArray.buffer; // 返回ArrayBuffer
			},

			// 控制台输出
			consoleOut(e) {

				this.consolemsg = this.consolemsg + '\r\n' + e
				// 追加消息
				this.scrollTo2 = 'hiddenview2' // 设置滚动位置

			},

			// 处理请求
			handleRequest(options) {
				console.log(options); // 打印参数
				console.log('debug page load'); // 调试日志
				const that = this;
				that.btnStartConnect(); // 开始蓝牙连接
				// 设置定时器检查连接状态
				that.pageInterval = setInterval(() => {
					if (bleKeyManager.getBLEConnectionState()) {
						// 已连接状态
						this.connectionState = '已连接'
						this.connectionID = bleKeyManager.getBLEConnectionID()
						this.connectionDisplay = that.connectionID

					} else {
						// 未连接状态
						this.connectionState = '未连接'
						this.connectionID = ''
						this.connectionDisplay = '未连接'

					}
				}, 200);
				// 初始化数据

				that.msg = ''
				that.consolemsg = ''
				that.parseLen = 0

				// 设置屏幕常亮
				uni.setKeepScreenOn({
					keepScreenOn: true
				});
			},

			// 打包并发送数据（支持动态数据体长度）
			PackAndSend(type, dataLength, data, sign) {
				console.log(type, dataLength, data, sign);
				const header = [36]; // 数据头
				const end = [36]; // 数据尾
				// 根据要求的数据长度填充数据，不足补0
				const paddedData = [...data].concat(new Array(dataLength - data.length).fill(0)).slice(0, dataLength);
				const packet = dataLength == 8 ? [...header, type, dataLength, ...data, ...end] : [...header, type, ...
					paddedData, ...end
				]; // 组合数据包

				bleKeyManager.dispatcherSend2(this.arrayToArrayBuffer(packet)); // 发送数据
			},

			PackAndSendSet(type, data) {
				const packet = [36, type, ...data, ...Array(12 - data.length).fill(0), 36];
				console.log(packet, Array(12 - data.length).fill(0));
				bleKeyManager.dispatcherSend2(this.arrayToArrayBuffer(packet)); // 发送数据
			},

			// 自动校准数据处理
			PackAndSendspecial(type, dataLength, data, sign) {
				const packet = [
					36,
					// Header
					17,
					8,
					// Type and length
					parseInt(sign, 16) || 0,
					// Sign value (fallback to 0)
					data ? 1 : 0,
					// Data flag
					...Array(6).fill(0),
					// Padding
					36 // Footer
				];

				bleKeyManager.dispatcherSend2(this.arrayToArrayBuffer(packet));
			},

			PackAndSendspecial04d(data) {
				const packet = [36, 77, 1, data, 36];
				bleKeyManager.dispatcherSend2(this.arrayToArrayBuffer(packet));
			},

			PackAndSendspecial063(data) {
				const packet = [36, 99, 1, data, 36];
				bleKeyManager.dispatcherSend2(this.arrayToArrayBuffer(packet));
			},

			// 认证加密
			auth_encrypt(passwordSource, random) {
				const passwordEncrypt = new Array(8).fill(0); // 初始化8字节数组
				for (let i = 0; i < 6; i++) {
					// 异或加密算法
					passwordEncrypt[i] = passwordSource[i] ^ random[i] ^ 255;
				}
				return passwordEncrypt;
			},

			// 发送命令（区分不同指令的数据体长度）
			btnCmdSend(type, data, sign) {
				console.log(type);
				switch (type) {
					case 16:
						// 认证命令
						const orgKey = this.orgKey;
						const retKey = this.auth_encrypt(orgKey, data); // 加密密钥
						this.PackAndSend(type, 8, retKey); // 发送8字节认证数据
						break;
					case 3: // 开锁命令
					case 4: // 锁车命令
					case 5: // 尾箱命令
					case 6:
						// 寻车命令
						this.PackAndSend(type, 8, new Array(8).fill(0)); // 发送8字节空数据
						break;
					case 59: // 设置 断开蓝牙自动锁车
					case 58:
						// 设置 感应模式
						const flameoutData = data; // 第一个字节为0x01，后面补11个0x00
						this.PackAndSend(type, 12, flameoutData); // 发送12字节数据
						break;
					case 34:
						// 配对命令
						this.PackAndSend(type, 8, data); // 发送8字节数据
						break;
					case 17:
						//开锁信号值
						this.PackAndSendspecial(type, 6, data, sign); // 发送6字节数据
						break;
					case 77:
						//设置锁车升窗
						this.PackAndSendspecial04d(data); // 发送6字节数据
						break;
					case 99:
						this.PackAndSendspecial063(data); // 发送6字节数据
						break;
					default:
						break;
				}
			},

			// 开始蓝牙连接
			btnStartConnect() {
				const that = this;
				if (!that.connectionID) {
					// 如果未连接
					bleKeyManager.connectBLE(
						that.deviceIDC,
						(state) => {
							// 蓝牙状态回调
							if (bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_PRE_EXECUTE === state) {
								// 预处理状态
							} else if (bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_ERROR === state) {
								uni.hideLoading(); // 隐藏加载框
							} else if (bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_ADAPTER_UNAVAILABLE === state) {
								uni.showModal('请打开蓝牙', false, () => {}); // 提示打开蓝牙
							} else if (bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_NOT_FOUND === state) {
								uni.showModal('没有发现设备', false, () => {}); // 提示未发现设备
							} else if (bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_CONNECT_FAILED === state) {
								// 连接失败
							} else if (bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_UNSUPPORTED === state) {
								uni.showModal('您的手机不支持低功耗蓝牙', false, () => {}); // 提示不支持BLE
							} else if (bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_SEND_FAILED === state) {
								uni.showModal('数据发送失败', false, () => {}); // 提示发送失败
							} else if (bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_NO_RESPONSE === state) {
								uni.showModal('设备超时无响应', false, () => {}); // 提示超时
							} else if (bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_CONNECT_SUCESS === state) {
								uni.hideLoading(); // 连接成功，隐藏加载框
							}
						},
						(type, arrayData, hexData, hexTextData) => {
							uni.hideLoading();
							// 数据接收回调
							if (type === 0) {
								// 认证类型
								this.btnCmdSend(16, arrayData); // 发送认证响应
							} else {
								that.parseData(that.trimHexData(hexTextData));
							}
							// 更新接收数据

							this.msg = this.msg + 'receive: type:' + type + ',data:' + hexTextData + '\r\n'
							this.scrollTo = 'hiddenview' // 设置滚动位置

						}
					);
				} else {
					uni.showModal('已连接蓝牙', false, () => {}); // 提示已连接
				}
			},

			/**
			 * 修剪16进制数据
			 * @param {string} hexString 原始16进制字符串
			 * @returns {string} 修剪后的有效数据部分
			 */
			trimHexData: function(hexString) {
				if (typeof hexString !== 'string' || !/^[0-9a-fA-F]+$/.test(hexString)) {
					throw new Error('无效的16进制字符串');
				}
				return hexString.slice(4, -2); // 去除头尾固定字符
			},

			handleCalibration() {
				const that = this;
				uni.showModal({
					title: '第一步',
					content: '请参考安装说明书将设备放置在要安装的位置',
					confirmText: '已安装',
					success: (cbRes_1) => {
						if (cbRes_1?.confirm) {
							uni.showModal({
								title: '第二步',
								content: '请关好所有车窗及车门',
								confirmText: '已关闭',
								success: (cbRes_2) => {
									if (cbRes_2?.confirm) {
										uni.showModal({
											title: '第三步',
											content: '请移步至离车头直线距离5米处',
											confirmText: '立即校准',
											success: (cbRes_3) => {
												if (cbRes_3?.confirm) {
													const signalCache = that
														.signalCache;
													const sorted = [...signalCache]
														.sort((a, b) => a - b);
													const trimmed = sorted.slice(1, -
														1);
													const avgA = Math.round(trimmed
														.reduce((a, b) => a + b) /
														trimmed.length);
													this.btnCmdSend(17, 1, avgA
														?.toString(16)); //开锁
													this.btnCmdSend(17, 0, (avgA + 10)
														?.toString(16)); //关锁
												}
											}
										});
									}
								}
							});
						}
					}
				});
			},

			/**
			 * 数据解析按钮处理
			 * @param {string} hexData 16进制数据字符串
			 */
			parseData: function(hexData) {
				const parsedResult = this.parseHexDataObject(hexData);
				if (parsedResult) {
					const currentData = this.parsedData || {};
					const isEqual = JSON.stringify(parsedResult) === JSON.stringify(currentData);
					if (!isEqual) {

						this.parsedData = parsedResult

					}
				}
			},

			/**
			 * 解析16进制车辆状态数据
			 * @param {string} hexString 30字符的16进制字符串
			 * @returns {Array|null} 解析结果数组，格式为[{key: string, value: any}]
			 */
			parseHexDataObject: function(hexString) {
				// 验证数据长度
				if (hexString.length !== 30) {
					// wx.showToast({ title: '数据长度不正确', icon: 'none' });
					return null;
				}

				// 转换为字节数组
				const bytes = [];
				for (let i = 0; i < 30; i += 2) {
					bytes.push(parseInt(hexString.substr(i, 2), 16));
				}
				const resultObject = {};
				resultObject.lock = bytes[2] === 1 ? true : false; //锁状态
				resultObject.supply = bytes[3]; //3v断电剩余时间
				resultObject.induction = bytes[0] === 1 ? '感应模式' : '手动模式'; //感应状态
				resultObject.lock = bytes[8]; //关锁信号值
				resultObject.unlock = bytes[11]; //开锁信号值
				resultObject.toBreakOff = bytes[6] === 1; //蓝牙断开自动锁车
				resultObject.signal = bytes[10]; //当前信号值
				resultObject.autoCloseWin = (bytes[7] & 16) !== 0; //锁车自动关窗
				resultObject.startSense = (bytes[13] & 2) !== 0; //启动状态蓝牙感应是否生效

				// Update the signal cache
				let signalCache = this.signalCache;
				signalCache.push(bytes[10]); // Add new value

				// Keep only the last 10 values
				if (signalCache.length > 10) {
					signalCache = signalCache.slice(-10);
				}

				this.bigRadius = bytes[8]
				// 大圈默认半径（45-90）
				this.smallRadius = bytes[11]
				// 小圈默认半径（40-85）
				this.signalCache = signalCache // Update the cache in data


				return resultObject;
			},

			// 获取标题
			getHeaderTitle(evt) {
				return TITLE_MAP[evt] || TITLE_MAP.default; // 根据evt返回对应标题
			},


			// 设置 蓝牙断开自动断开锁车
			handleToBreakOff(e) {
				const isEnabled = Boolean(e?.detail?.value);
				// 发送指定 设置蓝牙断开自动锁车 (0x01: 开, 0x00: 关)
				this.btnCmdSend(59, [isEnabled ? 1 : 0]);
			},

			handleAutoCloseTheWindow(e) {
				const isEnabled = Boolean(e?.detail?.value);
				// 发送指定 设置蓝牙断开自动锁车 (0x01: 开, 0x00: 关)
				this.btnCmdSend(77, [isEnabled ? 1 : 0]);
			},

			handleStartSense(e) {
				const isEnabled = Boolean(e?.detail?.value);
				// 发送指定 设置启动状态蓝牙感应是否有效 (0x01: 感应开, 0x00: 感应关关)
				this.btnCmdSend(99, [!isEnabled ? 1 : 0]);
			},

			// 设置 感应模式
			handleRadioChange(e) {
				const isEnabled = e?.detail?.value;
				this.btnCmdSend(58, [isEnabled == '1' ? 1 : 0]);
				// 更新通知状态

				this.Radiochecked = isEnabled

			},

			//新增或减少配置
			handleToggleControl(evt) {
				const {
					index
				} = evt.currentTarget?.dataset || {};
				const {
					value
				} = evt.detail || {};
				const {
					controlItems
				} = this;
				console.log(controlItems);
				// 参数校验
				if (index == null || value == null || !controlItems?.[index]) {
					return;
				}
				// 更新数据（使用不可变更新）
				const updatedItems = controlItems.map((item, i) =>
					i === index ? {
						...item,
						enabled: Boolean(value)
					} :
					item
				);
				// 更新视图和缓存

				this.controlItems = updatedItems

				console.log(updatedItems);
				uni.setStorage({
					key: 'controlItems',
					data: updatedItems
				});
			},

			// 设置按键指令
			handleKeyCommands(evt) {
				const {
					id
				} = evt?.currentTarget?.dataset?.item || {};
				const {
					instruction_type: currentType
				} = this;
				const newInstructionType = id === currentType ? 0 : id;

				this.instruction_type = newInstructionType

			},

			// 输出方式
			handleOutputMethod(evt) {
				const {
					index,
					item: info
				} = evt?.currentTarget?.dataset || {};
				const value = evt?.detail?.value;

				// 参数校验
				if (index === undefined || !info || value === undefined) {
					return;
				}

				// 获取选中项
				const selectedOutput = this.key_out_put?.[index]?.[Number(value)];
				if (!selectedOutput?.name) {
					return;
				}

				// 查找需要更新的项
				const {
					keyInstructions
				} = this;
				const updateIndex = keyInstructions.findIndex((item) => item?.id === info.id);
				if (updateIndex === -1) {
					return;
				}

				// 更新数据

				// this.[`keyInstructions[${updateIndex}].useType`] = selectedOutput?.name
				// this.[`keyInstructions[${updateIndex}].useTypeId`] = selectedOutput?.id
				this.keyInstructions[updateIndex].useType = selectedOutput.name;
				this.keyInstructions[updateIndex].useTypeId = selectedOutput.id;
				setTimeout(() => {
					const updatedItem = keyInstructions[updateIndex];
					if (updatedItem?.useTypeId) {
						this.handleInstructions(updatedItem);
					}
				}, 500)

			},

			// 快捷设置按键
			handleInstructions(evt) {
				const {
					id,
					useTypeId
				} = evt;
				const sendCommand = (cmd, data) => {
					this.PackAndSendSet(cmd, data);
				};
				const instructionMap = {
					1: {
						// 开锁键
						1: () => sendCommand(51, [51, 6, 1, 0, 0]),
						// 短按开锁键
						2: () => sendCommand(51, [51, 6, 2, 6, 0]) // 短按两次开锁键
					},

					2: {
						// 关锁键
						1: () => sendCommand(52, [52, 6, 1, 0, 0]) // 短按开锁键
					},

					3: {
						// 寻车键
						1: () => sendCommand(54, [54, 6, 1, 0, 0]),
						// 短按寻车键
						2: () => sendCommand(54, [52, 6, 3, 6, 0]) // 三按关锁键
					},

					4: {
						// 尾箱键
						1: () => sendCommand(53, [53, 6, 2, 6, 0]),
						// 短按两次尾箱键
						2: () => sendCommand(53, [53, 30, 1, 0, 0]) // 长按3秒尾箱键
					},

					5: {
						// 左中门
						1: () => sendCommand(80, [80, 6, 1, 0, 0]),
						// 短按左中门键
						2: () => sendCommand(80, [80, 30, 1, 0, 0]) // 长按3秒左中门键
					},

					6: {
						// 右中门
						1: () => sendCommand(81, [81, 6, 1, 0, 0]),
						// 短按右中门键
						2: () => sendCommand(81, [81, 30, 1, 0, 0]) // 长按3秒右中门键
					},

					7: {
						// 升窗
						1: () => sendCommand(82, [52, 70, 1, 0, 0]) // 长按7秒关锁键
					},

					8: {
						// 降窗
						1: () => sendCommand(83, [51, 70, 1, 0, 0]) // 长按7秒开锁键
					}
				};

				const idActions = instructionMap[id];
				if (!idActions) {
					return;
				} // 无效 id
				const action = idActions[useTypeId];
				if (action) {
					action();
				}
			}
		}
	};
</script>
<style>
	/* pages/settings/settings.wxss */
	.settings-container {
		height: 100vh;
		display: flex;
		flex-direction: column;
		background-repeat: no-repeat;
		background-size: cover;
		background-position: center;
		touch-action: pan-x;
		position: relative;
	}

	.settings-group {
		margin-bottom: 10px;
		background-color: #ffffff;
		width: 98%;
		margin: 10rpx auto;
	}

	.group-title {
		padding: 10px 15px;
		font-size: 14px;
		color: #999999;
	}

	.settings-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 15px;
		border-bottom: 1px solid #f0f0f0;
	}

	.item-left {
		display: flex;
		/* align-items: center; */
		flex-direction: column;
		justify-content: center;
	}

	.item-tips {
		font-size: 24rpx;
		color: #999999;
	}

	.item-icon {
		width: 20px;
		height: 20px;
		margin-right: 10px;
	}

	.item-text {
		font-size: 28rpx;
		color: #333333;
	}

	.item-right {
		display: flex;
		align-items: center;
	}

	.item-value {
		font-size: 14px;
		color: #999999;
		margin-right: 5px;
	}

	.item-arrow {
		width: 16px;
		height: 16px;
	}

	/* 最后一个设置项去掉下划线 */
	.settings-item:last-child {
		border-bottom: none;
	}

	switch {
		transform: scale(0.7);
		/* 缩小到 80% */
	}

	/* 车辆转移 */
	.transfer-container {
		display: flex;
		flex-direction: column;
		padding: 20rpx;
		gap: 20rpx;
	}

	.transfer-input {
		border: 1rpx solid #c5c3c3;
		height: 80rpx;
		padding: 0 20rpx;
		font-size: 26rpx;
		border-radius: 10rpx;
		/* 添加内边距提升输入体验 */
	}

	.transfer-btn-wrapper {
		width: 100%;
		display: flex;
		justify-content: center;
	}

	.transfer-confirm-btn {
		width: 100%;
		background-color: #1b64b1;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 80rpx;
		color: white;
		border-radius: 8rpx;
		/* 添加圆角 */
	}

	.transfer-tips {
		display: flex;
		flex-direction: column;
	}

	.transfer-tip-item {
		font-size: 26rpx;
		color: #666;
		/* 添加浅灰色提升可读性 */
		line-height: 1.6;
		/* 增加行高 */
	}

	/* 容器样式 */
	.container {
		position: relative;
		width: 90%;
		height: 300px;
		margin: 20px auto;
		background-color: #f9f9f9;
		border-radius: 8px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	}

	/* 圆环基础样式 */
	.circle {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		border-radius: 50%;
	}

	/* 大圆样式 */
	.big-circle {
		border: 3px solid #4b7cb0;
		animation: blink 7s infinite;
	}

	@keyframes blink {
		0% {
			opacity: 1;
		}

		50% {
			opacity: 0.3;
		}

		100% {
			opacity: 1;
		}
	}

	/* 小圆样式 */
	.small-circle {
		border: 2px solid #c6bada;
		animation: blink 5s infinite;
		/* background: linear-gradient(to right,
      #b2a9c2 0%,
      #d8d0e6 20%,
      #f0eef5 40%,
      #f9f9fa 50%,
      #f0eef5 60%,
      #d8d0e6 80%,
      #b2a9c2 100%); */
		z-index: 1;
	}

	/* 车图标样式 */
	.car-icon {
		position: absolute;
		top: 54%;
		left: 50%;
		transform: translate(-50%, -50%);
		font-size: 50px;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
		z-index: 2;
	}

	/* 控制区样式 */
	.controls {
		margin: 30px 20px;
		padding: 15px;
		background: white;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.slider-container {
		margin-bottom: 25px;
	}

	.slider-label {
		display: block;
		margin-bottom: 8px;
		font-size: 14px;
		color: #555;
	}

	/* 滑块自定义样式 */
	slider {
		margin-top: 5px;
	}

	.key-control {
		display: flex;
		width: 95%;
		align-items: center;
		margin: auto;
		box-shadow: 0rpx 1rpx 13rpx 0rpx rgba(51, 63, 92, 0.31);
		padding: 10rpx;
		border-radius: 8rpx;
		flex-direction: column;
	}

	.key-control-picker {
		display: flex;
		flex-direction: row;
		align-items: center;
		font-size: 26rpx;
	}

	radio-group {
		display: flex;
		flex-direction: row;
		gap: 12rpx;
	}

	.radio-animate {
		transition: transform 0.2s ease;
		transform: scale(0.9);
		/* 调整这个值改变大小 */
	}

	.radio-animate:active {
		transform: scale(0.8);
	}

	.text-color {
		color: #868383;
	}

	/* 提示文字样式 */
	.settings-tip {
		display: flex;
		justify-content: center;
		/* 水平居中 */
		width: 90%;
		margin: 20rpx auto;
		/* 上下间距，左右自动居中 */
		font-size: 32rpx;
		color: #333;
		text-align: center;
		line-height: 1.5;
	}
</style>