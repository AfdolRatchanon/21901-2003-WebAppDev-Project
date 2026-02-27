// ============================================================
// lib/cookie.ts — ฟังก์ชันจัดการ Cookie ฝั่ง Frontend
// ============================================================

// ตั้งค่า cookie พร้อมกำหนดวันหมดอายุ
export function setCookie(name: string, value: string, days: number): void {
  const expires = new Date()
  expires.setDate(expires.getDate() + days)
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/`
}

// อ่านค่า cookie ตามชื่อ (คืนค่า null ถ้าไม่พบ)
export function getCookie(name: string): string | null {
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [key, val] = cookie.trim().split('=')
    if (key === name) return decodeURIComponent(val ?? '')
  }
  return null
}

// ลบ cookie โดยตั้งวันหมดอายุเป็นอดีต
export function deleteCookie(name: string): void {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`
}
