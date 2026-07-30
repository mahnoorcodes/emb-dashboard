    import { Link, useLocation } from 'react-router-dom'
    import { useAuth } from '../lib/AuthContext'

    export default function Navbar({ title, badge }) {
    const { isPlatformAdmin, signOut } = useAuth()
    const location = useLocation()

    const links = [
        { to: '/dashboard', label: 'Dashboard' },
        ...(isPlatformAdmin ? [{ to: '/dashboard/admin', label: 'Admin view', highlight: true }] : []),
        { to: '/profile', label: 'Profile' },
        { to: '/settings', label: 'Settings' },
    ]

    return (
        <header className="px-8 py-5 flex items-center justify-between border-b border-ink-700">
        <div className="flex items-center gap-3">
            <span className="font-mono text-sm tracking-widest text-mist-400">EMB · {title}</span>
            {badge && (
            <span className="text-xs font-mono bg-brand-500/10 text-brand-500 border border-brand-500 rounded px-2 py-0.5">
                {badge}
            </span>
            )}
        </div>
        <div className="flex items-center gap-4">
            {links.map(
            (link) =>
                location.pathname !== link.to && (
                <Link
                    key={link.to}
                    to={link.to}
                    className={`text-sm transition-colors ${
                    link.highlight ? 'text-brand-500 hover:underline' : 'text-mist-400 hover:text-brand-500'
                    }`}
                >
                    {link.label}
                </Link>
                )
            )}
            <button onClick={signOut} className="text-sm text-mist-400 hover:text-brand-500 transition-colors">
            Log out
            </button>
        </div>
        </header>
    )
    }