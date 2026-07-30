    import { useEffect, useState } from 'react'
    import { Link, Navigate } from 'react-router-dom'
    import { useAuth } from '../lib/AuthContext'
    import { supabase } from '../lib/supabaseClient'

    const STALE_MINUTES = 30
    const REFRESH_MS = 30000
    const DEVICE_TYPES = ['teltonika_rut906', 'ttk', 'aquasentra', 'lorawan', 'm20']

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

    export default function DashboardAdmin() {
    const { user, isPlatformAdmin, loading: authLoading, signOut } = useAuth()
    const [devices, setDevices] = useState([])
    const [sites, setSites] = useState([])
    const [tickets, setTickets] = useState([])
    const [photoUrls, setPhotoUrls] = useState({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [search, setSearch] = useState('')

    // Gate: the ONLY thing that grants this page is a database-backed flag
    // (app_users.is_platform_admin) that no signup flow or client code can
    // ever set — see AuthContext. This is what actually shows every
    // customer's fleet, since RLS grants full read/write when this is true.
    const [showAddForm, setShowAddForm] = useState(false)
    const [newDevice, setNewDevice] = useState({ id: '', name: '', device_type: DEVICE_TYPES[0], model: '', site_id: '' })
    const [addError, setAddError] = useState(null)
    const [adding, setAdding] = useState(false)

    useEffect(() => {
        if (!isPlatformAdmin) return
        let active = true

        async function load() {
        const [devicesRes, sitesRes, ticketsRes] = await Promise.all([
            supabase.from('device_status').select('*').order('name'),
            supabase.from('sites').select('id, name, company_id, companies(name)').order('name'),
            supabase.from('tickets').select('*').order('updated_at', { ascending: false }).limit(20),
        ])
        if (!active) return

        if (devicesRes.error) setError(devicesRes.error.message)
        else {
            setDevices(devicesRes.data ?? [])
            setError(null)

            const withPhotos = (devicesRes.data ?? []).filter((d) => d.photo_path)
            const urlEntries = await Promise.all(
            withPhotos.map(async (d) => {
                const { data } = await supabase.storage.from('device-photos').createSignedUrl(d.photo_path, 3600)
                return [d.id, data?.signedUrl ?? null]
            })
            )
            if (active) setPhotoUrls(Object.fromEntries(urlEntries))
        }

        if (!sitesRes.error) setSites(sitesRes.data ?? [])
        if (!ticketsRes.error) setTickets(ticketsRes.data ?? [])
        setLoading(false)
        }

        load()
        const interval = setInterval(load, REFRESH_MS)
        return () => { active = false; clearInterval(interval) }
    }, [isPlatformAdmin])

    async function handleAddDevice(e) {
        e.preventDefault()
        setAdding(true)
        setAddError(null)
        const { error } = await supabase.from('devices').insert({
        id: newDevice.id.trim(),
        name: newDevice.name.trim(),
        device_type: newDevice.device_type,
        model: newDevice.model.trim() || null,
        site_id: newDevice.site_id || null,
        })
        setAdding(false)
        if (error) return setAddError(error.message)
        setNewDevice({ id: '', name: '', device_type: DEVICE_TYPES[0], model: '', site_id: '' })
        setShowAddForm(false)
        // Refresh immediately rather than waiting for the next poll
        const { data } = await supabase.from('device_status').select('*').order('name')
        setDevices(data ?? [])
    }

    if (authLoading) return null
    if (!isPlatformAdmin) {
        return <Navigate to="/dashboard" replace />
    }

    // Client-side filter only — devices already came from an RLS-scoped query,
    // so this can never surface another company's devices regardless of input.
    const q = search.trim().toLowerCase()
    const filteredDevices = q
        ? devices.filter((d) =>
            [d.name, d.device_type, d.site_name, d.model, d.id]
            .filter(Boolean)
            .some((field) => String(field).toLowerCase().includes(q))
        )
        : devices

    return (
        <div className="min-h-screen bg-ink-950">
        <header className="px-8 py-5 flex items-center justify-between border-b border-ink-700">
            <div className="flex items-center gap-3">
            <span className="font-mono text-sm tracking-widest text-mist-400">EMB · ADMIN</span>
            <span className="text-xs font-mono bg-brand-500/10 text-brand-500 border border-brand-500 rounded px-2 py-0.5">
                ADMIN VIEW
            </span>
            </div>
            <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-sm text-mist-400 hover:text-brand-500 transition-colors">
                Standard view
            </Link>
            <button onClick={signOut} className="text-sm text-mist-400 hover:text-brand-500 transition-colors">
                Log out
            </button>
            </div>
        </header>

        <main className="p-8 space-y-8">
            <div>
            <p className="text-mist-400 mb-1">Signed in as</p>
            <p className="text-mist-200 font-mono">{user?.email}</p>
            </div>

            <div className="bg-ink-800 border border-ink-700 rounded-lg p-4 text-xs text-mist-400 font-mono">
            Platform admin — this view spans every customer company. Access is granted only via
            a database flag set directly in Supabase, never through any signup or app screen.
            </div>

            <section className="bg-ink-800 border border-ink-700 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-ink-700 flex items-center justify-between">
                <p className="font-mono text-xs tracking-widest text-brand-500">ADD DEVICE</p>
                <button
                onClick={() => setShowAddForm((v) => !v)}
                className="text-sm text-brand-500 hover:underline"
                >
                {showAddForm ? 'Cancel' : '+ New device'}
                </button>
            </div>
            {showAddForm && (
                <form onSubmit={handleAddDevice} className="p-6 grid sm:grid-cols-2 gap-4">
                <label className="block">
                    <span className="block text-xs font-mono text-mist-400 mb-1.5">DEVICE ID (unique, e.g. rut906-site03)</span>
                    <input
                    required
                    value={newDevice.id}
                    onChange={(e) => setNewDevice({ ...newDevice, id: e.target.value })}
                    className="w-full bg-ink-900 border border-ink-600 rounded-md px-3 py-2 text-mist-200 focus:outline-none focus:ring-2 focus:ring-live-600"
                    />
                </label>
                <label className="block">
                    <span className="block text-xs font-mono text-mist-400 mb-1.5">NAME</span>
                    <input
                    required
                    value={newDevice.name}
                    onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                    className="w-full bg-ink-900 border border-ink-600 rounded-md px-3 py-2 text-mist-200 focus:outline-none focus:ring-2 focus:ring-live-600"
                    />
                </label>
                <label className="block">
                    <span className="block text-xs font-mono text-mist-400 mb-1.5">DEVICE TYPE</span>
                    <select
                    value={newDevice.device_type}
                    onChange={(e) => setNewDevice({ ...newDevice, device_type: e.target.value })}
                    className="w-full bg-ink-900 border border-ink-600 rounded-md px-3 py-2 text-mist-200 focus:outline-none focus:ring-2 focus:ring-live-600"
                    >
                    {DEVICE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                </label>
                <label className="block">
                    <span className="block text-xs font-mono text-mist-400 mb-1.5">MODEL (optional)</span>
                    <input
                    value={newDevice.model}
                    onChange={(e) => setNewDevice({ ...newDevice, model: e.target.value })}
                    className="w-full bg-ink-900 border border-ink-600 rounded-md px-3 py-2 text-mist-200 focus:outline-none focus:ring-2 focus:ring-live-600"
                    />
                </label>
                <label className="block sm:col-span-2">
                    <span className="block text-xs font-mono text-mist-400 mb-1.5">SITE (which customer this belongs to)</span>
                    <select
                    value={newDevice.site_id}
                    onChange={(e) => setNewDevice({ ...newDevice, site_id: e.target.value })}
                    className="w-full bg-ink-900 border border-ink-600 rounded-md px-3 py-2 text-mist-200 focus:outline-none focus:ring-2 focus:ring-live-600"
                    >
                    <option value="">— Unassigned —</option>
                    {sites.map((s) => (
                        <option key={s.id} value={s.id}>{s.name} ({s.companies?.name ?? 'unknown company'})</option>
                    ))}
                    </select>
                </label>
                {addError && <p className="text-alert-500 text-sm sm:col-span-2">{addError}</p>}
                <div className="sm:col-span-2">
                    <button
                    type="submit"
                    disabled={adding}
                    className="bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-ink-950 font-semibold px-5 py-2 rounded-md transition-colors"
                    >
                    {adding ? 'Adding…' : 'Add device'}
                    </button>
                </div>
                </form>
            )}
            </section>

            <section className="bg-ink-800 border border-ink-700 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-ink-700 flex items-center justify-between gap-4">
                <p className="font-mono text-xs tracking-widest text-brand-500 whitespace-nowrap">DEVICE FLEET — FULL DIAGNOSTICS</p>
                <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by device, ID, type, or site…"
                className="flex-1 max-w-sm bg-ink-900 border border-ink-600 rounded-md px-3 py-1.5 text-sm text-mist-200
                            placeholder:text-ink-600 focus:outline-none focus:ring-2 focus:ring-live-600 focus:border-live-600
                            transition-colors"
                />
                <p className="text-xs text-mist-400 font-mono whitespace-nowrap">
                {filteredDevices.length} of {devices.length} · refreshes every 30s
                </p>
            </div>

            {loading && <p className="px-6 py-10 text-center text-mist-400">Loading fleet…</p>}
            {!loading && error && <p className="px-6 py-10 text-center text-alert-500">{error}</p>}
            {!loading && !error && devices.length === 0 && (
                <p className="px-6 py-10 text-center text-mist-400">No devices registered yet.</p>
            )}
            {!loading && !error && devices.length > 0 && filteredDevices.length === 0 && (
                <p className="px-6 py-10 text-center text-mist-400">No devices match "{search}".</p>
            )}

            {!loading && !error && filteredDevices.length > 0 && (
                <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="text-left text-mist-400 font-mono text-xs border-b border-ink-700">
                        <th className="px-4 py-3">Photo</th>
                        <th className="px-4 py-3">Device ID</th>
                        <th className="px-4 py-3">Name / Type</th>
                        <th className="px-4 py-3">Site</th>
                        <th className="px-4 py-3">Coordinates</th>
                        <th className="px-4 py-3">Water Vol</th>
                        <th className="px-4 py-3">Temp</th>
                        <th className="px-4 py-3">Battery</th>
                        <th className="px-4 py-3">Signal (RSRP)</th>
                        <th className="px-4 py-3">Input State</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Last Reading</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredDevices.map((d) => {
                        const status = statusFor(d)
                        return (
                        <tr key={d.id} className="border-b border-ink-700 last:border-0 hover:bg-ink-700/40 transition-colors">
                            <td className="px-4 py-3">
                            {photoUrls[d.id] ? (
                                <img src={photoUrls[d.id]} alt={d.name} className="w-10 h-10 rounded object-cover" />
                            ) : (
                                <div className="w-10 h-10 rounded bg-ink-700 flex items-center justify-center text-mist-400 text-xs">—</div>
                            )}
                            </td>
                            <td className="px-4 py-3 text-mist-400 font-mono text-xs">{d.id}</td>
                            <td className="px-4 py-3">
                            <p className="text-mist-200 font-medium">{d.name}</p>
                            <p className="text-xs text-mist-400 font-mono">{d.device_type} · {d.model ?? '—'}</p>
                            </td>
                            <td className="px-4 py-3 text-mist-200">{d.site_name ?? '—'}</td>
                            <td className="px-4 py-3 text-mist-400 font-mono text-xs">
                            {d.lat != null && d.lng != null ? `${d.lat.toFixed(4)}, ${d.lng.toFixed(4)}` : '—'}
                            </td>
                            <td className="px-4 py-3 text-mist-200 font-mono">{d.water_volume != null ? `${d.water_volume} L` : '—'}</td>
                            <td className="px-4 py-3 text-mist-200 font-mono">{d.temperature != null ? `${d.temperature}°C` : '—'}</td>
                            <td className="px-4 py-3 text-mist-200 font-mono">{d.battery != null ? `${d.battery}%` : '—'}</td>
                            <td className="px-4 py-3 text-mist-200 font-mono">{d.signal_rsrp != null ? `${d.signal_rsrp} dBm` : '—'}</td>
                            <td className="px-4 py-3 text-mist-200 font-mono text-xs">{d.last_input_state ?? '—'}</td>
                            <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${status.dot}`} />
                                <span className={`font-mono text-xs ${status.text}`}>{status.label}</span>
                            </span>
                            {d.latest_alert_message && (
                                <p className="text-xs text-alert-500 mt-1 max-w-[160px]">{d.latest_alert_message}</p>
                            )}
                            </td>
                            <td className="px-4 py-3 text-mist-400 font-mono text-xs">{formatAgo(d.last_reading_at)}</td>
                        </tr>
                        )
                    })}
                    </tbody>
                </table>
                </div>
            )}
            </section>

            <section className="bg-ink-800 border border-ink-700 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-ink-700">
                <p className="font-mono text-xs tracking-widest text-brand-500">RECENT TICKETS</p>
            </div>
            {tickets.length === 0 ? (
                <p className="px-6 py-10 text-center text-mist-400">No tickets synced yet.</p>
            ) : (
                <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="text-left text-mist-400 font-mono text-xs border-b border-ink-700">
                        <th className="px-6 py-3">Zoho Ticket ID</th>
                        <th className="px-6 py-3">Device</th>
                        <th className="px-6 py-3">Subject</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Updated</th>
                    </tr>
                    </thead>
                    <tbody>
                    {tickets.map((t) => (
                        <tr key={t.id} className="border-b border-ink-700 last:border-0 hover:bg-ink-700/40 transition-colors">
                        <td className="px-6 py-4 text-mist-400 font-mono text-xs">{t.zoho_ticket_id}</td>
                        <td className="px-6 py-4 text-mist-200 font-mono text-xs">{t.device_id ?? '—'}</td>
                        <td className="px-6 py-4 text-mist-200">{t.subject ?? '—'}</td>
                        <td className="px-6 py-4 text-mist-200 font-mono text-xs">{t.status ?? '—'}</td>
                        <td className="px-6 py-4 text-mist-400 font-mono text-xs">{formatAgo(t.updated_at)}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            )}
            </section>
        </main>
        </div>
    )
    }