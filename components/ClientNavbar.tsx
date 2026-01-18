'use client'
import React, { useState } from 'react'
import Image from "next/image"
import Link from 'next/link'
import { navitems } from '@/constants'
import { Session } from 'next-auth';
import { Bell, LogOut, ShoppingCart } from 'lucide-react'
import { signOut } from 'next-auth/react'

interface SidebarProps {
    session: Session | null;
}

const ClientNavbar = ({ session }: SidebarProps) => {

    const getInitials = (name: string) => {
        const words = name.split(' ').slice(0, 2)
        return words.map((word) => word.charAt(0).toUpperCase()).join('')
    }

    const [dropdown, setDropdown] = useState(false);
    const [menuDropdown, setMenuDropdown] = useState(false);
    const [level, setLevel] = useState(1); // 1=main, 2=sub, 3=subsub
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [selectedSub, setSelectedSub] = useState<any>(null);

    const goBack = () => {
        if (level === 3) {
            setLevel(2);
            setSelectedSub(null);
        } else if (level === 2) {
            setLevel(1);
            setSelectedItem(null);
        } else {
            setMenuDropdown(false);
        }
    };

    return (
        <nav className='bg-white p-3 md:px-6 fixed top-0 left-0 right-0 z-50 border-b border-zinc-200'>
            <div className='flex gap-3 justify-between items-center'>
                <Link href={"/"}>
                    <p className='font-black text-lg'>TJR.<span className='text-xs text-purple-600'>ONLINE</span></p>
                </Link>

                <ul className=" space-x-8 hidden md:flex">
                    {navitems.map((item) => (
                        <li key={item.name} className="relative group">
                            <button className="text-gray-800 hover:text-gray-600 font-bold cursor-pointer text-[11pt]">
                                {item.name}
                            </button>
                            {/* 1st level dropdown */}
                            {item.subItems && (
                                <ul className="fixed left-0 right-0 bg-white opacity-0 group-hover:opacity-100 invisible group-hover:visible p-6 flex gap-10 justify-center">
                                    {item.subItems.map((sub) => (
                                        <li key={sub.name} className="relative group/subitem  font-bold text-[11pt]">
                                            {sub.name}
                                            {/* 2nd level dropdown (if subSubItems exist) */}
                                            {sub.subSubItems && (
                                                <ul className="w-full space-y-2 mt-3 text-[10pt] font-bold">

                                                    {sub.subSubItems.map((subsub) => {
                                                        const parentSlug = sub.name.toLowerCase().replace(/\s+/g, "-");
                                                        const subSlug = subsub.toLowerCase().replace(/\s+/g, "-");
                                                        const href = `/${sub.url}/${parentSlug}/${subSlug}`;

                                                        return (
                                                            <li key={subsub} className="text-gray-600 hover:text-gray-400 cursor-pointer font-medium">
                                                                <a href={href}>{subsub}</a>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>


                <div className="flex gap-3 items-center">
                    {session?.user && (
                        <div className="flex items-center gap-3 relative">
                            <Link href={"/cart"}>
                                <ShoppingCart className="w-6 h-6" />
                            </Link>
                            <Bell className="w-6 h-6" />
                            <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center bg-gray-300 border border-gray-500 text-xs font-bold cursor-pointer"
                                onClick={() => {
                                    setDropdown((prev) => !prev);
                                }}
                            >
                                <p>{getInitials(session.user.name || '')}</p>
                            </div>

                            {dropdown && (
                                <div className="absolute right-4 top-10 w-60 truncate bg-white z-50 space-y-4 custom-light-shadow-box p-1" >
                                    <div className="p-3 text-gray-600 rounded bg-zinc-100">{session.user.name}</div>
                                    <div className='flex flex-col gap-4'>
                                        <Link
                                            href={`/${session.user.id}/track`}
                                            className='px-3'>
                                            Track Order
                                        </Link>
                                        <Link
                                            href={`/${session.user.id}/account`}
                                            className='px-3'>
                                            Manage Account
                                        </Link>
                                    </div>

                                    <div className="border-t p-3 flex gap-2 text-red-600 cursor-pointer mt-4"
                                        onClick={() => signOut()}>
                                        <LogOut className='w-4 h-4' />
                                        <p>Logout</p>
                                    </div>
                                </div>
                            )}

                        </div>


                    )}

                    <div className="space-y-1.5 w-6 cursor-pointer md:hidden"
                        onClick={() => setMenuDropdown(prev => !prev)}
                    >
                        <div className='w-full h-0.5 bg-zinc-600' />
                        <div className='w-full h-0.5 bg-zinc-600' />
                        <div className='w-full h-0.5 bg-zinc-600' />
                    </div>
                </div>
            </div>


            {menuDropdown && (
                <div className="md:hidden fixed top-0 bottom-0 right-0 left-0 z-[100] bg-black/70"

                >
                    <div className="p-3 bg-white w-72 h-full">
                        {/* Top Bar with Close/Back */}
                        <div className="flex justify-between items-center mb-6">
                            <button
                                onClick={goBack}
                                className="text-gray-700 font-bold cursor-pointer px-2 py-1 bg-zinc-100 rounded"
                            >
                                {level > 1 ? "Back" : "x"}
                            </button>
                            <span className="font-bold text-gray-800">
                                {level === 1 && "Menu"}
                                {level === 2 && selectedItem?.name}
                                {level === 3 && selectedSub?.name}
                            </span>
                        </div>

                        {/* LEVEL 1: Main nav */}
                        {level === 1 && (
                            <ul className="space-y-6">
                                {navitems.map((item) => (
                                    <li key={item.name}>
                                        <button
                                            className="text-gray-800 hover:text-gray-600 font-bold cursor-pointer text-[12pt] w-full text-left"
                                            onClick={() => {
                                                if (item.subItems) {
                                                    setSelectedItem(item);
                                                    setLevel(2);
                                                }
                                            }}
                                        >
                                            {item.name}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* LEVEL 2: SubItems */}
                        {level === 2 && selectedItem?.subItems && (
                            <ul className="space-y-6">
                                {selectedItem.subItems.map((sub: any) => (
                                    <li key={sub.name}>
                                        <button
                                            className="text-gray-800 hover:text-gray-600 font-bold cursor-pointer text-[12pt] w-full text-left"
                                            onClick={() => {
                                                if (sub.subSubItems) {
                                                    setSelectedSub(sub);
                                                    setLevel(3);
                                                }
                                            }}
                                        >
                                            {sub.name}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* LEVEL 3: SubSubItems */}
                        {level === 3 && selectedSub?.subSubItems && (
                            <ul className="space-y-4">
                                {selectedSub.subSubItems.map((subsub: string) => {
                                    const itemSlug = selectedItem.name.toLowerCase().replace(/\s+/g, "-");
                                    const parentSlug = selectedSub.name.toLowerCase().replace(/\s+/g, "-");
                                    const subSlug = subsub.toLowerCase().replace(/\s+/g, "-");

                                    const href = `/${itemSlug}/${parentSlug}/${subSlug}`;

                                    return (
                                        <li
                                            key={subsub}
                                            className="text-gray-800 hover:text-gray-600 font-bold cursor-pointer text-[12pt] w-full text-left"
                                        >
                                            <a href={href}>{subsub}</a>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>
            )}


        </nav>
    )
}

export default ClientNavbar