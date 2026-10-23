'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { KeyRound } from 'lucide-react'

type Step = 'email' | 'otp' | 'password'

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

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function sendOTP(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email) { setError('Please enter your email.'); return }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) setError(error.message)
    else { setSuccess('OTP sent! Check your email.'); setStep('otp') }
    setLoading(false)
  }

  async function verifyOTP(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!otp || otp.length < 6) { setError('Enter the 6-digit OTP.'); return }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'recovery' })
    if (error) setError(error.message)
    else { setSuccess('OTP verified! Set your new password.'); setStep('password') }
    setLoading(false)
  }

  async function updatePassword(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const pwErr = validatePassword(password)
    if (pwErr) { setError(pwErr); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) setError(error.message)
    else {
      setSuccess('Password updated! Redirecting to login...')
      setTimeout(() => router.push('/login'), 1500)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(160deg, #1e3a5f 0%, #1e40af 60%, #1d4ed8 100%)' }}>
      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col justify-center px-16 flex-1 text-white">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <KeyRound size={24} className="text-white" />
          </div>
          <span className="text-xl font-bold">CMS</span>
        </div>
        <h2 className="text-4xl font-bold leading-tight mb-4">Reset Your Password</h2>
        <p className="text-blue-200 text-lg">Follow the steps to regain access to your account.</p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-col justify-center w-full lg:w-[480px] lg:min-h-screen bg-white lg:rounded-l-3xl p-8 lg:p-12">
        <div className="mb-6">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mb-5 lg:hidden">
            <KeyRound size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Reset Password</h1>
          <p className="text-slate-500 text-sm mt-1">
            {step === 'email' && 'Enter your email to receive a reset code'}
            {step === 'otp' && 'Enter the code sent to your email'}
            {step === 'password' && 'Create your new password'}
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {(['email', 'otp', 'password'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step === s || i < ['email','otp','password'].indexOf(step)
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-400'
              }`}>
                {i + 1}
              </div>
              {i < 2 && <div className={`flex-1 h-0.5 ${i < ['email','otp','password'].indexOf(step) ? 'bg-blue-600' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">{error}</div>}
        {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm mb-4">{success}</div>}

        {step === 'email' && (
          <form onSubmit={sendOTP} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <input className="input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={verifyOTP} className="space-y-4">
            <div>
              <label className="label">OTP Code</label>
              <input className="input text-center text-2xl tracking-widest font-mono" placeholder="000000" maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} />
            </div>
            <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
          </form>
        )}

        {step === 'password' && (
          <form onSubmit={updatePassword} className="space-y-4">
            <div>
              <label className="label">New Password</label>
              <input className="input" type="password" placeholder="Min. 8 chars, 1 uppercase, 1 number" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input className="input" type="password" placeholder="••••••••" value={confirm} onChange={e => setConfirm(e.target.value)} />
            </div>
            <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-slate-500 mt-6">
          <Link href="/login" className="text-blue-600 hover:underline font-semibold">Back to Login</Link>
        </p>
      </div>
    </div>
  )
}
