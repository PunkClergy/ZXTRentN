import { http } from '@/utils/request/http'

export const login = (data) => http.get('/api/login', data)
export const u_getQrcodeImg = (data) => http.get('/deskapi/getQrcodeImg', data)


