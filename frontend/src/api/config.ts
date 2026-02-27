import axios from 'axios'
import { getCookie, deleteCookie } from '../lib/cookie'

// Base URL จาก environment variable
// Development: http://localhost:3000 (proxied via vite.config.ts)
// Production: ค่าจาก VITE_API_URL ใน Vercel
export const API_BASE_URL: string =
  import.meta.env.VITE_API_URL ?? ''

// Axios instance พร้อม interceptor
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Interceptor: แนบ JWT token จาก Cookie ทุก request อัตโนมัติ
apiClient.interceptors.request.use((config) => {
  const token = getCookie('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor: จัดการ 401 Unauthorized → ลบ Cookie แล้ว redirect ไป login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      deleteCookie('auth_token')
      deleteCookie('auth_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
