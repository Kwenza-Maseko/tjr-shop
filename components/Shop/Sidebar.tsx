'use client'

import { Session } from 'next-auth'
import React, { useState } from 'react'
import { usePathname } from 'next/navigation'
import { YourStoreNavLinks } from '@/constants'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ChevronDown, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'
import Image from 'next/image'


type SidebarProps = {
    user: {
        id: string;
        name?: string | null;
        email?: string | null;
        adminRole: "ADMIN" | "SUPER ADMIN" | null;
    };
};

const Sidebar = ({ user }: SidebarProps) => {
    const pathname = usePathname();
    const [isOpened, setIsOpened] = useState(false);

    const getInitials = (name: string) => {
        const words = name.split(' ').slice(0, 2)
        return words.map((word) => word.charAt(0).toUpperCase()).join('')
    }
    const filteredLinks = YourStoreNavLinks.filter((item) => {
        if (user.adminRole === "ADMIN") {
            return item.role === "ADMIN";
        }

        return true;
    });
    return (
        <div className="fixed left-0 top-0 h-dvh w-60 bg-zinc-50 text-white border-r flex flex-col z-30">
            {/* Store Info */}
            <div className="py-3 px-4 border-b">
                <div className="flex gap-3 items-center ">
                    <Image
                        src={"/assets/digitalmove-logo.png"}
                        width={35}
                        height={35}
                        alt='digitalmove-logo'
                        className="invert"
                    />
                    <div className='w-34'>
                        <h2 className="text-md text-black font-bold truncate">TJR Shop</h2>
                        <p className='text-gray-600 text-xs truncate'>Durban Runner</p>
                    </div>
                </div>
            </div>

            {/* Nav Links */}
            <div className="flex-1 overflow-y-auto px-4 space-y text-sm py-8">
                {filteredLinks.map((item) => {
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.urlName}
                            href={item.path}
                            aria-current={pathname.startsWith(item.path) ? "page" : undefined}
                            className={cn(
                                "flex items-center gap-2 mb-1 capitalize transition-colors p-2 rounded-md w-full",
                                pathname === item.path
                                    ? "bg-black font-bold text-white"
                                    : "text-black hover:text-gray-500"
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            {item.urlName}
                        </Link>
                    );
                })}
            </div>

            {/* Current User */}
            <div className="p-4 border-t relative">
                <div className="flex items-center gap-3 py-2 px-3 bg-white backdrop-blur-sm custom-shadow-box rounded-md">
                    <div className="w-[30px] h-[30px] rounded-md flex items-center justify-center bg-black text-[10px] font-bold cursor-pointer"
                        onClick={() => (setIsOpened(prev => !prev))}>
                        <p>{getInitials(user.name || '')}</p>
                    </div>
                    <div className="w-[130px] truncate text-sm text-gray-600">
                        {user.name}
                    </div>
                    <LogOut
                        size={18}
                        className="text-red-600 cursor-pointer w-4 h-4"
                        onClick={() => signOut()}
                    />
                </div>

                {isOpened && (
                    <div className="absolute -top-26 left-0 right-0 bg-white text-black space-y-3 p-4 rounded-md border">
                        <div className='bg-zinc-100 rounded p-2'>
                            <Link href={"/admin/manage-account"}
                                onClick={() => setIsOpened(false)}>My Account</Link>
                        </div>

                        <div className="flex gap-3 items-center justify-between border-t pt-2 cursor-pointer"
                            onClick={() => signOut()}>
                            <p>Logout</p>
                            <LogOut
                                size={18}
                                className="text-red-600  w-4 h-4"
                            />
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};

export default Sidebar;