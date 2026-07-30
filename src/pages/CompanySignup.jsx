import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import AuthShell from '../components/AuthShell'
import FormField from '../components/FormField'
import SegmentedToggle from '../components/SegmentedToggle'
import PrimaryButton from '../components/PrimaryButton'

export default function CompanySignup() {
  const [form, setForm] = useState({
    company_name: '', name: '', email: '', password: '', account_type: 'commercial',
  })
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
          portal: 'company',
          account_type: form.account_type,
          full_name: form.name,
          company_name: form.company_name,
          role: 'admin',
        },
      },
    })
    setLoading(false)
    if (error) return setError(error.message)
    navigate('/company/login', { state: { justSignedUp: true } })
  }

  return (
    <AuthShell
      eyebrow="COMPANY ACCOUNT"
      title="Register your company"
      subtitle="For managing multiple sites, devices and team members."
      footer={
        <>
          Already registered? <Link to="/company/login" className="text-live-500 hover:underline">Log in</Link>
          <br />
          Monitoring your own single site? <Link to="/customer/signup" className="text-live-500 hover:underline">Customer registration</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <SegmentedToggle
          label="PORTFOLIO TYPE"
          value={form.account_type}
          onChange={(v) => setForm({ ...form, account_type: v })}
          options={[
            { value: 'residential', label: 'Residential' },
            { value: 'commercial', label: 'Commercial' },
          ]}
        />
        <FormField label="COMPANY NAME" type="text" required value={form.company_name} onChange={set('company_name')} placeholder="e.g. LeakDtech Technical Services LLC" />
        <FormField label="YOUR NAME" type="text" required value={form.name} onChange={set('name')} placeholder="Admin contact name" />
        <FormField label="WORK EMAIL" type="email" required value={form.email} onChange={set('email')} placeholder="you@company.com" />
        <FormField label="PASSWORD" type="password" required minLength={8} value={form.password} onChange={set('password')} placeholder="At least 8 characters" />
        {error && <p className="text-alert-500 text-sm mb-4">{error}</p>}
        <PrimaryButton type="submit" loading={loading}>Register company</PrimaryButton>
      </form>
    </AuthShell>
  )
}
