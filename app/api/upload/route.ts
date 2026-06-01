import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { requireAdminApiAccess } from '@/lib/admin-api-auth'

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
])

function normalizeSegment(value: string) {
  return value
    .replace(/[^a-zA-Z0-9/_-]/g, '')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
}

function normalizeFileName(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, '-')
}

export async function POST(req: Request) {
  const unauthorized = await requireAdminApiAccess()

  if (unauthorized) {
    return unauthorized
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const folderValue = formData.get('folder')

    if (!file) {
      return NextResponse.json({ error: 'No file' }, { status: 400 })
    }

    if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: 'Formato invalido. Usa JPG, PNG ou WEBP.' },
        { status: 400 }
      )
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      return NextResponse.json(
        { error: 'A imagem excede o limite de 5MB.' },
        { status: 400 }
      )
    }

    const folder =
      typeof folderValue === 'string' ? normalizeSegment(folderValue) : ''
    const fileName = `${Date.now()}-${normalizeFileName(file.name)}`
    const filePath = folder ? `${folder}/${fileName}` : fileName

    const { error } = await supabaseAdmin.storage
      .from('djs')
      .upload(filePath, file)

    if (error) {
      console.error(error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data } = supabaseAdmin.storage
      .from('djs')
      .getPublicUrl(filePath)

    return NextResponse.json({ url: data.publicUrl })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
