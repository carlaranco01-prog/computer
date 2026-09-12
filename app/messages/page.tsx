'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AppShell from '@/components/AppShell'
import MessageBoard from '@/components/MessageBoard'
import { Profile } from '@/types'
import { MessageSquare } from 'lucide-react'

export default function MessagesPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [admin, setAdmin] = useState<Profile | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(p)
      const { data: a } = await supabase.from('profiles').select('*').eq('role', 'admin').limit(1).single()
      setAdmin(a)
    }
    load()
  }, [])

  if (!profile) return null

  return (
    <AppShell role="user" userName={profile.full_name} title="Messages">
      <div className="max-w-2xl">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Message Administrator</h2>
        {admin ? (
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center gap-3">
              <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-sm">
                {admin.full_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-slate-800 text-sm">{admin.full_name}</p>
                <p className="text-xs text-slate-400">Administrator</p>
              </div>
            </div>
            <MessageBoard currentUserId={profile.id} otherUserId={admin.id} otherUserName={admin.full_name} />
          </div>
        ) : (
          <div className="card p-12 text-center text-slate-400">
            <MessageSquare size={32} className="mx-auto mb-2 opacity-30" />
            <p className="font-medium">No administrator found</p>
          </div>
        )}
      </div>
    </AppShell>
  )
}
