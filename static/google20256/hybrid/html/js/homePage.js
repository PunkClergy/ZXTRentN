// 使用立即执行函数封装代码，避免全局污染
(function() {
	// 常量配置 - 标记图标URL
	const MARKER_ICON = "https://k3a.wiselink.net.cn/img/app/currentLocation.png"; // 用户位置标记图标
	const MARKER_CAR = "https://k3a.wiselink.net.cn/img/app/g_location.png"; // 车辆位置标记图标
	const MARKER_SIZE = 50; // 用户标记的默认尺寸
	const MARKER_CAR_SIZE = {
		width: 17,
		height: 36
	}; // 车辆标记的精确尺寸
	const DEFAULT_ZOOM = 15; // 地图默认缩放级别

	// 状态变量 - 存储应用状态
	let userLat = ''; // 用户/车辆纬度
	let userLng = ''; // 用户/车辆经度
	let mapInstance = null; // Google地图实例
	let userMarker = null; // 用户位置标记实例
	let infoContent = ''; // 接收到的附加信息
	let source = ''; // 数据来源标识
	let isMapInitialized = false; // 地图是否已初始化标志

	// 消息处理器 - 处理从其他窗口/iframe传来的消息
	function handleIncomingMessage(e) {
		// 检查是否为desk类型消息
		if (e.data.type === 'desk') {
			// 更新接收到的信息内容
			infoContent = e.data.payload;
			// 更新数据来源标识
			source = e.data.type;

			// 如果地图已初始化且收到有效位置数据
			if (isMapInitialized && infoContent?.latitude && infoContent?.longitude) {
				// 更新用户位置为desk数据源的位置
				updateUserPosition(infoContent.latitude, infoContent.longitude, true);
			}
			toggleVisibility()
		}
	}

	// 初始化消息监听 - 监听window的message事件
	window.addEventListener('message', handleIncomingMessage);

	/**
	 * 统一位置更新方法
	 * @param {number} lat - 纬度
	 * @param {number} lng - 经度
	 * @param {boolean} isFromDesk - 是否来自desk数据源
	 */
	function updateUserPosition(lat, lng, isFromDesk = false) {
		// 更新全局位置变量
		userLat = lat;
		userLng = lng;

		// 如果标记已存在 - 更新现有标记
		if (userMarker) {
			// 设置标记的新位置
			userMarker.setPosition({
				lat: userLat,
				lng: userLng
			});
			// 根据数据源更新标记图标
			userMarker.setIcon({
				url: isFromDesk ? MARKER_CAR : MARKER_ICON,
				scaledSize: new google.maps.Size(
					isFromDesk ? MARKER_CAR_SIZE.width : MARKER_SIZE,
					isFromDesk ? MARKER_CAR_SIZE.height : MARKER_SIZE
				)
			});
		}
		// 如果标记不存在但地图已初始化 - 创建新标记
		else if (mapInstance) {
			createUserMarker(isFromDesk);
		}

		// 如果地图实例存在 - 更新地图视图
		if (mapInstance) {
			// 将地图中心移动到新位置
			mapInstance.setCenter({
				lat: userLat,
				lng: userLng
			});
			// 确保地图保持在默认缩放级别
			mapInstance.setZoom(DEFAULT_ZOOM);
		}
	}

	/**
	 * 初始化地图核心功能
	 * @param {GeolocationPosition} position - 浏览器返回的地理位置对象
	 */
	function initMapCore(position) {
		// 判断是否使用desk数据源（优先使用）
		const useDeskData = source === 'desk' && infoContent?.latitude;

		// 更新用户位置：优先使用desk数据，否则使用浏览器定位数据
		updateUserPosition(
			useDeskData ? infoContent.latitude : position.coords.latitude,
			useDeskData ? infoContent.longitude : position.coords.longitude,
			useDeskData
		);

		// 如果地图实例尚未创建 - 初始化地图
		if (!mapInstance) {
			// 创建Google地图实例
			mapInstance = new google.maps.Map(document.getElementById('map'), {
				zoom: DEFAULT_ZOOM, // 设置初始缩放级别
				center: {
					lat: userLat,
					lng: userLng
				}, // 设置初始中心点
				disableDefaultUI: true, // 禁用默认UI控件
				gestureHandling: "greedy", // 单指操作地图（移动端优化）
				mapTypeControl: false, // 隐藏地图类型控件
				fullscreenControl: false // 隐藏全屏控件
			});

			// 确保用户标记被创建
			if (!userMarker) {
				createUserMarker(useDeskData);
			}

			// 设置按钮事件监听器
			setupEventListeners();


		}

		// 标记地图已初始化
		isMapInitialized = true;
	}

	/**
	 * 创建用户位置标记（无动画）
	 * @param {boolean} isFromDesk - 是否使用desk图标
	 */
	function createUserMarker(isFromDesk = false) {
		// 确保地图实例存在
		if (!mapInstance) return;

		// 创建新的地图标记（无动画）
		userMarker = new google.maps.Marker({
			position: {
				lat: userLat,
				lng: userLng
			}, // 标记位置
			icon: {
				url: isFromDesk ? MARKER_CAR : MARKER_ICON, // 根据来源选择图标
				scaledSize: new google.maps.Size( // 设置图标尺寸
					isFromDesk ? MARKER_CAR_SIZE.width : MARKER_SIZE,
					isFromDesk ? MARKER_CAR_SIZE.height : MARKER_SIZE
				)
			},
			map: mapInstance, // 关联到地图实例
			optimized: false // 禁用优化以确保动态更新性能
		});
	}

	/**
	 * 主初始化函数 - 由Google Maps API调用
	 */
	function initMap() {
		// 检查浏览器是否支持地理位置API
		if (!navigator.geolocation) {
			showToast('您的浏览器不支持定位功能');
			return;
		}

		// 获取用户当前位置
		navigator.geolocation.getCurrentPosition(
			position => initMapCore(position), // 成功回调
			error => handleGeoError(error), // 错误回调
			{ // 定位配置选项
				enableHighAccuracy: true, // 高精度模式
				timeout: 8000, // 8秒超时
				maximumAge: 0 // 不使用缓存位置
			}
		);
	}

	/**
	 * 处理地理位置错误
	 * @param {GeolocationPositionError} error - 地理位置错误对象
	 */
	function handleGeoError(error) {
		// 定义错误代码对应的用户友好消息
		const errorMessages = {
			1: '位置服务被拒绝，请在设置中开启权限', // PERMISSION_DENIED
			2: '暂时获取不到位置信息，请确保网络畅通', // POSITION_UNAVAILABLE
			3: '获取位置信息超时，请重试' // TIMEOUT
		};

		// 显示错误消息（优先使用预设消息，否则显示原生错误）
		showToast(errorMessages[error.code] || '获取位置失败: ' + error.message);
	}

	/**
	 * 设置事件监听器，处理按钮点击并发送消息到宿主环境
	 * @param {string} source - 消息来源标识符
	 */
	function setupEventListeners(source) {
		// 按钮配置：ID与对应的消息类型
		const buttonConfigs = [{
				id: 'btn1',
				type: 1
			}, // 锁门
			{
				id: 'btn3',
				type: 3
			}, // 开门
			{
				id: 'btn5',
				type: 5
			}, // 寻车
			{
				id: 'btnReturn',
				type: 'btnReturn'
			}, // 归还车辆
			{
				id: 'btnSee',
				type: 'btnSee'
			}, // 查看照片
			{
				id: 'btn8',
				type: 8
			}, // 风控拦截
			{
				id: 'btn6',
				type: 6
			} // 取消风控
		];

		// 为每个按钮配置添加事件监听
		buttonConfigs.forEach(config => {
			const button = document.getElementById(config.id);
			button?.addEventListener('click', () => sendMessageToHost(source, config.type));
		});
	}

	/**
	 * 向宿主环境发送标准化消息
	 * @param {string} source - 消息来源标识符
	 * @param {number|string} actionType - 按钮操作类型
	 */
	function sendMessageToHost(source, actionType) {
		uni.postMessage({
			data: {
				source: source,
				type: actionType,
				timestamp: Date.now() // 确保消息唯一性
			}
		});
	}


	/**
	 * 显示提示信息（简化版）
	 * @param {string} message - 要显示的消息
	 */
	function showToast(message) {
		// 实际项目中应替换为更友好的UI提示
		console.warn('Toast:', message); // 控制台警告
		// alert(message); // 简单弹窗（生产环境应注释掉）
	}
	/**
	 * 高级按钮可见性控制器（配置驱动 + 自动化状态管理）
	 * @param {string} source - 当前场景标识
	 */
	function toggleVisibility() {
		// 场景配置矩阵（场景 -> 按钮ID -> 显示状态）
		const visibilityMatrix = {
			desk: {
				btn1: true,
				btn3: true,
				btn5: true,
				btnSee: true,
				btnReturn: true
			},
			fk: {
				btn6: true,
				btn8: true
			}
		};

		// 自动化状态应用（单次DOM遍历）
		Object.entries(visibilityMatrix).forEach(([scene, buttons]) => {
			Object.keys(buttons).forEach(id => {
				const element = document.getElementById(id);
				if (element) {
					// 当前场景显示，其他场景隐藏
					element.style.display = source === scene ? 'block' : 'none';
				}
			});
		});
	}

	// 将initMap函数暴露给全局作用域，供Google Maps API回调
	window.initMap = initMap;
})();