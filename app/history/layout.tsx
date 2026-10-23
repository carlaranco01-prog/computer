import { requireAuth, getUserProfile } from '@/lib/auth'
import { ProfileProvider } from '@/components/ProfileContext'

export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireAuth()
  const profile = await getUserProfile()
  return <ProfileProvider profile={profile!}>{children}</ProfileProvider>
}
