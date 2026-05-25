'use client';
import React, { useState, useEffect } from 'react';
import { Bell, Crown, Shield, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Notifications from './Notifications';
import { ungrantedAccessAdmins } from '@/lib/adminDetails/users';
import { AdminParams } from '@/types';


type AdminRole = "ADMIN" | "SUPER ADMIN" | null;

const Navbar = ({ adminRole }: { adminRole: AdminRole }) => {
  const pathname = usePathname();
  const [openNotifications, setOpenNotifications] = useState(false);
  const [admins, setAdmins] = useState<AdminParams[]>([]);
  const [loading, setLoading] = useState(false);
  const role = adminRole; // now it's "ADMIN" | "SUPERADMIN"

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

  const label =
    pathname === "/admin"
      ? "Dashboard"
      : pathname
        .replace("/admin", "")
        .split("/")
        .filter(Boolean)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" / ");

  const isSuperAdmin = adminRole === 'SUPER ADMIN'

  return (
    <div>
      <div className='py-2 px-4 backdrop-blur-md fixed top-0 left-0 md:left-[240px] w-full md:w-[calc(100%-240px)] z-40 border-b bg-zinc-50'>
        <div className="flex justify-between items-center gap-2">
          {/* Title */}
          <div className="font-bold text-md w-full">
            <p className='tracking-wide uppercase mb-1'>{label}</p>
            <div className={`flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full border w-fit
              ${isSuperAdmin
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-green-50 text-green-600 border-green-200'}`}>
              {isSuperAdmin
                ? <Crown className="w-3 h-3" />
                : <Shield className="w-3 h-3" />}
              {role ?? 'Admin'}
            </div>
          </div>

          {/* Right buttons */}
          {role == "SUPER ADMIN" && (
            <div className="flex justify-end w-full">
              <div className="flex gap-3">
                {/* Notifications */}
                <div
                  className="rounded-full flex items-center gap-2 relative cursor-pointer px-3 py-1.5 bg-black text-white"
                  onClick={() => setOpenNotifications(true)}

                >
                  <Bell className="w-4 h-4" />

                  <p>Notifications</p>
                  {hasUngranted && (
                    <div className="w-3 h-3 bg-red-500 absolute right-1 -top-1.5 rounded-full border border-white" />
                  )}
                </div>
              </div>
            </div>
          )}

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
              <h2 className="text-md font-medium tracking-widest uppercase">Notifications</h2>
              <button onClick={() => setOpenNotifications(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              <Notifications
                admins={admins}
                setAdmins={setAdmins}
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
