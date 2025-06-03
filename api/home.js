import {
	http
} from '@/utils/request/http'
export const u_navlist = (data) => http.get('/deskapi/navlist', data)
export const u_logo = (data) => http.get('/deskapi/logo', data)
export const u_bannerlist = (data) => http.get('/api/bannerlist', data)
export const u_midMenulist = (data) => http.get('/deskapi/midMenulist', data)