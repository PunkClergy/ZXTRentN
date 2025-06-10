import {
	http
} from '@/utils/request/http'
export const u_getCarList = (data) => http.get('/carapi/getCarList', data)

