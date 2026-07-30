import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null) // authoritative row from app_users
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session?.user?.id) {
      setProfile(null)
      setLoading(false)
      return
    }
    let active = true
    supabase
      .from('app_users')
      .select('company_id, portal, account_type, role, is_platform_admin')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => {
        if (active) {
          setProfile(data ?? null)
          setLoading(false)
        }
      })
    return () => { active = false }
  }, [session?.user?.id])

  // These come from the database (app_users), never from user_metadata —
  // user_metadata can be rewritten by the signed-in user themselves via
  // supabase.auth.updateUser(), so it must never gate anything sensitive.
  const portal = profile?.portal ?? null
  const accountType = profile?.account_type ?? null
  const role = profile?.role ?? null
  const isPlatformAdmin = profile?.is_platform_admin ?? false

  const signOut = () => supabase.auth.signOut()

  return (
    <AuthContext.Provider
      value={{ session, user: session?.user ?? null, portal, accountType, role, isPlatformAdmin, loading, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}