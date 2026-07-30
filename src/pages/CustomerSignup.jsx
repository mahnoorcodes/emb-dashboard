import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import AuthShell from '../components/AuthShell'
import FormField from '../components/FormField'
import SegmentedToggle from '../components/SegmentedToggle'
import PrimaryButton from '../components/PrimaryButton'

export default function CustomerSignup() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', account_type: 'residential' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          portal: 'customer',
          account_type: form.account_type,
          full_name: form.name,
          phone: form.phone,
        },
      },
    })
    setLoading(false)
    if (error) return setError(error.message)
    navigate('/customer/login', { state: { justSignedUp: true } })
  }

  return (
    <AuthShell
      eyebrow="CUSTOMER ACCOUNT"
      title="Create your account"
      subtitle="For monitoring your own site's water and leak devices."
      footer={
        <>
          Already have an account? <Link to="/customer/login" className="text-live-500 hover:underline">Log in</Link>
          <br />
          Signing up on behalf of a company? <Link to="/company/signup" className="text-live-500 hover:underline">Company registration</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <SegmentedToggle
          label="ACCOUNT TYPE"
          value={form.account_type}
          onChange={(v) => setForm({ ...form, account_type: v })}
          options={[
            { value: 'residential', label: 'Residential' },
            { value: 'commercial', label: 'Commercial' },
          ]}
        />
        <FormField label="FULL NAME" type="text" required value={form.name} onChange={set('name')} placeholder="Your name" />
        <FormField label="EMAIL" type="email" required value={form.email} onChange={set('email')} placeholder="you@example.com" />
        <FormField label="PHONE" type="tel" value={form.phone} onChange={set('phone')} placeholder="+971 5..." />
        <FormField label="PASSWORD" type="password" required minLength={8} value={form.password} onChange={set('password')} placeholder="At least 8 characters" />
        {error && <p className="text-alert-500 text-sm mb-4">{error}</p>}
        <PrimaryButton type="submit" loading={loading}>Create account</PrimaryButton>
      </form>
    </AuthShell>
  )
}
