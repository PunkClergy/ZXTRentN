import {
	http
} from '@/utils/request/http'
export const u_getCarList = (data) => http.get('/carapi/getCarList', data)//车辆列表
export const u_addOrUpdateCar = (data) => http.postFormData('/carapi/addOrUpdateCar', data)//车辆编辑和新增



