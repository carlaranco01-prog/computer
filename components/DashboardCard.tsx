interface DashboardCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  color: string
  subtitle?: string
}

export default function DashboardCard({ title, value, icon, color, subtitle }: DashboardCardProps) {
  return (
    <div className="card p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-800 mb-0.5">{value}</p>
      <p className="text-sm text-slate-500 font-medium">{title}</p>
      {subtitle && <p className="text-xs text-blue-500 font-medium mt-1">{subtitle}</p>}
    </div>
  )
}
