import { apiClient } from './config'
import type { Equipment, ApiResponse, EquipmentFormData } from '../types'

const ENDPOINT = '/api/equipments'

export async function getEquipments(): Promise<Equipment[]> {
  const res = await apiClient.get<ApiResponse<Equipment[]>>(ENDPOINT)
  return res.data.data
}

export async function createEquipment(
  payload: EquipmentFormData
): Promise<Equipment> {
  const res = await apiClient.post<ApiResponse<Equipment>>(ENDPOINT, payload)
  return res.data.data
}

export async function updateEquipmentStatus(
  id: number,
  status: Equipment['status'],
  borrowedBy?: string
): Promise<Equipment> {
  const res = await apiClient.patch<ApiResponse<Equipment>>(
    `${ENDPOINT}/${id}`,
    { status, borrowedBy: borrowedBy ?? null }
  )
  return res.data.data
}

export async function deleteEquipment(id: number): Promise<void> {
  await apiClient.delete(`${ENDPOINT}/${id}`)
}
