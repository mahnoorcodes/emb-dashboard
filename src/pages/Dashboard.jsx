import { useEffect, useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabaseClient'
import Navbar from '../components/Navbar'
import DeviceDetailPanel from '../components/DeviceDetailPanel'

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
  const { user, portal } = useAuth()
  const [devices, setDevices] = useState([])
  const [photoUrls, setPhotoUrls] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [selectedDevice, setSelectedDevice] = useState(null)

  useEffect(() => {
    let active = true

    async function load() {
      const { data, error } = await supabase.from('device_status').select('*').order('name')
      if (!active) return
      if (error) { setError(error.message); setLoading(false); return }
      setDevices(data ?? [])
      setError(null)

      const withPhotos = (data ?? []).filter((d) => d.photo_paths?.length)
      const urlEntries = await Promise.all(
        withPhotos.map(async (d) => {
          const results = await Promise.all(
            d.photo_paths.map((path) => supabase.storage.from('device-photos').createSignedUrl(path, 3600))
          )
          results.forEach((r, i) => {
            if (r.error) console.error(`Signed URL failed for ${d.id} photo ${i}:`, r.error.message)
          })
          return [d.id, results.map((r) => r.data?.signedUrl).filter(Boolean)]
        })
      )
      if (active) setPhotoUrls(Object.fromEntries(urlEntries))
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
      <Navbar title="DASHBOARD" />

      <main className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="mb-1">
              <span className="text-mist-400">Welcome back, </span>
              <span className="text-mist-200 font-mono">{user?.user_metadata?.full_name || user?.user_metadata?.company_name || user?.email}</span>
            </p>
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
            <div className="overflow-x-auto table-scroll">
              <table className="table-fixed min-w-[1650px] text-sm">
                <thead>
                  <tr className="text-left text-mist-400 font-mono text-xs border-b border-ink-700">
                    <th className="px-4 py-3 w-40">Photo</th>
                    <th className="px-4 py-3 w-44">Device</th>
                    <th className="px-4 py-3 w-32">Site</th>
                    <th className="px-4 py-3 w-32">Company</th>
                    <th className="px-4 py-3 w-24">Map</th>
                    <th className="px-4 py-3 w-40">Coordinates</th>
                    <th className="px-4 py-3 w-28">Water Vol</th>
                    <th className="px-4 py-3 w-24">Temp</th>
                    <th className="px-4 py-3 w-24">Battery</th>
                    <th className="px-4 py-3 w-28">Signal (RSRP)</th>
                    <th className="px-4 py-3 w-28">Input State</th>
                    <th className="px-4 py-3 w-32">Status</th>
                    <th className="px-4 py-3 w-28">Last Reading</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDevices.map((d) => {
                    const status = statusFor(d)
                    return (
                      <tr
                        key={d.id}
                        onClick={() => setSelectedDevice(d)}
                        className="border-b border-ink-700 last:border-0 hover:bg-ink-700/40 transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-3">
                          {photoUrls[d.id]?.length > 0 ? (
                            <div className="flex gap-1">
                              {photoUrls[d.id].map((url, i) => (
                                <img key={i} src={url} alt={`${d.name} ${i + 1}`} className="w-10 h-10 rounded object-cover" />
                              ))}
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded bg-ink-700 flex items-center justify-center text-mist-400 text-xs">—</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-mist-200 font-medium">{d.name}</p>
                          <p className="text-xs text-mist-400 font-mono">{d.device_type}</p>
                        </td>
                        <td className="px-4 py-3 text-mist-200">{d.site_name ?? '—'}</td>
                        <td className="px-4 py-3">
                          <p className="text-mist-200">{d.company_name || d.owner_full_name || '—'}</p>
                          <p className="text-xs font-mono text-mist-400">{d.owner_portal === 'company' ? 'COMPANY' : 'CUSTOMER'}</p>
                        </td>
                        <td className="px-4 py-3">
                          {d.maps_url ? (
                            <a href={d.maps_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-brand-500 hover:underline text-xs">
                              Open ↗
                            </a>
                          ) : (
                            <span className="text-mist-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-mist-400 font-mono text-xs">
                          {d.lat != null && d.lng != null ? `${d.lat.toFixed(4)}, ${d.lng.toFixed(4)}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-mist-200 font-mono">
                          {d.water_volume != null ? `${d.water_volume} L` : '—'}
                        </td>
                        <td className="px-4 py-3 text-mist-200 font-mono">
                          {d.temperature != null ? `${d.temperature}°C` : '—'}
                        </td>
                        <td className="px-4 py-3 text-mist-200 font-mono">{d.battery != null ? `${d.battery}%` : '—'}</td>
                        <td className="px-4 py-3 text-mist-200 font-mono">{d.signal_rsrp != null ? `${d.signal_rsrp} dBm` : '—'}</td>
                        <td className="px-4 py-3 text-mist-200 font-mono text-xs">{d.last_input_state ?? '—'}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${status.dot}`} />
                            <span className={`font-mono text-xs ${status.text}`}>{status.label}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3 text-mist-400 font-mono text-xs">{formatAgo(d.last_reading_at)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <DeviceDetailPanel
        device={selectedDevice}
        photos={selectedDevice ? photoUrls[selectedDevice.id] ?? [] : []}
        onClose={() => setSelectedDevice(null)}
      />
    </div>
  )
}