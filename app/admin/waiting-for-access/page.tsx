import Link from 'next/link'
import React from 'react'

const WaitingForAccess = () => {
    return (
        <div className='min-h-screen flex justify-center items-center p-4'>
            <div className='w-full md:w-[500px] text-center'>
                <p className="text-lg md:text-xl font-black text-center capitalize text-gray-600">
                    We have sent a request to your super admin for giving you access to the panel. you can not access the panel until you are granted access!
                </p>

                <div className="mt-8 flex gap-1 justify-center">
                    <p>Once you have been granted access</p>
                    <Link
                        href={"/admin/sign-in"}
                        className='text-gray-600 underline'
                    >
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default WaitingForAccess