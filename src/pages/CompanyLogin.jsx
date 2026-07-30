import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import AuthShell from '../components/AuthShell'
import FormField from '../components/FormField'
import PrimaryButton from '../components/PrimaryButton'

export default function CompanyLogin() {
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
    setLoading(false)
    if (error) return setError(error.message)
    if (data.user?.user_metadata?.portal !== 'company') {
      await supabase.auth.signOut()
      return setError('This login is for company accounts. Use the customer login instead.')
    }
    navigate('/dashboard')
  }

  return (
    <AuthShell
      eyebrow="COMPANY ACCOUNT"
      title="Log in"
      subtitle={location.state?.justSignedUp ? 'Company created — check your email to confirm, then log in.' : 'Access your fleet, tickets and team.'}
      footer={
        <>
          No company account yet? <Link to="/company/signup" className="text-live-500 hover:underline">Register</Link>
          <br />
          Monitoring your own single site? <Link to="/customer/login" className="text-live-500 hover:underline">Customer login</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <FormField label="WORK EMAIL" type="email" required value={form.email} onChange={set('email')} placeholder="you@company.com" />
        <FormField label="PASSWORD" type="password" required value={form.password} onChange={set('password')} placeholder="Your password" />
        {error && <p className="text-alert-500 text-sm mb-4">{error}</p>}
        <PrimaryButton type="submit" loading={loading}>Log in</PrimaryButton>
      </form>
    </AuthShell>
  )
}
