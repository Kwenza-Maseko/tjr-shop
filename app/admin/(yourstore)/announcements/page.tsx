'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createOrUpdateAnnouncement, deleteAnnouncement, getAnnouncements } from '@/lib/store/announcement'
import { Loader2, Megaphone, Trash2, Pencil, X, Bell } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(date: Date | null) {
  if (!date) return '—'
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(date).toLocaleDateString('en-ZA', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

function fmtDate(date: Date | null) {
  if (!date) return '—'
  return new Date(date).toLocaleString('en-ZA', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const Announcements = () => {
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [announcements, setAnnouncements] = useState<{ id: string; announcement: string; createdAt: Date | null }[]>([])
  const [text, setText] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    const fetch_ = async () => {
      const result = await getAnnouncements()
      if (result) setAnnouncements(result)
    }
    fetch_()
  }, [])

  const handleSave = async () => {
    if (!text.trim()) return
    setLoading(true)
    const result = await createOrUpdateAnnouncement(text, editingId || null)
    setLoading(false)

    if (result.success && result.data) {
      toast.success(result.action === 'updated' ? 'Announcement updated' : 'Announcement published')
      setAnnouncements(prev =>
        result.action === 'updated'
          ? prev.map(a => a.id === result.data.id ? result.data : a)
          : [...prev, result.data]
      )
      setText('')
      setEditingId(null)
    } else {
      toast.error('Failed to save announcement')
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    const result = await deleteAnnouncement(id)
    setDeletingId(null)

    if (result.success) {
      toast.success('Announcement deleted')
      setAnnouncements(prev => prev.filter(a => a.id !== id))
      if (editingId === id) { setEditingId(null); setText('') }
    } else {
      toast.error('Failed to delete announcement')
    }
  }

  const handleEdit = (a: { id: string; announcement: string }) => {
    setEditingId(a.id)
    setText(a.announcement)
  }

  const handleCancel = () => {
    setEditingId(null)
    setText('')
  }

  return (
    <div className="p-4 space-y-4 max-w-2xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Publish public messages to your customers
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
          <Bell className="w-3 h-3" />
          {announcements.length} active
        </div>
      </div>

      {/* Compose box */}
      <div className={`bg-white rounded-xl border overflow-hidden transition-colors
                ${editingId ? 'border-black' : 'border-black/5'}`}>

        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <Megaphone className="w-3.5 h-3.5 text-muted-foreground" />
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            {editingId ? 'Edit announcement' : 'New announcement'}
          </p>
          {editingId && (
            <button
              onClick={handleCancel}
              className="ml-auto w-6 h-6 flex items-center justify-center rounded-md hover:bg-muted transition-colors"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>

        <div className="p-4 space-y-3">
          <Input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            placeholder="e.g. Free shipping on all orders this weekend!"
            className="h-10 text-sm bg-muted/40 border-border focus-visible:ring-1 focus-visible:ring-black focus-visible:ring-offset-0"
          />
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground">
              Press Enter or click Publish
            </p>
            <div className="flex gap-2">
              {editingId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  className="h-8 text-xs"
                >
                  Cancel
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleSave}
                disabled={loading || !text.trim()}
                className="h-8 text-xs bg-black hover:bg-black/80 text-white"
              >
                {loading
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : editingId ? 'Update' : 'Publish'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {announcements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground bg-white rounded-xl border border-black/5">
            <Bell className="w-8 h-8 opacity-20" />
            <p className="text-sm">No announcements yet</p>
          </div>
        ) : announcements.map(a => {
          const isEditing = editingId === a.id
          const isDeleting = deletingId === a.id

          return (
            <div
              key={a.id}
              className={`bg-white rounded-xl border overflow-hidden transition-colors
                                ${isEditing ? 'border-black' : 'border-black/5'}`}
            >
              {/* Top strip */}
              <div className="h-[2px] w-full bg-gradient-to-r from-green-400 to-teal-400" />

              <div className="px-4 py-3 flex items-start justify-between gap-3">

                {/* Icon + text */}
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="mt-0.5 p-1.5 rounded-lg bg-green-50 border border-green-200 flex-shrink-0">
                    <Megaphone className="w-3.5 h-3.5 text-green-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 leading-snug">
                      {a.announcement}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] text-muted-foreground">
                        {fmtDate(a.createdAt)}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-green-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        {timeAgo(a.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(a)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    disabled={isDeleting}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500 transition-colors disabled:opacity-50"
                  >
                    {isDeleting
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Announcements