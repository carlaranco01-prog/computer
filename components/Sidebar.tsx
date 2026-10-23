'use client'
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Monitor, Users, Wrench, MessageSquare,
  ClipboardList, BarChart3, LogOut, BookOpen, ChevronRight
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import ProfileModal from './ProfileModal'
import { useProfile, useProfileSafe } from './ProfileContext'

const adminLinks = [
  { href: '/admin/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/admin/computers',  label: 'Computers',   icon: Monitor },
  { href: '/admin/assignments',label: 'Assignments', icon: BookOpen },
  { href: '/admin/maintenance',label: 'Maintenance', icon: Wrench },
  { href: '/admin/messages',   label: 'Messages',    icon: MessageSquare },
  { href: '/admin/users',      label: 'Users',        icon: Users },
  { href: '/admin/reports',    label: 'Reports',      icon: BarChart3 },
  { href: '/history',          label: 'Activity Log', icon: ClipboardList },
]

const staffLinks = [
  { href: '/staff/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/staff/computers',   label: 'Computers',   icon: Monitor },
  { href: '/staff/assignments', label: 'Assignments', icon: BookOpen },
  { href: '/staff/maintenance', label: 'Maintenance', icon: Wrench },
  { href: '/staff/messages',    label: 'Messages',    icon: MessageSquare },
  { href: '/history',           label: 'Activity Log',icon: ClipboardList },
]

const userLinks = [
  { href: '/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/computers',   label: 'My Computer', icon: Monitor },
  { href: '/assignments', label: 'Assignments', icon: BookOpen },
  { href: '/maintenance', label: 'Maintenance', icon: Wrench },
  { href: '/messages',    label: 'Messages',    icon: MessageSquare },
  { href: '/history',     label: 'History',     icon: ClipboardList },
]

interface SidebarProps {
  role: 'admin' | 'staff' | 'user'
  userName: string
}

const roleColors: Record<string, string> = {
  admin: 'bg-indigo-400/30 text-indigo-200',
  staff: 'bg-emerald-400/30 text-emerald-200',
  user:  'bg-white/20 text-white/70',
}

export default function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const links = role === 'admin' ? adminLinks : role === 'staff' ? staffLinks : userLinks
  const [showProfile, setShowProfile] = useState(false)
  const ctx = useProfileSafe()
  const avatarUrl = ctx?.avatarUrl ?? null
  const displayName = ctx?.fullName ?? userName
  const profile = ctx?.profile

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <>
      <aside
        className="w-60 h-screen sticky top-0 flex flex-col select-none overflow-y-auto"
        style={{ background: 'linear-gradient(175deg, #1e1b4b 0%, #312e81 45%, #3730a3 100%)' }}
      >
        {/* Brand */}
        <div className="px-5 pt-6 pb-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-400/30 rounded-xl flex items-center justify-center shrink-0 ring-1 ring-white/20">
            <Monitor size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white tracking-wide">CMS</p>
            <p className="text-[10px] text-indigo-300 leading-tight">Computer Management</p>
          </div>
        </div>

        <div className="mx-5 h-px bg-white/10 mb-4" />

        {/* Clickable user profile card */}
        <button
          onClick={() => setShowProfile(true)}
          className="mx-3 mb-5 px-3 py-3 bg-white/10 rounded-2xl ring-1 ring-white/10 hover:bg-white/15 transition-colors text-left w-[calc(100%-1.5rem)]"
        >
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-9 h-9 rounded-xl object-cover shrink-0 ring-2 ring-white/20"
              />
            ) : (
              <div className="w-9 h-9 bg-indigo-400 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-lg">
                {displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate leading-tight">{displayName}</p>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full mt-0.5 inline-block ${roleColors[role]}`}>
                {role.toUpperCase()}
              </span>
            </div>
          </div>
        </button>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5">
          <p className="text-[10px] font-bold text-indigo-400/70 uppercase tracking-widest px-3 mb-2">Navigation</p>
          {links.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={`sidebar-link ${isActive ? 'active' : 'text-indigo-200 hover:text-white'}`}
              >
                <Icon size={16} className="shrink-0" />
                <span className="flex-1 truncate">{label}</span>
                {isActive && <ChevronRight size={13} className="text-indigo-400 shrink-0" />}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="sidebar-link text-indigo-300 hover:text-white hover:bg-red-500/20 w-full text-left group"
          >
            <LogOut size={16} className="shrink-0 group-hover:text-red-300 transition-colors" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Profile modal — portaled to body so it's not clipped by aside overflow */}
      {showProfile && profile && typeof document !== 'undefined' && createPortal(
        <ProfileModal
          profile={profile}
          onClose={() => setShowProfile(false)}
        />,
        document.body
      )}
    </>
  )
}
