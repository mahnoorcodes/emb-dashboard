export default function FormField({ label, ...props }) {
  return (
    <label className="block mb-4">
      <span className="block text-xs font-mono tracking-wide text-mist-400 mb-1.5">{label}</span>
      <input
        className="w-full bg-ink-900 border border-ink-600 rounded-md px-3 py-2 text-mist-200
                   placeholder:text-ink-600 focus:outline-none focus:ring-2 focus:ring-live-600 focus:border-live-600
                   transition-colors"
        {...props}
      />
    </label>
  )
}
