'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Profile } from '@/types'

interface ProfileCtx {
  profile: Profile
  avatarUrl: string | null
  fullName: string
  setAvatarUrl: (url: string) => void
  setFullName: (name: string) => void
}

const Ctx = createContext<ProfileCtx | null>(null)

export function ProfileProvider({ profile, children }: { profile: Profile, children: ReactNode }) {
  const avatarKey = `avatar_${profile.id}`
  const nameKey   = `name_${profile.id}`

  const [avatarUrl, _setAvatarUrl] = useState<string | null>(null)
  const [fullName, _setFullName] = useState<string>(profile.full_name)

  useEffect(() => {
    const stored = localStorage.getItem(avatarKey)
    _setAvatarUrl(stored || profile.avatar_url || null)
    const storedName = localStorage.getItem(nameKey)
    if (storedName) _setFullName(storedName)
  }, [])

  function setAvatarUrl(url: string) {
    localStorage.setItem(avatarKey, url)
    _setAvatarUrl(url)
  }

  function setFullName(name: string) {
    localStorage.setItem(nameKey, name)
    _setFullName(name)
  }

  return (
    <Ctx.Provider value={{ profile, avatarUrl, fullName, setAvatarUrl, setFullName }}>
      {children}
    </Ctx.Provider>
  )
}

export function useProfile() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useProfile must be used inside ProfileProvider')
  return ctx
}

export function useProfileSafe() {
  return useContext(Ctx)
}
