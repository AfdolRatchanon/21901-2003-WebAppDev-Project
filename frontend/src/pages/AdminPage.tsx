import { useState, type FormEvent } from 'react'
import { useEquipments } from '../hooks/useEquipments'
import { createEquipment, deleteEquipment } from '../api/equipmentApi'
import type { EquipmentFormData } from '../types'

export function AdminPage() {
  const { equipments, isLoading, refetch } = useEquipments()

  // State สำหรับฟอร์มเพิ่มอุปกรณ์ใหม่
  const [form, setForm] = useState<EquipmentFormData>({
    name: '',
    category: '',
    serialNo: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)

  // นับจำนวนอุปกรณ์ตามสถานะ
  const countByStatus = {
    total: equipments.length,
    available: equipments.filter(e => e.status === 'available').length,
    borrowed: equipments.filter(e => e.status === 'borrowed').length,
    maintenance: equipments.filter(e => e.status === 'maintenance').length,
  }

  // จัดการ input ฟอร์ม
  function handleChange(field: keyof EquipmentFormData, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  // Submit เพิ่มอุปกรณ์ใหม่
  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    setFormSuccess(null)
    setIsSubmitting(true)

    try {
      await createEquipment(form)
      setForm({ name: '', category: '', serialNo: '' })
      setFormSuccess(`เพิ่มอุปกรณ์ "${form.name}" เรียบร้อยแล้ว`)
      refetch()
    } catch {
      setFormError('ไม่สามารถเพิ่มอุปกรณ์ได้ กรุณาตรวจสอบข้อมูล')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ลบอุปกรณ์
  async function handleDelete(id: number, name: string) {
    if (!confirm(`ยืนยันการลบอุปกรณ์ "${name}"?`)) return
    try {
      await deleteEquipment(id)
      refetch()
    } catch {
      alert('ไม่สามารถลบอุปกรณ์ได้')
    }
  }

  const statusLabel: Record<string, string> = {
    available: 'ว่าง',
    borrowed: 'ถูกยืม',
    maintenance: 'ซ่อมบำรุง',
  }

  const statusBadge: Record<string, string> = {
    available: 'bg-green-100 text-green-700',
    borrowed: 'bg-red-100 text-red-700',
    maintenance: 'bg-amber-100 text-amber-700',
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">จัดการอุปกรณ์</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm">
          <p className="text-3xl font-extrabold text-blue-600">{countByStatus.total}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">ทั้งหมด</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm">
          <p className="text-3xl font-extrabold text-green-600">{countByStatus.available}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">ว่าง</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm">
          <p className="text-3xl font-extrabold text-red-600">{countByStatus.borrowed}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">ถูกยืม</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm">
          <p className="text-3xl font-extrabold text-amber-600">{countByStatus.maintenance}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">ซ่อมบำรุง</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Form: เพิ่มอุปกรณ์ใหม่ */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-700">เพิ่มอุปกรณ์ใหม่</h2>
          </div>
          <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg">
                {formError}
              </div>
            )}
            {formSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-xs px-3 py-2 rounded-lg">
                {formSuccess}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">ชื่ออุปกรณ์</label>
              <input
                type="text"
                placeholder="เช่น โน้ตบุ๊ค Dell XPS 13"
                value={form.name}
                onChange={e => handleChange('name', e.target.value)}
                required
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">หมวดหมู่</label>
              <input
                type="text"
                placeholder="เช่น Laptop, Projector, Router"
                value={form.category}
                onChange={e => handleChange('category', e.target.value)}
                required
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">Serial No.</label>
              <input
                type="text"
                placeholder="เช่น SN-2024-001"
                value={form.serialNo}
                onChange={e => handleChange('serialNo', e.target.value)}
                required
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
            >
              {isSubmitting ? 'กำลังบันทึก...' : '+ เพิ่มอุปกรณ์'}
            </button>
          </form>
        </div>

        {/* Table: รายการอุปกรณ์ทั้งหมด */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-700">รายการอุปกรณ์ทั้งหมด ({equipments.length})</h2>
          </div>

          {isLoading ? (
            <p className="text-center text-slate-400 py-12 text-sm">กำลังโหลด...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                    <th className="text-left px-5 py-3 font-semibold">ชื่ออุปกรณ์</th>
                    <th className="text-left px-4 py-3 font-semibold">หมวดหมู่</th>
                    <th className="text-left px-4 py-3 font-semibold">Serial No.</th>
                    <th className="text-left px-4 py-3 font-semibold">สถานะ</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {equipments.map(eq => (
                    <tr key={eq.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-slate-800">{eq.name}</td>
                      <td className="px-4 py-3 text-slate-500">{eq.category}</td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-xs">{eq.serialNo}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${statusBadge[eq.status]}`}>
                          {statusLabel[eq.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {/* ลบได้เฉพาะอุปกรณ์ที่ว่าง */}
                        {eq.status === 'available' && (
                          <button
                            onClick={() => handleDelete(eq.id, eq.name)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs font-semibold px-2.5 py-1 rounded transition-colors"
                          >
                            ลบ
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {equipments.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center text-slate-400 py-12">
                        ยังไม่มีอุปกรณ์ในระบบ
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </main>
  )
}
