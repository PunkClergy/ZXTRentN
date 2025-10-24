import {
	http
} from '@/utils/request/http'


export const u_promotionalApi = (data) => http.get('/promotionalApi/list', data)
export const u_promotionalApiWxBooklist = (data) => http.get('/promotionalApi/wxFilelist', data)
export const u_industryList = (data) => http.get('/promotionalApi/industryList', data)
