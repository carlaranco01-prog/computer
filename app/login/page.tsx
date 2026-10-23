'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Monitor, Shield, Zap, BarChart3, ArrowLeft } from 'lucide-react'
import OtpVerify from '@/components/OtpVerify'

const features = [
  { icon: Monitor, label: 'Asset Tracking', desc: 'Monitor every device in real-time' },
  { icon: Shield,  label: 'Secure Access',  desc: 'Role-based permissions & OTP login' },
  { icon: Zap,     label: 'Fast Workflows', desc: 'Assign, maintain, and report instantly' },
  { icon: BarChart3, label: 'Analytics',    desc: 'Insights on usage and maintenance' },
]

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)

  useEffect(() => {
    async function checkSession() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
      if (profile?.role === 'admin') window.location.href = '/admin/dashboard'
      else if (profile?.role === 'staff') window.location.href = '/staff/dashboard'
      else window.location.href = '/dashboard'
    }
    checkSession()
  }, [])

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email) { setError('Please enter your email.'); return }
    setLoading(true)
    const supabase = createClient()
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    })
    if (otpError) { setError(otpError.message); setLoading(false); return }
    setOtpSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #3730a3 100%)' }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-center px-16 flex-1 text-white">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-11 h-11 bg-white/15 rounded-2xl flex items-center justify-center ring-1 ring-white/20">
            <Monitor size={22} className="text-white" />
          </div>
          <div>
            <p className="text-lg font-bold tracking-wide">CMS</p>
            <p className="text-indigo-300 text-xs">Computer Management System</p>
          </div>
        </div>

        <h2 className="text-4xl font-extrabold leading-tight mb-3 tracking-tight">
          Manage your fleet<br />
          <span className="text-indigo-300">with confidence.</span>
        </h2>
        <p className="text-indigo-200 text-base mb-10 max-w-sm">
          Track, assign, and maintain all your computers from one unified platform.
        </p>

        <div className="grid grid-cols-2 gap-3 max-w-sm">
          {features.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="bg-white/10 rounded-2xl p-4 ring-1 ring-white/10 hover:bg-white/15 transition-colors">
              <Icon size={18} className="text-indigo-300 mb-2" />
              <p className="text-sm font-semibold text-white">{label}</p>
              <p className="text-xs text-indigo-300 mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-col justify-center w-full lg:w-[460px] lg:min-h-screen bg-white lg:rounded-l-[2.5rem] p-8 lg:p-12 shadow-2xl relative">
        <Link href="/" className="absolute top-6 left-6 flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-indigo-600 transition-colors group">
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Home
        </Link>
        <div className="w-11 h-11 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 lg:hidden">
          <Monitor size={20} className="text-white" />
        </div>

        {!otpSent ? (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Welcome back</h1>
              <p className="text-slate-500 text-sm mt-1.5">Enter your email to receive a sign-in code</p>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" />
                  {error}
                </div>
              )}
              <div>
                <label className="label">Email Address</label>
                <input
                  className="input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-primary w-full py-3 text-base" disabled={loading}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Sending code…
                  </span>
                ) : 'Send Sign-In Code'}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline">
                Register
              </Link>
            </p>
          </>
        ) : (
          <OtpVerify email={email} type="login" onBack={() => setOtpSent(false)} />
        )}
      </div>
    </div>
  )
}
