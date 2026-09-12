'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AppShell from '@/components/AppShell'
import Modal from '@/components/Modal'
import { Toast, useToast } from '@/components/Toast'
import { Profile, ComputerAssignment } from '@/types'
import { Plus, Search } from 'lucide-react'

export default function AdminAssignmentsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [assignments, setAssignments] = useState<ComputerAssignment[]>([])
  const [filtered, setFiltered] = useState<ComputerAssignment[]>([])
  const [computers, setComputers] = useState<{ id: string; computer_name: string; computer_code: string; status: string }[]>([])
  const [users, setUsers] = useState<Profile[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast, show, hide } = useToast()
  const [form, setForm] = useState({ computer_id: '', user_id: '', assigned_date: new Date().toISOString().split('T')[0], remarks: '' })

  async function loadData() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    setProfile(p)
    const { data: a } = await supabase.from('computer_assignments').select('*, computers(*), profiles(*)').order('created_at', { ascending: false })
    setAssignments(a ?? [])
    const { data: c } = await supabase.from('computers').select('id, computer_name, computer_code, status').eq('status', 'Available')
    setComputers(c ?? [])
    const { data: u } = await supabase.from('profiles').select('*').eq('role', 'user')
    setUsers(u ?? [])
  }

  useEffect(() => { loadData() }, [])

  useEffect(() => {
    let result = assignments
    if (statusFilter !== 'All') result = result.filter(a => a.status === statusFilter)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(a =>
        a.computers?.computer_name.toLowerCase().includes(q) ||
        a.computers?.computer_code.toLowerCase().includes(q) ||
        a.profiles?.full_name.toLowerCase().includes(q) ||
        a.profiles?.email.toLowerCase().includes(q)
      )
    }
    setFiltered(result)
  }, [assignments, search, statusFilter])

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault()
    if (!form.computer_id || !form.user_id) { show('Select a computer and user.', 'error'); return }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('computer_assignments').insert({ ...form, status: 'Active' })
    if (error) { show(error.message, 'error'); setLoading(false); return }
    await supabase.from('computers').update({ status: 'Assigned' }).eq('id', form.computer_id)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) await supabase.from('activity_logs').insert({ user_id: user.id, action: 'Computer Assigned', description: `Assigned computer to user` })
    show('Computer assigned!', 'success')
    setShowModal(false)
    setForm({ computer_id: '', user_id: '', assigned_date: new Date().toISOString().split('T')[0], remarks: '' })
    loadData()
    setLoading(false)
  }

  async function handleReturn(a: ComputerAssignment) {
    const supabase = createClient()
    await supabase.from('computer_assignments').update({ status: 'Returned', returned_date: new Date().toISOString().split('T')[0] }).eq('id', a.id)
    await supabase.from('computers').update({ status: 'Available' }).eq('id', a.computer_id)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) await supabase.from('activity_logs').insert({ user_id: user.id, action: 'Computer Returned', description: `Computer returned` })
    show('Computer marked as returned.', 'success')
    loadData()
  }

  if (!profile) return null

  return (
    <AppShell role="admin" userName={profile.full_name} title="Manage Assignments">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-2 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="input pl-9" placeholder="Search by computer or user..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="input w-auto" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              {['All', 'Active', 'Returned'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 whitespace-nowrap">
            <Plus size={16} /> Assign Computer
          </button>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="table-header">Computer</th>
                  <th className="table-header">User</th>
                  <th className="table-header">Assigned Date</th>
                  <th className="table-header hidden md:table-cell">Returned Date</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="table-cell">
                      <p className="font-medium">{a.computers?.computer_name}</p>
                      <p className="text-xs text-slate-400 font-mono">{a.computers?.computer_code}</p>
                    </td>
                    <td className="table-cell">
                      <p className="font-medium">{a.profiles?.full_name}</p>
                      <p className="text-xs text-slate-400">{a.profiles?.email}</p>
                    </td>
                    <td className="table-cell">{new Date(a.assigned_date).toLocaleDateString()}</td>
                    <td className="table-cell hidden md:table-cell">{a.returned_date ? new Date(a.returned_date).toLocaleDateString() : '—'}</td>
                    <td className="table-cell">
                      <span className={`badge ${a.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{a.status}</span>
                    </td>
                    <td className="table-cell">
                      {a.status === 'Active' && (
                        <button onClick={() => handleReturn(a)} className="text-xs btn-secondary py-1 px-2">Mark Returned</button>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-10 text-slate-400 text-sm">No assignments found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <Modal title="Assign Computer" onClose={() => setShowModal(false)}>
          <form onSubmit={handleAssign} className="space-y-4">
            <div>
              <label className="label">Computer *</label>
              <select className="input" value={form.computer_id} onChange={e => setForm(f => ({ ...f, computer_id: e.target.value }))}>
                <option value="">Select available computer</option>
                {computers.map(c => <option key={c.id} value={c.id}>{c.computer_name} ({c.computer_code})</option>)}
              </select>
            </div>
            <div>
              <label className="label">User *</label>
              <select className="input" value={form.user_id} onChange={e => setForm(f => ({ ...f, user_id: e.target.value }))}>
                <option value="">Select user</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>)}
              </select>
            </div>
            <div>
              <label className="label">Assigned Date</label>
              <input className="input" type="date" value={form.assigned_date} onChange={e => setForm(f => ({ ...f, assigned_date: e.target.value }))} />
            </div>
            <div>
              <label className="label">Remarks</label>
              <input className="input" placeholder="Optional notes..." value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Assigning...' : 'Assign Computer'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </AppShell>
  )
}
