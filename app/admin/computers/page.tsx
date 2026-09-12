'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AppShell from '@/components/AppShell'
import ComputerTable from '@/components/ComputerTable'
import ComputerForm from '@/components/ComputerForm'
import Modal from '@/components/Modal'
import { Toast, useToast } from '@/components/Toast'
import { Computer, Profile, ComputerStatus } from '@/types'
import { Plus, Search } from 'lucide-react'

const STATUSES: (ComputerStatus | 'All')[] = ['All', 'Available', 'Assigned', 'Under Maintenance', 'Damaged', 'Retired']

export default function AdminComputersPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [computers, setComputers] = useState<Computer[]>([])
  const [filtered, setFiltered] = useState<Computer[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [showAdd, setShowAdd] = useState(false)
  const [editTarget, setEditTarget] = useState<Computer | null>(null)
  const [viewTarget, setViewTarget] = useState<Computer | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Computer | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { toast, show, hide } = useToast()

  async function loadData() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    setProfile(p)
    const { data: c } = await supabase.from('computers').select('*').order('created_at', { ascending: false })
    setComputers(c ?? [])
  }

  useEffect(() => { loadData() }, [])

  useEffect(() => {
    let result = computers
    if (statusFilter !== 'All') result = result.filter(c => c.status === statusFilter)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(c =>
        c.computer_code.toLowerCase().includes(q) ||
        c.computer_name.toLowerCase().includes(q) ||
        c.brand.toLowerCase().includes(q) ||
        c.model.toLowerCase().includes(q) ||
        c.serial_number.toLowerCase().includes(q) ||
        (c.location ?? '').toLowerCase().includes(q)
      )
    }
    setFiltered(result)
  }, [computers, search, statusFilter])

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const supabase = createClient()
    const { error } = await supabase.from('computers').delete().eq('id', deleteTarget.id)
    if (error) { show(error.message, 'error') }
    else {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) await supabase.from('activity_logs').insert({
        user_id: user.id,
        action: 'Computer Deleted',
        description: `Deleted: ${deleteTarget.computer_name} (${deleteTarget.computer_code})`,
      })
      show('Computer deleted.', 'success')
      setDeleteTarget(null)
      loadData()
    }
    setDeleting(false)
  }

  if (!profile) return null

  return (
    <AppShell role="admin" userName={profile.full_name} title="Manage Computers">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-2 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="input pl-9" placeholder="Search by code, name, brand, model..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="input w-auto" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2 whitespace-nowrap">
            <Plus size={16} /> Add Computer
          </button>
        </div>

        <div className="card overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <p className="text-sm text-slate-500">{filtered.length} computer{filtered.length !== 1 ? 's' : ''} found</p>
          </div>
          <ComputerTable computers={filtered} isAdmin onEdit={setEditTarget} onDelete={setDeleteTarget} onView={setViewTarget} />
        </div>
      </div>

      {showAdd && (
        <Modal title="Add Computer" onClose={() => setShowAdd(false)} size="lg">
          <ComputerForm onSuccess={() => { setShowAdd(false); loadData() }} onCancel={() => setShowAdd(false)} />
        </Modal>
      )}

      {editTarget && (
        <Modal title="Edit Computer" onClose={() => setEditTarget(null)} size="lg">
          <ComputerForm initial={editTarget} onSuccess={() => { setEditTarget(null); loadData() }} onCancel={() => setEditTarget(null)} />
        </Modal>
      )}

      {viewTarget && (
        <Modal title="Computer Details" onClose={() => setViewTarget(null)}>
          <div className="space-y-3">
            {([
              ['Computer Code', viewTarget.computer_code],
              ['Computer Name', viewTarget.computer_name],
              ['Brand', viewTarget.brand],
              ['Model', viewTarget.model],
              ['Serial Number', viewTarget.serial_number],
              ['Processor', viewTarget.processor],
              ['RAM', viewTarget.ram],
              ['Storage', viewTarget.storage],
              ['Operating System', viewTarget.operating_system],
              ['Location', viewTarget.location],
              ['Status', viewTarget.status],
            ] as [string, string][]).map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 py-1 border-b border-slate-50">
                <span className="text-sm text-slate-500 shrink-0">{label}</span>
                <span className="text-sm font-medium text-slate-800 text-right">{value || '—'}</span>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Confirm Delete" onClose={() => setDeleteTarget(null)} size="sm">
          <p className="text-sm text-slate-600 mb-4">
            Are you sure you want to delete <strong>{deleteTarget.computer_name}</strong> ({deleteTarget.computer_code})? This cannot be undone.
          </p>
          <div className="flex gap-3">
            <button onClick={handleDelete} className="btn-danger" disabled={deleting}>{deleting ? 'Deleting...' : 'Delete'}</button>
            <button onClick={() => setDeleteTarget(null)} className="btn-secondary">Cancel</button>
          </div>
        </Modal>
      )}
    </AppShell>
  )
}
