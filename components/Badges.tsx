import { ComputerStatus } from '@/types'

const statusConfig: Record<ComputerStatus, string> = {
  Available: 'bg-green-100 text-green-700',
  Assigned: 'bg-blue-100 text-blue-700',
  'Under Maintenance': 'bg-yellow-100 text-yellow-700',
  Damaged: 'bg-red-100 text-red-700',
  Retired: 'bg-slate-100 text-slate-600',
}

export function StatusBadge({ status }: { status: string }) {
  const cls = statusConfig[status as ComputerStatus] ?? 'bg-slate-100 text-slate-600'
  return <span className={`badge ${cls}`}>{status}</span>
}

const maintenanceConfig: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  Completed: 'bg-green-100 text-green-700',
}

export function MaintenanceBadge({ status }: { status: string }) {
  const cls = maintenanceConfig[status] ?? 'bg-slate-100 text-slate-600'
  return <span className={`badge ${cls}`}>{status}</span>
}

export function RoleBadge({ role }: { role: string }) {
  const cls = role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
  return <span className={`badge ${cls}`}>{role}</span>
}
