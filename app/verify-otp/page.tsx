'use client'
import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Mail } from 'lucide-react'

function VerifyOTPContent() {
  const router = useRouter()
  const params = useSearchParams()
  const email = params.get('email') ?? ''
  const name = params.get('name') ?? ''

  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

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
    const nextEmpty = pasted.length < 6 ? pasted.length : 5
    inputRefs.current[nextEmpty]?.focus()
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
      type: 'signup',
    })

    if (verifyError) {
      setError(verifyError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      const fullName = name || data.user.user_metadata?.full_name || ''
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName,
        email: data.user.email ?? email,
        role: 'user',
      }, { onConflict: 'id' })

      await supabase.from('activity_logs').insert({
        user_id: data.user.id,
        action: 'Account Verified',
        description: 'Email OTP verified successfully',
      })
    }

    setSuccess('Email verified! Redirecting to login...')
    setTimeout(() => router.push('/login'), 1500)
  }

  async function handleResend() {
    setResending(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.resend({ type: 'signup', email })
    if (error) setError(error.message)
    else { setSuccess('OTP resent! Check your email.'); setCountdown(60) }
    setResending(false)
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(160deg, #1e3a5f 0%, #1e40af 60%, #1d4ed8 100%)' }}>
      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col justify-center px-16 flex-1 text-white">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Mail size={24} className="text-white" />
          </div>
          <span className="text-xl font-bold">CMS</span>
        </div>
        <h2 className="text-4xl font-bold leading-tight mb-4">Check Your Email</h2>
        <p className="text-blue-200 text-lg">We sent a 6-digit verification code to your email address.</p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-col justify-center w-full lg:w-[480px] lg:min-h-screen bg-white lg:rounded-l-3xl p-8 lg:p-12">
        <div className="mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mb-5 lg:hidden">
            <Mail size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Verify Your Email</h1>
          <p className="text-slate-500 text-sm mt-1">Enter the 6-digit code sent to</p>
          <p className="text-blue-600 font-semibold text-sm mt-0.5">{email}</p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}
          {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm">{success}</div>}

          {/* 6 digit boxes */}
          <div>
            <label className="label">Verification Code</label>
            <div className="flex gap-3 mt-2" onPaste={handlePaste}>
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
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={handleResend}
            disabled={resending || countdown > 0}
            className="text-sm text-blue-600 hover:underline disabled:opacity-40 disabled:no-underline font-medium"
          >
            {countdown > 0 ? `Resend code in ${countdown}s` : resending ? 'Sending...' : 'Resend Code'}
          </button>
          <p className="text-xs text-slate-400 mt-2">Check your spam folder if you don&apos;t see the email</p>
        </div>
      </div>
    </div>
  )
}

export default function VerifyOTPPage() {
  return (
    <Suspense>
      <VerifyOTPContent />
    </Suspense>
  )
}
