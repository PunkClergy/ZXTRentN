import { http } from '@/utils/request/http'

export const login = (data) => http.post('/login', data)

