'use client'
import { getAnnouncements } from '@/lib/store/announcement';
import { Megaphone, Tag, Zap, Gift, Truck, Star, Bell } from 'lucide-react';
import { useEffect, useState } from 'react'

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Pick an icon and color theme based on keywords in the announcement
function getAnnouncementStyle(text: string) {
  const t = text.toLowerCase()
  if (t.includes('sale') || t.includes('discount') || t.includes('off') || t.includes('%')) {
    return {
      icon: <Tag className="w-4 h-4" />,
      gradient: 'from-red-500 to-orange-500',
      bg: 'bg-red-50',
      border: 'border-red-200',
      badge: 'bg-red-100 text-red-700 border-red-300',
      dot: 'bg-red-500',
      label: 'SALE',
    }
  }
  if (t.includes('free') || t.includes('gift') || t.includes('giveaway')) {
    return {
      icon: <Gift className="w-4 h-4" />,
      gradient: 'from-purple-500 to-pink-500',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      badge: 'bg-purple-100 text-purple-700 border-purple-300',
      dot: 'bg-purple-500',
      label: 'FREE',
    }
  }
  if (t.includes('ship') || t.includes('deliver') || t.includes('dispatch')) {
    return {
      icon: <Truck className="w-4 h-4" />,
      gradient: 'from-blue-500 to-indigo-500',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      badge: 'bg-blue-100 text-blue-700 border-blue-300',
      dot: 'bg-blue-500',
      label: 'SHIPPING',
    }
  }
  if (t.includes('new') || t.includes('launch') || t.includes('arrived') || t.includes('just in')) {
    return {
      icon: <Zap className="w-4 h-4" />,
      gradient: 'from-yellow-500 to-orange-400',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      badge: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      dot: 'bg-yellow-500',
      label: 'NEW',
    }
  }
  if (t.includes('exclusive') || t.includes('limited') || t.includes('special')) {
    return {
      icon: <Star className="w-4 h-4" />,
      gradient: 'from-amber-500 to-yellow-400',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      badge: 'bg-amber-100 text-amber-700 border-amber-300',
      dot: 'bg-amber-500',
      label: 'EXCLUSIVE',
    }
  }
  // default
  return {
    icon: <Megaphone className="w-4 h-4" />,
    gradient: 'from-green-500 to-teal-500',
    bg: 'bg-green-50',
    border: 'border-green-200',
    badge: 'bg-green-100 text-green-700 border-green-300',
    dot: 'bg-green-500',
    label: 'ANNOUNCEMENT',
  }
}

function timeAgo(date: Date) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(date).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short' })
}

// ─── Component ────────────────────────────────────────────────────────────────

const Notifications = () => {
  const [announcements, setAnnouncements] = useState<{ id: string; announcement: string; createdAt: Date | null }[]>([])
  const [visible, setVisible] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchAnnouncement = async () => {
      const result = await getAnnouncements()
      if (result) {
        setAnnouncements(result)
        // stagger fade-in per card
        result.forEach((a, i) => {
          setTimeout(() => {
            setVisible(prev => new Set(prev).add(a.id))
          }, i * 80)
        })
      }
    }
    fetchAnnouncement()
  }, [])

  if (announcements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <Bell className="w-5 h-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">No announcements yet</p>
          <p className="text-xs text-muted-foreground mt-0.5">Check back soon for news and deals</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">

      {/* Header count */}
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-3.5 h-3.5 text-muted-foreground" />
        <p className="text-xs text-muted-foreground uppercase tracking-widest">
          {announcements.length} announcement{announcements.length !== 1 ? 's' : ''}
        </p>
      </div>

      {announcements.map((a) => {
        const style = getAnnouncementStyle(a.announcement)
        const isVisible = visible.has(a.id)

        return (
          <div
            key={a.id}
            className={`rounded-xl border overflow-hidden transition-all duration-500
              ${style.bg} ${style.border}
              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
          >
            {/* Coloured top bar */}
            <div className={`h-1 w-full bg-gradient-to-r ${style.gradient}`} />

            <div className="p-3 space-y-2">

              {/* Top row */}
              <div className="flex items-start justify-between gap-2">

                {/* Icon + label */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <div className={`p-1.5 rounded-lg bg-gradient-to-br ${style.gradient} text-white`}>
                    {style.icon}
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full border ${style.badge}`}>
                    {style.label}
                  </span>
                </div>

                {/* Time */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${style.dot}`} />
                  <p className="text-[10px] text-muted-foreground">
                    {a.createdAt ? timeAgo(a.createdAt) : '—'}
                  </p>
                </div>
              </div>

              {/* Announcement text */}
              <p className="text-xs font-medium leading-snug pl-0.5">
                {a.announcement}
              </p>

              {/* Footer */}
              <p className="text-[10px] text-muted-foreground pl-0.5">
                {a.createdAt
                  ? new Date(a.createdAt).toLocaleString('en-ZA', {
                      day: '2-digit', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })
                  : '—'}
              </p>

            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Notifications