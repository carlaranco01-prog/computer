'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Mail } from 'lucide-react'

function VerifyOTPContent() {
  const router = useRouter()
  const params = useSearchParams()
  const email = params.get('email') ?? ''
  const name = params.get('name') ?? ''
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [countdown])

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    if (!otp || otp.length < 6) { setError('Please enter the 6-digit OTP.'); return }
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
      // Now we have a real session — safe to insert profile
      const fullName = name || data.user.user_metadata?.full_name || ''

      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName,
        email: data.user.email ?? email,
        role: 'user',
      }, { onConflict: 'id' })

      if (profileError) {
        console.error('Profile upsert error:', profileError.message)
      }

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: data.user.id,
        action: 'Account Verified',
        description: 'Email OTP verified successfully',
      })
    }

    setSuccess('Email verified! Redirecting...')
    setTimeout(() => router.push('/dashboard'), 1500)
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Mail size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Verify Your Email</h1>
          <p className="text-slate-500 text-sm mt-1">Enter the 6-digit code sent to</p>
          <p className="text-blue-600 font-medium text-sm">{email}</p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleVerify} className="space-y-4">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
            {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{success}</div>}
            <div>
              <label className="label">OTP Code</label>
              <input
                className="input text-center text-2xl tracking-widest font-mono"
                placeholder="000000"
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <button type="submit" className="btn-primary w-full py-2.5" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>
          <div className="text-center mt-4">
            <button
              onClick={handleResend}
              disabled={resending || countdown > 0}
              className="text-sm text-blue-600 hover:underline disabled:opacity-50 disabled:no-underline"
            >
              {countdown > 0 ? `Resend OTP in ${countdown}s` : resending ? 'Sending...' : 'Resend OTP'}
            </button>
          </div>
          <p className="text-center text-xs text-slate-400 mt-3">
            Check your spam folder if you don&apos;t see the email
          </p>
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
