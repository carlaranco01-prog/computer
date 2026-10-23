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
    { title: 'Total Computers',    value: totalComputers ?? 0,    icon: <Monitor size={20} className="text-indigo-600" />,  color: 'stat-indigo' },
    { title: 'Available',          value: availableComputers ?? 0, icon: <CheckCircle size={20} className="text-emerald-600" />, color: 'stat-emerald' },
    { title: 'Assigned',           value: assignedComputers ?? 0,  icon: <Monitor size={20} className="text-violet-600" />,  color: 'stat-violet' },
    { title: 'Under Maintenance',  value: maintenanceComputers ?? 0, icon: <Wrench size={20} className="text-amber-600" />,  color: 'stat-amber' },
    { title: 'Damaged',            value: damagedComputers ?? 0,   icon: <XCircle size={20} className="text-red-600" />,    color: 'stat-red' },
    { title: 'Total Users',        value: totalUsers ?? 0,         icon: <Users size={20} className="text-sky-600" />,      color: 'stat-sky' },
    { title: 'Pending Maintenance',value: pendingMaintenance ?? 0, icon: <Clock size={20} className="text-orange-600" />,   color: 'stat-orange' },
    { title: 'Reports',            value: '→',                     icon: <BarChart3 size={20} className="text-teal-600" />, color: 'stat-teal', subtitle: 'View analytics' },
  ]

  return (
    <AppShell role="admin" userName={profile!.full_name} title="Admin Dashboard" profile={profile!}>
      <div className="space-y-4">
        {/* Welcome */}
        <div className="rounded-2xl px-6 py-5 text-white border-0" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)' }}>
          <p className="text-xs font-semibold text-indigo-300 uppercase tracking-widest mb-1">Admin Dashboard</p>
          <h2 className="text-lg font-extrabold">Welcome back, {profile!.full_name}! 👋</h2>
          <p className="text-indigo-200 text-xs mt-0.5">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map(s => (
            <DashboardCard key={s.title} title={s.title} value={s.value} icon={s.icon} color={s.color} subtitle={(s as any).subtitle} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Recent Activity */}
          <div className="card p-4">
            <h3 className="text-sm font-bold text-slate-800 mb-3">Recent Activity</h3>
            {recentLogs && recentLogs.length > 0 ? (
              <div className="space-y-3">
                {recentLogs.map(log => (
                  <div key={log.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full mt-1.5 shrink-0" />
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
          <div className="card p-4">
            <h3 className="text-sm font-bold text-slate-800 mb-3">Recent Maintenance</h3>
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
