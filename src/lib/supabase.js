import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL

// Supabase renamed the client-side key: the publishable key (sb_publishable_...)
// replaces what used to be called the anon key. Both names are accepted here so
// the app works whether your project is on the new keys or the legacy ones.
const publishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !publishableKey) {
  console.error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY. ' +
      'Get both from Supabase -> your project -> Connect -> App Frameworks (React / Vite). ' +
      'See SUPABASE.md.',
  )
}

if (publishableKey?.startsWith('sb_secret_')) {
  // A secret key in the browser would hand every visitor full database access.
  throw new Error('That is the SECRET key. Use the publishable key (sb_publishable_...) here.')
}

export const supabase = createClient(url, publishableKey)

// Public URL for a stored photo path, e.g. "<piece-id>/0.jpg"
export const photoUrl = (path) => supabase.storage.from('pieces').getPublicUrl(path).data.publicUrl