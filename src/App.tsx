import { useState, useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { QRCodeSVG } from 'qrcode.react'

// ─── Data & API ─────────────────────────────────────────────────────────────

type CheckInStatus = 'pending' | 'checked-in'

interface Guest {
  id: string
  name: string
  inviteNumber: string
  code: string
  status: CheckInStatus
  checkedInAt?: string
  weddingName?: string
}

type AppScreen = 'scanner' | 'scan-result' | 'checked-in-confirm' | 'already-checked-in' | 'invalid-qr' | 'guests' | 'guest-detail' | 'dashboard' | 'manual-search' | 'invitation' | 'camera-error'
type ScanState = 'ready' | 'scanning' | 'detected'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCurrentTime() {
  return new Date().toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function WeddingTitle({ size = 'md', wedding }: { size?: 'sm' | 'md' | 'lg', wedding?: { name: string } }) {
  const cls = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-2xl',
  }[size]
  const title = wedding?.name || 'Adunola & Babatunde'
  const parts = title.split('&').map(s => s.trim())
  return (
    <span style={{ fontFamily: 'var(--font-display)' }} className={`${cls} font-semibold text-[#8B6914] italic`}>
      {parts[0]} <span className="not-italic font-light">&</span> {parts[1] || ''}
    </span>
  )
}

function StatusBadge({ status }: { status: CheckInStatus }) {
  if (status === 'checked-in') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
        Checked In
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-500 border border-stone-200">
      <span className="w-1.5 h-1.5 rounded-full bg-stone-400 inline-block" />
      Not Checked In
    </span>
  )
}

function BottomNav({ screen, onNav }: { screen: AppScreen, onNav: (s: AppScreen) => void }) {
  const tabs = [
    { key: 'scanner', label: 'Scan', icon: ScanIcon },
    { key: 'guests', label: 'Guests', icon: GuestsIcon },
    { key: 'dashboard', label: 'Summary', icon: DashIcon },
    { key: 'invitation', label: 'Invite', icon: InviteIcon },
  ] as const
  const active = ['scanner', 'scan-result', 'checked-in-confirm', 'already-checked-in', 'invalid-qr', 'manual-search', 'camera-error'].includes(screen) ? 'scanner'
    : ['guests', 'guest-detail'].includes(screen) ? 'guests'
    : screen === 'dashboard' ? 'dashboard'
    : 'invitation'
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#DDD4C2] flex z-50 max-w-md mx-auto">
      {tabs.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onNav(key as AppScreen)}
          className={`flex-1 py-3 flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${active === key ? 'text-[#8B6914]' : 'text-stone-400 hover:text-stone-600'}`}
        >
          <Icon active={active === key} />
          {label}
        </button>
      ))}
    </nav>
  )
}

function ScanIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#8B6914' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="5" height="5" rx="1" /><rect x="16" y="3" width="5" height="5" rx="1" />
      <rect x="3" y="16" width="5" height="5" rx="1" />
      <path d="M16 16h2v2h-2zm2 2h2v2h-2zm-2 2h2v2h-2z" />
      <line x1="12" y1="3" x2="12" y2="9" /><line x1="12" y1="15" x2="12" y2="21" />
      <line x1="3" y1="12" x2="9" y2="12" /><line x1="15" y1="12" x2="21" y2="12" />
    </svg>
  )
}
function GuestsIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#8B6914' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="7" r="3" /><circle cx="17" cy="9" r="2.5" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><path d="M17 12c2.2 0 4 1.8 4 4" />
    </svg>
  )
}
function DashIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#8B6914' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="13" width="5" height="8" rx="1" /><rect x="9.5" y="8" width="5" height="13" rx="1" /><rect x="16" y="3" width="5" height="18" rx="1" />
    </svg>
  )
}
function InviteIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#8B6914' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 8l9 6 9-6" />
    </svg>
  )
}

// ─── Login Screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    })
    if (res.ok) {
      onLogin()
    } else {
      setError(true)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF7F2] p-6 text-center">
      <div className="w-full max-w-xs bg-white rounded-2xl border border-[#DDD4C2] shadow-lg p-6">
        <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-2xl font-bold text-[#8B6914] mb-4">Staff Login</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input 
            type="password" 
            placeholder="Enter password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#DDD4C2] rounded-xl text-sm placeholder:text-stone-400 focus:outline-none focus:border-[#C49A28]"
          />
          {error && <p className="text-xs text-red-600">Invalid password</p>}
          <button type="submit" className="w-full py-3 bg-[#8B6914] text-white rounded-xl font-semibold text-sm hover:bg-[#7A5C10] transition-colors">
            Login
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── QR Scanner ───────────────────────────────────────────────────────────────

function ScannerScreen({
  onScanResult,
  onManualSearch,
}: {
  onScanResult: (guest: Guest | null) => void
  onManualSearch: () => void
}) {
  const [scanState, setScanState] = useState<ScanState>('ready')
  const [cameraError, setCameraError] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  
  useEffect(() => {
    // Clear any leftover markup inside the qr-reader div (common html5-qrcode bug in React)
    const container = document.getElementById("qr-reader")
    if (container) {
      container.innerHTML = ""
    }

    let active = true
    let html5QrCode: Html5Qrcode | null = null

    async function startCamera() {
      try {
        html5QrCode = new Html5Qrcode("qr-reader")
        scannerRef.current = html5QrCode
        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText) => {
            if (!active) return
            setScanState('detected')
            
            // Stop scanning once detected
            if (html5QrCode && html5QrCode.isScanning) {
              await html5QrCode.stop()
            }
            
            try {
              const res = await fetch(`/api/invitations/${decodedText}`)
              if (!res.ok) {
                onScanResult(null)
              } else {
                const data = await res.json()
                onScanResult(data)
              }
            } catch {
              onScanResult(null)
            }
          },
          () => {
            if (active && scanState !== 'scanning') {
              setScanState('scanning')
            }
          }
        )
      } catch {
        if (active) {
          setCameraError(true)
        }
      }
    }

    startCamera()

    return () => {
      active = false
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(() => {})
      }
    }
  }, [])

  if (cameraError) {
    return <CameraErrorScreen onRetry={() => { setCameraError(false) }} onManualSearch={onManualSearch} />
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-12 pb-4 text-center bg-[#FAF7F2] z-10">
        <WeddingTitle size="lg" />
        <p className="text-xs text-stone-500 mt-1 tracking-wide uppercase font-medium">Guest Check-In</p>
      </div>

      <div className="relative flex-1 bg-stone-900 overflow-hidden flex flex-col">
        <div id="qr-reader" className="w-full h-full object-cover"></div>
        {/* Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-64 h-64">
            {[['top-0 left-0', 'border-t-2 border-l-2'],
              ['top-0 right-0', 'border-t-2 border-r-2'],
              ['bottom-0 left-0', 'border-b-2 border-l-2'],
              ['bottom-0 right-0', 'border-b-2 border-r-2']].map(([pos, border], i) => (
              <div key={i} className={`absolute ${pos} w-8 h-8 border-[#C49A28] ${border}`} />
            ))}
            {scanState === 'detected' && (
              <div className="absolute inset-0 bg-emerald-400/30 rounded animate-pulse" />
            )}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                scanState === 'ready' ? 'bg-white/20 text-white'
                : scanState === 'scanning' ? 'bg-[#C49A28]/80 text-white'
                : 'bg-emerald-500/80 text-white'
              }`}>
                {scanState === 'ready' ? '● Ready to scan' : scanState === 'scanning' ? '◌ Scanning…' : '✓ QR detected'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 bg-[#FAF7F2] border-t border-[#DDD4C2] z-10">
        <button
          onClick={() => { stopCamera(); onManualSearch() }}
          className="w-full py-2.5 text-sm text-[#8B6914] border border-[#C49A28]/50 rounded-xl font-medium hover:bg-[#C49A28]/10 transition-colors"
        >
          Enter invitation code manually
        </button>
      </div>
    </div>
  )
}

// ─── Scan Result ──────────────────────────────────────────────────────────────

function ScanResultScreen({ guest, onCheckIn, onScanAnother }: { guest: Guest, onCheckIn: () => void, onScanAnother: () => void }) {
  const alreadyIn = guest.status === 'checked-in'
  return (
    <div className="flex flex-col h-full bg-[#FAF7F2]">
      <div className="px-5 pt-12 pb-6 text-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${alreadyIn ? 'bg-amber-100' : 'bg-emerald-100'}`}>
          {alreadyIn ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><circle cx="12" cy="16" r="1" fill="#92400E" />
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>
        <p className={`text-sm font-semibold tracking-wide ${alreadyIn ? 'text-amber-700' : 'text-emerald-700'}`}>
          {alreadyIn ? 'Already Checked In' : '✓ Invitation Verified'}
        </p>
      </div>

      <div className="flex-1 px-5">
        <div className="bg-white rounded-2xl border border-[#DDD4C2] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#EDE6D9] bg-[#FAF7F2]">
            <p className="text-[10px] uppercase tracking-widest text-stone-400 font-medium mb-0.5">Wedding</p>
            <WeddingTitle size="md" wedding={{ name: guest.weddingName || '' }} />
          </div>
          <div className="px-5 py-4 border-b border-[#EDE6D9]">
            <p className="text-[10px] uppercase tracking-widest text-stone-400 font-medium mb-1">Guest</p>
            <p style={{ fontFamily: 'var(--font-display)' }} className="text-xl font-semibold text-[#1C1611]">{guest.name}</p>
          </div>
          <div className="px-5 py-4 border-b border-[#EDE6D9] flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-stone-400 font-medium mb-1">Invitation</p>
              <p className="text-sm font-medium text-[#1C1611]">{guest.inviteNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-stone-400 font-medium mb-1">Code</p>
              <p className="text-xs font-mono text-stone-500">{guest.code}</p>
            </div>
          </div>
          <div className="px-5 py-3 flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-widest text-stone-400 font-medium">Status</p>
            <StatusBadge status={guest.status} />
          </div>
          {alreadyIn && guest.checkedInAt && (
            <div className="px-5 pb-4">
              <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 border border-amber-200">
                This invitation was already checked in at {guest.checkedInAt}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 py-6 space-y-3">
        {!alreadyIn && (
          <button
            onClick={onCheckIn}
            className="w-full py-3.5 bg-[#8B6914] text-white rounded-xl font-semibold text-sm hover:bg-[#7A5C10] transition-colors shadow-sm"
          >
            Check In Guest
          </button>
        )}
        {alreadyIn && (
          <div className="w-full py-3 bg-amber-50 border border-amber-200 rounded-xl text-center text-amber-700 text-sm font-medium">
            Entry Not Permitted — Already Checked In
          </div>
        )}
        <button
          onClick={onScanAnother}
          className="w-full py-3 text-sm text-[#8B6914] border border-[#C49A28]/50 rounded-xl font-medium hover:bg-[#C49A28]/10 transition-colors"
        >
          {alreadyIn ? 'Back to Scanner' : 'Scan Another Guest'}
        </button>
      </div>
    </div>
  )
}

// ─── Checked In Confirm ───────────────────────────────────────────────────────

function CheckedInConfirmScreen({ guest, onScanNext }: { guest: Guest, onScanNext: () => void }) {
  const time = guest.checkedInAt || getCurrentTime()
  return (
    <div className="flex flex-col h-full bg-[#FAF7F2] items-center justify-center px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-5">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <p className="text-emerald-700 font-semibold text-sm tracking-wide mb-6">✓ Guest Checked In</p>

      <div className="bg-white rounded-2xl border border-[#DDD4C2] shadow-sm w-full max-w-xs mb-8 overflow-hidden">
        <div className="px-5 py-4 border-b border-[#EDE6D9]">
          <p style={{ fontFamily: 'var(--font-display)' }} className="text-xl font-semibold text-[#1C1611]">{guest.name}</p>
          <p className="text-sm text-stone-500 mt-0.5">{guest.inviteNumber}</p>
        </div>
        <div className="px-5 py-3 flex items-center justify-between">
          <WeddingTitle size="sm" wedding={{ name: guest.weddingName || '' }} />
          <span className="text-xs text-stone-400">{time}</span>
        </div>
        <div className="px-5 pb-3">
          <p className="text-[10px] text-stone-400">Checked in at {time}</p>
        </div>
      </div>

      <button
        onClick={onScanNext}
        className="w-full max-w-xs py-3.5 bg-[#8B6914] text-white rounded-xl font-semibold text-sm hover:bg-[#7A5C10] transition-colors shadow-sm"
      >
        Scan Next Guest
      </button>
    </div>
  )
}

// ─── Invalid QR ───────────────────────────────────────────────────────────────

function InvalidQRScreen({ onTryAgain }: { onTryAgain: () => void }) {
  return (
    <div className="flex flex-col h-full bg-[#FAF7F2] items-center justify-center px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-5">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#991B1B" strokeWidth="2" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </div>
      <p style={{ fontFamily: 'var(--font-display)' }} className="text-2xl font-semibold text-[#1C1611] mb-2">Invalid Invitation</p>
      <p className="text-sm text-stone-500 mb-8 leading-relaxed">This QR code isn't recognized for this wedding.</p>
      <button
        onClick={onTryAgain}
        className="w-full max-w-xs py-3.5 bg-[#8B6914] text-white rounded-xl font-semibold text-sm hover:bg-[#7A5C10] transition-colors shadow-sm"
      >
        Try Again
      </button>
    </div>
  )
}

// ─── Camera Error ─────────────────────────────────────────────────────────────

function CameraErrorScreen({ onRetry, onManualSearch }: { onRetry: () => void, onManualSearch: () => void }) {
  return (
    <div className="flex flex-col h-full bg-[#FAF7F2] items-center justify-center px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center mb-5">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#7A6448" strokeWidth="1.8" strokeLinecap="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <line x1="3" y1="3" x2="21" y2="21" />
        </svg>
      </div>
      <p style={{ fontFamily: 'var(--font-display)' }} className="text-2xl font-semibold text-[#1C1611] mb-2">Camera Unavailable</p>
      <p className="text-sm text-stone-500 mb-2 leading-relaxed">Camera access is required to scan QR codes. Please allow camera permissions in your browser settings.</p>
      <p className="text-xs text-stone-400 mb-8">Or use the manual entry option to search for a guest.</p>
      <button onClick={onRetry} className="w-full max-w-xs py-3.5 bg-[#8B6914] text-white rounded-xl font-semibold text-sm hover:bg-[#7A5C10] transition-colors shadow-sm mb-3">
        Try Again
      </button>
      <button onClick={onManualSearch} className="w-full max-w-xs py-3.5 bg-white text-[#8B6914] border border-[#C49A28]/50 rounded-xl font-semibold text-sm hover:bg-[#FAF7F2] transition-colors shadow-sm">
        Manual Entry
      </button>
    </div>
  )
}

// ─── Guest List ───────────────────────────────────────────────────────────────

function GuestsScreen({ onSelectGuest }: { onSelectGuest: (g: Guest) => void }) {
  const [query, setQuery] = useState('')
  const [guests, setGuests] = useState<Guest[]>([])

  useEffect(() => {
    fetch(`/api/guests?q=${query}`)
      .then(res => res.json())
      .then(data => setGuests(data.guests || []))
  }, [query])

  const checkedCount = guests.filter(g => g.status === 'checked-in').length

  return (
    <div className="flex flex-col h-full bg-[#FAF7F2]">
      <div className="px-5 pt-12 pb-4 border-b border-[#DDD4C2] bg-[#FAF7F2]">
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <p style={{ fontFamily: 'var(--font-display)' }} className="text-lg font-semibold text-[#1C1611]">Guest List</p>
          </div>
          <p className="text-xs text-stone-400">{checkedCount}/{guests.length} checked in</p>
        </div>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search guests, invite #, or code…"
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#DDD4C2] rounded-xl text-sm placeholder:text-stone-400 focus:outline-none focus:border-[#C49A28] focus:ring-1 focus:ring-[#C49A28]/30"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
        {guests.length === 0 && (
          <div className="text-center py-12 text-stone-400">
            <p className="text-sm">No guests found</p>
            <p className="text-xs mt-1">Try a different search term</p>
          </div>
        )}
        {guests.map(guest => (
          <button
            key={guest.id}
            onClick={() => onSelectGuest(guest)}
            className="w-full bg-white rounded-xl border border-[#DDD4C2] px-4 py-3 flex items-center justify-between hover:border-[#C49A28]/60 hover:shadow-sm transition-all text-left"
          >
            <div>
              <p className="text-sm font-medium text-[#1C1611]">{guest.name}</p>
              <p className="text-xs text-stone-400 mt-0.5">{guest.inviteNumber} · {guest.code}</p>
            </div>
            <StatusBadge status={guest.status} />
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Guest Detail ─────────────────────────────────────────────────────────────

function GuestDetailScreen({ guest, onBack, onCheckIn }: { guest: Guest, onBack: () => void, onCheckIn: (id: string) => void }) {
  return (
    <div className="flex flex-col h-full bg-[#FAF7F2]">
      <div className="px-5 pt-12 pb-4 border-b border-[#DDD4C2] flex items-center gap-3">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <p style={{ fontFamily: 'var(--font-display)' }} className="text-lg font-semibold text-[#1C1611]">Guest Details</p>
      </div>

      <div className="flex-1 px-5 py-5 space-y-4">
        <div className="bg-white rounded-2xl border border-[#DDD4C2] shadow-sm overflow-hidden">
          <div className="px-5 py-5 border-b border-[#EDE6D9]">
            <p style={{ fontFamily: 'var(--font-display)' }} className="text-2xl font-semibold text-[#1C1611]">{guest.name}</p>
            <p className="text-sm text-stone-500 mt-1">{guest.inviteNumber}</p>
          </div>
          <div className="divide-y divide-[#EDE6D9]">
            {[
              { label: 'Wedding', value: <WeddingTitle size="sm" wedding={{ name: guest.weddingName || '' }} /> },
              { label: 'Invitation Code', value: <span className="font-mono text-sm">{guest.code}</span> },
              { label: 'Status', value: <StatusBadge status={guest.status} /> },
              ...(guest.checkedInAt ? [{ label: 'Checked In At', value: <span className="text-sm">{guest.checkedInAt}</span> }] : []),
            ].map(({ label, value }) => (
              <div key={label} className="px-5 py-3 flex items-center justify-between">
                <p className="text-xs text-stone-400 font-medium uppercase tracking-wide">{label}</p>
                {value}
              </div>
            ))}
          </div>
        </div>

        {guest.status === 'pending' && (
          <button
            onClick={() => onCheckIn(guest.code)}
            className="w-full py-3.5 bg-[#8B6914] text-white rounded-xl font-semibold text-sm hover:bg-[#7A5C10] transition-colors shadow-sm"
          >
            Check In Guest
          </button>
        )}
        {guest.status === 'checked-in' && (
          <div className="w-full py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-emerald-700 text-sm font-medium">
            Already Checked In
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function DashboardScreen() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch('/api/summary')
      .then(res => res.json())
      .then(setData)
  }, [])

  if (!data) return <div className="p-12 text-center text-stone-500">Loading summary...</div>

  const stats = [
    { label: 'Total Invitations', value: data.total, color: 'text-[#1C1611]' },
    { label: 'Checked In', value: data.checkedIn, color: 'text-emerald-700' },
    { label: 'Remaining', value: data.remaining, color: 'text-[#8B6914]' },
    { label: 'Check-In Rate', value: `${data.rate.toFixed(1)}%`, color: 'text-[#1C1611]' },
  ]

  return (
    <div className="flex flex-col h-full bg-[#FAF7F2]">
      <div className="px-5 pt-12 pb-4 border-b border-[#DDD4C2]">
        <p style={{ fontFamily: 'var(--font-display)' }} className="text-lg font-semibold text-[#1C1611]">Wedding Check-In</p>
        <WeddingTitle size="sm" wedding={data.wedding} />
        <p className="text-xs text-stone-400 mt-0.5">{data.wedding.venue}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-[#DDD4C2] shadow-sm px-4 py-4">
              <p style={{ fontFamily: 'var(--font-display)' }} className={`text-3xl font-bold ${color}`}>{value}</p>
              <p className="text-[10px] text-stone-400 uppercase tracking-wide font-medium mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="bg-white rounded-2xl border border-[#DDD4C2] shadow-sm px-5 py-4">
          <div className="flex justify-between text-xs text-stone-500 mb-2">
            <span>Check-In Progress</span>
            <span>{data.checkedIn} / {data.total}</span>
          </div>
          <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#8B6914] to-[#C49A28] rounded-full transition-all duration-700"
              style={{ width: `${(data.checkedIn / (data.total || 1)) * 100}%` }}
            />
          </div>
          <p className="text-[10px] text-stone-400 mt-2">{data.rate.toFixed(1)}% of guests have arrived</p>
        </div>

        {/* Recent check-ins */}
        <div className="bg-white rounded-2xl border border-[#DDD4C2] shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-[#EDE6D9]">
            <p className="text-xs font-semibold text-stone-600 uppercase tracking-wide">Recent Check-Ins</p>
          </div>
          {data.recent.map((g: any, idx: number) => (
            <div key={idx} className="px-5 py-3 border-b border-[#EDE6D9] last:border-0 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#1C1611]">{g.name}</p>
                <p className="text-xs text-stone-400">{g.invite_number}</p>
              </div>
              <p className="text-xs text-stone-400">{new Date(g.checked_in_at + 'Z').toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Manual Search ────────────────────────────────────────────────────────────

function ManualSearchScreen({ onResult, onBack }: { onResult: (g: Guest) => void, onBack: () => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Guest[] | null>(null)

  const handleSearch = async () => {
    const res = await fetch(`/api/guests?q=${query}`)
    const data = await res.json()
    setResults(data.guests || [])
  }

  return (
    <div className="flex flex-col h-full bg-[#FAF7F2]">
      <div className="px-5 pt-12 pb-4 border-b border-[#DDD4C2] flex items-center gap-3">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <p style={{ fontFamily: 'var(--font-display)' }} className="text-lg font-semibold text-[#1C1611]">Search Invitation</p>
      </div>

      <div className="px-5 py-5 space-y-4">
        <p className="text-xs text-stone-500">Search by guest name, invitation number, or invitation code.</p>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="e.g. Oluwaseun Adeyemi or WED-001"
          className="w-full px-4 py-3 bg-white border border-[#DDD4C2] rounded-xl text-sm placeholder:text-stone-400 focus:outline-none focus:border-[#C49A28] focus:ring-1 focus:ring-[#C49A28]/30"
        />
        <button
          onClick={handleSearch}
          className="w-full py-3 bg-[#8B6914] text-white rounded-xl font-semibold text-sm hover:bg-[#7A5C10] transition-colors"
        >
          Search
        </button>
      </div>

      {results !== null && (
        <div className="flex-1 overflow-y-auto px-5 space-y-2">
          {results.length === 0 ? (
            <div className="text-center py-10 text-stone-400">
              <p className="text-sm">No matching invitation found</p>
              <p className="text-xs mt-1">Double-check the name or code</p>
            </div>
          ) : results.map(g => (
            <button
              key={g.id}
              onClick={() => onResult(g)}
              className="w-full bg-white rounded-xl border border-[#DDD4C2] px-4 py-3 flex items-center justify-between hover:border-[#C49A28]/60 transition-all text-left"
            >
              <div>
                <p className="text-sm font-medium text-[#1C1611]">{g.name}</p>
                <p className="text-xs text-stone-400 mt-0.5">{g.inviteNumber} · {g.code}</p>
              </div>
              <StatusBadge status={g.status} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Invitation Screen ────────────────────────────────────────────────────────

function InvitationScreen() {
  const [guest, setGuest] = useState<any>(null)
  const [guestsList, setGuestsList] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/guests')
      .then(res => res.json())
      .then(data => {
        setGuestsList(data.guests || [])
        setGuest(data.guests?.[0] || null)
      })
  }, [])

  if (!guest) return <div className="p-12 text-center text-stone-500">Loading...</div>

  return (
    <div className="flex flex-col h-full bg-[#FAF7F2]">
      <div className="px-5 pt-12 pb-4 border-b border-[#DDD4C2]">
        <p style={{ fontFamily: 'var(--font-display)' }} className="text-lg font-semibold text-[#1C1611]">Invitation Preview</p>
        <p className="text-xs text-stone-400 mt-0.5">Example of the guest QR code invitation</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col items-center justify-start gap-4">
        
        <select 
          className="bg-white border border-[#DDD4C2] rounded-xl px-4 py-2 text-sm text-[#1C1611] w-full max-w-xs focus:outline-none focus:border-[#C49A28]"
          value={guest.id}
          onChange={(e) => setGuest(guestsList.find(g => g.id === e.target.value))}
        >
          {guestsList.map(g => (
            <option key={g.id} value={g.id}>{g.name} ({g.code})</option>
          ))}
        </select>

        <div
          className="w-full max-w-xs rounded-3xl overflow-hidden shadow-lg border border-[#DDD4C2]"
          style={{ background: 'linear-gradient(160deg, #FAF7F0 0%, #F5EDD8 100%)' }}
        >
          {/* Decorative top */}
          <div className="h-2 bg-gradient-to-r from-[#8B6914] via-[#C49A28] to-[#8B6914]" />

          <div className="px-8 py-8 text-center space-y-1">
            {/* Ornament */}
            <div className="text-[#C49A28] text-2xl mb-3">✦</div>

            <p style={{ fontFamily: 'var(--font-display)' }} className="text-[10px] uppercase tracking-[0.25em] text-stone-400 font-medium">You are invited to the wedding of</p>

            <WeddingTitle size="lg" />

            <p className="text-[10px] text-stone-400 tracking-wide pt-3">Saturday, 14th November 2026</p>
            <p className="text-[10px] text-stone-500">Eko Hotels & Suites, Lagos</p>

            <div className="py-1">
              <div className="border-t border-[#DDD4C2] my-4" />
              <p style={{ fontFamily: 'var(--font-display)' }} className="text-[9px] uppercase tracking-[0.2em] text-stone-400 mb-3">Together with their families invite you</p>
            </div>

            {/* Real QR Code */}
            <div className="w-36 h-36 mx-auto bg-white rounded-2xl border-2 border-[#DDD4C2] flex items-center justify-center p-3 shadow-inner">
              <QRCodeSVG value={guest.code} size={120} fgColor="#1C1611" />
            </div>

            <div className="pt-3">
              <p style={{ fontFamily: 'var(--font-display)' }} className="text-base font-semibold text-[#1C1611]">{guest.name}</p>
              <p className="text-xs text-stone-500 mt-0.5">{guest.inviteNumber}</p>
              <p className="text-[10px] font-mono text-stone-400 mt-0.5">{guest.code}</p>
            </div>

            <div className="border-t border-[#DDD4C2] my-4" />
            <p className="text-[8px] text-stone-400 leading-relaxed">Present this QR code at the entrance for check-in.<br />One admission per invitation.</p>
          </div>

          <div className="h-2 bg-gradient-to-r from-[#8B6914] via-[#C49A28] to-[#8B6914]" />
        </div>
      </div>
    </div>
  )
}

// ─── App Shell ────────────────────────────────────────────────────────────────

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [screen, setScreen] = useState<AppScreen>('scanner')
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)

  useEffect(() => {
    fetch('/api/auth/status')
      .then(res => res.json())
      .then(data => setIsAuthenticated(data.authenticated))
  }, [])

  if (isAuthenticated === null) return null // loading
  if (!isAuthenticated) return <LoginScreen onLogin={() => setIsAuthenticated(true)} />

  async function handleScanResult(guest: Guest | null) {
    if (!guest) {
      setScreen('invalid-qr')
    } else {
      setSelectedGuest(guest)
      setScreen('scan-result')
    }
  }

  async function handleCheckIn(code?: string) {
    const inviteCode = code ?? selectedGuest?.code
    if (!inviteCode) return
    
    const res = await fetch('/api/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: inviteCode })
    })

    if (res.ok) {
      // Refresh the selected guest data
      const gRes = await fetch(`/api/invitations/${inviteCode}`)
      if (gRes.ok) {
        setSelectedGuest(await gRes.json())
      }
      setScreen('checked-in-confirm')
    } else {
      // Already checked in or error
      const gRes = await fetch(`/api/invitations/${inviteCode}`)
      if (gRes.ok) {
        setSelectedGuest(await gRes.json())
      }
      setScreen('scan-result') // the scan-result screen will show "Already Checked In"
    }
  }

  function handleSelectGuest(g: Guest) {
    setSelectedGuest(g)
    setScreen('guest-detail')
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex justify-center">
      <div className="w-full max-w-md relative flex flex-col" style={{ minHeight: '100dvh' }}>
        <div className="flex-1 overflow-hidden" style={{ paddingBottom: '64px' }}>
          <div className="h-full overflow-y-auto">
            {screen === 'scanner' && (
              <ScannerScreen onScanResult={handleScanResult} onManualSearch={() => setScreen('manual-search')} />
            )}
            {screen === 'scan-result' && selectedGuest && (
              <ScanResultScreen
                guest={selectedGuest}
                onCheckIn={handleCheckIn}
                onScanAnother={() => setScreen('scanner')}
              />
            )}
            {screen === 'checked-in-confirm' && selectedGuest && (
              <CheckedInConfirmScreen guest={selectedGuest} onScanNext={() => setScreen('scanner')} />
            )}
            {screen === 'invalid-qr' && (
              <InvalidQRScreen onTryAgain={() => setScreen('scanner')} />
            )}
            {screen === 'camera-error' && (
              <CameraErrorScreen onRetry={() => setScreen('scanner')} onManualSearch={() => setScreen('manual-search')} />
            )}
            {screen === 'guests' && (
              <GuestsScreen onSelectGuest={handleSelectGuest} />
            )}
            {screen === 'guest-detail' && selectedGuest && (
              <GuestDetailScreen
                guest={selectedGuest}
                onBack={() => setScreen('guests')}
                onCheckIn={handleCheckIn}
              />
            )}
            {screen === 'dashboard' && (
              <DashboardScreen />
            )}
            {screen === 'manual-search' && (
              <ManualSearchScreen onResult={g => { setSelectedGuest(g); setScreen('scan-result') }} onBack={() => setScreen('scanner')} />
            )}
            {screen === 'invitation' && (
              <InvitationScreen />
            )}
          </div>
        </div>

        <BottomNav screen={screen} onNav={setScreen} />
      </div>
    </div>
  )
}
