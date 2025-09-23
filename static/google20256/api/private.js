// u_carList, u_sendInfo, u_uploadLog
import {
	http
} from '@/utils/request/http'
export const u_paivatecarList = (data) => http.get('/carapi/getCarList', data) //获取车辆列表
export const u_paivatesendInfo = (data) => http.postFormData('/renterApi/uploadControlRecord', data) //xxx
export const u_paivateuploadLog = (data) => http.post('/loggerapi/uploadLog', data) //上传报文
export const u_getCarBluetoothKeyByCode = (data) => http.get('/renterApi/getCarBluetoothKeyByCode', data) //验证code合法性
