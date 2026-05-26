
import { Shield, Clock, CheckCircle2, XCircle, Crown } from 'lucide-react'

interface AdminParams {
  id: string
  fullName: string
  email: string
  password: string
  adminRole: "SUPER ADMIN" | "ADMIN" | null
  accessGranted: "GRANTED" | "NOT GRANTED" | null
  createdAt: Date | null
}

const AVATAR_COLORS = [
  { bg: '#E6F1FB', color: '#0C447C' },
  { bg: '#E1F5EE', color: '#085041' },
  { bg: '#FAEEDA', color: '#633806' },
  { bg: '#FBEAF0', color: '#72243E' },
  { bg: '#EAF3DE', color: '#27500A' },
  { bg: '#EEEDFE', color: '#3C3489' },
]

function avatarColor(id: string) {
  let hash = 0
  for (const c of id) hash += c.charCodeAt(0)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

function fmtDate(date: Date | null) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-ZA', {
    day: '2-digit', month: 'long', year: 'numeric'
  })
}

const ManageAccountComponent = ({ user }: { user: AdminParams }) => {
  const getInitials = (name: string) =>
    name.split(' ').slice(0, 2).map(w => w.charAt(0).toUpperCase()).join('')

  const col = avatarColor(user.id)

  const isGranted = user.accessGranted === 'GRANTED'
  const isSuperAdmin = user.adminRole === 'SUPER ADMIN'

  return (
    <div className="max-w-md w-full mx-auto space-y-3 mt-4">

      {/* Profile card */}
      <div className="bg-white rounded-xl border border-black/5 overflow-hidden">

        {/* Top gradient banner */}
        <div className="h-20 bg-gradient-to-r from-zinc-900 to-zinc-700 relative">
          {/* Subtle pattern */}
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '16px 16px' }}
          />
        </div>

        {/* Avatar — overlaps banner */}
        <div className="px-5 pb-5">
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div
              className="w-20 h-20 rounded-2xl border-4 border-white flex items-center justify-center text-2xl font-bold shadow-sm z-10"
              style={{ background: col.bg, color: col.color }}
            >
              {getInitials(user.fullName || '')}
            </div>

            {/* Role badge */}
            <div className={`flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-full border
              ${isSuperAdmin
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-zinc-50 text-zinc-600 border-zinc-200'}`}>
              {isSuperAdmin
                ? <Crown className="w-3 h-3" />
                : <Shield className="w-3 h-3" />}
              {user.adminRole ?? 'Admin'}
            </div>
          </div>

          {/* Name + email */}
          <div className="space-y-0.5">
            <p className="text-base font-semibold text-gray-900 leading-none">
              {user.fullName}
            </p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 gap-3">

        {/* Access status */}
        <div className={`rounded-xl border p-4 space-y-2
          ${isGranted ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Access</p>
          <div className={`flex items-center gap-1.5 text-sm font-medium
            ${isGranted ? 'text-green-700' : 'text-red-600'}`}>
            {isGranted
              ? <CheckCircle2 className="w-4 h-4" />
              : <XCircle className="w-4 h-4" />}
            {isGranted ? 'Granted' : 'Not granted'}
          </div>
        </div>

        {/* Member since */}
        <div className="rounded-xl border border-black/5 bg-white p-4 space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Member since</p>
          <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
            <Clock className="w-4 h-4 text-muted-foreground" />
            {fmtDate(user.createdAt)}
          </div>
        </div>

      </div>

      {/* Account details */}
      <div className="bg-white rounded-xl border border-black/5 divide-y divide-border">
        {[
          { label: 'Full name', value: user.fullName },
          { label: 'Email', value: user.email },
          { label: 'Role', value: user.adminRole ?? '—' },
        ].map(row => (
          <div key={row.label} className="flex items-center justify-between px-4 py-3">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground w-28 flex-shrink-0">
              {row.label}
            </p>
            <p className={`text-sm text-gray-800 text-right truncate max-w-[200px]`}>
              {row.value}
            </p>
          </div>
        ))}
      </div>

    </div>
  )
}

export default ManageAccountComponent