import 'dotenv/config'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../../generated/prisma/client'

// Parse DATABASE_URL เพื่อสร้าง adapter สำหรับ MySQL/MariaDB
const url = process.env.DATABASE_URL ?? 'mysql://root:@localhost:3306/equipment_db'
const parsed = new URL(url)

const adapter = new PrismaMariaDb({
  host: parsed.hostname,
  port: Number(parsed.port) || 3306,
  user: parsed.username || 'root',
  password: parsed.password || '',
  database: parsed.pathname.slice(1),
  connectionLimit: 5,
})

// Singleton pattern — ใช้ instance เดียวทั้งแอป
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
