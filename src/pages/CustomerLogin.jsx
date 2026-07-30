import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import AuthShell from '../components/AuthShell'
import FormField from '../components/FormField'
import PrimaryButton from '../components/PrimaryButton'

export default function CustomerLogin() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { data, error } = await supabase.auth.signInWithPassword(form)
    if (error) { setLoading(false); return setError(error.message) }

    const { data: profile } = await supabase
      .from('app_users')
      .select('portal')
      .eq('id', data.user.id)
      .single()

    setLoading(false)
    if (profile?.portal !== 'customer') {
      await supabase.auth.signOut()
      return setError('This login is for customer accounts. Use the company login instead.')
    }
    navigate('/dashboard')
  }

  return (
    <AuthShell
      eyebrow="CUSTOMER ACCOUNT"
      title="Log in"
      subtitle={location.state?.justSignedUp ? 'Account created — check your email to confirm, then log in.' : 'Monitor your sites and devices.'}
      footer={
        <>
          No account yet? <Link to="/customer/signup" className="text-live-500 hover:underline">Sign up</Link>
          <br />
          Are you ONE93NINE/LeakDtech staff? <Link to="/company/login" className="text-live-500 hover:underline">Company login</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <FormField label="EMAIL" type="email" required value={form.email} onChange={set('email')} placeholder="you@example.com" />
        <FormField label="PASSWORD" type="password" required value={form.password} onChange={set('password')} placeholder="Your password" />
        {error && <p className="text-alert-500 text-sm mb-4">{error}</p>}
        <PrimaryButton type="submit" loading={loading}>Log in</PrimaryButton>
      </form>
    </AuthShell>
  )
}