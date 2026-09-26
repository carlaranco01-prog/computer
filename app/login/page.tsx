'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Monitor } from 'lucide-react'
import OtpVerify from '@/components/OtpVerify'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)

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
        <h2 className="text-4xl font-bold leading-tight mb-4">Computer Management System</h2>
        <p className="text-blue-200 text-lg">Track, assign, and manage all your computers in one place.</p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-col justify-center w-full lg:w-[480px] lg:min-h-screen bg-white lg:rounded-l-3xl p-8 lg:p-12">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mb-5 lg:hidden">
          <Monitor size={22} className="text-white" />
        </div>

        {!otpSent ? (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-800">Welcome back</h1>
              <p className="text-slate-500 text-sm mt-1">Enter your email to receive a sign-in code</p>
            </div>
            <form onSubmit={handleSendOtp} className="space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}
              <div>
                <label className="label">Email Address</label>
                <input className="input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
                {loading ? 'Sending code...' : 'Send Sign-In Code'}
              </button>
            </form>
            <p className="text-center text-sm text-slate-500 mt-6">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-blue-600 hover:underline font-semibold">Register</Link>
            </p>
          </>
        ) : (
          <OtpVerify
            email={email}
            type="login"
            onBack={() => setOtpSent(false)}
          />
        )}
      </div>
    </div>
  )
}
