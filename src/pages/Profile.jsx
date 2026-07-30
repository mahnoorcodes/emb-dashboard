    import { useState } from 'react'
    import { Link, useNavigate } from 'react-router-dom'
    import { useAuth } from '../lib/AuthContext'
    import { supabase } from '../lib/supabaseClient'

    export default function Profile() {
    const { user, portal, accountType, role, isPlatformAdmin, signOut } = useAuth()
    const navigate = useNavigate()
    const [sending, setSending] = useState(false)
    const [sent, setSent] = useState(false)
    const [error, setError] = useState(null)

    const fullName = user?.user_metadata?.full_name ?? '—'
    const phone = user?.user_metadata?.phone ?? null
    const companyName = user?.user_metadata?.company_name ?? null

    async function handleResetPassword() {
        setSending(true)
        setError(null)
        const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/emb-dashboard/reset-password`,
        })
        setSending(false)
        if (error) setError(error.message)
        else setSent(true)
    }

    return (
        <div className="min-h-screen bg-ink-950">
        <header className="px-8 py-5 flex items-center justify-between border-b border-ink-700">
            <span className="font-mono text-sm tracking-widest text-mist-400">EMB · PROFILE</span>
            <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-sm text-mist-400 hover:text-brand-500 transition-colors">
                Back to dashboard
            </Link>
            <Link to="/settings" className="text-sm text-mist-400 hover:text-brand-500 transition-colors">
                Settings
            </Link>
            <button onClick={signOut} className="text-sm text-mist-400 hover:text-brand-500 transition-colors">
                Log out
            </button>
            </div>
        </header>

        <main className="p-8 max-w-2xl">
            <div className="bg-ink-800 border border-ink-700 rounded-lg overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-ink-700">
                <p className="font-mono text-xs tracking-widest text-brand-500">ACCOUNT DETAILS</p>
            </div>
            <div className="p-6 space-y-4">
                <Row label="Name" value={fullName} />
                <Row label="Email" value={user?.email} />
                {phone && <Row label="Phone" value={phone} />}
                {companyName && <Row label="Company" value={companyName} />}
                <Row label="Account type" value={
                <span className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500 text-brand-500 text-xs font-mono px-2 py-1 rounded">
                    {portal === 'company' ? 'COMPANY' : 'CUSTOMER'} · {accountType?.toUpperCase() ?? '—'}
                </span>
                } />
                {portal === 'company' && (
                <Row label="Role" value={role === 'admin' ? 'Admin' : 'Member'} />
                )}
                {isPlatformAdmin && (
                <Row label="Platform access" value={
                    <span className="text-brand-500 font-mono text-xs">PLATFORM ADMIN</span>
                } />
                )}
            </div>
            </div>

            <div className="bg-ink-800 border border-ink-700 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-ink-700">
                <p className="font-mono text-xs tracking-widest text-brand-500">PASSWORD</p>
            </div>
            <div className="p-6">
                <p className="text-mist-400 text-sm mb-4">
                We'll email a secure link to <span className="text-mist-200 font-mono">{user?.email}</span> to reset your password.
                </p>
                {sent ? (
                <p className="text-live-500 text-sm">Check your inbox — the link is valid for a limited time.</p>
                ) : (
                <button
                    onClick={handleResetPassword}
                    disabled={sending}
                    className="bg-ink-700 hover:bg-ink-600 disabled:opacity-50 text-mist-200 text-sm font-medium px-4 py-2 rounded-md transition-colors"
                >
                    {sending ? 'Sending…' : 'Send password reset email'}
                </button>
                )}
                {error && <p className="text-alert-500 text-sm mt-3">{error}</p>}
            </div>
            </div>
        </main>
        </div>
    )
    }

    function Row({ label, value }) {
    return (
        <div className="flex items-center justify-between">
        <span className="text-mist-400 text-sm">{label}</span>
        <span className="text-mist-200 font-mono text-sm">{value}</span>
        </div>
    )
    }