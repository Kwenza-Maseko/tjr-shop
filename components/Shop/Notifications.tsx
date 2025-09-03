'use client';
import React, { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { AdminParams } from '@/types';
import { toast } from 'sonner';
import AccessGrant from '../AccessGrant';

interface NotificationsProps {
  admins: AdminParams[];
  setAdmins: React.Dispatch<React.SetStateAction<AdminParams[]>>;
  loading: boolean;
}

const Notifications: React.FC<NotificationsProps> = ({ admins, setAdmins, loading }) => {
  const [openGrantPanel, setOpenGrantPanel] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminParams | null>(null);

  const handleOpenGrant = (admin: AdminParams) => {
    setSelectedAdmin(admin);
    setOpenGrantPanel(true);
  };

  return (
    <div>
      {loading ? (
        <Loader2 className='w-4 h-4 animate-spin' />
      ) : admins.length > 0 ? (
        <ul className='space-y-4'>
          {admins.map((admin) => (
            <li key={admin.id} className="flex gap-2 items-center">
              <span>{admin.fullName} -</span>
              <div className="bg-red-50 text-red-500 p-1 rounded">
                Request Access
              </div>
              <button
                className="ml-auto text-blue-500"
                onClick={() => handleOpenGrant(admin)}
              >
                Review
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No ungranted admin found 🎉</p>
      )}

      {openGrantPanel && selectedAdmin && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40"
            onClick={() => setOpenGrantPanel(false)}
          />
          <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-lg z-50 transform animate-slideIn">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-md font-semibold">Grant Access</h2>
              <button onClick={() => setOpenGrantPanel(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              <AccessGrant
                admin={selectedAdmin}
                onGranted={(id: string) => {
                  setAdmins((prev) => prev.filter((a) => a.id !== id));
                  setOpenGrantPanel(false);
                  toast.success('Access granted');
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Notifications;
