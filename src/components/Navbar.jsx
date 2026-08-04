import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

export default function Navbar({ title, badge }) {
const { session, isPlatformAdmin, signOut } = useAuth()
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
        <Link to={session ? '/dashboard' : '/'} className="flex items-center gap-3 rounded-md transition-colors hover:text-brand-500">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-ink-600 bg-ink-700/70 p-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-mist-400">
            <img src="https://wlxxakyyguiddtfbwdou.supabase.co/storage/v1/object/public/website-images/one93nine-logo.webp" alt="One93Nine" className="h-full w-full object-contain" />
        </div>
        <span className="font-mono text-sm tracking-widest text-mist-400">EMB · {title}</span>
        </Link>
        {badge && (
        <span className="text-xs font-mono bg-brand-500/10 text-brand-500 border border-brand-500 rounded px-2 py-0.5">
            {badge}
        </span>
        )}
    </div>

    {/* Nav links and Log out only render for logged-in users — nothing
        to show on landing/signup/login pages, where there's no session. */}
    {session && (
        <>
        <div className="hidden sm:flex items-center gap-4">
            {visibleLinks.map((link) => (
            <Link
                key={link.to}
                to={link.to}
                className={`text-sm transition-colors ${
                link.highlight ? 'text-brand-500 hover:underline' : 'text-mist-400 hover:text-brand-500'
                }`}
                aria-label={link.label}
                title={link.label}
            >
                {link.to === '/dashboard' ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8v-10h-8v10zm0-18v6h8V3h-8z" />
                </svg>
                ) : link.to === '/profile' ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
                ) : link.to === '/settings' ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                    <path d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.63l-1.92-3.32a.5.5 0 0 0-.61-.22l-2.39.96a7.03 7.03 0 0 0-1.62-.94l-.36-2.54A.5.5 0 0 0 14.5 2h-5a.5.5 0 0 0-.5.42l-.36 2.54c-.59.22-1.14.52-1.62.94l-2.39-.96a.5.5 0 0 0-.61.22L2.7 8.48a.5.5 0 0 0 .12.63l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94L2.82 14.9a.5.5 0 0 0-.12.63l1.92 3.32c.16.27.49.37.77.22l2.39-.96c.48.42 1.03.72 1.62.94l.36 2.54c.05.28.28.48.56.48h5c.28 0 .51-.2.56-.48l.36-2.54c.59-.22 1.14-.52 1.62-.94l2.39.96c.28.11.61.05.77-.22l1.92-3.32a.5.5 0 0 0-.12-.63l-2.03-1.58zM12 15.5a3.5 3.5 0 1 1 .001-7.001A3.5 3.5 0 0 1 12 15.5z" />
                </svg>
                ) : (
                link.label
                )}
            </Link>
            ))}
            <button onClick={signOut} className="text-sm text-mist-400 hover:text-brand-500 transition-colors">
            Log out
            </button>
        </div>

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
        </>
    )}
    </div>

    {session && menuOpen && (
    <div className="sm:hidden absolute top-full left-0 right-0 bg-ink-800 border-b border-ink-700 z-50 flex flex-col">
        {visibleLinks.map((link) => (
        <Link
            key={link.to}
            to={link.to}
            onClick={() => setMenuOpen(false)}
            className={`px-4 py-3 text-sm border-t border-ink-700 transition-colors ${
            link.highlight ? 'text-brand-500' : 'text-mist-400 hover:text-brand-500'
            }`}
            aria-label={link.label}
            title={link.label}
        >
            {link.to === '/dashboard' ? (
            <span className="inline-flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8v-10h-8v10zm0-18v6h8V3h-8z" />
                </svg>
                Dashboard
            </span>
            ) : link.to === '/profile' ? (
            <span className="inline-flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
                Profile
            </span>
            ) : link.to === '/settings' ? (
            <span className="inline-flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.63l-1.92-3.32a.5.5 0 0 0-.61-.22l-2.39.96a7.03 7.03 0 0 0-1.62-.94l-.36-2.54A.5.5 0 0 0 14.5 2h-5a.5.5 0 0 0-.5.42l-.36 2.54c-.59.22-1.14.52-1.62.94l-2.39-.96a.5.5 0 0 0-.61.22L2.7 8.48a.5.5 0 0 0 .12.63l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94L2.82 14.9a.5.5 0 0 0-.12.63l1.92 3.32c.16.27.49.37.77.22l2.39-.96c.48.42 1.03.72 1.62.94l.36 2.54c.05.28.28.48.56.48h5c.28 0 .51-.2.56-.48l.36-2.54c.59-.22 1.14-.52 1.62-.94l2.39.96c.28.11.61.05.77-.22l1.92-3.32a.5.5 0 0 0-.12-.63l-2.03-1.58zM12 15.5a3.5 3.5 0 1 1 .001-7.001A3.5 3.5 0 0 1 12 15.5z" />
                </svg>
                Settings
            </span>
            ) : (
            link.label
            )}
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