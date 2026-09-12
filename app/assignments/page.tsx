import { requireAuth, getUserProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/AppShell'
import { StatusBadge } from '@/components/Badges'
import { BookOpen } from 'lucide-react'

export default async function AssignmentsPage() {
  await requireAuth()
  const profile = await getUserProfile()
  const supabase = await createClient()

  const { data: assignments } = await supabase
    .from('computer_assignments')
    .select('*, computers(*)')
    .eq('user_id', profile!.id)
    .order('created_at', { ascending: false })

  return (
    <AppShell role="user" userName={profile!.full_name} title="My Assignments">
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Assignment History</h2>
        <div className="card overflow-hidden">
          {assignments && assignments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="table-header">Computer</th>
                    <th className="table-header">Assigned Date</th>
                    <th className="table-header">Returned Date</th>
                    <th className="table-header">Status</th>
                    <th className="table-header hidden md:table-cell">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assignments.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="table-cell">
                        <p className="font-medium">{a.computers?.computer_name}</p>
                        <p className="text-xs text-slate-400 font-mono">{a.computers?.computer_code}</p>
                      </td>
                      <td className="table-cell">{new Date(a.assigned_date).toLocaleDateString()}</td>
                      <td className="table-cell">{a.returned_date ? new Date(a.returned_date).toLocaleDateString() : '—'}</td>
                      <td className="table-cell">
                        <span className={`badge ${a.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{a.status}</span>
                      </td>
                      <td className="table-cell hidden md:table-cell text-slate-500">{a.remarks || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <BookOpen size={32} className="mx-auto mb-2 opacity-30" />
              <p className="font-medium">No assignments found</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
