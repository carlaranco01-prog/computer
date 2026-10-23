import { requireAuth, getUserProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppShell from '@/components/AppShell'
import DashboardCard from '@/components/DashboardCard'
import { StatusBadge } from '@/components/Badges'
import { Monitor, MessageSquare, ClipboardList, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  await requireAuth()
  const profile = await getUserProfile()
  if (!profile) redirect('/login')
  const supabase = await createClient()

  const [{ data: assignment }, { data: messages }, { data: logs }] = await Promise.all([
    supabase
      .from('computer_assignments')
      .select('*, computers(*)')
      .eq('user_id', profile!.id)
      .eq('status', 'Active')
      .single(),
    supabase
      .from('messages')
      .select('*')
      .eq('receiver_id', profile!.id)
      .eq('status', 'unread')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', profile!.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  return (
    <AppShell role="user" userName={profile!.full_name} title="Dashboard" unreadCount={messages?.length ?? 0}>
      <div className="space-y-4">
        {/* Welcome */}
        <div className="rounded-2xl px-6 py-5 text-white border-0" style={{ background: 'linear-gradient(135deg, #312e81 0%, #4f46e5 100%)' }}>
          <p className="text-xs font-semibold text-indigo-300 uppercase tracking-widest mb-1">My Dashboard</p>
          <h2 className="text-lg font-extrabold">Welcome back, {profile!.full_name}! 👋</h2>
          <p className="text-indigo-200 text-xs mt-0.5">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <DashboardCard title="Assigned Computer" value={assignment ? '1' : '0'} icon={<Monitor size={20} className="text-indigo-600" />} color="stat-indigo" />
          <DashboardCard title="Unread Messages" value={messages?.length ?? 0} icon={<MessageSquare size={20} className="text-emerald-600" />} color="stat-emerald" />
          <DashboardCard title="Activities" value={logs?.length ?? 0} icon={<ClipboardList size={20} className="text-violet-600" />} color="stat-violet" />
          <DashboardCard title="Report Problem" value="→" icon={<AlertTriangle size={20} className="text-orange-600" />} color="stat-orange" subtitle="Click to report" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Assigned Computer */}
          <div className="card p-4">
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Monitor size={15} className="text-blue-600" /> My Assigned Computer
            </h3>
            {assignment?.computers ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Computer Code</span>
                  <span className="font-mono text-sm font-semibold text-blue-600">{assignment.computers.computer_code}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Name</span>
                  <span className="text-sm font-medium">{assignment.computers.computer_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Brand / Model</span>
                  <span className="text-sm">{assignment.computers.brand} {assignment.computers.model}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Location</span>
                  <span className="text-sm">{assignment.computers.location || '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Status</span>
                  <StatusBadge status={assignment.computers.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Assigned Date</span>
                  <span className="text-sm">{new Date(assignment.assigned_date).toLocaleDateString()}</span>
                </div>
                <div className="pt-2">
                  <Link href="/maintenance" className="btn-primary text-xs px-3 py-1.5">
                    Report a Problem
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Monitor size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">No computer assigned yet</p>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="card p-4">
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <ClipboardList size={15} className="text-purple-600" /> Recent Activity
            </h3>
            {logs && logs.length > 0 ? (
              <div className="space-y-3">
                {logs.map(log => (
                  <div key={log.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full mt-1.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">{log.action}</p>
                      <p className="text-xs text-slate-400">{log.description}</p>
                      <p className="text-xs text-slate-300 mt-0.5">{new Date(log.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-8">No recent activity</p>
            )}
            <Link href="/history" className="text-xs text-blue-600 hover:underline mt-3 block">View all activity →</Link>
          </div>
        </div>
      </div>
    </AppShell>
  )
}


