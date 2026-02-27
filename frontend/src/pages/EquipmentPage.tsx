import { useState, useCallback } from 'react'
import { useEquipments } from '../hooks/useEquipments'
import { useEquipmentRealtime } from '../hooks/useEquipmentRealtime'
import { updateEquipmentStatus } from '../api/equipmentApi'
import type { EquipmentStatusChangedPayload, AuthContextType } from '../types'

interface EquipmentPageProps {
  auth: AuthContextType
}

// Label สำหรับแสดงสถานะเป็นภาษาไทย
const statusLabel = {
  available: 'ว่าง',
  borrowed: 'ถูกยืม',
  maintenance: 'ซ่อมบำรุง',
}

// Tailwind classes สำหรับแต่ละสถานะ (border + badge)
const statusConfig = {
  available: {
    border: 'border-l-green-500',
    badge: 'bg-green-100 text-green-700',
  },
  borrowed: {
    border: 'border-l-red-500',
    badge: 'bg-red-100 text-red-700',
  },
  maintenance: {
    border: 'border-l-amber-500',
    badge: 'bg-amber-100 text-amber-700',
  },
}

export function EquipmentPage({ auth }: EquipmentPageProps) {
  const { equipments, setEquipments, isLoading, error, refetch } = useEquipments()

  // state สำหรับฟอร์มยืมอุปกรณ์ (เปิดแสดงที่การ์ดไหน)
  const [borrowingId, setBorrowingId] = useState<number | null>(null)
  const [purpose, setPurpose] = useState('')
  const [expectedReturn, setExpectedReturn] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)

  // Real-time: รับ event จาก Socket.io แล้วอัปเดต state โดยตรง (ไม่ต้อง refetch)
  const handleRealtimeChange = useCallback(
    (payload: EquipmentStatusChangedPayload) => {
      setEquipments(prev =>
        prev.map(eq =>
          eq.id === payload.equipmentId
            ? { ...eq, status: payload.newStatus, borrowedBy: payload.borrowedBy }
            : eq
        )
      )
    },
    [setEquipments]
  )

  const { isConnected } = useEquipmentRealtime(handleRealtimeChange)

  // ยืมอุปกรณ์ — PATCH status = 'borrowed'
  async function handleBorrow(equipmentId: number) {
    if (!purpose.trim()) {
      setActionError('กรุณาระบุวัตถุประสงค์การใช้งาน')
      return
    }
    if (!expectedReturn) {
      setActionError('กรุณาเลือกวันที่คาดว่าจะคืน')
      return
    }
    try {
      await updateEquipmentStatus(equipmentId, 'borrowed', auth.user?.name ?? '')
      setBorrowingId(null)
      setPurpose('')
      setExpectedReturn('')
      refetch()
    } catch {
      setActionError('ไม่สามารถยืมอุปกรณ์ได้ กรุณาลองใหม่')
    }
  }

  // คืนอุปกรณ์ — PATCH status = 'available'
  async function handleReturn(equipmentId: number) {
    try {
      await updateEquipmentStatus(equipmentId, 'available')
      refetch()
    } catch {
      setActionError('ไม่สามารถคืนอุปกรณ์ได้ กรุณาลองใหม่')
    }
  }

  const isAdminOrTeacher = auth.user?.role === 'admin' || auth.user?.role === 'teacher'

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">

      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-slate-800">รายการอุปกรณ์</h1>

        {/* Real-time connection indicator */}
        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
          isConnected
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-600'
        }`}>
          {isConnected ? '● เชื่อมต่อแล้ว (Real-time)' : '○ ออฟไลน์'}
        </span>
      </div>

      {/* Action Error Alert */}
      {actionError && (
        <div className="flex items-center justify-between bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="ml-3 text-red-400 hover:text-red-700">✕</button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <p className="text-center text-slate-400 py-16">กำลังโหลดข้อมูล...</p>
      )}

      {/* Fetch Error */}
      {error && (
        <p className="text-center text-red-600 bg-red-50 rounded-lg px-4 py-3 mb-4">{error}</p>
      )}

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {equipments.map(eq => {
          const config = statusConfig[eq.status]

          return (
            <div
              key={eq.id}
              className={`bg-white rounded-xl border border-slate-200 border-l-4 ${config.border} p-4 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all`}
            >
              {/* Card Header: ชื่อ + status badge */}
              <div className="flex justify-between items-start gap-2 mb-1">
                <span className="font-bold text-slate-800 text-sm leading-snug">{eq.name}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 uppercase tracking-wide ${config.badge}`}>
                  {statusLabel[eq.status]}
                </span>
              </div>

              {/* รายละเอียด */}
              <p className="text-xs text-slate-500 mb-1">{eq.category} · S/N: {eq.serialNo}</p>
              {eq.borrowedBy && (
                <p className="text-xs text-red-500 font-semibold mb-2">ยืมโดย: {eq.borrowedBy}</p>
              )}

              {/* Borrow Form (inline — แสดงเมื่อกดยืม) */}
              {borrowingId === eq.id ? (
                <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-dashed border-slate-300 flex flex-col gap-2">
                  <input
                    type="text"
                    placeholder="วัตถุประสงค์การใช้งาน"
                    value={purpose}
                    onChange={e => setPurpose(e.target.value)}
                    className="border border-slate-300 rounded-md px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <input
                    type="date"
                    value={expectedReturn}
                    onChange={e => setExpectedReturn(e.target.value)}
                    className="border border-slate-300 rounded-md px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBorrow(eq.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors"
                    >
                      ยืนยัน
                    </button>
                    <button
                      onClick={() => { setBorrowingId(null); setPurpose(''); setExpectedReturn('') }}
                      className="border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-semibold px-3 py-1.5 rounded-md transition-colors"
                    >
                      ยกเลิก
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 flex-wrap mt-3">

                  {/* ปุ่มยืม — เฉพาะอุปกรณ์ที่ว่าง */}
                  {eq.status === 'available' && (
                    <button
                      onClick={() => { setBorrowingId(eq.id); setActionError(null) }}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors"
                    >
                      ยืมอุปกรณ์
                    </button>
                  )}

                  {/* ปุ่มคืน — เฉพาะอุปกรณ์ที่ถูกยืม */}
                  {eq.status === 'borrowed' && (
                    <button
                      onClick={() => handleReturn(eq.id)}
                      className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors"
                    >
                      คืนอุปกรณ์
                    </button>
                  )}

                  {/* admin/teacher: เปลี่ยนสถานะเป็นซ่อมบำรุง */}
                  {isAdminOrTeacher && eq.status === 'available' && (
                    <button
                      onClick={() => updateEquipmentStatus(eq.id, 'maintenance').then(refetch)}
                      className="border border-amber-400 text-amber-600 hover:bg-amber-50 text-xs font-semibold px-3 py-1.5 rounded-md transition-colors"
                    >
                      ซ่อมบำรุง
                    </button>
                  )}
                  {isAdminOrTeacher && eq.status === 'maintenance' && (
                    <button
                      onClick={() => updateEquipmentStatus(eq.id, 'available').then(refetch)}
                      className="border border-green-400 text-green-600 hover:bg-green-50 text-xs font-semibold px-3 py-1.5 rounded-md transition-colors"
                    >
                      พร้อมใช้งาน
                    </button>
                  )}

                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {!isLoading && equipments.length === 0 && (
        <p className="text-center text-slate-400 py-16">ยังไม่มีอุปกรณ์ในระบบ</p>
      )}

    </main>
  )
}
