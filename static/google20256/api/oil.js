import {
	http
} from '@/utils/request/http'
export const u_oilDipstickapiDipsticHistory = (data) => http.get('/oilDipstickapi/dipsticHistory', data) //油量检测记录
export const u_dzBussinessMobileApiGetCarStatus = (data) => http.postFormData('/dzBussinessMobileApi/getCarStatus', data) //自动检测
export const u_dzBussinessMobileApiRentStart = (data) => http.get('/oilDipstickapi/rentStart', data) //起租

