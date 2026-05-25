import React, { ReactNode } from 'react'
import Image from "next/image"
const Layout = ({ children }: { children: ReactNode }) => {
    return (
        <main className='min-h-screen flex items-center flex-col justify-center '>
            <div className='rounded-md bg-white w-full md:w-[400px]'>
                <div className="flex flex-col gap-4 items-center pb-8">
                    <Image
                        src={"/assets/tjr-logo.png"}
                        width={90}
                        height={90}
                        alt='logo'
                    />
                    {children}
                </div>
            </div>
        </main>
    )
}

export default Layout