var currentLat = ''; // 当前位置纬度（重命名更清晰）
var currentLng = ''; // 当前位置经度
var zoom = 18; // 地图缩放比例
var meMarker = ''; // 个人位置标记点
var img = "https://k3a.wiselink.net.cn/img/app/currentLocation.png"
var markers = []
var lastClickedMarker = null; // 记录当前点击的marker
let openInfoWindow; // 当前打开的信息窗口
var info = [];
var map; // 全局map实例
var isMapInitialized = false; // 标记地图是否初始化

// 消息监听器
window.addEventListener('message', (e) => {
	if (e.data.type === 'elctrncky') {
		console.log('收到初始化数据:', e.data.payload);
		info = e.data.payload;

		// 如果地图已初始化，直接创建标记
		if (isMapInitialized) {
			createMarkers();
		}
	}
});

/**
 * 初始化地图
 */
function initMap() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(position => {
			currentLat = position.coords.latitude;
			currentLng = position.coords.longitude;

			map = new google.maps.Map(document.getElementById('map'), {
				zoom: zoom,
				center: {
					lat: currentLat,
					lng: currentLng
				},
				animation: 'BOUNCE'
			});

			setMePositioning();
			isMapInitialized = true;

			// 如果已有数据，创建标记
			if (info.length > 0) {
				createMarkers();
			}
		}, fail => {
			console.error('获取位置失败:', fail);
			Toast('获取位置失败，请检查定位权限', 2000);
		}, {
			enableHighAccuracy: true,
			timeout: 5000
		});
	} else {
		Toast('您的浏览器不支持Geolocation API', 2000);
	}
}

/**
 * 设置用户位置标记
 */
function setMePositioning() {
	meMarker = new google.maps.Marker({
		position: {
			lat: currentLat,
			lng: currentLng
		},
		icon: {
			url: img,
			scaledSize: new google.maps.Size(50, 50),
		},
		animation: 'BOUNCE',
		map: map
	});
}

/**
 * 创建标记点
 */
function createMarkers() {
	// 清除现有标记
	clearMarkers();

	info.forEach((item, index) => {
		if (!item || !item.latitude || !item.longitude) {
			console.warn('无效的数据项:', item);
			return;
		}

		const marker = new google.maps.Marker({
			position: {
				lat: item.latitude,
				lng: item.longitude
			},
			title: item.plateNumber,
			icon: {
				url: 'https://k3a.wiselink.net.cn/img/app/g_location.png',
				scaledSize: new google.maps.Size(17, 36),
			},
			address: item.address,
			map: map
		});

		markers.push(marker);
		setupMarkerEvents(marker, index);
	});
}

/**
 * 设置标记点事件
 */
function setupMarkerEvents(marker, index) {
	// 创建信息窗口内容
	const contentString = `<div id="myButton_${index}">
        <div class="infoWindow-title">${marker.title}</div>
        <p class="textoverflow">${marker.address}</p>
    </div>`;

	const infowindow = new google.maps.InfoWindow({
		content: contentString,
		maxWidth: 200,
		disableAutoPan: true
	});

	// 添加点击事件监听
	marker.addListener('click', () => {



		lastClickedMarker = marker;

		// 关闭之前的信息窗口并打开新的
		if (openInfoWindow) {
			openInfoWindow.close();
		}
		infowindow.open(map, marker);
		openInfoWindow = infowindow;
		alert(123)

	});
}

/**
 * 清除所有标记
 */
function clearMarkers() {
	markers.forEach(marker => marker.setMap(null));
	markers = [];
}

// 按钮事件绑定
document.getElementById('btn').addEventListener('click', () => {
	uni.postMessage({
		data: {
			source: 1
		}
	});
});

document.getElementById('btn1').addEventListener('click', () => {
	uni.postMessage({
		data: {
			source: 2,
			payload: info
		}
	});
});

window.initMap = initMap;