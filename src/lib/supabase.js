import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  // Fail loudly in development rather than silently returning empty data.
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — see SUPABASE.md')
}

export const supabase = createClient(url, anonKey)

// Public URL for a stored photo path, e.g. "pieces/<piece-id>/0.jpg"
export const photoUrl = (path) => supabase.storage.from('pieces').getPublicUrl(path).data.publicUrl