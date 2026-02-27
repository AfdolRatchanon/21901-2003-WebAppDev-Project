import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import type { EquipmentStatusChangedPayload } from '../types'

export function useEquipmentRealtime(
  onStatusChange: (payload: EquipmentStatusChangedPayload) => void
) {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const socket = io({ path: '/socket.io' })

    socket.on('connect', () => setIsConnected(true))
    socket.on('disconnect', () => setIsConnected(false))

    socket.on('equipmentStatusChanged', (payload: EquipmentStatusChangedPayload) => {
      onStatusChange(payload)
    })

    socket.emit('joinRoom', 'equipment-updates')

    return () => {
      socket.disconnect()
    }
  }, [onStatusChange])

  return { isConnected }
}
