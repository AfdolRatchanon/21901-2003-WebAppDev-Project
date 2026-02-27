import { useState, type FormEvent } from 'react'
import { z } from 'zod'
import { useEquipments } from '../hooks/useEquipments'
import { createEquipment, deleteEquipment } from '../api/equipmentApi'
import type { EquipmentFormData } from '../types'

// Schema ตรวจสอบข้อมูลฟอร์มเพิ่มอุปกรณ์ ฝั่ง Frontend
const equipmentSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่ออุปกรณ์'),
  category: z.string().min(1, 'กรุณากรอกหมวดหมู่'),
  serialNo: z.string().min(1, 'กรุณากรอก Serial No.'),
})

type EquipmentErrors = Partial<Record<keyof z.infer<typeof equipmentSchema>, string>>

const statusLabel: Record<string, string> = {
  available: 'ว่าง',
  borrowed: 'ถูกยืม',
  maintenance: 'ซ่อมบำรุง',
}

const statusBadge: Record<string, string> = {
  available: 'bg-green-100 text-green-700',
  borrowed: 'bg-red-100 text-red-700',
  maintenance: 'bg-yellow-100 text-yellow-700',
}

export function AdminPage() {
  const { equipments, isLoading, refetch } = useEquipments()

  const [form, setForm] = useState<EquipmentFormData>({ name: '', category: '', serialNo: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<EquipmentErrors>({})
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

    // ตรวจสอบข้อมูลด้วย Zod ก่อนส่ง API
    const result = equipmentSchema.safeParse(form)
    if (!result.success) {
      const errors: EquipmentErrors = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof EquipmentErrors
        errors[field] = issue.message
      }
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})
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

  return (
    <main className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">จัดการอุปกรณ์</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">{countByStatus.total}</p>
          <p className="text-sm text-slate-500 mt-1">ทั้งหมด</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{countByStatus.available}</p>
          <p className="text-sm text-slate-500 mt-1">ว่าง</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-3xl font-bold text-red-500">{countByStatus.borrowed}</p>
          <p className="text-sm text-slate-500 mt-1">ถูกยืม</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-3xl font-bold text-yellow-500">{countByStatus.maintenance}</p>
          <p className="text-sm text-slate-500 mt-1">ซ่อมบำรุง</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Form: เพิ่มอุปกรณ์ใหม่ */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-700">เพิ่มอุปกรณ์ใหม่</h2>
          </div>
          <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">

            {formError   && <p className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-lg">{formError}</p>}
            {formSuccess && <p className="bg-green-50 border border-green-200 text-green-700 text-sm px-3 py-2 rounded-lg">{formSuccess}</p>}

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">ชื่ออุปกรณ์</label>
              <input
                type="text" placeholder="เช่น โน้ตบุ๊ค Dell XPS 13"
                value={form.name} onChange={e => handleChange('name', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${fieldErrors.name ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
              />
              {fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">หมวดหมู่</label>
              <input
                type="text" placeholder="เช่น Laptop, Projector, Router"
                value={form.category} onChange={e => handleChange('category', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${fieldErrors.category ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
              />
              {fieldErrors.category && <p className="text-red-500 text-xs mt-1">{fieldErrors.category}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">Serial No.</label>
              <input
                type="text" placeholder="เช่น SN-2024-001"
                value={form.serialNo} onChange={e => handleChange('serialNo', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${fieldErrors.serialNo ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
              />
              {fieldErrors.serialNo && <p className="text-red-500 text-xs mt-1">{fieldErrors.serialNo}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'กำลังบันทึก...' : '+ เพิ่มอุปกรณ์'}
            </button>
          </form>
        </div>

        {/* Table: รายการอุปกรณ์ทั้งหมด */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-700">รายการอุปกรณ์ทั้งหมด ({equipments.length})</h2>
          </div>

          {isLoading ? (
            <p className="text-center text-slate-400 py-12">กำลังโหลด...</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs">
                <tr>
                  <th className="text-left px-5 py-3">ชื่ออุปกรณ์</th>
                  <th className="text-left px-4 py-3">หมวดหมู่</th>
                  <th className="text-left px-4 py-3">Serial No.</th>
                  <th className="text-left px-4 py-3">สถานะ</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {equipments.map(eq => (
                  <tr key={eq.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-800">{eq.name}</td>
                    <td className="px-4 py-3 text-slate-500">{eq.category}</td>
                    <td className="px-4 py-3 text-slate-400 font-mono text-xs">{eq.serialNo}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusBadge[eq.status]}`}>
                        {statusLabel[eq.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {/* ลบได้เฉพาะอุปกรณ์ที่ว่าง */}
                      {eq.status === 'available' && (
                        <button
                          onClick={() => handleDelete(eq.id, eq.name)}
                          className="text-red-500 text-xs hover:underline"
                        >
                          ลบ
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {equipments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-slate-400 py-12">ยังไม่มีอุปกรณ์ในระบบ</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </main>
  )
}
