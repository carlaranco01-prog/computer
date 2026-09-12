'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AppShell from '@/components/AppShell'
import Modal from '@/components/Modal'
import { Toast, useToast } from '@/components/Toast'
import { MaintenanceBadge } from '@/components/Badges'
import { Profile, Maintenance, MaintenanceStatus } from '@/types'
import { Plus, Search, Pencil } from 'lucide-react'

const STATUSES: MaintenanceStatus[] = ['Pending', 'In Progress', 'Completed']

export default function AdminMaintenancePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [records, setRecords] = useState<Maintenance[]>([])
  const [filtered, setFiltered] = useState<Maintenance[]>([])
  const [computers, setComputers] = useState<{ id: string; computer_name: string; computer_code: string }[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [showAdd, setShowAdd] = useState(false)
  const [editTarget, setEditTarget] = useState<Maintenance | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast, show, hide } = useToast()
  const [form, setForm] = useState({ computer_id: '', issue: '', description: '', maintenance_date: new Date().toISOString().split('T')[0], status: 'Pending' as MaintenanceStatus, remarks: '' })

  async function loadData() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    setProfile(p)
    const { data: r } = await supabase.from('maintenance').select('*, computers(computer_name, computer_code)').order('created_at', { ascending: false })
    setRecords(r ?? [])
    const { data: c } = await supabase.from('computers').select('id, computer_name, computer_code')
    setComputers(c ?? [])
  }

  useEffect(() => { loadData() }, [])

  useEffect(() => {
    let result = records
    if (statusFilter !== 'All') result = result.filter(r => r.status === statusFilter)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(r =>
        r.issue.toLowerCase().includes(q) ||
        (r as any).computers?.computer_name.toLowerCase().includes(q) ||
        (r as any).computers?.computer_code.toLowerCase().includes(q)
      )
    }
    setFiltered(result)
  }, [records, search, statusFilter])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.computer_id || !form.issue) { show('Fill in required fields.', 'error'); return }
    setLoading(true)
    const supabase = createClient()
    const { error } = editTarget
      ? await supabase.from('maintenance').update(form).eq('id', editTarget.id)
      : await supabase.from('maintenance').insert(form)
    if (error) { show(error.message, 'error') }
    else {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) await supabase.from('activity_logs').insert({ user_id: user.id, action: editTarget ? 'Maintenance Updated' : 'Maintenance Created', description: `Issue: ${form.issue}` })
      show(editTarget ? 'Record updated!' : 'Record added!', 'success')
      setShowAdd(false)
      setEditTarget(null)
      resetForm()
      loadData()
    }
    setLoading(false)
  }

  function resetForm() {
    setForm({ computer_id: '', issue: '', description: '', maintenance_date: new Date().toISOString().split('T')[0], status: 'Pending', remarks: '' })
  }

  function openEdit(r: Maintenance) {
    setForm({ computer_id: r.computer_id, issue: r.issue, description: r.description ?? '', maintenance_date: r.maintenance_date, status: r.status, remarks: r.remarks ?? '' })
    setEditTarget(r)
    setShowAdd(true)
  }

  if (!profile) return null

  return (
    <AppShell role="admin" userName={profile.full_name} title="Manage Maintenance">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-2 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="input pl-9" placeholder="Search by issue or computer..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="input w-auto" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              {['All', ...STATUSES].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <button onClick={() => { resetForm(); setEditTarget(null); setShowAdd(true) }} className="btn-primary flex items-center gap-2 whitespace-nowrap">
            <Plus size={16} /> Add Record
          </button>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="table-header">Computer</th>
                  <th className="table-header">Issue</th>
                  <th className="table-header hidden md:table-cell">Date</th>
                  <th className="table-header">Status</th>
                  <th className="table-header hidden lg:table-cell">Remarks</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="table-cell">
                      <p className="font-medium">{(r as any).computers?.computer_name}</p>
                      <p className="text-xs text-slate-400 font-mono">{(r as any).computers?.computer_code}</p>
                    </td>
                    <td className="table-cell">{r.issue}</td>
                    <td className="table-cell hidden md:table-cell">{new Date(r.maintenance_date).toLocaleDateString()}</td>
                    <td className="table-cell"><MaintenanceBadge status={r.status} /></td>
                    <td className="table-cell hidden lg:table-cell text-slate-500 text-xs">{r.remarks || '—'}</td>
                    <td className="table-cell">
                      <button onClick={() => openEdit(r)} className="p-1.5 hover:bg-yellow-50 text-yellow-600 rounded-lg transition-colors">
                        <Pencil size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-10 text-slate-400 text-sm">No maintenance records found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showAdd && (
        <Modal title={editTarget ? 'Edit Maintenance Record' : 'Add Maintenance Record'} onClose={() => { setShowAdd(false); setEditTarget(null) }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Computer *</label>
              <select className="input" value={form.computer_id} onChange={e => setForm(f => ({ ...f, computer_id: e.target.value }))}>
                <option value="">Select computer</option>
                {computers.map(c => <option key={c.id} value={c.id}>{c.computer_name} ({c.computer_code})</option>)}
              </select>
            </div>
            <div>
              <label className="label">Issue *</label>
              <input className="input" placeholder="e.g. Screen flickering" value={form.issue} onChange={e => setForm(f => ({ ...f, issue: e.target.value }))} />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Date</label>
                <input className="input" type="date" value={form.maintenance_date} onChange={e => setForm(f => ({ ...f, maintenance_date: e.target.value }))} />
              </div>
              <div>
                <label className="label">Status</label>
                <select className="input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as MaintenanceStatus }))}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Remarks</label>
              <input className="input" placeholder="Optional notes..." value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : editTarget ? 'Update' : 'Add Record'}</button>
              <button type="button" className="btn-secondary" onClick={() => { setShowAdd(false); setEditTarget(null) }}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </AppShell>
  )
}
