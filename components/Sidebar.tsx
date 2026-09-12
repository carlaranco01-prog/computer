'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Monitor, Users, Wrench, MessageSquare,
  ClipboardList, BarChart3, LogOut, Settings, BookOpen
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
    <aside className="w-64 min-h-screen bg-white border-r border-slate-200 flex flex-col">
      <div className="p-5 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Monitor size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">CMS</p>
            <p className="text-xs text-slate-400">Computer Management</p>
          </div>
        </div>
      </div>

      <div className="p-3 border-b border-slate-100">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-xs font-bold">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-700 truncate">{userName}</p>
            <p className="text-xs text-slate-400 capitalize">{role}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`sidebar-link ${pathname === href || pathname.startsWith(href + '/') ? 'active' : 'text-slate-600'}`}
          >
            <Icon size={17} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-200 space-y-0.5">
        <button
          onClick={handleLogout}
          className="sidebar-link text-slate-600 w-full text-left hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </aside>
  )
}
