import { useState, useEffect } from 'react'
import { loginApi } from '../api/authApi'
import { apiClient } from '../api/config'
import { setCookie, getCookie, deleteCookie } from '../lib/cookie'
import type { User, AuthContextType } from '../types'

// ชื่อ cookie ที่ใช้เก็บ token และข้อมูล user
const TOKEN_COOKIE = 'auth_token'
const USER_COOKIE = 'auth_user'

export function useAuth(): AuthContextType {
  // restore user จาก Cookie เมื่อ refresh หน้า
  const [user, setUser] = useState<User | null>(() => {
    const stored = getCookie(USER_COOKIE)
    try { return stored ? (JSON.parse(stored) as User) : null }
    catch { return null }
  })

  const [token, setToken] = useState<string | null>(
    () => getCookie(TOKEN_COOKIE)
  )

  // เมื่อ mount: ถ้ามี token ให้ตั้ง axios header
  useEffect(() => {
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
  }, [token])

  async function login(email: string, password: string): Promise<boolean> {
    try {
      const { token: newToken, user: loggedInUser } = await loginApi(email, password)
      // บันทึก token และ user ลงใน Cookie (หมดอายุใน 1 วัน)
      setCookie(TOKEN_COOKIE, newToken, 1)
      setCookie(USER_COOKIE, JSON.stringify(loggedInUser), 1)
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
      setToken(newToken)
      setUser(loggedInUser)
      return true
    } catch {
      return false
    }
  }

  function logout() {
    // ลบ Cookie เมื่อ logout
    deleteCookie(TOKEN_COOKIE)
    deleteCookie(USER_COOKIE)
    delete apiClient.defaults.headers.common['Authorization']
    setToken(null)
    setUser(null)
  }

  return {
    user,
    token,
    login,
    logout,
    isAuthenticated: token !== null,
  }
}
