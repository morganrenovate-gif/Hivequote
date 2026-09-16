import { cookies } from 'next/headers'
import {
  CONTRACTOR_ACCESS_COOKIE,
  CONTRACTOR_REFRESH_COOKIE,
  resolveContractorAccessToken,
} from '@/lib/auth/contractor'

export async function getServerContractor() {
  const accessToken = cookies().get(CONTRACTOR_ACCESS_COOKIE)?.value ?? ''
  if (!accessToken) return null
  return resolveContractorAccessToken(accessToken)
}

export function hasContractorRefreshSession() {
  return Boolean(cookies().get(CONTRACTOR_REFRESH_COOKIE)?.value)
}
