    import { useState } from 'react'
    import { useNavigate } from 'react-router-dom'
    import { supabase } from '../lib/supabaseClient'
    import AuthShell from '../components/AuthShell'
    import FormField from '../components/FormField'
    import PrimaryButton from '../components/PrimaryButton'

    export default function ResetPassword() {
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [done, setDone] = useState(false)
    const navigate = useNavigate()

    // Supabase's reset-password email link signs the user into a temporary
    // recovery session automatically when they land here — no token handling
    // needed manually, updateUser() just works against that session.
    async function handleSubmit(e) {
        e.preventDefault()
        if (password !== confirm) {
        setError('Passwords do not match.')
        return
        }
        setLoading(true)
        setError(null)
        const { error } = await supabase.auth.updateUser({ password })
        setLoading(false)
        if (error) return setError(error.message)
        setDone(true)
        setTimeout(() => navigate('/'), 2000)
    }

    return (
        <AuthShell
        eyebrow="ACCOUNT"
        title="Set a new password"
        subtitle={done ? 'Password updated — redirecting you to log in…' : 'Choose a new password for your account.'}
        >
        {!done && (
            <form onSubmit={handleSubmit}>
            <FormField
                label="NEW PASSWORD"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
            />
            <FormField
                label="CONFIRM NEW PASSWORD"
                type="password"
                required
                minLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat the password"
            />
            {error && <p className="text-alert-500 text-sm mb-4">{error}</p>}
            <PrimaryButton type="submit" loading={loading}>Update password</PrimaryButton>
            </form>
        )}
        </AuthShell>
    )
    }