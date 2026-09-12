import { requireAdmin, getUserProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/AppShell'
import DashboardCard from '@/components/DashboardCard'
import { StatusBadge, MaintenanceBadge } from '@/components/Badges'
import { Monitor, Users, Wrench, CheckCircle, AlertTriangle, Clock, XCircle, BarChart3 } from 'lucide-react'

export default async function AdminDashboardPage() {
  await requireAdmin()
  const profile = await getUserProfile()
  const supabase = await createClient()

  const [
    { count: totalComputers },
    { count: availableComputers },
    { count: assignedComputers },
    { count: maintenanceComputers },
    { count: damagedComputers },
    { count: totalUsers },
    { count: pendingMaintenance },
    { data: recentLogs },
    { data: recentMaintenance },
  ] = await Promise.all([
    supabase.from('computers').select('*', { count: 'exact', head: true }),
    supabase.from('computers').select('*', { count: 'exact', head: true }).eq('status', 'Available'),
    supabase.from('computers').select('*', { count: 'exact', head: true }).eq('status', 'Assigned'),
    supabase.from('computers').select('*', { count: 'exact', head: true }).eq('status', 'Under Maintenance'),
    supabase.from('computers').select('*', { count: 'exact', head: true }).eq('status', 'Damaged'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'user'),
    supabase.from('maintenance').select('*', { count: 'exact', head: true }).eq('status', 'Pending'),
    supabase.from('activity_logs').select('*, profiles(full_name)').order('created_at', { ascending: false }).limit(8),
    supabase.from('maintenance').select('*, computers(computer_name, computer_code)').order('created_at', { ascending: false }).limit(5),
  ])

  const stats = [
    { title: 'Total Computers', value: totalComputers ?? 0, icon: <Monitor size={22} className="text-blue-600" />, color: 'bg-blue-50' },
    { title: 'Available', value: availableComputers ?? 0, icon: <CheckCircle size={22} className="text-green-600" />, color: 'bg-green-50' },
    { title: 'Assigned', value: assignedComputers ?? 0, icon: <Monitor size={22} className="text-purple-600" />, color: 'bg-purple-50' },
    { title: 'Under Maintenance', value: maintenanceComputers ?? 0, icon: <Wrench size={22} className="text-yellow-600" />, color: 'bg-yellow-50' },
    { title: 'Damaged', value: damagedComputers ?? 0, icon: <XCircle size={22} className="text-red-600" />, color: 'bg-red-50' },
    { title: 'Total Users', value: totalUsers ?? 0, icon: <Users size={22} className="text-indigo-600" />, color: 'bg-indigo-50' },
    { title: 'Pending Maintenance', value: pendingMaintenance ?? 0, icon: <Clock size={22} className="text-orange-600" />, color: 'bg-orange-50' },
    { title: 'Reports', value: '→', icon: <BarChart3 size={22} className="text-teal-600" />, color: 'bg-teal-50', subtitle: 'View analytics' },
  ]

  return (
    <AppShell role="admin" userName={profile!.full_name} title="Admin Dashboard">
      <div className="space-y-6">
        {/* Welcome */}
        <div className="card p-5 bg-gradient-to-r from-slate-800 to-slate-700 text-white border-0">
          <h2 className="text-xl font-bold">Admin Dashboard</h2>
          <p className="text-slate-300 text-sm mt-1">Welcome back, {profile!.full_name} · {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(s => (
            <DashboardCard key={s.title} title={s.title} value={s.value} icon={s.icon} color={s.color} subtitle={(s as any).subtitle} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Recent Activity</h3>
            {recentLogs && recentLogs.length > 0 ? (
              <div className="space-y-3">
                {recentLogs.map(log => (
                  <div key={log.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{(log as any).profiles?.full_name} — {log.action}</p>
                      <p className="text-xs text-slate-400">{new Date(log.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-6">No recent activity</p>
            )}
          </div>

          {/* Recent Maintenance */}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Recent Maintenance</h3>
            {recentMaintenance && recentMaintenance.length > 0 ? (
              <div className="space-y-3">
                {recentMaintenance.map(m => (
                  <div key={m.id} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{(m as any).computers?.computer_name}</p>
                      <p className="text-xs text-slate-400 truncate">{m.issue}</p>
                    </div>
                    <MaintenanceBadge status={m.status} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-6">No maintenance records</p>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
