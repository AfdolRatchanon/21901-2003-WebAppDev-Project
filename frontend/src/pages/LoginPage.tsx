import { useState, type FormEvent } from 'react'
import type { AuthContextType } from '../types'

interface LoginPageProps {
  auth: AuthContextType
}

export function LoginPage({ auth }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // จัดการ submit ฟอร์ม Login
  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const success = await auth.login(email, password)
    if (!success) {
      setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-800 to-slate-700">
      <div className="bg-white rounded-2xl p-10 w-full max-w-sm shadow-2xl">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🖥️</div>
          <h1 className="text-xl font-bold text-slate-800">ระบบเบิก-จ่ายอุปกรณ์ไอที</h1>
          <p className="text-sm text-slate-500 mt-1">กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-semibold text-slate-700">
              อีเมล
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@school.ac.th"
              required
              className="border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-semibold text-slate-700">
              รหัสผ่าน
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••"
              required
              className="border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg text-sm transition-colors mt-1"
          >
            {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        {/* Demo Hint */}
        <div className="mt-6 p-3 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-center">
          <p className="text-xs text-slate-400 font-semibold mb-1">ข้อมูลทดสอบ</p>
          <p className="text-xs text-slate-500">admin@school.ac.th / admin123</p>
          <p className="text-xs text-slate-500">teacher@school.ac.th / teacher123</p>
          <p className="text-xs text-slate-500">student@school.ac.th / student123</p>
        </div>

      </div>
    </div>
  )
}
