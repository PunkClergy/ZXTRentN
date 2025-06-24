import { http } from '@/utils/request/http'

export const login = (data) => http.get('/api/login', data)
export const u_getQrcodeImg = (data) => http.get('/deskapi/getQrcodeImg', data)//获取入群二维码
export const u_updatePassword = (data) => http.get('/api/updatePassword', data)//修改密码

