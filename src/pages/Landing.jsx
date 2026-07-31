import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="min-h-screen bg-ink-950 flex flex-col">
      <header className="px-8 py-6 flex items-center justify-between">
        <span className="font-mono text-sm tracking-widest text-mist-400">EMB · EMERGENCY MESSAGING BACKBONE</span>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-3xl text-center">
          <p className="font-mono text-xs tracking-[0.2em] text-brand-500 mb-3">LIVE WATER DEVICE MONITORING</p>
          <h1 className="text-3xl sm:text-4xl font-semibold text-mist-200 mb-3">
            One signal. Three channels. Zero silence.
          </h1>
          <p className="text-mist-400 mb-10 max-w-xl mx-auto">
            Monitor leak detection, water volume and gateway health across every site, in real time.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 max-w-xl mx-auto text-left">
            <div className="bg-ink-800 border border-ink-700 rounded-lg p-6">
              <span className="inline-block w-2 h-2 rounded-full bg-live-500 signal-dot mb-4" />
              <h2 className="text-lg font-semibold text-mist-200 mb-1">Customer</h2>
              <p className="text-sm text-mist-400 mb-5">Monitor your own site's devices and alerts.</p>
              <div className="flex flex-col gap-2">
                <Link to="/customer/login" className="text-center text-sm bg-ink-700 hover:bg-ink-600 text-mist-200 rounded-md py-2 transition-colors">Log in</Link>
                <Link to="/customer/signup" className="text-center text-sm text-live-500 hover:underline py-1">Create account</Link>
              </div>
            </div>

            <div className="bg-ink-800 border border-ink-700 rounded-lg p-6">
              <span className="inline-block w-2 h-2 rounded-full bg-brand-600 signal-dot mb-4" />
              <h2 className="text-lg font-semibold text-mist-200 mb-1">Company</h2>
              <p className="text-sm text-mist-400 mb-5">Manage a fleet of sites, devices and tickets.</p>
              <div className="flex flex-col gap-2">
                <Link to="/company/login" className="text-center text-sm bg-ink-700 hover:bg-ink-600 text-mist-200 rounded-md py-2 transition-colors">Log in</Link>
                <Link to="/company/signup" className="text-center text-sm text-live-500 hover:underline py-1">Register company</Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
