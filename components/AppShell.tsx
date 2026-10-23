'use client'
import { useState } from 'react'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import { Profile } from '@/types'

interface AppShellProps {
  role: 'admin' | 'staff' | 'user'
  userName: string
  title: string
  children: React.ReactNode
  profile?: Profile
  unreadCount?: number
}

export default function AppShell({ role, userName, title, children, profile }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #f8faff 100%)' }}>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className={`fixed inset-y-0 left-0 z-50 lg:relative lg:flex lg:shrink-0 transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <Sidebar role={role} userName={userName} />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6 fade-up">{children}</main>
      </div>
    </div>
  )
}
