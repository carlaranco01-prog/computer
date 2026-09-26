'use server'
import { createClient } from '@supabase/supabase-js'

export async function confirmUser(userId: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { error } = await supabase.auth.admin.updateUserById(userId, {
    email_confirm: true,
  })

  return { error: error?.message ?? null }
}
