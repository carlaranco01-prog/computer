'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AppShell from '@/components/AppShell'
import { MaintenanceBadge } from '@/components/Badges'
import { Toast, useToast } from '@/components/Toast'
import { Wrench, Plus } from 'lucide-react'
import Modal from '@/components/Modal'
import { Maintenance, Profile } from '@/types'

export default function MaintenancePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [records, setRecords] = useState<Maintenance[]>([])
  const [computers, setComputers] = useState<{ id: string; computer_name: string; computer_code: string }[]>([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast, show, hide } = useToast()
  const [form, setForm] = useState({ computer_id: '', issue: '', description: '', maintenance_date: new Date().toISOString().split('T')[0] })

  async function loadData() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    setProfile(p)
    const { data: assignment } = await supabase
      .from('computer_assignments')
      .select('computer_id, computers(id, computer_name, computer_code)')
      .eq('user_id', user.id)
      .eq('status', 'Active')
      .single()
    if (assignment?.computers) {
      const c = assignment.computers as unknown as { id: string; computer_name: string; computer_code: string }
      setComputers([c])
      setForm(f => ({ ...f, computer_id: c.id }))
    }
    const { data: recs } = await supabase
      .from('maintenance')
      .select('*, computers(computer_name, computer_code)')
      .order('created_at', { ascending: false })
    setRecords(recs ?? [])
  }

  useEffect(() => { loadData() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.computer_id || !form.issue) { show('Please fill in required fields.', 'error'); return }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('maintenance').insert(form)
    if (error) { show(error.message, 'error') }
    else {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) await supabase.from('activity_logs').insert({ user_id: user.id, action: 'Maintenance Created', description: `Reported issue: ${form.issue}` })
      show('Problem reported successfully!', 'success')
      setShowModal(false)
      setForm(f => ({ ...f, issue: '', description: '' }))
      loadData()
    }
    setLoading(false)
  }

  if (!profile) return null

  return (
    <AppShell role="user" userName={profile.full_name} title="Maintenance">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Maintenance Records</h2>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Report Problem
          </button>
        </div>

        <div className="card overflow-hidden">
          {records.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="table-header">Computer</th>
                    <th className="table-header">Issue</th>
                    <th className="table-header">Date</th>
                    <th className="table-header">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="table-cell">
                        <p className="font-medium">{(r as any).computers?.computer_name}</p>
                        <p className="text-xs text-slate-400 font-mono">{(r as any).computers?.computer_code}</p>
                      </td>
                      <td className="table-cell">{r.issue}</td>
                      <td className="table-cell">{new Date(r.maintenance_date).toLocaleDateString()}</td>
                      <td className="table-cell"><MaintenanceBadge status={r.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <Wrench size={32} className="mx-auto mb-2 opacity-30" />
              <p className="font-medium">No maintenance records</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <Modal title="Report a Problem" onClose={() => setShowModal(false)}>
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
              <textarea className="input" rows={3} placeholder="Describe the problem in detail..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div>
              <label className="label">Date</label>
              <input className="input" type="date" value={form.maintenance_date} onChange={e => setForm(f => ({ ...f, maintenance_date: e.target.value }))} />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Submitting...' : 'Submit Report'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </AppShell>
  )
}
