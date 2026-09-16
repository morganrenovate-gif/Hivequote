import { cookies } from 'next/headers'
import { CONTRACTOR_ACCESS_COOKIE, resolveContractorAccessToken } from '@/lib/auth/contractor'

export async function getServerContractor() {
  const accessToken = cookies().get(CONTRACTOR_ACCESS_COOKIE)?.value ?? ''
  if (!accessToken) return null
  return resolveContractorAccessToken(accessToken)
}
