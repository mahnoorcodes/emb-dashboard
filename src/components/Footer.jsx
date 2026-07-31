export default function Footer() {
return (
<footer className="border-t border-ink-700 px-4 sm:px-8 py-6">
    <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
    <p className="text-xs font-mono text-mist-400 tracking-widest">
        EMB · A JOINT PLATFORM BY LEAKDTECH &amp; ONE9 3NINE CONSULTING FZE · TECHNOLOGY FROM INCEPTION.
    </p>
    <div className="flex items-center gap-4">
        <span className="text-xs text-mist-400">Visit our websites</span>
        <a href="https://leakdtech.com" target="_blank" rel="noopener noreferrer" aria-label="leakdtech.com" title="leakdtech.com" className="text-brand-500 hover:text-brand-400">
        <img src="https://wlxxakyyguiddtfbwdou.supabase.co/storage/v1/object/public/website-images/leakdtech-icon-40.png" alt="LeakDtech" className="w-6 h-6 object-contain" />
        </a>
        <a href="https://one93nine.com" target="_blank" rel="noopener noreferrer" aria-label="one93nine.com" title="one93nine.com" className="text-brand-500 hover:text-brand-400">
        <img src="https://wlxxakyyguiddtfbwdou.supabase.co/storage/v1/object/public/website-images/one93nine-logo.webp" alt="One93Nine" className="w-6 h-6 object-contain" />
        </a>
    </div>
    </div>
</footer>
)
}