'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Monitor } from 'lucide-react'
import OtpVerify from '@/components/OtpVerify'

function validatePassword(p: string) {
  if (p.length < 8) return 'Password must be at least 8 characters.'
  if (!/[A-Z]/.test(p)) return 'Password must contain an uppercase letter.'
  if (!/[0-9]/.test(p)) return 'Password must contain a number.'
  return ''
}

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

    // First sign up the user with password
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name } },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user && data.user.identities?.length === 0) {
      setError('This email is already registered. Please sign in instead.')
      setLoading(false)
      return
    }

    // Then send OTP for verification
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: form.email,
      options: { shouldCreateUser: false },
    })

    if (otpError) {
      setError(otpError.message)
      setLoading(false)
      return
    }

    setOtpSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(160deg, #1e3a5f 0%, #1e40af 60%, #1d4ed8 100%)' }}>
      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col justify-center px-16 flex-1 text-white">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Monitor size={24} className="text-white" />
          </div>
          <span className="text-xl font-bold">CMS</span>
        </div>
        <h2 className="text-4xl font-bold leading-tight mb-4">Join the System</h2>
        <p className="text-blue-200 text-lg">Create your account and get access to your assigned computer.</p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-col justify-center w-full lg:w-[480px] lg:min-h-screen bg-white lg:rounded-l-3xl p-8 lg:p-12 overflow-y-auto">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mb-5 lg:hidden">
          <Monitor size={22} className="text-white" />
        </div>

        {!otpSent ? (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-800">Create Account</h1>
              <p className="text-slate-500 text-sm mt-1">Register to get started</p>
            </div>
            <form onSubmit={handleRegister} className="space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}
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
              <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
            <p className="text-center text-sm text-slate-500 mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 hover:underline font-semibold">Sign in</Link>
            </p>
          </>
        ) : (
          <OtpVerify
            email={form.email}
            name={form.full_name}
            type="signup"
            onBack={() => setOtpSent(false)}
          />
        )}
      </div>
    </div>
  )
}
