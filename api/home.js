import { http } from '@/utils/request/http'
export const u_navlist = (data) => http.get('/deskapi/navlist',data)

