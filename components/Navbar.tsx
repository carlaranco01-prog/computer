'use client'
import { Menu, Bell } from 'lucide-react'

interface NavbarProps {
  title: string
  onMenuClick?: () => void
  unreadCount?: number
}

export default function Navbar({ title, onMenuClick, unreadCount = 0 }: NavbarProps) {
  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button onClick={onMenuClick} className="p-2 hover:bg-slate-100 rounded-xl lg:hidden transition-colors">
            <Menu size={20} className="text-slate-600" />
          </button>
        )}
        <div>
          <h1 className="text-base font-bold text-slate-800">{title}</h1>
          <p className="text-xs text-slate-400 hidden sm:block">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="relative p-2 hover:bg-slate-100 rounded-xl transition-colors">
          <Bell size={19} className="text-slate-500" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
