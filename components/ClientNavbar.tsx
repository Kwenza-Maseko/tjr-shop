'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { navitems } from '@/constants'
import { Session } from 'next-auth'
import { Bell, LogOut, ShoppingCart, ChevronRight } from 'lucide-react'
import { signOut } from 'next-auth/react'
import Notifications from './Notifications'

interface SidebarProps {
    session: Session | null
    productTypes: Record<string, string[]> | null
}

interface GroupedTypes {
    [targetCategory: string]: string[]
}

const DESKTOP_NAV = [
    {
        target: 'men',
        categories: ['Clothing', 'Shoes', 'Brand'],
    },
    {
        target: 'women',
        categories: ['Clothing', 'Shoes', 'Brand'],
    },
    {
        target: 'kids',
        categories: ['Clothing', 'Shoes', 'Kids By Age', 'Brand'],
    },
    {
        target: 'sport',
        categories: ['Running', 'Football', 'Training & Gym'],
    },
]

const ClientNavbar = ({ session, productTypes }: SidebarProps) => {
    const typeMap: GroupedTypes = productTypes ?? {}

    const getInitials = (name: string) =>
        name.split(' ').slice(0, 2).map(w => w.charAt(0).toUpperCase()).join('')

    const [dropdown, setDropdown] = useState(false)
    const [menuDropdown, setMenuDropdown] = useState(false)
    const [level, setLevel] = useState(1)
    const [selectedItem, setSelectedItem] = useState<any>(null)
    const [selectedSub, setSelectedSub] = useState<any>(null)
    const [isNotificationOpen, setIsNotificationOpen] = useState(false)
    const [hoveredTarget, setHoveredTarget] = useState<string | null>(null)

    const goBack = () => {
        if (level === 3) { setLevel(2); setSelectedSub(null) }
        else if (level === 2) { setLevel(1); setSelectedItem(null) }
        else { setMenuDropdown(false) }
    }

    const toSlug = (str: string) =>
        str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    return (
        <nav className='bg-white p-3 md:px-6 md:py-0 fixed top-0 left-0 right-0 z-50 border-b border-zinc-200'>
            <div className='flex gap-3 justify-between items-center'>
                <Link href="/">
                    <p className='font-black text-lg'>TJR.<span className='text-xs text-purple-600'>ONLINE</span></p>
                </Link>

                {/* ── Desktop nav ── */}
                <ul className="hidden md:flex items-center">
                    {DESKTOP_NAV.map(({ target, categories }) => (
                        <li
                            key={target}
                            className="relative"
                            onMouseEnter={() => setHoveredTarget(target)}
                            onMouseLeave={() => setHoveredTarget(null)}
                        >
                            {/* Top level label */}
                            <Link
                                href={`/store/${target}/all`}
                                className="px-5 py-5 text-sm font-medium capitalize text-zinc-500 hover:text-black transition-colors md:block hidden"
                            >
                                {target}
                            </Link>

                            {/* Mega dropdown */}
                            {hoveredTarget === target && (
                                <div className="absolute top-full left-0 z-50 w-[600px]">
                                    <div className="bg-white border border-zinc-200 shadow-lg p-5 grid grid-cols-3 gap-6">
                                        {categories.map(cat => {
                                            // DB key format: "men__Clothing"
                                            const key = `${target}__${cat}`
                                            const items = typeMap[key] ?? []

                                            return (
                                                <div key={cat}>
                                                    {/* Category heading */}
                                                    <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 mb-2">
                                                        {cat}
                                                    </p>

                                                    {/* All link */}
                                                    <Link
                                                        href={`/store/${target}/${toSlug(cat)}/all`}
                                                        className="block text-sm text-zinc-800 hover:text-black font-medium py-1 hover:underline"
                                                    >
                                                        All {cat}
                                                    </Link>

                                                    {/* Product types from DB */}
                                                    {items.length > 0 ? (
                                                        items.map(type => (
                                                            <Link
                                                                key={type}
                                                                href={`/store/${target}/${toSlug(cat)}/${toSlug(type)}`}
                                                                className="block text-xs text-zinc-500 hover:text-black py-1 hover:underline"
                                                            >
                                                                {type}
                                                            </Link>
                                                        ))
                                                    ) : (
                                                        <p className="text-xs text-zinc-300 py-1">No items</p>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>

                {/* ── Right icons ── */}
                <div className="flex gap-3 items-center">
                    {session?.user && (
                        <div className="flex items-center gap-3 relative">
                            <Link href="/cart">
                                <ShoppingCart className="w-6 h-6" />
                            </Link>
                            <Bell
                                className="w-6 h-6 cursor-pointer"
                                onClick={() => setIsNotificationOpen(p => !p)}
                            />
                            <div
                                className="w-[30px] h-[30px] rounded-full flex items-center justify-center bg-gray-300 border border-gray-500 text-xs font-bold cursor-pointer"
                                onClick={() => setDropdown(p => !p)}
                            >
                                {getInitials(session.user.name || '')}
                            </div>

                            {dropdown && (
                                <div className="absolute right-4 top-10 w-60 truncate bg-white z-50 space-y-4 custom-light-shadow-box p-1">
                                    <div className="p-3 text-gray-600 rounded bg-zinc-100">{session.user.name}</div>
                                    <div className='flex flex-col gap-4'>
                                        <Link href={`/account/${session.user.id}/track`} className='px-3'>Track Order</Link>
                                        <Link href={`/account/${session.user.id}/manage-account`} className='px-3'>Manage Account</Link>
                                    </div>
                                    <div className="border-t p-3 flex gap-2 text-red-600 cursor-pointer" onClick={() => signOut()}>
                                        <LogOut className='w-4 h-4' />
                                        <p>Logout</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Mobile hamburger */}
                    <div
                        className="space-y-1.5 w-6 cursor-pointer md:hidden"
                        onClick={() => setMenuDropdown(p => !p)}
                    >
                        <div className='w-full h-0.5 bg-zinc-600' />
                        <div className='w-full h-0.5 bg-zinc-600' />
                        <div className='w-full h-0.5 bg-zinc-600' />
                    </div>
                </div>
            </div>

            {/* ── Mobile menu ── */}
            {menuDropdown && (
                <div className="md:hidden fixed top-0 bottom-0 right-0 left-0 z-[100] bg-black/70">
                    <div className="p-3 bg-white w-72 h-full overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <button
                                onClick={goBack}
                                className="text-gray-700 font-bold px-2 py-1 bg-zinc-100 rounded"
                            >
                                {level > 1 ? 'Back' : '✕'}
                            </button>
                            <span className="font-bold text-gray-800 capitalize">
                                {level === 1 && 'Menu'}
                                {level === 2 && selectedItem?.target}
                                {level === 3 && selectedSub}
                            </span>
                        </div>

                        {/* Level 1 — targets */}
                        {level === 1 && (
                            <ul className="space-y-6">
                                {DESKTOP_NAV.map(item => (
                                    <li key={item.target}>
                                        <button
                                            className="text-gray-800 font-bold text-[12pt] w-full text-left capitalize flex justify-between items-center"
                                            onClick={() => { setSelectedItem(item); setLevel(2) }}
                                        >
                                            {item.target}
                                            <ChevronRight className="w-4 h-4 text-zinc-400" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* Level 2 — categories for selected target */}
                        {level === 2 && selectedItem && (
                            <ul className="space-y-6">
                                {selectedItem.categories.map((cat: string) => (
                                    <li key={cat}>
                                        <button
                                            className="text-gray-800 font-bold text-[12pt] w-full text-left flex justify-between items-center"
                                            onClick={() => { setSelectedSub(cat); setLevel(3) }}
                                        >
                                            {cat}
                                            <ChevronRight className="w-4 h-4 text-zinc-400" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* Level 3 — product types from DB */}
                        {level === 3 && selectedItem && selectedSub && (
                            <ul className="space-y-4">
                                <li>
                                    <Link
                                        href={`/store/${selectedItem.target}/${toSlug(selectedSub)}/all`}
                                        className="text-gray-800 font-bold text-[12pt]"
                                        onClick={() => setMenuDropdown(false)}
                                    >
                                        All {selectedSub}
                                    </Link>
                                </li>
                                {(typeMap[`${selectedItem.target}__${selectedSub}`] ?? []).map(type => (
                                    <li key={type}>
                                        <Link
                                            href={`/store/${selectedItem.target}/${toSlug(selectedSub)}/${toSlug(type)}`}
                                            className="text-gray-600 font-medium text-[11pt]"
                                            onClick={() => setMenuDropdown(false)}
                                        >
                                            {type}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}

            {isNotificationOpen && (
                <div
                    className='absolute bg-black/70 left-0 right-0 top-0 bottom-0 h-screen flex justify-end'
                    onClick={() => setIsNotificationOpen(false)}
                >
                    <div className="h-full w-full md:w-96 bg-white p-4">
                        <p className='text-lg text-end cursor-pointer' onClick={() => setIsNotificationOpen(false)}>✕</p>
                        <Notifications />
                    </div>
                </div>
            )}
        </nav>
    )
}

export default ClientNavbar