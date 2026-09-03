import { createClient } from '@supabase/supabase-js'

// Vite only reads .env, .env.local and .env.production — never .env.example,
// which is a template for humans. On Netlify these come from
// Site configuration -> Environment variables, and are baked in at BUILD time,
// so a site deployed before you added them stays broken until it rebuilds.
const rawUrl = import.meta.env.VITE_SUPABASE_URL?.trim()

// Supabase renamed the client key: publishable replaces anon. Accept either.
const rawKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY
)?.trim()

// The client wants the bare project URL. The dashboard also shows a RESTful
// endpoint ending in /rest/v1/ — strip it rather than fail on a easy mix-up.
const url = rawUrl?.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '')

export const configError = !url
  ? 'VITE_SUPABASE_URL is not set.'
  : !rawKey
    ? 'VITE_SUPABASE_PUBLISHABLE_KEY is not set.'
    : rawKey.startsWith('sb_secret_')
      ? 'That is the SECRET key. Use the publishable key (sb_publishable_…) — a secret key in the browser gives every visitor full database access.'
      : null

if (configError) console.error('Supabase config:', configError)

// Fall back to harmless placeholders so a misconfigured build shows the setup
// screen instead of a blank page.
export const supabase = createClient(url || 'https://placeholder.supabase.co', rawKey || 'placeholder')

export const photoUrl = (path) => supabase.storage.from('pieces').getPublicUrl(path).data.publicUrl