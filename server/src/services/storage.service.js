import { getSupabase } from '../config/supabase.js'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'

const BUCKET = 'documents'

export async function uploadFile(file) {
  const supabase = getSupabase()
  const ext = path.extname(file.originalname)
  const filePath = `${uuidv4()}${ext}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    })

  if (error) throw new Error(`Upload failed: ${error.message}`)

  return {
    filePath,
    fileName: file.originalname,
    fileSize: file.size,
    mimeType: file.mimetype,
  }
}

export async function deleteFile(filePath) {
  const supabase = getSupabase()
  await supabase.storage.from(BUCKET).remove([filePath])
}

export function getPublicUrl(filePath) {
  const supabase = getSupabase()
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath)
  return data.publicUrl
}
