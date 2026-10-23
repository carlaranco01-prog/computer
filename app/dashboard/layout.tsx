import { requireAuth, getUserProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ProfileProvider } from '@/components/ProfileContext'

export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireAuth()
  const profile = await getUserProfile()
  if (!profile) redirect('/login')
  return <ProfileProvider profile={profile}>{children}</ProfileProvider>
}
