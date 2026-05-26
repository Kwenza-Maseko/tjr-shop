'use client'

import { Shield, Clock, Eye, EyeOff, Phone, Lock } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface UserParams {
    id: string
    fullName: string
    email: string
    password: string
    role: "USERS" | "ADMIN" | null
    phoneNumber: string | null
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

type ActiveSection = 'phone' | 'password' | null

const ManageUserAccountComponent = ({ user }: { user: UserParams }) => {
    const [activeSection, setActiveSection] = useState<ActiveSection>(null)

    // Phone state
    const [phone, setPhone] = useState(user.phoneNumber ?? '')
    const [phoneLoading, setPhoneLoading] = useState(false)

    // Password state
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showCurrent, setShowCurrent] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [passwordLoading, setPasswordLoading] = useState(false)

    const getInitials = (name: string) =>
        name.split(' ').slice(0, 2).map(w => w.charAt(0).toUpperCase()).join('')

    const col = avatarColor(user.id)

    const handlePhoneUpdate = async () => {
        if (!phone.trim()) {
            toast.error('Please enter a phone number')
            return
        }
        setPhoneLoading(true)
        try {
            const res = await fetch(`/api/account/update-phone`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone }),
            })
            const data = await res.json()
            if (res.ok) {
                toast.success('Phone number updated')
                setActiveSection(null)
            } else {
                toast.error(data.error ?? 'Failed to update phone number')
            }
        } catch {
            toast.error('Network error. Please try again.')
        } finally {
            setPhoneLoading(false)
        }
    }

    const handlePasswordUpdate = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error('Please fill in all fields')
            return
        }
        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match')
            return
        }
        if (newPassword.length < 8) {
            toast.error('Password must be at least 8 characters')
            return
        }
        setPasswordLoading(true)
        try {
            const res = await fetch(`/api/account/update-password`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            })
            const data = await res.json()
            if (res.ok) {
                toast.success('Password updated successfully')
                setCurrentPassword('')
                setNewPassword('')
                setConfirmPassword('')
                setActiveSection(null)
            } else {
                toast.error(data.error ?? 'Failed to update password')
            }
        } catch {
            toast.error('Network error. Please try again.')
        } finally {
            setPasswordLoading(false)
        }
    }

    const toggle = (section: ActiveSection) =>
        setActiveSection(prev => prev === section ? null : section)

    const inputClass = "w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg outline-none focus:border-zinc-400 bg-white transition-colors"

    return (
        <div className="max-w-md w-full mx-auto space-y-3 mt-8">

            {/* Profile card */}
            <div className="bg-white rounded-xl border border-black/5 overflow-hidden">
                <div className="h-20 bg-gradient-to-r from-zinc-900 to-zinc-700 relative">
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '16px 16px' }}
                    />
                </div>
                <div className="px-5 pb-5">
                    <div className="flex items-end justify-between -mt-10 mb-4">
                        <div
                            className="w-20 h-20 rounded-2xl border-4 border-white flex items-center justify-center text-2xl font-bold shadow-sm z-10"
                            style={{ background: col.bg, color: col.color }}
                        >
                            {getInitials(user.fullName || '')}
                        </div>
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-base font-semibold text-gray-900 leading-none">{user.fullName}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                </div>
            </div>

            {/* Joined */}
            <div className="rounded-xl border border-black/5 bg-white p-4 space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Joined on</p>
                <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    {fmtDate(user.createdAt)}
                </div>
            </div>

            {/* Account details */}
            <div className="bg-white rounded-xl border border-black/5 divide-y divide-border">
                {[
                    { label: 'Full name', value: user.fullName },
                    { label: 'Email', value: user.email },
                    { label: 'Phone Number', value: user.phoneNumber ?? '—' },
                ].map(row => (
                    <div key={row.label} className="flex items-center justify-between px-4 py-3">
                        <p className="text-[11px] uppercase tracking-widest text-muted-foreground w-28 flex-shrink-0">
                            {row.label}
                        </p>
                        <p className="text-sm text-gray-800 text-right truncate max-w-[200px]">
                            {row.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Update phone */}
            <div className="bg-white rounded-xl border border-black/5 overflow-hidden">
                <button
                    onClick={() => toggle('phone')}
                    className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-zinc-50 transition-colors"
                >
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Phone className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-medium text-zinc-800">Update phone number</p>
                            <p className="text-[11px] text-zinc-400">{user.phoneNumber ?? 'Not set'}</p>
                        </div>
                    </div>
                    <span className="text-xs text-zinc-400">{activeSection === 'phone' ? '✕' : 'Edit'}</span>
                </button>

                {activeSection === 'phone' && (
                    <div className="px-4 pb-4 space-y-3 border-t border-zinc-100 pt-3">
                        <input
                            type="tel"
                            placeholder="e.g. 0821234567"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            className={inputClass}
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => setActiveSection(null)}
                                className="flex-1 py-2 text-sm border border-zinc-200 rounded-lg text-zinc-600 hover:bg-zinc-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePhoneUpdate}
                                disabled={phoneLoading}
                                className="flex-1 py-2 text-sm bg-zinc-900 text-white rounded-lg hover:bg-zinc-700 disabled:opacity-50 transition-colors"
                            >
                                {phoneLoading ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Update password */}
            <div className="bg-white rounded-xl border border-black/5 overflow-hidden">
                <button
                    onClick={() => toggle('password')}
                    className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-zinc-50 transition-colors"
                >
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                            <Lock className="w-4 h-4 text-amber-600" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-medium text-zinc-800">Change password</p>
                            <p className="text-[11px] text-zinc-400">Update your account password</p>
                        </div>
                    </div>
                    <span className="text-xs text-zinc-400">{activeSection === 'password' ? '✕' : 'Edit'}</span>
                </button>

                {activeSection === 'password' && (
                    <div className="px-4 pb-4 space-y-3 border-t border-zinc-100 pt-3">

                        <div className="space-y-1">
                            <label className="text-[11px] text-zinc-500 uppercase tracking-wider">Current password</label>
                            <div className="relative">
                                <input
                                    type={showCurrent ? 'text' : 'password'}
                                    placeholder="Current password"
                                    value={currentPassword}
                                    onChange={e => setCurrentPassword(e.target.value)}
                                    className={inputClass + ' pr-9'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrent(p => !p)}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                                >
                                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] text-zinc-500 uppercase tracking-wider">New password</label>
                            <div className="relative">
                                <input
                                    type={showNew ? 'text' : 'password'}
                                    placeholder="Min. 8 characters"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    className={inputClass + ' pr-9'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNew(p => !p)}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                                >
                                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] text-zinc-500 uppercase tracking-wider">Confirm new password</label>
                            <div className="relative">
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    placeholder="Repeat new password"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    className={inputClass + ' pr-9'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(p => !p)}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                                >
                                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {newPassword.length > 0 && (
                            <div className="flex gap-1">
                                {[1, 2, 3, 4].map(i => (
                                    <div
                                        key={i}
                                        className={`h-1 flex-1 rounded-full transition-colors ${
                                            newPassword.length >= i * 3
                                                ? newPassword.length >= 10 ? 'bg-green-400' : 'bg-amber-400'
                                                : 'bg-zinc-200'
                                        }`}
                                    />
                                ))}
                            </div>
                        )}

                        <div className="flex gap-2 pt-1">
                            <button
                                onClick={() => {
                                    setActiveSection(null)
                                    setCurrentPassword('')
                                    setNewPassword('')
                                    setConfirmPassword('')
                                }}
                                className="flex-1 py-2 text-sm border border-zinc-200 rounded-lg text-zinc-600 hover:bg-zinc-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePasswordUpdate}
                                disabled={passwordLoading}
                                className="flex-1 py-2 text-sm bg-zinc-900 text-white rounded-lg hover:bg-zinc-700 disabled:opacity-50 transition-colors"
                            >
                                {passwordLoading ? 'Updating...' : 'Update'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2 px-1 pb-4">
                <Shield className="w-3.5 h-3.5 text-zinc-400 flex-none" />
                <p className="text-[11px] text-zinc-400">Your data is encrypted and stored securely</p>
            </div>

        </div>
    )
}

export default ManageUserAccountComponent