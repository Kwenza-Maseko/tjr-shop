import React, { ReactNode } from 'react'

const Layout = ({ children }: { children: ReactNode }) => {
    return (
        <main className='min-h-screen flex items-center flex-col justify-center '>
            <div className='rounded-md bg-white w-full md:w-[400px]'>
                <div className="flex flex-col gap-4 items-center">
                    {children}
                </div>
            </div>
        </main>
    )
}

export default Layout