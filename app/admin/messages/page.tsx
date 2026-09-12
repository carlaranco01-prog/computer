'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AppShell from '@/components/AppShell'
import MessageBoard from '@/components/MessageBoard'
import { Profile } from '@/types'
import { MessageSquare } from 'lucide-react'

export default function AdminMessagesPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [users, setUsers] = useState<Profile[]>([])
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(p)
      const { data: u } = await supabase.from('profiles').select('*').eq('role', 'user').order('full_name')
      setUsers(u ?? [])
      // Count unread per user
      const { data: msgs } = await supabase.from('messages').select('sender_id').eq('receiver_id', user.id).eq('status', 'unread')
      const counts: Record<string, number> = {}
      msgs?.forEach(m => { counts[m.sender_id] = (counts[m.sender_id] ?? 0) + 1 })
      setUnreadCounts(counts)
    }
    load()
  }, [])

  if (!profile) return null

  return (
    <AppShell role="admin" userName={profile.full_name} title="Messages">
      <div className="flex gap-4 h-[calc(100vh-8rem)]">
        {/* User list */}
        <div className="w-64 shrink-0 card overflow-y-auto">
          <div className="p-4 border-b border-slate-200">
            <p className="text-sm font-semibold text-slate-700">Conversations</p>
          </div>
          {users.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-8">No users yet</p>
          )}
          {users.map(u => (
            <button
              key={u.id}
              onClick={() => setSelectedUser(u)}
              className={`w-full flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors border-b border-slate-100 text-left ${selectedUser?.id === u.id ? 'bg-blue-50' : ''}`}
            >
              <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                {u.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-800 truncate">{u.full_name}</p>
                <p className="text-xs text-slate-400 truncate">{u.email}</p>
              </div>
              {unreadCounts[u.id] > 0 && (
                <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center shrink-0">
                  {unreadCounts[u.id]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Chat area */}
        <div className="flex-1 card overflow-hidden flex flex-col">
          {selectedUser ? (
            <>
              <div className="p-4 border-b border-slate-200 flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm">
                  {selectedUser.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-slate-800 text-sm">{selectedUser.full_name}</p>
                  <p className="text-xs text-slate-400">{selectedUser.email}</p>
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <MessageBoard currentUserId={profile.id} otherUserId={selectedUser.id} otherUserName={selectedUser.full_name} />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">Select a user to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
