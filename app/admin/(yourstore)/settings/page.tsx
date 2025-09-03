'use client'
import React, { useState } from 'react'
import { storeSideBar } from '@/constants'
import Banner from '@/components/Shop/Banner'
import StoreHeadline from '@/components/Shop/StoreHeadline'
import ProductDetails from '@/components/Shop/ProductDetails'
import ContactDetails from '@/components/Shop/ContactDetails'
import WorkingHours from '@/components/Shop/WorkingHours'

const StoreSideBar = () => {
    const [selected, setSelected] = useState('banner')

    return (
        <div className="flex min-h-screen relative">
            <div className="border-r-2 border-gray-200 w-[210px] flex flex-col gap-3 p-4 pt-6">
                {storeSideBar.map((item) => (
                    <div
                        key={item.name}
                        onClick={() => setSelected(item.name)}
                        className={`capitalize cursor-pointer px-2 py-1 rounded flex gap-2 items-center ${selected === item.name ? ' text-teal-500 font-semibold' : 'text-gray-600'
                            }`}
                    >

                        {selected === item.name && (
                            <div className="flex flex-col gap-0.5 w-3 items-center">
                                <div className={`h-[1px] w-full bg-teal-500 `} />
                                <div className='h-[1px] w-full bg-teal-500' />
                                <div className='h-[1px] w-full bg-teal-500' />
                            </div>
                        )}
                        {item.name}
                    </div>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6">
                <div className="w-full">
                    {selected === 'banner' && <Banner />}
                    {selected === 'store headline' && <StoreHeadline />}
                    {selected === 'product details' && <ProductDetails />}
                    {selected === 'store contact details' && <ContactDetails />}
                    {selected === 'working hours' && <WorkingHours />}
                </div>
            </div>
        </div>
    )
}

export default StoreSideBar
