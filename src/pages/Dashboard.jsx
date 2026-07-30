import { useAuth } from '../lib/AuthContext'

export default function Dashboard() {
  const { user, portal, accountType, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-ink-950">
      <header className="px-8 py-5 flex items-center justify-between border-b border-ink-700">
        <span className="font-mono text-sm tracking-widest text-mist-400">EMB · DASHBOARD</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-mist-400 font-mono">
            {portal === 'company' ? 'COMPANY' : 'CUSTOMER'} · {accountType?.toUpperCase()}
          </span>
          <button onClick={signOut} className="text-sm text-mist-400 hover:text-brand-500 transition-colors">
            Log out
          </button>
        </div>
      </header>

      <main className="p-8">
        <p className="text-mist-400 mb-1">Signed in as</p>
        <p className="text-mist-200 font-mono mb-8">{user?.email}</p>

        <div className="bg-ink-800 border border-ink-700 rounded-lg p-6 max-w-xl">
          <p className="font-mono text-xs tracking-widest text-brand-500 mb-2">NEXT UP</p>
          <p className="text-mist-200">
            This is the auth-gated shell. Device grid, live telemetry cards, map view and the tickets
            tab wire in here next — each calling the Lambda read API against your Supabase tables.
          </p>
        </div>
      </main>
    </div>
  )
}
