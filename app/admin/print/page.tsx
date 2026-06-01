import PrintClient from './PrintClient'
import { requireAdminPageAccess } from '@/lib/admin-page-auth'

export default async function PrintPage() {
  await requireAdminPageAccess()

  return <PrintClient />
}
