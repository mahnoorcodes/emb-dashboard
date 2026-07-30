export default function SegmentedToggle({ label, options, value, onChange }) {
  return (
    <div className="mb-5">
      <span className="block text-xs font-mono tracking-wide text-mist-400 mb-1.5">{label}</span>
      <div className="grid grid-cols-2 gap-2">
        {options.map((opt) => (
          <button
            type="button"
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
              value === opt.value
                ? 'border-live-500 bg-live-500/10 text-live-500'
                : 'border-ink-600 text-mist-400 hover:border-mist-400'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
