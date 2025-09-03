import { auth } from '@/adminAuth'
import Sidebar from '@/components/Shop/Sidebar';
import { ReactNode } from 'react'
import { redirect } from "next/navigation";
import Navbar from '@/components/Shop/Navbar';

const Layout = async ({ children }: { children: ReactNode }) => {
    const session = await auth();

    if (!session) {
        redirect("/admin/sign-in"); // redirect to login if not authorized
    }
    return (
        <div className="flex">
            <Sidebar session={session} />
            <div className="flex-1 md:ml-[240px]">
                <div className="">
                    <Navbar />
                </div>
                <div className="pt-[60px]">
                    {children}
                </div>
            </div>
        </div>

    )
}

export default Layout