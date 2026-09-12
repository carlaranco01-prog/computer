'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Computer, ComputerStatus } from '@/types'
import { Toast, useToast } from './Toast'

const STATUSES: ComputerStatus[] = ['Available', 'Assigned', 'Under Maintenance', 'Damaged', 'Retired']

interface ComputerFormProps {
  initial?: Partial<Computer>
  onSuccess: () => void
  onCancel: () => void
}

export default function ComputerForm({ initial, onSuccess, onCancel }: ComputerFormProps) {
  const isEdit = !!initial?.id
  const { toast, show, hide } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    computer_code: initial?.computer_code ?? '',
    computer_name: initial?.computer_name ?? '',
    brand: initial?.brand ?? '',
    model: initial?.model ?? '',
    serial_number: initial?.serial_number ?? '',
    processor: initial?.processor ?? '',
    ram: initial?.ram ?? '',
    storage: initial?.storage ?? '',
    operating_system: initial?.operating_system ?? '',
    location: initial?.location ?? '',
    status: initial?.status ?? 'Available' as ComputerStatus,
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.computer_code || !form.computer_name || !form.brand || !form.model || !form.serial_number) {
      show('Please fill in all required fields.', 'error')
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { error } = isEdit
      ? await supabase.from('computers').update(form).eq('id', initial!.id!)
      : await supabase.from('computers').insert(form)

    if (error) {
      show(error.message, 'error')
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('activity_logs').insert({
          user_id: user.id,
          action: isEdit ? 'Computer Updated' : 'Computer Added',
          description: `${isEdit ? 'Updated' : 'Added'} computer: ${form.computer_name} (${form.computer_code})`,
        })
      }
      show(isEdit ? 'Computer updated!' : 'Computer added!', 'success')
      setTimeout(onSuccess, 800)
    }
    setLoading(false)
  }

  const fields = [
    { key: 'computer_code', label: 'Computer Code *', placeholder: 'PC-001' },
    { key: 'computer_name', label: 'Computer Name *', placeholder: 'Lab Computer 1' },
    { key: 'brand', label: 'Brand *', placeholder: 'Dell' },
    { key: 'model', label: 'Model *', placeholder: 'OptiPlex 7090' },
    { key: 'serial_number', label: 'Serial Number *', placeholder: 'SN-DELL-001' },
    { key: 'processor', label: 'Processor', placeholder: 'Intel Core i7' },
    { key: 'ram', label: 'RAM', placeholder: '16GB DDR4' },
    { key: 'storage', label: 'Storage', placeholder: '512GB SSD' },
    { key: 'operating_system', label: 'Operating System', placeholder: 'Windows 11 Pro' },
    { key: 'location', label: 'Location', placeholder: 'Lab Room 101' },
  ]

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="label">{label}</label>
              <input
                className="input"
                placeholder={placeholder}
                value={form[key as keyof typeof form]}
                onChange={e => set(key, e.target.value)}
              />
            </div>
          ))}
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update Computer' : 'Add Computer'}
          </button>
          <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </>
  )
}
