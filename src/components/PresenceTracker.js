'use client'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase'

export default function PresenceTracker() {
  useEffect(() => {
    const supabase = createClient()
    let userId = null
    let heartbeat = null

    async function setOnline(id) {
      await supabase.from('profiles').update({ is_online: true, last_seen: new Date().toISOString() }).eq('id', id)
    }

    async function setOffline(id) {
      await supabase.from('profiles').update({ is_online: false, last_seen: new Date().toISOString() }).eq('id', id)
    }

    async function init() {
      const { data } = await supabase.auth.getUser()
      if (!data?.user) return
      userId = data.user.id
      await setOnline(userId)
      heartbeat = setInterval(() => setOnline(userId), 30000)
    }

    init()

    const handleVisibilityChange = () => {
      if (!userId) return
      if (document.hidden) {
        setOffline(userId)
        clearInterval(heartbeat)
      } else {
        setOnline(userId)
        heartbeat = setInterval(() => setOnline(userId), 30000)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearInterval(heartbeat)
      if (userId) setOffline(userId)
    }
  }, [])

  return null
}
