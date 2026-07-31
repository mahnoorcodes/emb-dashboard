import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

export default function Navbar({ title, badge }) {
const { isPlatformAdmin, signOut } = useAuth()
const location = useLocation()
const [menuOpen, setMenuOpen] = useState(false)

const links = [
{ to: '/dashboard', label: 'Dashboard' },
...(isPlatformAdmin ? [{ to: '/dashboard/admin', label: 'Admin view', highlight: true }] : []),
{ to: '/profile', label: 'Profile' },
{ to: '/settings', label: 'Settings' },
]
const visibleLinks = links.filter((link) => location.pathname !== link.to)

return (
<header className="relative border-b border-ink-700">
    <div className="px-4 sm:px-8 py-5 flex items-center justify-between">
    <div className="flex items-center gap-3">
        <span className="font-mono text-sm tracking-widest text-mist-400">EMB · {title}</span>
        {badge && (
        <span className="text-xs font-mono bg-brand-500/10 text-brand-500 border border-brand-500 rounded px-2 py-0.5">
            {badge}
        </span>
        )}
    </div>

    {/* Desktop nav */}
    <div className="hidden sm:flex items-center gap-4">
        {visibleLinks.map((link) => (
        <Link
            key={link.to}
            to={link.to}
            className={`text-sm transition-colors ${
            link.highlight ? 'text-brand-500 hover:underline' : 'text-mist-400 hover:text-brand-500'
            }`}
        >
            {link.label}
        </Link>
        ))}
        <button onClick={signOut} className="text-sm text-mist-400 hover:text-brand-500 transition-colors">
        Log out
        </button>
    </div>

    {/* Mobile burger toggle */}
    <button
        onClick={() => setMenuOpen((v) => !v)}
        className="sm:hidden text-mist-400 hover:text-brand-500 transition-colors p-1"
        aria-label="Menu"
    >
        {menuOpen ? (
        <span className="text-xl leading-none">✕</span>
        ) : (
        <span className="text-xl leading-none">☰</span>
        )}
    </button>
    </div>

    {/* Mobile expanding menu */}
    {menuOpen && (
    <div className="sm:hidden absolute top-full left-0 right-0 bg-ink-800 border-b border-ink-700 z-50 flex flex-col">
        {visibleLinks.map((link) => (
        <Link
            key={link.to}
            to={link.to}
            onClick={() => setMenuOpen(false)}
            className={`px-4 py-3 text-sm border-t border-ink-700 transition-colors ${
            link.highlight ? 'text-brand-500' : 'text-mist-400 hover:text-brand-500'
            }`}
        >
            {link.label}
        </Link>
        ))}
        <button
        onClick={() => { setMenuOpen(false); signOut() }}
        className="px-4 py-3 text-sm text-left text-mist-400 hover:text-brand-500 border-t border-ink-700 transition-colors"
        >
        Log out
        </button>
    </div>
    )}
</header>
)
}