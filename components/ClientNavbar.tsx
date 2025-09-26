import React from 'react'
import Image from "next/image"
import Link from 'next/link'
const ClientNavbar = () => {
    return (
        <nav className='bg-white p-3 md:px-6 fixed top-0 left-0 right-0 z-50 border-b border-zinc-200'>
            <div className='flex gap-3 justify-between'>
                <Link href={"/"}>
                    <Image
                        src={"/assets/digitalmove-logo.png"}
                        width={35}
                        height={35}
                        alt='logo'
                        className='invert'
                    />
                </Link>

            </div>
        </nav>
    )
}

export default ClientNavbar