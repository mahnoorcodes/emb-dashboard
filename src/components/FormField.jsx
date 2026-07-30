import { useState } from 'react'

export default function FormField({ label, type, ...props }) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'

  return (
    <label className="block mb-4">
      <span className="block text-xs font-mono tracking-wide text-mist-400 mb-1.5">{label}</span>
      <div className="relative">
        <input
          type={isPassword ? (show ? 'text' : 'password') : type}
          className="w-full bg-ink-900 border border-ink-600 rounded-md px-3 py-2 text-mist-200
                    placeholder:text-ink-600 focus:outline-none focus:ring-2 focus:ring-live-600 focus:border-live-600
                    transition-colors pr-14"
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-mist-400 hover:text-brand-500 transition-colors"
          >
            {show ? 'HIDE' : 'SHOW'}
          </button>
        )}
      </div>
    </label>
  )
}