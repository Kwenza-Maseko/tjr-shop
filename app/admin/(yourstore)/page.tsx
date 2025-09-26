import { auth } from '@/adminAuth'
import { redirect } from 'next/navigation';
import React from 'react'

const Overview = async () => {
    const session = await auth();
    if (!session) {
        redirect("/admin/sign-in");
    }
    return (
        <div className='p-4'>
            <div className="flex gap-4 ">
                <div className="flex flex-col gap-5 custom-light-shadow-box gradients-bg p-5 rounded w-[300px]">
                    <p className='text-xl font-bold text-gray-600 truncate'>{session.user?.name}</p>
                    <p className='text-xs text-gray-400 truncate'>{session.user?.email}</p>
                </div>
            </div>
        </div>
    )
}

export default Overview