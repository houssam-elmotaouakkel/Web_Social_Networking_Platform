import { useContext } from 'react'
import { BadgeContext } from '../contexts/createBadgeContext'

export function useBadges() {
  return useContext(BadgeContext)
}
