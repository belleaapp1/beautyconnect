'use client'
import { useEffect } from 'react'

export default function PageTracker({ path, profileId }: { path: string; profileId?: string }) {
  useEffect(() => {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, profile_id: profileId ?? null }),
    }).catch(() => {})
  }, [path, profileId])
  return null
}
