import {
	http
} from '@/utils/request/http'
export const u_companyInfo = (data) => http.get('/companyapi/companyInfo', data) //查询资料
export const u_companyImprove = (data) => http.postFormData('/companyapi/companyImprove', data) //查询资料




