'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Monitor, Users, Wrench, MessageSquare,
  ClipboardList, BarChart3, LogOut, BookOpen
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const adminLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/computers', label: 'Computers', icon: Monitor },
  { href: '/admin/assignments', label: 'Assignments', icon: BookOpen },
  { href: '/admin/maintenance', label: 'Maintenance', icon: Wrench },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { href: '/history', label: 'Activity History', icon: ClipboardList },
]

const userLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/computers', label: 'My Computer', icon: Monitor },
  { href: '/assignments', label: 'Assignments', icon: BookOpen },
  { href: '/maintenance', label: 'Maintenance', icon: Wrench },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
  { href: '/history', label: 'History', icon: ClipboardList },
]

interface SidebarProps {
  role: 'admin' | 'user'
  userName: string
}

export default function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const links = role === 'admin' ? adminLinks : userLinks

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-64 min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #1e3a5f 0%, #1e40af 60%, #1d4ed8 100%)' }}>
      {/* Logo */}
      <div className="p-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
            <Monitor size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">CMS</p>
            <p className="text-xs text-blue-200">Computer Management</p>
          </div>
        </div>
      </div>

      {/* User profile */}
      <div className="mx-3 mb-4 p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{userName}</p>
            <p className="text-xs text-blue-200 capitalize">{role}</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 space-y-0.5">
        <p className="text-xs font-bold text-blue-300 uppercase tracking-widest px-3 mb-2">Menu</p>
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`sidebar-link ${isActive ? 'active' : 'text-blue-100'}`}
            >
              <Icon size={17} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="sidebar-link text-blue-200 hover:text-white hover:bg-red-500/30 w-full text-left"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </aside>
  )
}
