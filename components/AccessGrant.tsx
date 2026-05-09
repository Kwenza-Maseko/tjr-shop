'use client';
import React, { useState } from 'react';
import { AdminParams } from '@/types';
import { Loader2 } from 'lucide-react';
import { UpdateAdmin } from '@/lib/adminDetails/users';
import { toast } from 'sonner';

interface AccessGrantProps {
    admin: AdminParams;
    onGranted: (id: string) => void;
}

const AccessGrant: React.FC<AccessGrantProps> = ({ admin, onGranted }) => {
    const [loading, setLoading] = useState(false);

    const grantAccess = async () => {
        setLoading(true);
        const update = await UpdateAdmin(admin.id);
        setLoading(false);
        if (update.success) {
            toast(`${admin.fullName} have been granted access as to Admin Panel`)
        }
        else {

            toast(`Failed to grant ${admin.fullName} access`)
        }
    };

    return (
        <div>
            <p>
                Grant access to <strong>{admin.fullName}</strong>?
            </p>
            <button
                onClick={grantAccess}
                disabled={loading}
                className="bg-blue-500 text-white px-2 py-1 rounded-full mt-4"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Grant Access'}
            </button>
        </div>
    );
};

export default AccessGrant;
