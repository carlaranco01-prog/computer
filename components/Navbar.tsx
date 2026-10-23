'use client'
import { Menu } from 'lucide-react'

interface NavbarProps {
  title: string
  onMenuClick?: () => void
}

export default function Navbar({ title, onMenuClick }: NavbarProps) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <header className="h-14 bg-white/80 backdrop-blur-md border-b border-slate-200/80 flex items-center px-5 sticky top-0 z-30 shadow-[0_1px_8px_rgba(79,70,229,0.06)]">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-indigo-50 rounded-xl lg:hidden transition-colors text-slate-500 hover:text-indigo-600"
          >
            <Menu size={18} />
          </button>
        )}
        <div>
          <h1 className="text-sm font-bold text-slate-800 leading-tight">{title}</h1>
          <p className="text-[11px] text-slate-400 hidden sm:block leading-tight">{today}</p>
        </div>
      </div>
    </header>
  )
}
