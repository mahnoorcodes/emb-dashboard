import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabaseClient'

const STALE_MINUTES = 30
const REFRESH_MS = 30000

function statusFor(device) {
  if (device.latest_alert_severity) {
    return { label: 'ALERT', dot: 'bg-alert-500 signal-dot-alert', text: 'text-alert-500' }
  }
  if (!device.last_reading_at) {
    return { label: 'NO DATA', dot: 'bg-mist-400', text: 'text-mist-400' }
  }
  const minutesAgo = (Date.now() - new Date(device.last_reading_at).getTime()) / 60000
  if (minutesAgo > STALE_MINUTES) {
    return { label: 'OFFLINE', dot: 'bg-mist-400', text: 'text-mist-400' }
  }
  return { label: 'OK', dot: 'bg-live-500 signal-dot', text: 'text-live-500' }
}

function formatAgo(ts) {
  if (!ts) return '—'
  const mins = Math.round((Date.now() - new Date(ts).getTime()) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.round(hrs / 24)}d ago`
}

export default function Dashboard() {
  const { user, portal, accountType, isPlatformAdmin, signOut } = useAuth()
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      const { data, error } = await supabase.from('device_status').select('*').order('name')
      if (!active) return
      if (error) setError(error.message)
      else { setDevices(data ?? []); setError(null) }
      setLoading(false)
    }

    load()
    const interval = setInterval(load, REFRESH_MS)
    return () => { active = false; clearInterval(interval) }
  }, [])

  const alertCount = devices.filter((d) => d.latest_alert_severity).length

  // Client-side filter only — `devices` already came from an RLS-scoped
  // query (device_status view), so this can never surface another
  // company's devices no matter what's typed here.
  const q = search.trim().toLowerCase()
  const filteredDevices = q
    ? devices.filter((d) =>
        [d.name, d.device_type, d.site_name, d.model]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(q))
      )
    : devices

  return (
    <div className="min-h-screen bg-ink-950">
      <header className="px-8 py-5 flex items-center justify-between border-b border-ink-700">
        <span className="font-mono text-sm tracking-widest text-mist-400">EMB · DASHBOARD</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-mist-400 font-mono">
            {portal === 'company' ? 'COMPANY' : 'CUSTOMER'} · {accountType?.toUpperCase()}
          </span>
          {isPlatformAdmin && (
            <Link to="/dashboard/admin" className="text-sm text-brand-500 hover:underline">
              Admin view
            </Link>
          )}
          <Link to="/profile" className="text-sm text-mist-400 hover:text-brand-500 transition-colors">
            Profile
          </Link>
          <Link to="/settings" className="text-sm text-mist-400 hover:text-brand-500 transition-colors">
            Settings
          </Link>
          <button onClick={signOut} className="text-sm text-mist-400 hover:text-brand-500 transition-colors">
            Log out
          </button>
        </div>
      </header>

      <main className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-mist-400 mb-1">Signed in as</p>
            <p className="text-mist-200 font-mono">{user?.email}</p>
          </div>
          {alertCount > 0 && (
            <span className="inline-flex items-center gap-2 bg-alert-500/10 border border-alert-500 text-alert-500 text-sm font-mono px-3 py-1.5 rounded-md">
              <span className="w-2 h-2 rounded-full bg-alert-500 signal-dot-alert" />
              {alertCount} active alert{alertCount > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="bg-ink-800 border border-ink-700 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-ink-700 flex items-center justify-between gap-4">
            <p className="font-mono text-xs tracking-widest text-brand-500 whitespace-nowrap">DEVICES</p>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by device name, type, or site…"
              className="flex-1 max-w-sm bg-ink-900 border border-ink-600 rounded-md px-3 py-1.5 text-sm text-mist-200
                         placeholder:text-ink-600 focus:outline-none focus:ring-2 focus:ring-live-600 focus:border-live-600
                         transition-colors"
            />
            <p className="text-xs text-mist-400 font-mono whitespace-nowrap">
              {filteredDevices.length} of {devices.length} · refreshes every 30s
            </p>
          </div>

          {loading && <p className="px-6 py-10 text-center text-mist-400">Loading devices…</p>}

          {!loading && error && (
            <p className="px-6 py-10 text-center text-alert-500">Couldn't load devices: {error}</p>
          )}

          {!loading && !error && devices.length === 0 && (
            <div className="px-6 py-10 text-center">
              <p className="text-mist-200 mb-1">No devices yet</p>
              <p className="text-sm text-mist-400">Devices will appear here once they're registered and reporting.</p>
            </div>
          )}

          {!loading && !error && devices.length > 0 && filteredDevices.length === 0 && (
            <p className="px-6 py-10 text-center text-mist-400">No devices match "{search}".</p>
          )}

          {!loading && !error && filteredDevices.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-mist-400 font-mono text-xs border-b border-ink-700">
                    <th className="px-6 py-3">Device</th>
                    <th className="px-6 py-3">Site</th>
                    <th className="px-6 py-3">Water Volume</th>
                    <th className="px-6 py-3">Temp</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Last Reading</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDevices.map((d) => {
                    const status = statusFor(d)
                    return (
                      <tr key={d.id} className="border-b border-ink-700 last:border-0 hover:bg-ink-700/40 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-mist-200 font-medium">{d.name}</p>
                          <p className="text-xs text-mist-400 font-mono">{d.device_type}</p>
                        </td>
                        <td className="px-6 py-4 text-mist-200">{d.site_name ?? '—'}</td>
                        <td className="px-6 py-4 text-mist-200 font-mono">
                          {d.water_volume != null ? `${d.water_volume} L` : '—'}
                        </td>
                        <td className="px-6 py-4 text-mist-200 font-mono">
                          {d.temperature != null ? `${d.temperature}°C` : '—'}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${status.dot}`} />
                            <span className={`font-mono text-xs ${status.text}`}>{status.label}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-mist-400 font-mono text-xs">{formatAgo(d.last_reading_at)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}