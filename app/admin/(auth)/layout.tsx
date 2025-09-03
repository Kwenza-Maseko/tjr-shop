import Image from 'next/image'
import React, { ReactNode } from 'react'

const Layout = ({ children }: { children: ReactNode }) => {
    return (
        <main className='flex'>
            <div className='bg-black w-[500px] min-h-screen hidden md:block'>

            </div>

            <div className="flex items-center justify-center w-full">
                <div className='rounded-md p-6 bg-white w-full md:w-[400px]'>
                    <div className="flex flex-col gap-4 items-center">
                        {children}
                    </div>
                </div>
            </div>
        </main>
    )
}

export default Layout