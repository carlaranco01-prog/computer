interface DashboardCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  color: string
  subtitle?: string
}

export default function DashboardCard({ title, value, icon, color, subtitle }: DashboardCardProps) {
  return (
    <div className="card-hover p-5 group cursor-default">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${color} transition-transform group-hover:scale-110 duration-200`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-extrabold text-slate-800 tabular-nums leading-none mb-1">{value}</p>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{title}</p>
      {subtitle && (
        <p className="text-[11px] text-indigo-500 font-semibold mt-1.5 flex items-center gap-1">
          {subtitle}
        </p>
      )}
    </div>
  )
}
