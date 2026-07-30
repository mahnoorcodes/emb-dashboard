    import { useState } from 'react'
    import { Link } from 'react-router-dom'
    import { useAuth } from '../lib/AuthContext'
    import { supabase } from '../lib/supabaseClient'
    import SegmentedToggle from '../components/SegmentedToggle'

    function Toggle({ checked, onChange, label }) {
    return (
        <button
        type="button"
        onClick={() => onChange(!checked)}
        className="flex items-center justify-between w-full text-left py-3"
        >
        <span className="text-mist-200 text-sm">{label}</span>
        <span
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            checked ? 'bg-brand-500' : 'bg-ink-600'
            }`}
        >
            <span
            className={`inline-block h-4 w-4 transform rounded-full bg-ink-950 transition-transform ${
                checked ? 'translate-x-4' : 'translate-x-0.5'
            }`}
            />
        </span>
        </button>
    )
    }

    export default function Settings() {
    const {
        user, portal, role, region, unitSystem, notifyEmail, notifySms, refreshProfile,
    } = useAuth()

    const [name, setName] = useState(user?.user_metadata?.full_name ?? '')
    const [regionInput, setRegionInput] = useState(region ?? '')
    const [units, setUnits] = useState(unitSystem)
    const [emailAlerts, setEmailAlerts] = useState(notifyEmail)
    const [smsAlerts, setSmsAlerts] = useState(notifySms)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState(null)

    async function handleSave(e) {
        e.preventDefault()
        setSaving(true)
        setSaved(false)
        setError(null)

        // Name lives on the auth user record itself, not app_users
        const { error: nameError } = await supabase.auth.updateUser({ data: { full_name: name } })

        // Everything else is a preference on the app_users row — the guard
        // trigger in the database silently ignores any attempt here to touch
        // company_id/role/portal, so this call can never escalate access.
        const { error: prefError } = await supabase
        .from('app_users')
        .update({
            region: regionInput || null,
            unit_system: units,
            notify_email: emailAlerts,
            notify_sms: smsAlerts,
        })
        .eq('id', user.id)

        setSaving(false)
        if (nameError || prefError) {
        setError(nameError?.message ?? prefError?.message)
        return
        }
        refreshProfile()
        setSaved(true)
    }

    return (
        <div className="min-h-screen bg-ink-950">
        <header className="px-8 py-5 flex items-center justify-between border-b border-ink-700">
            <span className="font-mono text-sm tracking-widest text-mist-400">EMB · SETTINGS</span>
            <Link to="/profile" className="text-sm text-mist-400 hover:text-brand-500 transition-colors">
            Back to profile
            </Link>
        </header>

        <main className="p-8 max-w-2xl">
            <form onSubmit={handleSave} className="space-y-6">
            <section className="bg-ink-800 border border-ink-700 rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-ink-700">
                <p className="font-mono text-xs tracking-widest text-brand-500">USER INFORMATION</p>
                </div>
                <div className="p-6 space-y-4">
                <label className="block">
                    <span className="block text-xs font-mono text-mist-400 mb-1.5">NAME</span>
                    <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-ink-900 border border-ink-600 rounded-md px-3 py-2 text-mist-200 focus:outline-none focus:ring-2 focus:ring-live-600"
                    />
                </label>
                <label className="block">
                    <span className="block text-xs font-mono text-mist-400 mb-1.5">REGION</span>
                    <input
                    value={regionInput}
                    onChange={(e) => setRegionInput(e.target.value)}
                    placeholder="e.g. Sharjah, UAE"
                    className="w-full bg-ink-900 border border-ink-600 rounded-md px-3 py-2 text-mist-200 focus:outline-none focus:ring-2 focus:ring-live-600"
                    />
                </label>
                {portal === 'company' && (
                    <p className="text-xs text-mist-400">
                    Company and role are managed by your organization and can't be changed here.
                    </p>
                )}
                </div>
            </section>

            <section className="bg-ink-800 border border-ink-700 rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-ink-700">
                <p className="font-mono text-xs tracking-widest text-brand-500">WATER METRIC UNITS</p>
                </div>
                <div className="p-6">
                <SegmentedToggle
                    label="APPLIES TO VOLUME, FLOW, PRESSURE, TEMPERATURE & DEPTH"
                    value={units}
                    onChange={setUnits}
                    options={[
                    { value: 'metric', label: 'Metric (L, °C, bar)' },
                    { value: 'imperial', label: 'Imperial (gal, °F, psi)' },
                    ]}
                />
                </div>
            </section>

            <section className="bg-ink-800 border border-ink-700 rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-ink-700">
                <p className="font-mono text-xs tracking-widest text-brand-500">ALERT NOTIFICATIONS</p>
                </div>
                <div className="px-6 divide-y divide-ink-700">
                <Toggle checked={emailAlerts} onChange={setEmailAlerts} label="Email me on device alerts" />
                <Toggle checked={smsAlerts} onChange={setSmsAlerts} label="Text me on device alerts" />
                </div>
            </section>

            {error && <p className="text-alert-500 text-sm">{error}</p>}
            {saved && <p className="text-live-500 text-sm">Settings saved.</p>}

            <button
                type="submit"
                disabled={saving}
                className="bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-ink-950 font-semibold px-5 py-2 rounded-md transition-colors"
            >
                {saving ? 'Saving…' : 'Save settings'}
            </button>
            </form>
        </main>
        </div>
    )
    }