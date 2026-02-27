import { apiClient } from './config'
import type { ApiResponse, User } from '../types'

interface LoginResponse {
  token: string
  user: User
}

export async function loginApi(
  email: string,
  password: string
): Promise<LoginResponse> {
  const res = await apiClient.post<ApiResponse<LoginResponse>>(
    '/api/auth/login',
    { email, password }
  )
  return res.data.data
}

export async function logoutApi(): Promise<void> {
  await apiClient.post('/api/auth/logout')
}
