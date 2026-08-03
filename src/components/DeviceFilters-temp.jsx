const DEVICE_TYPES = ['teltonika_rut906', 'ttk', 'aquasentra', 'lorawan', 'm20']
const STATUSES = ['OK', 'ALERT', 'OFFLINE', 'NO DATA']

const selectClass =
'bg-ink-900 border border-ink-600 rounded-md px-2 py-1.5 text-sm text-mist-200 focus:outline-none focus:ring-2 focus:ring-live-600'

export const defaultFilters = { deviceType: '', status: '', site: '', company: '', from: '', to: '' }

export function applyFilters(devices, filters, getStatus) {
return devices.filter((d) => {
if (filters.deviceType && d.device_type !== filters.deviceType) return false
if (filters.status && getStatus(d).label !== filters.status) return false
if (filters.site && d.site_name !== filters.site) return false
if (filters.company && (d.company_name || d.owner_full_name) !== filters.company) return false
if (filters.from && (!d.installed_at || new Date(d.installed_at) < new Date(filters.from))) return false
if (filters.to && (!d.installed_at || new Date(d.installed_at) > new Date(filters.to + 'T23:59:59'))) return false
return true
})
}

export default function DeviceFilters({ devices, filters, setFilters, showCompany = false }) {
const sites = [...new Set(devices.map((d) => d.site_name).filter(Boolean))].sort()
const companies = showCompany
? [...new Set(devices.map((d) => d.company_name || d.owner_full_name).filter(Boolean))].sort()
: []

const activeCount = Object.values(filters).filter(Boolean).length

return (
<div className="px-6 py-3 border-b border-ink-700 flex items-center gap-3 flex-wrap">
    <select
    value={filters.deviceType}
    onChange={(e) => setFilters({ ...filters, deviceType: e.target.value })}
    className={selectClass}
    >
    <option value="">All device types</option>
    {DEVICE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
    </select>

    <select
    value={filters.status}
    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
    className={selectClass}
    >
    <option value="">All statuses</option>
    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
    </select>

    <select
    value={filters.site}
    onChange={(e) => setFilters({ ...filters, site: e.target.value })}
    className={selectClass}
    >
    <option value="">All sites</option>
    {sites.map((s) => <option key={s} value={s}>{s}</option>)}
    </select>

    {showCompany && (
    <select
        value={filters.company}
        onChange={(e) => setFilters({ ...filters, company: e.target.value })}
        className={selectClass}
    >
        <option value="">All companies/customers</option>
        {companies.map((c) => <option key={c} value={c}>{c}</option>)}
    </select>
    )}

    <label className="flex items-center gap-1.5 text-xs text-mist-400">
    Added from
    <input
        type="date"
        value={filters.from}
        onChange={(e) => setFilters({ ...filters, from: e.target.value })}
        className={selectClass}
    />
    </label>
    <label className="flex items-center gap-1.5 text-xs text-mist-400">
    to
    <input
        type="date"
        value={filters.to}
        onChange={(e) => setFilters({ ...filters, to: e.target.value })}
        className={selectClass}
    />
    </label>

    {activeCount > 0 && (
    <button
        onClick={() => setFilters(defaultFilters)}
        className="text-xs text-alert-500 hover:underline ml-auto"
    >
        Clear {activeCount} filter{activeCount > 1 ? 's' : ''}
    </button>
    )}
</div>
)
}