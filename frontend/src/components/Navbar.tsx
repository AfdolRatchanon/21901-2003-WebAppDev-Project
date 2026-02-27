import { Link, useLocation } from 'react-router-dom'
import type { AuthContextType } from '../types'

interface NavbarProps {
  auth: AuthContextType
}

// แสดงชื่อ role เป็นภาษาไทย
const roleLabel: Record<string, string> = {
  admin: 'ผู้ดูแล',
  teacher: 'อาจารย์',
  student: 'นักเรียน',
}

// สีของ role badge แต่ละประเภท
const roleBadgeClass: Record<string, string> = {
  admin: 'bg-violet-600 text-white',
  teacher: 'bg-cyan-600 text-white',
  student: 'bg-teal-600 text-white',
}

export function Navbar({ auth }: NavbarProps) {
  const location = useLocation()
  const role = auth.user?.role ?? 'student'

  // ฟังก์ชันช่วยตรวจสอบว่า link นี้ active อยู่ไหม
  function isActive(path: string) {
    return location.pathname === path
  }

  return (
    <nav className="sticky top-0 z-10 bg-slate-800 shadow-md">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-4">

        {/* Logo / Brand */}
        <Link to="/" className="text-white font-bold text-sm shrink-0 hover:text-slate-200 transition-colors">
          🖥️ ระบบเบิก-จ่ายอุปกรณ์ไอที
        </Link>

        {/* Navigation Links */}
        <div className="flex gap-1 flex-1">
          <Link to="/" className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${isActive('/') ? 'text-white bg-white/15' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}>
            อุปกรณ์
          </Link>

          {/* เมนู "จัดการ" แสดงเฉพาะ admin และ teacher */}
          {(role === 'admin' || role === 'teacher') && (
            <Link to="/admin" className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${isActive('/admin') ? 'text-white bg-white/15' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}>
              จัดการ
            </Link>
          )}
        </div>

        {/* User Info + Logout */}
        <div className="flex items-center gap-3 shrink-0">
          {/* ชื่อและ role badge */}
          <div className="hidden sm:flex flex-col items-end gap-0.5">
            <span className="text-slate-100 text-sm font-semibold leading-none">
              {auth.user?.name}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${roleBadgeClass[role]}`}>
              {roleLabel[role]}
            </span>
          </div>

          {/* ปุ่มออกจากระบบ */}
          <button
            onClick={auth.logout}
            className="text-slate-400 hover:text-white border border-white/20 hover:border-white/50 px-3 py-1.5 rounded text-sm transition-colors"
          >
            ออกจากระบบ
          </button>
        </div>

      </div>
    </nav>
  )
}
