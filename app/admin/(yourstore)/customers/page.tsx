'use client';

import React, { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { User } from '@/types';
import { getUsers } from '@/lib/auth/auth';
import { Calendar, Loader2, Users } from 'lucide-react';

const Customers = () => {
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<User[]>([]);

    // fetch users
    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            const result = await getUsers();
            if (result) setUsers(result);
            setLoading(false);
        };
        fetchUsers();
    }, []);

    // Get users created this month
    const thisMonthUsers = users.filter((user) => {
        if (!user.createdAt) return false;
        const created = new Date(user.createdAt);
        const now = new Date();
        return (
            created.getFullYear() === now.getFullYear() &&
            created.getMonth() === now.getMonth()
        );
    });

    // Calculate percentage
    const thisMonthPercent = users.length
        ? Math.round((thisMonthUsers.length / users.length) * 100)
        : 0;

    return (
        <div className='p-4 m-4 rounded text-gray-600'>
            {loading ? (
                <Loader2 className='w-4 h-4 animate-spin ' />
            ) : users.length > 0 ? (
                <div>
                    <div className="flex gap-4 mb-6">
                        <div className='p-8 rounded flex justify-between items-center gap-5 gradients-bg w-[250px] custom-light-shadow-box border'>
                            <div className="flex flex-col gap-2 h-full">
                                <p className='font-semibold'>Total Customers</p>
                                <p className='text-xl font-semibold'>{users.length}</p>
                            </div>
                            <Users className='w-7 h-7 text-gray-500' />
                        </div>

                         <div className='p-8 rounded flex justify-between items-center gap-5 gradients-bg w-[250px] custom-light-shadow-box border'>
                            <div className="flex flex-col gap-2 h-full">
                                <p className='font-semibold'>This Month</p>
                                <p className='text-xl font-semibold'>{thisMonthUsers.length}</p>

                                <div className="py-1 px-3 bg-green-200 border border-green-300/50 mt-2 rounded">
                                    <p className='text-xs text-green-700'>{thisMonthPercent}% of total</p>
                                </div>
                            </div>
                            <Calendar className='w-7 h-7 text-gray-500' />
                        </div>
                    </div>

                    <div className='bg-white p-6 rounded'>
                        <Table className='border rounded'>
                            <TableCaption>List of all customers</TableCaption>
                            <TableHeader className='bg-teal-50'>
                                <TableRow>
                                    <TableHead className='px-4'>Full Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Last Login</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-bold p-4">{user.fullName}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.phoneNumber ?? "-"}</TableCell>
                                        <TableCell>{user.role ?? "N/A"}</TableCell>
                                        <TableCell>
                                            {user.lastLogin
                                                ? new Date(user.lastLogin).toLocaleDateString()
                                                : "Never"}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                </div>
            ) : (
                <p className="text-sm text-gray-500">No customers found.</p>
            )}
        </div>
    );
};

export default Customers;
