import { createBrowserClient } from '@supabase/ssr'

// Use your exact .env variables
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

// Export a singleton for use in Client Components (like your ContextFilter)
export const supabase = createClient()