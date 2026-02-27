import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

interface TokenPayload {
  userId: number
  email: string
  role: string
}

// ขยาย Express Request ให้มี user property
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'กรุณาเข้าสู่ระบบก่อน' })
    return
  }

  const token = authHeader.split(' ')[1]
  const secret = process.env.JWT_SECRET ?? 'dev-secret-change-in-production'

  try {
    const payload = jwt.verify(token, secret) as TokenPayload
    req.user = payload
    next()
  } catch {
    res.status(401).json({ success: false, message: 'Token ไม่ถูกต้องหรือหมดอายุ' })
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์ดำเนินการนี้' })
      return
    }
    next()
  }
}
