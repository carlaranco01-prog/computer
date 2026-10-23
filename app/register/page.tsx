'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Monitor, CheckCircle2 } from 'lucide-react'
import OtpVerify from '@/components/OtpVerify'

const PW_RULES = {
  minLength: 8,
  messages: {
    short:     'Must be at least 8 characters.',
    uppercase: 'Must contain an uppercase letter.',
    number:    'Must contain a number.',
  },
}

function validatePassword(p: string) {
  if (p.length < PW_RULES.minLength) return PW_RULES.messages.short
  if (!/[A-Z]/.test(p)) return PW_RULES.messages.uppercase
  if (!/[0-9]/.test(p)) return PW_RULES.messages.number
  return ''
}

const perks = [
  'Track your assigned computer',
  'Submit maintenance requests',
  'Receive real-time messages',
  'View your activity history',
]

export default function RegisterPage() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.full_name || !form.email || !form.password || !form.confirm) {
      setError('Please fill in all fields.'); return
    }
    const pwErr = validatePassword(form.password)
    if (pwErr) { setError(pwErr); return }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }

    setLoading(true)
    const supabase = createClient()

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name } },
    })

    if (signUpError) { setError(signUpError.message); setLoading(false); return }

    if (data.user && data.user.identities?.length === 0) {
      setError('This email is already registered. Please sign in instead.')
      setLoading(false)
      return
    }

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
          Join the system<br />
          <span className="text-indigo-300">in seconds.</span>
        </h2>
        <p className="text-indigo-200 text-base mb-10 max-w-sm">
          Create your account and get instant access to your assigned computer and resources.
        </p>

        <div className="space-y-3 max-w-xs">
          {perks.map(perk => (
            <div key={perk} className="flex items-center gap-3">
              <CheckCircle2 size={17} className="text-indigo-300 shrink-0" />
              <span className="text-sm text-indigo-100">{perk}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-col justify-center w-full lg:w-[460px] lg:min-h-screen bg-white lg:rounded-l-[2.5rem] p-8 lg:p-12 shadow-2xl overflow-y-auto">
        <div className="w-11 h-11 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 lg:hidden">
          <Monitor size={20} className="text-white" />
        </div>

        {!otpSent ? (
          <>
            <div className="mb-7">
              <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Create Account</h1>
              <p className="text-slate-500 text-sm mt-1.5">Register to get started with CMS</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" />
                  {error}
                </div>
              )}
              <div>
                <label className="label">Full Name</label>
                <input className="input" placeholder="Juan Dela Cruz" value={form.full_name} onChange={e => set('full_name', e.target.value)} />
              </div>
              <div>
                <label className="label">Email Address</label>
                <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
              </div>
              <div>
                <label className="label">Password</label>
                <input className="input" type="password" placeholder="Min. 8 chars, 1 uppercase, 1 number" value={form.password} onChange={e => set('password', e.target.value)} />
              </div>
              <div>
                <label className="label">Confirm Password</label>
                <input className="input" type="password" placeholder="••••••••" value={form.confirm} onChange={e => set('confirm', e.target.value)} />
              </div>
              <button type="submit" className="btn-primary w-full py-3 text-base" disabled={loading}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Creating account…
                  </span>
                ) : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </>
        ) : (
          <OtpVerify email={form.email} name={form.full_name} type="signup" onBack={() => setOtpSent(false)} />
        )}
      </div>
    </div>
  )
}
