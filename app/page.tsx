import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Monitor, Shield, Wrench, MessageSquare, BarChart3, Users, CheckCircle, ArrowRight, Zap } from 'lucide-react'

const features = [
  { icon: Monitor,      color: 'text-indigo-600', bg: 'bg-indigo-50', title: 'Computer Tracking',   desc: 'Track every device with full specs — brand, model, RAM, storage, OS, and location.', href: '/admin/computers' },
  { icon: Users,        color: 'text-violet-600', bg: 'bg-violet-50', title: 'User Management',     desc: 'Role-based access for admins and users. Everyone sees exactly what they need.',       href: '/admin/users' },
  { icon: Shield,       color: 'text-sky-600',    bg: 'bg-sky-50',    title: 'Assignments',         desc: 'Assign computers to users, track history, and manage returns effortlessly.',           href: '/admin/assignments' },
  { icon: Wrench,       color: 'text-amber-600',  bg: 'bg-amber-50',  title: 'Maintenance',         desc: 'Log issues, track repair status from Pending to Completed, keep full records.',        href: '/admin/maintenance' },
  { icon: MessageSquare,color: 'text-emerald-600',bg: 'bg-emerald-50',title: 'Messaging',           desc: 'Built-in messaging between users and admins. Report problems directly.',               href: '/messages' },
  { icon: BarChart3,    color: 'text-rose-600',   bg: 'bg-rose-50',   title: 'Reports & Analytics', desc: 'Visual charts for computer status, maintenance trends, and activity.',                 href: '/admin/reports' },
]

const steps = [
  { n: '1', title: 'Create Account',  desc: 'Register with your email and verify with a one-time code.' },
  { n: '2', title: 'Get Assigned',    desc: 'Admin assigns a computer to you. View full specs on your dashboard.' },
  { n: '3', title: 'Stay Connected',  desc: 'Report problems, message admin, and track your activity history.' },
]

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    if (profile?.role === 'admin') redirect('/admin/dashboard')
    else if (profile?.role === 'staff') redirect('/staff/dashboard')
    else if (profile?.role === 'user') redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "var(--font-inter), 'Inter', sans-serif" }}>

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
              <Monitor size={15} className="text-white" />
            </div>
            <span className="font-bold text-slate-800 tracking-tight">CMS</span>
            <span className="hidden sm:block text-slate-300 text-sm">·</span>
            <span className="hidden sm:block text-slate-400 text-sm">Computer Management </span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-sm font-semibold text-slate-500 hover:text-indigo-600 px-4 py-2 rounded-xl transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="btn-primary text-sm">
              Get Started <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-20 px-6" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)' }}>
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="relative max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          {/* text */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm text-indigo-200 mb-8">
              <Zap size={13} className="text-indigo-300" />
              Fully featured · Free to use
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight mb-6">
              Manage your computers<br />
              <span className="text-indigo-300">smarter & faster.</span>
            </h1>
            <p className="text-indigo-200 text-lg max-w-xl mb-10 leading-relaxed">
              Track assets, assign devices, handle maintenance, and communicate — all from one clean dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link href="/register" className="inline-flex items-center justify-center gap-2 bg-white text-indigo-700 hover:bg-indigo-50 font-bold px-8 py-3.5 rounded-2xl transition-colors shadow-lg shadow-indigo-900/30">
                Create Free Account <ArrowRight size={16} />
              </Link>
              <Link href="/login" className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-3.5 rounded-2xl transition-colors">
                Sign In
              </Link>
            </div>
          </div>
          {/* hero image */}
          <div className="flex-1 w-full max-w-lg lg:max-w-none">
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-indigo-900/50 bg-white/5">
              <div className="flex flex-col items-center justify-center gap-3 text-white/30 py-20">
                <Monitor size={64} />
                <span className="text-sm">Computer Management System</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-b border-slate-100 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '100%', label: 'Web Based' },
            { value: 'OTP',  label: 'Secure Login' },
            { value: '2',    label: 'User Roles' },
            { value: 'Free', label: 'To Use' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-2xl font-extrabold text-indigo-600">{value}</p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Everything you need</h2>
            <p className="text-slate-400 mt-3 max-w-md mx-auto text-sm">All the tools to manage your computer lab or office equipment in one place.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, color, bg, title, desc, href }) => (
              <Link key={title} href={href} className="group relative overflow-hidden rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all duration-200 bg-white block p-5">
                <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                  <Icon size={18} className={color} />
                </div>
                <p className="font-bold text-slate-800 mb-1.5 group-hover:text-indigo-600 transition-colors">{title}</p>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-500 mt-3">
                  Open <ArrowRight size={11} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-3">How It Works</p>
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Get started in minutes</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map(({ n, title, desc }) => (
              <div key={n} className="text-center">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-extrabold text-white mx-auto mb-4 shadow-lg shadow-indigo-200" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                  {n}
                </div>
                <p className="font-bold text-slate-800 mb-1.5">{title}</p>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roles ── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-3">Access Control</p>
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Two roles, one system</h2>
            <p className="text-slate-400 mt-3 text-sm">Different views tailored for admins and regular users.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Admin */}
            <div className="rounded-2xl p-6 border-2 border-indigo-100 bg-indigo-50/40">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                  <Shield size={18} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">Administrator</p>
                  <p className="text-xs text-slate-400">Full system access</p>
                </div>
              </div>
              <ul className="space-y-2">
                {['Manage all computers', 'Assign computers to users', 'Handle maintenance records', 'Message all users', 'View reports & analytics', 'Manage user roles & access'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle size={14} className="text-indigo-500 shrink-0" />{item}
                  </li>
                ))}
              </ul>
            </div>
            {/* User */}
            <div className="rounded-2xl p-6 border-2 border-emerald-100 bg-emerald-50/40">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                  <Users size={18} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">Regular User</p>
                  <p className="text-xs text-slate-400">Personal dashboard</p>
                </div>
              </div>
              <ul className="space-y-2">
                {['Register & verify via OTP', 'View assigned computer details', 'Submit maintenance requests', 'Message the administrator', 'View personal activity history', 'Receive admin replies'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle size={14} className="text-emerald-500 shrink-0" />{item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-slate-950 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
              <Monitor size={13} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-300">Computer Management System</span>
          </div>
          <p className="text-xs text-slate-500">Built with Next.js · Supabase · Tailwind CSS</p>
        </div>
      </footer>

    </div>
  )
}
