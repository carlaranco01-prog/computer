'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AppShell from '@/components/AppShell'
import Modal from '@/components/Modal'
import { Toast, useToast } from '@/components/Toast'
import { RoleBadge } from '@/components/Badges'
import { Profile } from '@/types'
import { Search, Eye, Trash2 } from 'lucide-react'

export default function AdminUsersPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [users, setUsers] = useState<Profile[]>([])
  const [filtered, setFiltered] = useState<Profile[]>([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const [viewTarget, setViewTarget] = useState<Profile | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Profile | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
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

  async function handleRoleChange(userId: string, newRole: string) {
    setSavingId(userId)
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
    if (error) show(error.message, 'error')
    else {
      show('Role updated!', 'success')
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole as Profile['role'] } : u))
    }
    setSavingId(null)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const supabase = createClient()
    const { error } = await supabase.from('profiles').delete().eq('id', deleteTarget.id)
    if (error) show(error.message, 'error')
    else { show('User deleted.', 'success'); setDeleteTarget(null); loadData() }
    setDeleting(false)
  }

  const roleCounts = { all: users.length, admin: users.filter(u => u.role === 'admin').length, staff: users.filter(u => u.role === 'staff').length, user: users.filter(u => u.role === 'user').length }

  if (!profile) return null

  return (
    <AppShell role="admin" userName={profile.full_name} title="Manage Users" profile={profile}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}
      <div className="space-y-4">

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Total Users', value: roleCounts.all,   color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Admins',      value: roleCounts.admin,  color: 'text-violet-600', bg: 'bg-violet-50' },
            { label: 'Staff',       value: roleCounts.staff,  color: 'text-emerald-600',bg: 'bg-emerald-50' },
            { label: 'Users',       value: roleCounts.user,   color: 'text-slate-600',  bg: 'bg-slate-50' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className="card p-4">
              <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input pl-9" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input w-auto" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            {['All', 'admin', 'staff', 'user'].map(r => <option key={r}>{r}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">{filtered.length} user{filtered.length !== 1 ? 's' : ''}</p>
            <p className="text-xs text-slate-400">Role changes save instantly</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/80 border-b border-slate-200">
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
                  <tr key={u.id} className="table-row">
                    <td className="table-cell">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-700 text-xs font-bold shrink-0">
                          {u.full_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-800">{u.full_name}</span>
                      </div>
                    </td>
                    <td className="table-cell hidden md:table-cell text-slate-500">{u.email}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <select
                          value={u.role}
                          disabled={u.id === profile.id || savingId === u.id}
                          onChange={e => handleRoleChange(u.id, e.target.value)}
                          className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400/40 focus:border-indigo-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                        >
                          <option value="user">User</option>
                          <option value="staff">Staff</option>
                          <option value="admin">Admin</option>
                        </select>
                        {savingId === u.id && (
                          <span className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                        )}
                      </div>
                    </td>
                    <td className="table-cell hidden lg:table-cell text-slate-400 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setViewTarget(u)} className="p-1.5 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-colors" title="View">
                          <Eye size={15} />
                        </button>
                        {u.id !== profile.id && (
                          <button onClick={() => setDeleteTarget(u)} className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-colors" title="Delete">
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-12 text-slate-400 text-sm">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View modal */}
      {viewTarget && (
        <Modal title="User Details" onClose={() => setViewTarget(null)} size="sm">
          <div className="space-y-1">
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-700 text-2xl font-bold">
                {viewTarget.full_name.charAt(0).toUpperCase()}
              </div>
            </div>
            {([['Full Name', viewTarget.full_name], ['Email', viewTarget.email], ['Joined', new Date(viewTarget.created_at).toLocaleDateString()]] as [string, string][]).map(([l, v]) => (
              <div key={l} className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-sm text-slate-400">{l}</span>
                <span className="text-sm font-semibold text-slate-700">{v}</span>
              </div>
            ))}
            <div className="flex justify-between py-2">
              <span className="text-sm text-slate-400">Role</span>
              <RoleBadge role={viewTarget.role} />
            </div>
          </div>
        </Modal>
      )}

      {/* Delete modal */}
      {deleteTarget && (
        <Modal title="Delete User" onClose={() => setDeleteTarget(null)} size="sm">
          <p className="text-sm text-slate-600 mb-5">
            Are you sure you want to delete <strong>{deleteTarget.full_name}</strong>? This cannot be undone.
          </p>
          <div className="flex gap-3">
            <button onClick={handleDelete} className="btn-danger" disabled={deleting}>{deleting ? 'Deleting...' : 'Delete User'}</button>
            <button onClick={() => setDeleteTarget(null)} className="btn-secondary">Cancel</button>
          </div>
        </Modal>
      )}
    </AppShell>
  )
}

