import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { requireAuth, requireRole } from '../middleware/auth'
import type { Server as SocketIOServer } from 'socket.io'

// inject socket.io server สำหรับ emit real-time events
export function createEquipmentRouter(io: SocketIOServer) {
  const router = Router()

  // Validation schemas
  const createSchema = z.object({
    name: z.string().min(2),
    category: z.string().min(2),
    serialNo: z.string().min(3),
  })

  const updateStatusSchema = z.object({
    status: z.enum(['available', 'borrowed', 'maintenance']),
    borrowedBy: z.string().nullable().optional(),
  })

  // GET /api/equipments — ทุกคนดูได้ (แต่ต้อง login)
  router.get('/', requireAuth, async (_req, res) => {
    const equipments = await prisma.equipment.findMany({
      orderBy: { createdAt: 'desc' },
    })
    res.json({ success: true, data: equipments })
  })

  // POST /api/equipments — เฉพาะ admin/teacher
  router.post('/', requireAuth, requireRole('admin', 'teacher'), async (req, res) => {
    const parsed = createSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ success: false, message: parsed.error.errors[0].message })
      return
    }

    const equipment = await prisma.equipment.create({ data: parsed.data })
    res.status(201).json({ success: true, data: equipment })
  })

  // PATCH /api/equipments/:id — อัปเดต status + emit real-time
  router.patch('/:id', requireAuth, async (req, res) => {
    const id = parseInt(req.params.id)
    const parsed = updateStatusSchema.safeParse(req.body)

    if (isNaN(id) || !parsed.success) {
      res.status(400).json({ success: false, message: 'ข้อมูลไม่ถูกต้อง' })
      return
    }

    const updated = await prisma.equipment.update({
      where: { id },
      data: parsed.data,
    })

    // Emit real-time event ให้ทุก client ที่ join room
    io.to('equipment-updates').emit('equipmentStatusChanged', {
      equipmentId: id,
      newStatus: updated.status,
      borrowedBy: updated.status === 'available' ? null : (parsed.data.borrowedBy ?? null),
    })

    res.json({ success: true, data: updated })
  })

  // DELETE /api/equipments/:id — เฉพาะ admin
  router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
    const id = parseInt(req.params.id)

    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'ID ไม่ถูกต้อง' })
      return
    }

    await prisma.equipment.delete({ where: { id } })
    res.json({ success: true, message: 'ลบอุปกรณ์เรียบร้อย' })
  })

  return router
}
