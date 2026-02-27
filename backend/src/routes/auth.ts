import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

const router = Router()

// Validation schema
const loginSchema = z.object({
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  password: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  // Server-side validation ด้วย Zod
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: parsed.error.issues[0].message,
    })
    return
  }

  const { email, password } = parsed.data

  const user = await prisma.user.findUnique({ where: { email } })

  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ success: false, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' })
    return
  }

  const secret = process.env.JWT_SECRET ?? 'dev-secret-change-in-production'
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    secret,
    { expiresIn: '8h' }
  )

  res.json({
    success: true,
    data: {
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    },
  })
})

export default router
