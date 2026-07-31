function Row({ label, children }) {
return (
<div className="py-3 border-b border-ink-700 last:border-0">
    <p className="text-xs font-mono text-mist-400 mb-1">{label}</p>
    <div className="text-mist-200">{children}</div>
</div>
)
}

function statusFor(device) {
const STALE_MINUTES = 30
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

export default function DeviceDetailPanel({ device, photos = [], showDeviceId = false, onClose, onEdit, onDelete }) {
const isOpen = !!device

return (
<>
    {/* Backdrop */}
    <div
    onClick={onClose}
    className={`fixed inset-0 bg-black/60 z-40 transition-opacity ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
    }`}
    />

    {/* Panel */}
    <div
    className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-ink-800 border-l border-ink-700 z-50
                overflow-y-auto transition-transform duration-300 ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
    >
    {device && (
        <>
        <div className="px-6 py-5 border-b border-ink-700 flex items-center justify-between sticky top-0 bg-ink-800">
            <p className="font-mono text-xs tracking-widest text-brand-500">DEVICE DETAILS</p>
            <button onClick={onClose} className="text-mist-400 hover:text-brand-500 text-sm">
            Close ✕
            </button>
        </div>

        <div className="px-6 py-2">
            <Row label="PHOTO">
            {photos.length > 0 ? (
                <div className="flex gap-2">
                {photos.map((url, i) => (
                    <img key={i} src={url} alt={`${device.name} ${i + 1}`} className="w-20 h-20 rounded object-cover" />
                ))}
                </div>
            ) : (
                <span className="text-mist-400">—</span>
            )}
            </Row>

            {showDeviceId && (
            <Row label="DEVICE ID">
                <span className="font-mono text-sm">{device.id}</span>
            </Row>
            )}

            <Row label="DEVICE">
            <p className="font-medium">{device.name}</p>
            <p className="text-sm text-mist-400 font-mono">
                {device.device_type} {device.model ? `· ${device.model}` : ''}
            </p>
            </Row>

            <Row label="SITE">{device.site_name ?? '—'}</Row>

            <Row label="COMPANY">
            <p>{device.company_name || device.owner_full_name || '—'}</p>
            <p className="text-xs font-mono text-mist-400 mt-0.5">
                {device.owner_portal === 'company' ? 'COMPANY' : 'CUSTOMER'}
            </p>
            </Row>

            <Row label="MAP">
            {device.maps_url ? (
                <a href={device.maps_url} target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:underline">
                Open ↗
                </a>
            ) : (
                <span className="text-mist-400">—</span>
            )}
            </Row>

            <Row label="COORDINATES">
            <span className="font-mono text-sm">
                {device.lat != null && device.lng != null ? `${device.lat.toFixed(4)}, ${device.lng.toFixed(4)}` : '—'}
            </span>
            </Row>

            <Row label="WATER VOLUME">
            <span className="font-mono">{device.water_volume != null ? `${device.water_volume} L` : '—'}</span>
            </Row>

            <Row label="TEMPERATURE">
            <span className="font-mono">{device.temperature != null ? `${device.temperature}°C` : '—'}</span>
            </Row>

            <Row label="BATTERY">
            <span className="font-mono">{device.battery != null ? `${device.battery}%` : '—'}</span>
            </Row>

            <Row label="SIGNAL (RSRP)">
            <span className="font-mono">{device.signal_rsrp != null ? `${device.signal_rsrp} dBm` : '—'}</span>
            </Row>

            <Row label="INPUT STATE">
            <span className="font-mono text-sm">{device.last_input_state ?? '—'}</span>
            </Row>

            <Row label="STATUS">
            {(() => {
                const status = statusFor(device)
                return (
                <span className="inline-flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${status.dot}`} />
                    <span className={`font-mono text-sm ${status.text}`}>{status.label}</span>
                </span>
                )
            })()}
            {device.latest_alert_message && (
                <p className="text-sm text-alert-500 mt-1">{device.latest_alert_message}</p>
            )}
            </Row>

            <Row label="LAST READING">{formatAgo(device.last_reading_at)}</Row>
        </div>

        {(onEdit || onDelete) && (
            <div className="px-6 py-4 border-t border-ink-700 flex gap-3 sticky bottom-0 bg-ink-800">
            {onEdit && (
                <button
                onClick={() => { onEdit(device); onClose() }}
                className="flex-1 bg-brand-500 hover:bg-brand-400 text-ink-950 font-semibold py-2 rounded-md transition-colors"
                >
                Edit
                </button>
            )}
            {onDelete && (
                <button
                onClick={() => { onDelete(device); onClose() }}
                className="flex-1 bg-ink-700 hover:bg-ink-600 text-alert-500 font-semibold py-2 rounded-md transition-colors"
                >
                Delete
                </button>
            )}
            </div>
        )}
        </>
    )}
    </div>
</>
)
}