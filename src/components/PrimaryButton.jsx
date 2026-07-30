export default function PrimaryButton({ children, loading, ...props }) {
  return (
    <button
      className="w-full bg-brand-500 hover:bg-brand-400 disabled:opacity-50 disabled:cursor-not-allowed
                 text-ink-950 font-semibold py-2.5 rounded-md transition-colors"
      disabled={loading}
      {...props}
    >
      {loading ? 'Working…' : children}
    </button>
  )
}
