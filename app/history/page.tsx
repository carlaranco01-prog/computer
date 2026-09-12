import { requireAuth, getUserProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/AppShell'
import { ClipboardList } from 'lucide-react'

export default async function HistoryPage() {
  await requireAuth()
  const profile = await getUserProfile()
  const supabase = await createClient()

  const isAdmin = profile?.role === 'admin'

  const query = supabase
    .from('activity_logs')
    .select('*, profiles(full_name, email)')
    .order('created_at', { ascending: false })
    .limit(100)

  if (!isAdmin) query.eq('user_id', profile!.id)

  const { data: logs } = await query

  const actionColors: Record<string, string> = {
    Login: 'bg-green-100 text-green-700',
    Logout: 'bg-slate-100 text-slate-600',
    'Computer Added': 'bg-blue-100 text-blue-700',
    'Computer Updated': 'bg-yellow-100 text-yellow-700',
    'Computer Deleted': 'bg-red-100 text-red-700',
    'Computer Assigned': 'bg-purple-100 text-purple-700',
    'Computer Returned': 'bg-orange-100 text-orange-700',
    'Maintenance Created': 'bg-yellow-100 text-yellow-700',
    'Message Sent': 'bg-blue-100 text-blue-700',
    'Account Verified': 'bg-green-100 text-green-700',
  }

  return (
    <AppShell role={profile!.role} userName={profile!.full_name} title="Activity History">
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          {isAdmin ? 'All Activity Logs' : 'My Activity History'}
        </h2>
        <div className="card overflow-hidden">
          {logs && logs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {isAdmin && <th className="table-header">User</th>}
                    <th className="table-header">Action</th>
                    <th className="table-header hidden md:table-cell">Description</th>
                    <th className="table-header">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      {isAdmin && (
                        <td className="table-cell">
                          <p className="font-medium text-sm">{(log as any).profiles?.full_name}</p>
                          <p className="text-xs text-slate-400">{(log as any).profiles?.email}</p>
                        </td>
                      )}
                      <td className="table-cell">
                        <span className={`badge ${actionColors[log.action] ?? 'bg-slate-100 text-slate-600'}`}>{log.action}</span>
                      </td>
                      <td className="table-cell hidden md:table-cell text-slate-500 text-xs">{log.description}</td>
                      <td className="table-cell text-xs text-slate-500 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <ClipboardList size={32} className="mx-auto mb-2 opacity-30" />
              <p className="font-medium">No activity logs found</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
