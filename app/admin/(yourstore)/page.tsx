import { auth } from '@/adminAuth'
import OrderChart from '@/components/Shop/OrderChart';
import SalesChart from '@/components/Shop/SalesChart';
import VisitedUsersChart from '@/components/Shop/VisitedUsersChart';
import { redirect } from 'next/navigation';
import React from 'react'

const Overview = async () => {

    return (
        <div className='p-4 space-y-8'>
            <div className="flex gap-4 flex-wrap">
                <div className="flex w-[370px] flex-col gap-5 custom-light-shadow-box gradients-bg p-5 rounded">
                    <p className='text-[13px] font-bold text-gray-600 truncate'>Total Revenue</p>
                    <p className='text-xs text-gray-400 truncate'>0</p>
                </div>

                <div className="flex w-[370px] flex-col gap-5 custom-light-shadow-box gradients-bg-yellow p-5 rounded">
                    <p className='text-[13px] font-bold text-gray-600 truncate'>Total Orders</p>
                    <p className='text-xs text-gray-400 truncate'>0</p>
                </div>

                <div className="flex w-[370px] flex-col gap-5 custom-light-shadow-box gradients-bg-purple p-5 rounded">
                    <p className='text-[13px] font-bold text-gray-600 truncate'>Total Customers</p>
                    <p className='text-xs text-gray-400 truncate'>0</p>
                </div>

                <div className="flex w-[370px] flex-col gap-5 custom-light-shadow-box gradients-bg-light-yellow p-5 rounded">
                    <p className='text-[13px] font-bold text-gray-600 truncate'>Products Sold</p>
                    <p className='text-xs text-gray-400 truncate'>0</p>
                </div>

                <div className="flex w-[370px] flex-col gap-5 custom-light-shadow-box gradients-bg-red p-5 rounded">
                    <p className='text-[13px] font-bold text-gray-600 truncate'>Refunds / Returns</p>
                    <p className='text-xs text-gray-400 truncate'>0</p>
                </div>

                <div className="flex w-[370px] flex-col gap-5 custom-light-shadow-box gradients-bg-green p-5 rounded">
                    <p className='text-[13px] font-bold text-gray-600 truncate'>Average Order Value (AOV)</p>
                    <p className='text-xs text-gray-400 truncate'>0</p>
                </div>
            </div>


            <VisitedUsersChart />

            <div className="flex md:flex-row flex-col gap-8">
                <div className="w-full">
                    <OrderChart />
                </div>
                <div className="w-full">
                    <SalesChart />
                </div>
            </div>
        </div>
    )
}

export default Overview