import React, { ReactNode } from 'react'
import Image from "next/image"
const Layout = ({ children }: { children: ReactNode }) => {
    return (
        <main className='min-h-screen flex items-center flex-col justify-center p-4'>
            <div className='rounded-md p-6 bg-white w-full md:w-[400px]'>
                <div className="flex flex-col gap-4 items-center">
                    <Image
                        src={"/assets/digitalmove-logo.png"}
                        width={80}
                        height={67}
                        alt='digitalmove-logo'
                        className="invert"
                    />
                    {children}
                </div>
            </div>
        </main>
    )
}

export default Layout