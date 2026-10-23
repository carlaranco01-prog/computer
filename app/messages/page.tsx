'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AppShell from '@/components/AppShell'
import MessageBoard from '@/components/MessageBoard'
import { Profile } from '@/types'
import { MessageSquare } from 'lucide-react'

export default function MessagesPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [contacts, setContacts] = useState<Profile[]>([])
  const [selectedContact, setSelectedContact] = useState<Profile | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(p)
      const { data: staffAndAdmins } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['admin', 'staff'])
        .order('full_name')
      const availableContacts = staffAndAdmins ?? []
      setContacts(availableContacts)
      setSelectedContact(availableContacts.find(contact => contact.role === 'admin') ?? availableContacts[0] ?? null)
    }
    load()
  }, [])

  if (!profile) return null

  return (
    <AppShell role="user" userName={profile.full_name} title="Messages">
      <div className="flex flex-col sm:flex-row gap-4 h-[calc(100vh-8rem)]">
        <div className="w-full sm:w-64 sm:shrink-0 card overflow-y-auto max-h-44 sm:max-h-none">
          <div className="p-4 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-700">Conversations</p>
          </div>
          {contacts.length === 0 && <p className="text-sm text-slate-400 text-center py-8">No staff or administrator accounts found</p>}
          {contacts.map(contact => (
            <button
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className={`w-full flex items-center gap-3 p-3 hover:bg-indigo-50/50 transition-colors border-b border-slate-100 text-left ${selectedContact?.id === contact.id ? 'bg-indigo-50' : ''}`}
            >
              <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                {contact.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-800 truncate">{contact.full_name}</p>
                <p className="text-xs text-slate-400">{contact.role === 'admin' ? 'Administrator' : 'Staff'}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="flex-1 card overflow-hidden flex flex-col">
          {selectedContact ? (
            <>
              <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-700 font-bold text-sm">
                  {selectedContact.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{selectedContact.full_name}</p>
                  <p className="text-xs text-slate-400">{selectedContact.role === 'admin' ? 'Administrator' : 'Staff'}</p>
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <MessageBoard currentUserId={profile.id} otherUserId={selectedContact.id} otherUserName={selectedContact.full_name} />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">No staff or administrator available</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}


