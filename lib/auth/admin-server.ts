import { cookies } from 'next/headers'
import { ADMIN_ACCESS_COOKIE, resolveAdminAccessToken } from '@/lib/auth/admin'

export async function getServerAdmin() {
  const accessToken = cookies().get(ADMIN_ACCESS_COOKIE)?.value ?? ''
  if (!accessToken) return null
  return resolveAdminAccessToken(accessToken)
}
