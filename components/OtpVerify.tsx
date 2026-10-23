'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface OtpVerifyProps {
  email: string
  name?: string
  type: 'signup' | 'login'
  onBack: () => void
}

export default function OtpVerify({ email, name, type, onBack }: OtpVerifyProps) {
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => { inputRefs.current[0]?.focus() }, [])

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [countdown])

  function handleDigitChange(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1)
    const newDigits = [...digits]
    newDigits[index] = digit
    setDigits(newDigits)
    if (digit && index < 5) inputRefs.current[index + 1]?.focus()
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newDigits = [...digits]
    pasted.split('').forEach((d, i) => { newDigits[i] = d })
    setDigits(newDigits)
    inputRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    const otp = digits.join('')
    if (otp.length < 6) { setError('Please enter all 6 digits.'); return }
    setLoading(true)
    setError('')
    const supabase = createClient()

    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: type === 'signup' ? 'signup' : 'email',
    })

    if (verifyError) {
      setError(verifyError.message)
      setLoading(false)
      return
    }

    if (!data.user) {
      setError('Verification failed. Please try again.')
      setLoading(false)
      return
    }

    const fullName = name || data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User'
    const { error: profileSaveError } = await supabase.from('profiles').upsert({
      id: data.user.id,
      full_name: fullName,
      email: data.user.email ?? email,
      role: 'user',
    }, { onConflict: 'id', ignoreDuplicates: true })

    if (profileSaveError) {
      setError(`Could not load your account profile: ${profileSaveError.message}`)
      setLoading(false)
      return
    }

    await supabase.from('activity_logs').insert({
      user_id: data.user.id,
      action: type === 'signup' ? 'Account Verified' : 'Login',
      description: type === 'signup' ? 'Email OTP verified successfully' : 'User logged in via OTP',
    }).then(() => {})

    if (type === 'signup') {
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) {
        setError(`Registration succeeded, but sign out failed: ${signOutError.message}`)
        setLoading(false)
        return
      }
      setSuccess('Registration complete! Redirecting to sign in...')
      window.location.href = '/login'
      return
    }

    setSuccess('Verified! Redirecting...')

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .maybeSingle()

    if (profileError || !profile) {
      setError(profileError?.message ?? 'Your account profile could not be found. Please try again.')
      setLoading(false)
      return
    }

    if (profile?.role === 'admin') window.location.href = '/admin/dashboard'
    else if (profile?.role === 'staff') window.location.href = '/staff/dashboard'
    else window.location.href = '/dashboard'
  }

  async function handleResend() {
    setResending(true)
    setError('')
    const supabase = createClient()
    const { error } = type === 'signup'
      ? await supabase.auth.resend({ type: 'signup', email })
      : await supabase.auth.signInWithOtp({
          email,
          options: { shouldCreateUser: false },
        })
    if (error) setError(error.message)
    else { setSuccess('Code resent! Check your email.'); setCountdown(60) }
    setResending(false)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Check Your Email</h1>
        <p className="text-slate-500 text-sm mt-1">Enter the 6-digit code sent to</p>
        <p className="text-blue-600 font-semibold text-sm mt-0.5">{email}</p>
      </div>

      <form onSubmit={handleVerify} className="space-y-6">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}
        {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm">{success}</div>}

        <div>
          <label className="label">Verification Code</label>
          <div className="flex gap-2 mt-2" onPaste={handlePaste}>
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={el => { inputRefs.current[i] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleDigitChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className="w-full aspect-square text-center text-2xl font-bold border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-slate-50 focus:bg-white"
              />
            ))}
          </div>
        </div>

        <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify Code'}
        </button>
      </form>

      <div className="text-center mt-5 space-y-2">
        <button
          onClick={handleResend}
          disabled={resending || countdown > 0}
          className="text-sm text-blue-600 hover:underline disabled:opacity-40 disabled:no-underline font-medium"
        >
          {countdown > 0 ? `Resend code in ${countdown}s` : resending ? 'Sending...' : 'Resend Code'}
        </button>
        <p className="text-xs text-slate-400">Check your spam folder if you don&apos;t see the email</p>
        <button onClick={onBack} className="text-xs text-slate-400 hover:text-slate-600 block mx-auto">
          ← Back
        </button>
      </div>
    </div>
  )
}
