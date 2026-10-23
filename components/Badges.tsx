import { ComputerStatus } from '@/types'

const statusConfig: Record<ComputerStatus, { cls: string; dot: string }> = {
  Available:           { cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', dot: 'bg-emerald-500' },
  Assigned:            { cls: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',   dot: 'bg-indigo-500' },
  'Under Maintenance': { cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',      dot: 'bg-amber-500' },
  Damaged:             { cls: 'bg-red-50 text-red-700 ring-1 ring-red-200',            dot: 'bg-red-500' },
  Retired:             { cls: 'bg-slate-100 text-slate-500 ring-1 ring-slate-200',     dot: 'bg-slate-400' },
}

export function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status as ComputerStatus] ?? { cls: 'bg-slate-100 text-slate-500 ring-1 ring-slate-200', dot: 'bg-slate-400' }
  return (
    <span className={`badge ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  )
}

const maintenanceConfig: Record<string, { cls: string; dot: string }> = {
  Pending:       { cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',    dot: 'bg-amber-500' },
  'In Progress': { cls: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',          dot: 'bg-sky-500' },
  Completed:     { cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', dot: 'bg-emerald-500' },
}

export function MaintenanceBadge({ status }: { status: string }) {
  const cfg = maintenanceConfig[status] ?? { cls: 'bg-slate-100 text-slate-500 ring-1 ring-slate-200', dot: 'bg-slate-400' }
  return (
    <span className={`badge ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  )
}

export function RoleBadge({ role }: { role: string }) {
  const cfg =
    role === 'admin' ? { cls: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200', dot: 'bg-violet-500' } :
    role === 'staff' ? { cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', dot: 'bg-emerald-500' } :
                       { cls: 'bg-slate-100 text-slate-500 ring-1 ring-slate-200', dot: 'bg-slate-400' }
  return (
    <span className={`badge ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {role}
    </span>
  )
}
