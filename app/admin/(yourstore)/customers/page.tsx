'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Input } from '@/components/ui/input'
import { User } from '@/types'
import { getUsers } from '@/lib/auth/auth'
import {
    ChevronLeft, ChevronRight, Loader2,
    Users, UserCheck, CalendarDays, Phone, Search
} from 'lucide-react'

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function initials(name: string) {
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

function fmtDate(d: string | Date | null) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-ZA', {
        day: '2-digit', month: 'short', year: 'numeric'
    })
}

function timeAgo(d: string | Date | null) {
    if (!d) return 'Never'
    const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
    if (diff < 60)     return 'Just now'
    if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
    return fmtDate(d)
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon }: {
    label: string; value: string | number; sub: string; icon: React.ReactNode
}) {
    return (
        <div className="flex-1 min-w-[160px] bg-white rounded-xl border border-black/5 p-4 space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
            <p className="text-2xl font-semibold leading-none">{value}</p>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="text-black">{icon}</span>
                {sub}
            </div>
        </div>
    )
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({ currentPage, totalPages, onPageChange, totalItems, pageSize }: {
    currentPage: number; totalPages: number
    onPageChange: (p: number) => void
    totalItems: number; pageSize: number
}) {
    const start = (currentPage - 1) * pageSize + 1
    const end   = Math.min(currentPage * pageSize, totalItems)

    const pages: (number | '…')[] = []
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) pages.push(i)
        else if (pages[pages.length - 1] !== '…') pages.push('…')
    }

    return (
        <div className="flex items-center justify-between px-5 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
                {totalItems === 0 ? 'No results' : `${start}–${end} of ${totalItems} customers`}
            </p>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                    <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                {pages.map((p, i) =>
                    p === '…' ? (
                        <span key={`e-${i}`} className="w-7 text-center text-xs text-muted-foreground">…</span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => onPageChange(p as number)}
                            className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs border transition
                                ${p === currentPage
                                    ? 'bg-black text-white border-black'
                                    : 'border-border text-gray-600 hover:bg-muted'}`}
                        >
                            {p}
                        </button>
                    )
                )}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                    <ChevronRight className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10

const Customers = () => {
    const [loading, setLoading] = useState(false)
    const [users, setUsers]     = useState<User[]>([])
    const [search, setSearch]   = useState('')
    const [page, setPage]       = useState(1)

    useEffect(() => {
        const fetch_ = async () => {
            setLoading(true)
            const result = await getUsers()
            if (result) setUsers(result)
            setLoading(false)
        }
        fetch_()
    }, [])

    // Stats
    const stats = useMemo(() => {
        const now = new Date()
        const thisMonth = users.filter(u => {
            if (!u.createdAt) return false
            const d = new Date(u.createdAt)
            return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
        })
        const withPhone = users.filter(u => u.phoneNumber)
        return { total: users.length, thisMonth: thisMonth.length, withPhone: withPhone.length }
    }, [users])

    // Search + paginate
    const filtered = useMemo(() => {
        if (!search.trim()) return users
        const q = search.toLowerCase()
        return users.filter(u =>
            u.fullName.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            (u.phoneNumber ?? '').includes(q)
        )
    }, [users, search])

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
    const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

    const handleSearch = (v: string) => { setSearch(v); setPage(1) }

    return (
        <div className="p-4 space-y-4">

            {/* Stats */}
            <div className="flex flex-wrap gap-3">
                <StatCard
                    label="Total Customers"
                    value={stats.total}
                    sub="registered accounts"
                    icon={<Users className="w-3.5 h-3.5" />}
                />
                <StatCard
                    label="This Month"
                    value={stats.thisMonth}
                    sub="new sign-ups"
                    icon={<CalendarDays className="w-3.5 h-3.5" />}
                />
                <StatCard
                    label="With Phone"
                    value={stats.withPhone}
                    sub="contact available"
                    icon={<Phone className="w-3.5 h-3.5" />}
                />
            </div>

            {/* Table card */}
            <div className="bg-white rounded-xl border border-black/5 overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                        Customers · {filtered.length}
                    </p>
                    <div className="relative w-52">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <Input
                            className="pl-8 h-7 text-xs rounded-lg"
                            placeholder="Search name, email…"
                            value={search}
                            onChange={e => handleSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-16 gap-2 text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading customers…
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30 hover:bg-muted/30">
                                    <TableHead className="text-[10px] uppercase tracking-widest w-64">Customer</TableHead>
                                    <TableHead className="text-[10px] uppercase tracking-widest">Phone</TableHead>
                                    <TableHead className="text-[10px] uppercase tracking-widest">Role</TableHead>
                                    <TableHead className="text-[10px] uppercase tracking-widest">Joined</TableHead>
                                    <TableHead className="text-[10px] uppercase tracking-widest">Last Login</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginated.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-12 text-sm text-muted-foreground">
                                            No customers match your search.
                                        </TableCell>
                                    </TableRow>
                                ) : paginated.map(user => {
                                    const col = avatarColor(user.id)
                                    return (
                                        <TableRow key={user.id} className="group">

                                            {/* Customer */}
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
                                                        style={{ background: col.bg, color: col.color }}
                                                    >
                                                        {initials(user.fullName)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium leading-none">{user.fullName}</p>
                                                        <p className="text-[11px] text-muted-foreground mt-0.5">{user.email}</p>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Phone */}
                                            <TableCell>
                                                <span className="text-sm text-muted-foreground">
                                                    {user.phoneNumber ?? '—'}
                                                </span>
                                            </TableCell>

                                            {/* Role */}
                                            <TableCell>
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-muted border border-border text-muted-foreground capitalize">
                                                    {user.role ?? 'User'}
                                                </span>
                                            </TableCell>

                                            {/* Joined */}
                                            <TableCell>
                                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                    {fmtDate(user.createdAt ?? null)}
                                                </span>
                                            </TableCell>

                                            {/* Last login */}
                                            <TableCell>
                                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                    {timeAgo(user.lastLogin ?? null)}
                                                </span>
                                            </TableCell>

                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {/* Pagination */}
                {!loading && filtered.length > PAGE_SIZE && (
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                        totalItems={filtered.length}
                        pageSize={PAGE_SIZE}
                    />
                )}

            </div>
        </div>
    )
}

export default Customers