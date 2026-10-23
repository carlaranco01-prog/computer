'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ReturnRequestButtonProps {
  assignmentId: string
  userId: string
}

export default function ReturnRequestButton({ assignmentId, userId }: ReturnRequestButtonProps) {
  const [requested, setRequested] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function requestReturn() {
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: requestError } = await supabase.from('return_requests').insert({
      assignment_id: assignmentId,
      user_id: userId,
    })

    if (requestError) {
      setError(requestError.code === '23505'
        ? 'A return request is already pending for this computer.'
        : requestError.message)
    } else {
      setRequested(true)
    }
    setLoading(false)
  }

  return (
    <div>
      {requested ? (
        <p className="text-sm font-medium text-amber-700">Return request sent. Please wait for staff to confirm the return.</p>
      ) : (
        <button onClick={requestReturn} disabled={loading} className="btn-primary text-sm disabled:opacity-50">
          {loading ? 'Sending request…' : 'Request Return'}
        </button>
      )}
      {error && <p role="alert" className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  )
}
