import { useState, useEffect, useCallback } from 'react'
import { getEquipments } from '../api/equipmentApi'
import type { Equipment } from '../types'

export function useEquipments() {
  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEquipments = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getEquipments()
      setEquipments(data)
    } catch {
      setError('ไม่สามารถโหลดข้อมูลอุปกรณ์ได้')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEquipments()
  }, [fetchEquipments])

  return { equipments, setEquipments, isLoading, error, refetch: fetchEquipments }
}
