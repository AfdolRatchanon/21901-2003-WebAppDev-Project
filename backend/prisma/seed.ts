import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // hash ทีละคน แล้ว upsert — ป้องกัน connection timeout ใน XAMPP MySQL
  const adminPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@school.ac.th' },
    update: {},
    create: { email: 'admin@school.ac.th', password: adminPassword, name: 'ผู้ดูแลระบบ', role: 'admin' },
  })

  const teacherPassword = await bcrypt.hash('teacher123', 10)
  await prisma.user.upsert({
    where: { email: 'teacher@school.ac.th' },
    update: {},
    create: { email: 'teacher@school.ac.th', password: teacherPassword, name: 'อาจารย์สมชาย', role: 'teacher' },
  })

  const studentPassword = await bcrypt.hash('student123', 10)
  await prisma.user.upsert({
    where: { email: 'student@school.ac.th' },
    update: {},
    create: { email: 'student@school.ac.th', password: studentPassword, name: 'นักเรียนสมหญิง', role: 'student' },
  })

  console.log('✅ Users seeded')

  // Seed Equipments ทีละรายการ
  const equipments = [
    { serialNo: 'MB-001', name: 'MacBook Pro 14"', category: 'Notebook', status: 'available' },
    { serialNo: 'MB-002', name: 'MacBook Pro 14"', category: 'Notebook', status: 'borrowed' },
    { serialNo: 'IP-001', name: 'iPad Air 5th Gen', category: 'Tablet', status: 'available' },
    { serialNo: 'IP-002', name: 'iPad Air 5th Gen', category: 'Tablet', status: 'available' },
    { serialNo: 'DL-001', name: 'Dell Monitor 27"', category: 'Monitor', status: 'maintenance' },
    { serialNo: 'LG-001', name: 'Logitech Webcam', category: 'Peripheral', status: 'available' },
  ]

  for (const eq of equipments) {
    await prisma.equipment.upsert({
      where: { serialNo: eq.serialNo },
      update: {},
      create: eq,
    })
  }

  console.log('✅ Equipments seeded')
  console.log('')
  console.log('📋 Test Accounts:')
  console.log('  admin@school.ac.th    / admin123')
  console.log('  teacher@school.ac.th  / teacher123')
  console.log('  student@school.ac.th  / student123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
