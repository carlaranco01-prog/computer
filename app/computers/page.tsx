import { requireAuth, getUserProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/AppShell'
import { StatusBadge } from '@/components/Badges'
import { Monitor } from 'lucide-react'

export default async function ComputersPage() {
  await requireAuth()
  const profile = await getUserProfile()
  const supabase = await createClient()

  const { data: assignment } = await supabase
    .from('computer_assignments')
    .select('*, computers(*)')
    .eq('user_id', profile!.id)
    .eq('status', 'Active')
    .single()

  const computer = assignment?.computers

  const specs = computer ? [
    { label: 'Computer Code', value: computer.computer_code },
    { label: 'Computer Name', value: computer.computer_name },
    { label: 'Brand', value: computer.brand },
    { label: 'Model', value: computer.model },
    { label: 'Serial Number', value: computer.serial_number },
    { label: 'Processor', value: computer.processor },
    { label: 'RAM', value: computer.ram },
    { label: 'Storage', value: computer.storage },
    { label: 'Operating System', value: computer.operating_system },
    { label: 'Location', value: computer.location },
  ] : []

  return (
    <AppShell role="user" userName={profile!.full_name} title="My Computer">
      <div className="max-w-2xl">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Assigned Computer</h2>
        {computer ? (
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Monitor size={24} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">{computer.computer_name}</h3>
                <p className="text-sm text-slate-500">{computer.computer_code}</p>
              </div>
              <div className="ml-auto">
                <StatusBadge status={computer.status} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {specs.map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</p>
                  <p className="text-sm text-slate-700 font-medium mt-0.5">{value || '—'}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-400">Assigned on {new Date(assignment!.assigned_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        ) : (
          <div className="card p-12 text-center text-slate-400">
            <Monitor size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No computer assigned</p>
            <p className="text-sm mt-1">Contact your administrator for a computer assignment.</p>
          </div>
        )}
      </div>
    </AppShell>
  )
}
