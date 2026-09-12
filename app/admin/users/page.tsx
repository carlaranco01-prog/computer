'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AppShell from '@/components/AppShell'
import Modal from '@/components/Modal'
import { Toast, useToast } from '@/components/Toast'
import { RoleBadge } from '@/components/Badges'
import { Profile } from '@/types'
import { Search, Eye } from 'lucide-react'

export default function AdminUsersPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [users, setUsers] = useState<Profile[]>([])
  const [filtered, setFiltered] = useState<Profile[]>([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const [viewTarget, setViewTarget] = useState<Profile | null>(null)
  const [editRole, setEditRole] = useState<Profile | null>(null)
  const [newRole, setNewRole] = useState<'admin' | 'user'>('user')
  const [loading, setLoading] = useState(false)
  const { toast, show, hide } = useToast()

  async function loadData() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    setProfile(p)
    const { data: u } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    setUsers(u ?? [])
  }

  useEffect(() => { loadData() }, [])

  useEffect(() => {
    let result = users
    if (roleFilter !== 'All') result = result.filter(u => u.role === roleFilter)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(u => u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    }
    setFiltered(result)
  }, [users, search, roleFilter])

  async function handleRoleUpdate() {
    if (!editRole) return
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', editRole.id)
    if (error) show(error.message, 'error')
    else { show('Role updated!', 'success'); setEditRole(null); loadData() }
    setLoading(false)
  }

  if (!profile) return null

  return (
    <AppShell role="admin" userName={profile.full_name} title="Manage Users">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input pl-9" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input w-auto" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            {['All', 'admin', 'user'].map(r => <option key={r}>{r}</option>)}
          </select>
        </div>

        <div className="card overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <p className="text-sm text-slate-500">{filtered.length} user{filtered.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="table-header">Name</th>
                  <th className="table-header hidden md:table-cell">Email</th>
                  <th className="table-header">Role</th>
                  <th className="table-header hidden lg:table-cell">Joined</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-xs font-bold shrink-0">
                          {u.full_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{u.full_name}</span>
                      </div>
                    </td>
                    <td className="table-cell hidden md:table-cell text-slate-500">{u.email}</td>
                    <td className="table-cell"><RoleBadge role={u.role} /></td>
                    <td className="table-cell hidden lg:table-cell text-slate-500 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setViewTarget(u)} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors">
                          <Eye size={15} />
                        </button>
                        <button onClick={() => { setEditRole(u); setNewRole(u.role) }} className="text-xs btn-secondary py-1 px-2">
                          Change Role
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-10 text-slate-400 text-sm">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {viewTarget && (
        <Modal title="User Details" onClose={() => setViewTarget(null)} size="sm">
          <div className="space-y-3">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-2xl font-bold">
                {viewTarget.full_name.charAt(0).toUpperCase()}
              </div>
            </div>
            {[['Full Name', viewTarget.full_name], ['Email', viewTarget.email], ['Role', viewTarget.role], ['Joined', new Date(viewTarget.created_at).toLocaleDateString()]].map(([l, v]) => (
              <div key={l} className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-sm text-slate-500">{l}</span>
                <span className="text-sm font-medium">{v}</span>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {editRole && (
        <Modal title="Change User Role" onClose={() => setEditRole(null)} size="sm">
          <p className="text-sm text-slate-600 mb-4">Change role for <strong>{editRole.full_name}</strong></p>
          <div className="mb-4">
            <label className="label">New Role</label>
            <select className="input" value={newRole} onChange={e => setNewRole(e.target.value as 'admin' | 'user')}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button onClick={handleRoleUpdate} className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Update Role'}</button>
            <button onClick={() => setEditRole(null)} className="btn-secondary">Cancel</button>
          </div>
        </Modal>
      )}
    </AppShell>
  )
}
