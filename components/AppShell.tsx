'use client'
import { useState } from 'react'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

interface AppShellProps {
  role: 'admin' | 'user'
  userName: string
  title: string
  children: React.ReactNode
  unreadCount?: number
}

export default function AppShell({ role, userName, title, children, unreadCount }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar — desktop always visible, mobile slide-in */}
      <div className={`fixed inset-y-0 left-0 z-50 lg:static lg:block transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <Sidebar role={role} userName={userName} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title={title} onMenuClick={() => setSidebarOpen(true)} unreadCount={unreadCount} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
