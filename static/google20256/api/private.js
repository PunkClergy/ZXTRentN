// u_carList, u_sendInfo, u_uploadLog
import {
	http
} from '@/utils/request/http'
export const u_paivatecarList = (data) => http.get('/carapi/getCarList', data) //获取车辆列表
export const u_paivatesendInfo = (data) => http.postFormData('/renterApi/uploadControlRecord', data) //上传日志
export const u_paivateuploadLog = (data) => http.post('/loggerapi/uploadLog', data) //上传报文
export const u_getCarBluetoothKeyByCode = (data) => http.get('/renterApi/getCarBluetoothKeyByCode', data) //验证code合法性


export const u_paivateAddOrUpdateCar = (data) => http.postFormData('/carapi/addOrUpdateCar', data) //新增设备
export const u_paivateCarapiDeleteCar = (data) => http.postFormData('/carapi/deleteCar', data) //删除设备

