import AdminClient from './AdminClient'
import { requireAdminPageAccess } from '@/lib/admin-page-auth'

export default async function AdminPage() {
  await requireAdminPageAccess()

  return <AdminClient />
}
