import { Link } from 'react-router-dom'

export default function AuthShell({ eyebrow, title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen bg-ink-950 flex flex-col">
      <header className="px-8 py-6">
        <Link to="/" className="font-mono text-sm tracking-widest text-mist-400 hover:text-live-500 transition-colors">
          EMB · EMERGENCY MESSAGING BACKBONE
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <p className="font-mono text-xs tracking-[0.2em] text-brand-500 mb-2">{eyebrow}</p>
            <h1 className="text-2xl font-semibold text-mist-200">{title}</h1>
            {subtitle && <p className="text-sm text-mist-400 mt-1">{subtitle}</p>}
          </div>
          <div className="bg-ink-800 border border-ink-700 rounded-lg p-6">
            {children}
          </div>
          {footer && <div className="mt-5 text-center text-sm text-mist-400">{footer}</div>}
        </div>
      </main>
    </div>
  )
}
