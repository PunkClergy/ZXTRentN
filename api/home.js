import {
	http
} from '@/utils/request/http'
export const u_navlist = (data) => http.get('/appdeskapi/navlist', data)
export const u_logo = (data) => http.get('/appdeskapi/logo', data)
export const u_bannerlist = (data) => http.get('/appdeskapi/bannerlist', data)
export const u_midMenulist = (data) => http.get('/appdeskapi/midMenulist', data)
export const u_rightMenulist = (data) => http.get('/appdeskapi/rightMenulist', data)
