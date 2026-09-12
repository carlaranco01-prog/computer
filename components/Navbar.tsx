'use client'
import { Menu, Bell } from 'lucide-react'

interface NavbarProps {
  title: string
  onMenuClick?: () => void
  unreadCount?: number
}

export default function Navbar({ title, onMenuClick, unreadCount = 0 }: NavbarProps) {
  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button onClick={onMenuClick} className="p-1.5 hover:bg-slate-100 rounded-lg lg:hidden">
            <Menu size={20} />
          </button>
        )}
        <h1 className="text-base font-semibold text-slate-800">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Bell size={20} className="text-slate-500" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </header>
  )
}
