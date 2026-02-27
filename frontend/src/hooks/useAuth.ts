import { useState, useEffect } from 'react'
import { loginApi } from '../api/authApi'
import { apiClient } from '../api/config'
import type { User, AuthContextType } from '../types'

export function useAuth(): AuthContextType {
  // restore user จาก localStorage เมื่อ refresh หน้า
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user')
    try { return stored ? (JSON.parse(stored) as User) : null }
    catch { return null }
  })

  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('token')
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
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(loggedInUser))
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
      setToken(newToken)
      setUser(loggedInUser)
      return true
    } catch {
      return false
    }
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
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
