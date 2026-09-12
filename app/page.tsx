import Link from 'next/link'
import { Monitor, Shield, Wrench, MessageSquare, BarChart3, Users, CheckCircle, ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Monitor size={16} className="text-white" />
            </div>
            <span className="font-bold text-slate-800">CMS</span>
            <span className="text-slate-400 text-sm hidden sm:block">Computer Management System</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="btn-primary text-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-slate-800 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/30 border border-blue-400/40 rounded-full px-4 py-1.5 text-sm mb-6">
            <CheckCircle size={14} />
            Fully featured computer management
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Manage Your Computers
            <span className="block text-blue-300 mt-2">Smarter & Faster</span>
          </h1>
          <p className="text-blue-100 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            A complete system to track computers, manage assignments, handle maintenance, and communicate — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
              Create Account <ArrowRight size={18} />
            </Link>
            <Link href="/login" className="border border-blue-400 hover:bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-slate-50 border-y border-slate-200 py-12 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '100%', label: 'Web Based' },
            { value: 'Real-time', label: 'Updates' },
            { value: 'Role-based', label: 'Access Control' },
            { value: 'Free', label: 'To Use' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-2xl font-bold text-blue-600">{value}</p>
              <p className="text-sm text-slate-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-800">Everything You Need</h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">All the tools to manage your computer lab or office equipment in one system.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Monitor size={24} className="text-blue-600" />,
                bg: 'bg-blue-50',
                title: 'Computer Tracking',
                desc: 'Track every computer with full specs — brand, model, processor, RAM, storage, OS, and location.',
              },
              {
                icon: <Users size={24} className="text-green-600" />,
                bg: 'bg-green-50',
                title: 'User Management',
                desc: 'Manage staff and student accounts with role-based access. Admins get full control, users get their own view.',
              },
              {
                icon: <Shield size={24} className="text-purple-600" />,
                bg: 'bg-purple-50',
                title: 'Computer Assignments',
                desc: 'Assign computers to users, track assignment history, and mark returns with a single click.',
              },
              {
                icon: <Wrench size={24} className="text-orange-600" />,
                bg: 'bg-orange-50',
                title: 'Maintenance Records',
                desc: 'Log maintenance issues, track repair status from Pending to Completed, and keep full history.',
              },
              {
                icon: <MessageSquare size={24} className="text-teal-600" />,
                bg: 'bg-teal-50',
                title: 'Messaging System',
                desc: 'Built-in real-time messaging between users and administrators. Report problems directly.',
              },
              {
                icon: <BarChart3 size={24} className="text-red-600" />,
                bg: 'bg-red-50',
                title: 'Reports & Analytics',
                desc: 'Visual charts for computer status, maintenance trends, and monthly activity reports.',
              },
            ].map(({ icon, bg, title, desc }) => (
              <div key={title} className="card p-6 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-4`}>
                  {icon}
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-800">How It Works</h2>
            <p className="text-slate-500 mt-3">Get started in minutes</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Create Account', desc: 'Register with your email and verify with OTP sent to your inbox.' },
              { step: '2', title: 'Get Assigned', desc: 'Admin assigns a computer to you. View full specs on your dashboard.' },
              { step: '3', title: 'Stay Connected', desc: 'Report problems, send messages to admin, and track your history.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step}
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-800">Two Roles, One System</h2>
            <p className="text-slate-500 mt-3">Different views for admins and regular users</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Admin */}
            <div className="card p-6 border-2 border-blue-100">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Shield size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">Administrator</p>
                  <p className="text-xs text-slate-400">Full system access</p>
                </div>
              </div>
              <ul className="space-y-2">
                {[
                  'Manage all computers (add, edit, delete)',
                  'Assign computers to users',
                  'Manage maintenance records',
                  'View and message all users',
                  'View reports and analytics',
                  'Manage user roles',
                  'View all activity logs',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle size={14} className="text-blue-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* User */}
            <div className="card p-6 border-2 border-green-100">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                  <Users size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">Regular User</p>
                  <p className="text-xs text-slate-400">Personal dashboard</p>
                </div>
              </div>
              <ul className="space-y-2">
                {[
                  'Register and verify email with OTP',
                  'View assigned computer details',
                  'View assignment history',
                  'Report computer problems',
                  'Send messages to admin',
                  'View personal activity history',
                  'Receive replies from admin',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle size={14} className="text-green-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-slate-700 text-white py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-blue-100 mb-8 text-lg">Create your account now and start managing your computers efficiently.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
              Create Account <ArrowRight size={18} />
            </Link>
            <Link href="/login" className="border border-blue-300 hover:bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <Monitor size={12} className="text-white" />
            </div>
            <span className="text-sm font-medium text-slate-300">Computer Management System</span>
          </div>
          <p className="text-xs">Built with Next.js, Supabase & Tailwind CSS</p>
          <div className="flex gap-4 text-sm">
            <Link href="/login" className="hover:text-white transition-colors">Login</Link>
            <Link href="/register" className="hover:text-white transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
