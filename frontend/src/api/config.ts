import axios from 'axios'

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

// Interceptor: แนบ JWT token ทุก request อัตโนมัติ
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor: จัดการ 401 Unauthorized → redirect ไป login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
