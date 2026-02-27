import { useState, type FormEvent } from 'react'
import { z } from 'zod'
import type { AuthContextType } from '../types'

// Schema ตรวจสอบข้อมูลฟอร์ม Login ฝั่ง Frontend
const loginSchema = z.object({
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
  password: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
})

type LoginErrors = Partial<Record<keyof z.infer<typeof loginSchema>, string>>

interface LoginPageProps {
  auth: AuthContextType
}

export function LoginPage({ auth }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<LoginErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // จัดการ submit ฟอร์ม Login
  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setServerError(null)

    // ตรวจสอบข้อมูลด้วย Zod ก่อนส่ง API
    const result = loginSchema.safeParse({ email, password })
    if (!result.success) {
      const errors: LoginErrors = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof LoginErrors
        errors[field] = issue.message
      }
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})
    setIsLoading(true)
    const success = await auth.login(email, password)
    if (!success) setServerError('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🖥️</div>
          <h1 className="text-xl font-bold text-slate-800">ระบบเบิก-จ่ายอุปกรณ์ไอที</h1>
          <p className="text-sm text-slate-500 mt-1">กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Server Error */}
          {serverError && (
            <p className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-lg">
              {serverError}
            </p>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">อีเมล</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@school.ac.th"
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.email ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
            />
            {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">รหัสผ่าน</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••"
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.password ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
            />
            {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>

        </form>

        {/* Demo Hint */}
        <div className="mt-5 bg-slate-50 rounded-lg border border-slate-200 p-3 text-center">
          <p className="text-xs font-semibold text-slate-400 mb-1">ข้อมูลทดสอบ</p>
          <p className="text-xs text-slate-500">admin@school.ac.th / admin123</p>
          <p className="text-xs text-slate-500">teacher@school.ac.th / teacher123</p>
          <p className="text-xs text-slate-500">student@school.ac.th / student123</p>
        </div>

      </div>
    </div>
  )
}
