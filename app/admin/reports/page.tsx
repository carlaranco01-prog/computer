'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AppShell from '@/components/AppShell'
import { Profile } from '@/types'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const STATUS_COLORS: Record<string, string> = {
  Available: '#22c55e',
  Assigned: '#3b82f6',
  'Under Maintenance': '#f59e0b',
  Damaged: '#ef4444',
  Retired: '#94a3b8',
}

const MAINTENANCE_COLORS: Record<string, string> = {
  Pending: '#f59e0b',
  'In Progress': '#3b82f6',
  Completed: '#22c55e',
}

export default function AdminReportsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [computerStats, setComputerStats] = useState<{ name: string; value: number }[]>([])
  const [maintenanceStats, setMaintenanceStats] = useState<{ name: string; value: number }[]>([])
  const [monthlyActivity, setMonthlyActivity] = useState<{ month: string; count: number }[]>([])
  const [totals, setTotals] = useState({ computers: 0, users: 0, assignments: 0, maintenance: 0 })

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(p)

      const [{ data: computers }, { data: maintenance }, { data: logs }] = await Promise.all([
        supabase.from('computers').select('status'),
        supabase.from('maintenance').select('status'),
        supabase.from('activity_logs').select('created_at').order('created_at', { ascending: true }),
      ])

      const cMap: Record<string, number> = {}
      computers?.forEach(c => { cMap[c.status] = (cMap[c.status] ?? 0) + 1 })
      setComputerStats(Object.entries(cMap).map(([name, value]) => ({ name, value })))

      const mMap: Record<string, number> = {}
      maintenance?.forEach(m => { mMap[m.status] = (mMap[m.status] ?? 0) + 1 })
      setMaintenanceStats(Object.entries(mMap).map(([name, value]) => ({ name, value })))

      const monthMap: Record<string, number> = {}
      const now = new Date()
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const key = d.toLocaleString('default', { month: 'short', year: '2-digit' })
        monthMap[key] = 0
      }
      logs?.forEach(l => {
        const d = new Date(l.created_at)
        const key = d.toLocaleString('default', { month: 'short', year: '2-digit' })
        if (key in monthMap) monthMap[key]++
      })
      setMonthlyActivity(Object.entries(monthMap).map(([month, count]) => ({ month, count })))

      const [{ count: tc }, { count: tu }, { count: ta }, { count: tm }] = await Promise.all([
        supabase.from('computers').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'user'),
        supabase.from('computer_assignments').select('*', { count: 'exact', head: true }),
        supabase.from('maintenance').select('*', { count: 'exact', head: true }),
      ])
      setTotals({ computers: tc ?? 0, users: tu ?? 0, assignments: ta ?? 0, maintenance: tm ?? 0 })
    }
    load()
  }, [])

  if (!profile) return null

  return (
    <AppShell role="admin" userName={profile.full_name} title="Reports & Analytics">
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Computers', value: totals.computers, color: 'text-blue-600' },
            { label: 'Total Users', value: totals.users, color: 'text-green-600' },
            { label: 'Total Assignments', value: totals.assignments, color: 'text-purple-600' },
            { label: 'Maintenance Records', value: totals.maintenance, color: 'text-orange-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card p-5">
              <p className="text-sm text-slate-500">{label}</p>
              <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Computer Status Distribution</h3>
            {computerStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={computerStats} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                    {computerStats.map(entry => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-slate-400 text-sm text-center py-10">No data</p>}
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Maintenance Status Distribution</h3>
            {maintenanceStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={maintenanceStats} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                    {maintenanceStats.map(entry => (
                      <Cell key={entry.name} fill={MAINTENANCE_COLORS[entry.name] ?? '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-slate-400 text-sm text-center py-10">No data</p>}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Monthly Activity (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyActivity}>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Activities" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AppShell>
  )
}
