'use client';
import React, { useState, useEffect } from 'react';
import { Bell, Search, ShoppingCart, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import Notifications from './Notifications';
import { ungrantedAccessAdmins } from '@/lib/adminDetails/users';
import { AdminParams } from '@/types';

const Navbar = () => {
  const pathname = usePathname();
  const [openNotifications, setOpenNotifications] = useState(false);
  const [admins, setAdmins] = useState<AdminParams[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAdmins = async () => {
      setLoading(true);
      const result = await ungrantedAccessAdmins();
      setLoading(false);

      if (result.success && result.data) {
        setAdmins(result.data);
      }
    };

    fetchAdmins();
  }, []);

  const hasUngranted = admins.length > 0;

  return (
    <div>
      <div className='py-2.5 px-4 backdrop-blur-md fixed top-0 left-0 md:left-[240px] w-full md:w-[calc(100%-240px)] z-40 border-b bg-zinc-50'>
        <div className="flex justify-between items-center gap-2">
          {/* Title */}
          <div className="font-bold text-gray-700 text-md w-full">
            Overview
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-2 bg-white px-2 rounded w-full custom-light-shadow-box">
            <Search className="w-4 h-4 text-gray-600" />
            <Input className="bg-white px-2 py-1 border-none outline-none shadow-none focus:outline-none focus:ring-0 w-[280px]" />
            <div className="text-xs p-1 my-2 bg-gray-200 rounded w-[40px] text-center">Ctrl K</div>
          </div>

          {/* Right buttons */}
          <div className="flex justify-end w-full">
            <div className="flex gap-3">

              {/* Cart */}
              <div className="rounded flex items-center gap-2 relative cursor-pointer px-2 py-1 bg-teal-500 text-white border border-teal-100">
                <ShoppingCart className="w-4 h-4" />
                <p>New Orders</p>

                <div className="w-2.5 h-2.5 bg-red-500 absolute left-3.5 top-1.5 rounded-full border-2 border-teal-500" />
              </div>

              {/* Notifications */}
              <div
                className="rounded flex items-center gap-2 relative cursor-pointer px-2 py-1 bg-teal-500 text-white border border-teal-100"
                onClick={() => setOpenNotifications(true)}

              >
                <Bell className="w-4 h-4" />

                <p>Notifications</p>
                {hasUngranted && (
                  <div className="w-2.5 h-2.5 bg-red-500 absolute left-3.5 top-1.5 rounded-full border-2 border-teal-500" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {openNotifications && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40"
            onClick={() => setOpenNotifications(false)}
          />

          <div
            className="fixed top-0 right-0 h-full w-80 bg-white shadow-lg z-50 transform animate-slideIn"
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-md font-semibold">Notifications</h2>
              <button onClick={() => setOpenNotifications(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              <Notifications
                admins={admins}
                setAdmins={setAdmins} // allow Notifications to update state
                loading={loading}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Navbar;
