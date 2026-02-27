// ============================================================
// types/index.ts — Type definitions for Equipment System
// ============================================================

// --- Enums ---

export type EquipmentStatus = 'available' | 'borrowed' | 'maintenance'
export type UserRole = 'admin' | 'teacher' | 'student'

// --- Core Entities ---

export interface Equipment {
  id: number
  name: string
  category: string
  serialNo: string
  status: EquipmentStatus
  borrowedBy: string | null
  createdAt: string
  updatedAt: string
}

export interface User {
  id: number
  email: string
  name: string
  role: UserRole
}

export interface BorrowRecord {
  id: number
  equipmentId: number
  userId: number
  purpose: string
  borrowedAt: string
  expectedReturn: string
  returnedAt: string | null
  equipment: Pick<Equipment, 'id' | 'name' | 'serialNo'>
  user: Pick<User, 'id' | 'name' | 'email'>
}

// --- API Response Wrapper ---

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

// --- Form Data ---

export interface LoginFormData {
  email: string
  password: string
}

export interface BorrowFormData {
  equipmentId: number
  purpose: string
  expectedReturn: string
}

export interface EquipmentFormData {
  name: string
  category: string
  serialNo: string
}

// --- Auth Context ---

export interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

// --- Socket.io Events ---

export interface EquipmentStatusChangedPayload {
  equipmentId: number
  newStatus: EquipmentStatus
  borrowedBy: string | null
}
