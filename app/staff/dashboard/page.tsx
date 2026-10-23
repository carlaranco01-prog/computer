import { requireStaff, getUserProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/AppShell'
import DashboardCard from '@/components/DashboardCard'
import { MaintenanceBadge } from '@/components/Badges'
import { Monitor, Wrench, CheckCircle, Clock, XCircle, BookOpen } from 'lucide-react'

export default async function StaffDashboardPage() {
  await requireStaff()
  const profile = await getUserProfile()
  const supabase = await createClient()

  const [
    { count: totalComputers },
    { count: available },
    { count: assigned },
    { count: underMaintenance },
    { count: damaged },
    { count: pendingMaintenance },
    { data: recentMaintenance },
    { data: recentLogs },
  ] = await Promise.all([
    supabase.from('computers').select('*', { count: 'exact', head: true }),
    supabase.from('computers').select('*', { count: 'exact', head: true }).eq('status', 'Available'),
    supabase.from('computers').select('*', { count: 'exact', head: true }).eq('status', 'Assigned'),
    supabase.from('computers').select('*', { count: 'exact', head: true }).eq('status', 'Under Maintenance'),
    supabase.from('computers').select('*', { count: 'exact', head: true }).eq('status', 'Damaged'),
    supabase.from('maintenance').select('*', { count: 'exact', head: true }).eq('status', 'Pending'),
    supabase.from('maintenance').select('*, computers(computer_name, computer_code)').order('created_at', { ascending: false }).limit(6),
    supabase.from('activity_logs').select('*, profiles(full_name)').order('created_at', { ascending: false }).limit(8),
  ])

  const stats = [
    { title: 'Total Computers',    value: totalComputers ?? 0,    icon: <Monitor size={20} className="text-indigo-600" />,  color: 'stat-indigo' },
    { title: 'Available',          value: available ?? 0,          icon: <CheckCircle size={20} className="text-emerald-600" />, color: 'stat-emerald' },
    { title: 'Assigned',           value: assigned ?? 0,           icon: <BookOpen size={20} className="text-violet-600" />, color: 'stat-violet' },
    { title: 'Under Maintenance',  value: underMaintenance ?? 0,   icon: <Wrench size={20} className="text-amber-600" />,   color: 'stat-amber' },
    { title: 'Damaged',            value: damaged ?? 0,            icon: <XCircle size={20} className="text-red-600" />,    color: 'stat-red' },
    { title: 'Pending Maintenance',value: pendingMaintenance ?? 0, icon: <Clock size={20} className="text-orange-600" />,   color: 'stat-orange' },
  ]

  return (
    <AppShell role="staff" userName={profile!.full_name} title="Staff Dashboard">
      <div className="space-y-5">
        <div className="rounded-2xl px-6 py-5 text-white" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)' }}>
          <p className="text-xs font-semibold text-emerald-300 uppercase tracking-widest mb-1">Staff Dashboard</p>
          <h2 className="text-lg font-extrabold">Welcome back, {profile!.full_name}! 👋</h2>
          <p className="text-emerald-200 text-xs mt-0.5">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {stats.map(s => <DashboardCard key={s.title} {...s} />)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
            ) : <p className="text-sm text-slate-400 text-center py-6">No maintenance records</p>}
          </div>

          <div className="card p-4">
            <h3 className="text-sm font-bold text-slate-800 mb-3">Recent Activity</h3>
            {recentLogs && recentLogs.length > 0 ? (
              <div className="space-y-3">
                {recentLogs.map(log => (
                  <div key={log.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full mt-1.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{(log as any).profiles?.full_name} — {log.action}</p>
                      <p className="text-xs text-slate-400">{new Date(log.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-slate-400 text-center py-6">No recent activity</p>}
          </div>
        </div>
      </div>
    </AppShell>
  )
}


