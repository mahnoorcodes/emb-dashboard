import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

const STALE_MINUTES = 30

function statusColor(device) {
if (device.latest_alert_severity) return '#e8483a' // alert-500
if (!device.last_reading_at) return '#a3a3a3' // mist-400
const minutesAgo = (Date.now() - new Date(device.last_reading_at).getTime()) / 60000
if (minutesAgo > STALE_MINUTES) return '#a3a3a3'
return '#54b848' // live-500
}

function statusLabel(device) {
if (device.latest_alert_severity) return 'ALERT'
if (!device.last_reading_at) return 'NO DATA'
const minutesAgo = (Date.now() - new Date(device.last_reading_at).getTime()) / 60000
if (minutesAgo > STALE_MINUTES) return 'OFFLINE'
return 'OK'
}

function pinIcon(device) {
const color = statusColor(device)
const label = statusLabel(device)
const pulseClass = label === 'ALERT' ? 'map-pin-alert' : label === 'OK' ? 'map-pin-ok' : ''

return L.divIcon({
className: '',
html: `<div class="${pulseClass}" style="
    width: 24px; height: 24px; border-radius: 50%;
    background: ${color}; 
"></div>`,
iconSize: [24, 24],
iconAnchor: [12, 12],
})
}

export default function DeviceMap({ devices, onSelectDevice }) {
const containerRef = useRef(null)
const mapRef = useRef(null)

const mappable = devices.filter((d) => d.lat != null && d.lng != null)

useEffect(() => {
if (!containerRef.current || mappable.length === 0) return

const map = L.map(containerRef.current, {
    center: [mappable[0].lat, mappable[0].lng],
    zoom: 8,
})
mapRef.current = map

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
}).addTo(map)

const clusterGroup = L.markerClusterGroup({
    iconCreateFunction: (cluster) => {
    const markers = cluster.getAllChildMarkers()
    const statuses = markers.map((m) => m.options.deviceStatus)
    const hasAlert = statuses.some((s) => s === 'ALERT')
    const allOk = !hasAlert && statuses.every((s) => s === 'OK')
    const pulseClass = hasAlert ? 'map-pin-alert' : allOk ? 'map-pin-ok' : ''
    const color = hasAlert ? '#e8483a' : allOk ? '#54b848' : '#a3a3a3'
    const count = cluster.getChildCount()

    return L.divIcon({
        className: '',
        html: `<div class="${pulseClass}" style="
        width: 38px; height: 38px; border-radius: 50%;
        background: ${color};
        display: flex; align-items: center; justify-content: center;
        color: #fff; font-weight: 700; font-family: sans-serif; font-size: 13px;
        ">${count}</div>`,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
    })
    },
})

mappable.forEach((d) => {
    const marker = L.marker([d.lat, d.lng], {
    icon: pinIcon(d),
    deviceStatus: statusLabel(d), // read back inside iconCreateFunction above
    })
const mapLink = d.maps_url || `https://www.google.com/maps?q=${d.lat},${d.lng}`
    marker.bindPopup(
            `<div style="font-family: sans-serif; font-size: 13px;">
            <strong>${d.name}</strong><br/>
            ${d.site_name ? d.site_name + '<br/>' : ''}
            Status: ${statusLabel(d)}<br/>
            <a href="${mapLink}" target="_blank" rel="noopener noreferrer" style="color: #54b848;">Open in Google Maps ↗</a><br/>
            <a href="#" class="view-device-link" style="color: #99cc33; font-weight: 600;">View device details →</a>
            </div>`
        )

        marker.on('popupopen', (e) => {
            const link = e.popup.getElement()?.querySelector('.view-device-link')
            if (link) {
            link.addEventListener('click', (evt) => {
                evt.preventDefault()
                onSelectDevice?.(d)
            })
            }
        })

        clusterGroup.addLayer(marker)
        })

map.addLayer(clusterGroup)

return () => map.remove()
}, [devices])

if (mappable.length === 0) {
return (
    <div className="p-10 text-center text-mist-400">
    No devices have coordinates yet — add latitude/longitude when adding or editing a device to see them here.
    </div>
)
}

return <div ref={containerRef} className="w-full h-[500px] rounded-b-lg overflow-hidden" style={{ background: '#121212' }} />
}