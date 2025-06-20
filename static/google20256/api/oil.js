import {
	http
} from '@/utils/request/http'
export const u_oilDipstickapiDipsticHistory = (data) => http.get('/oilDipstickapi/dipsticHistory', data) //油量检测记录
export const u_dzBussinessMobileApiGetCarStatus = (data) => http.postFormData('/dzBussinessMobileApi/getCarStatus', data) //自动检测


