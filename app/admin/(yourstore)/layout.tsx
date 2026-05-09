import { auth } from '@/adminAuth'
import Sidebar from '@/components/Shop/Sidebar';
import { ReactNode } from 'react'
import { redirect } from "next/navigation";
import Navbar from '@/components/Shop/Navbar';
import { db } from '@/database/drizzle';
import { adminTable } from '@/database/schema';
import { eq } from 'drizzle-orm';

type SidebarUser = {
    id: string;
    name?: string | null;
    email?: string | null;
    adminRole: "ADMIN" | "SUPER ADMIN" | null;
};
const Layout = async ({ children }: { children: ReactNode }) => {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/admin/sign-in")
    }

    const [admin] = await db
        .select()
        .from(adminTable)
        .where(eq(adminTable.id, session.user.id))
        .limit(1);

    if (!admin) {
        redirect("/admin/sign-in")
    }

    if (admin.accessGranted !== "GRANTED") {
        redirect("/admin/waiting-for-access")
    }

    const sidebarUser: SidebarUser = {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        adminRole: admin.adminRole,
    };

    return (
        <div className="flex">
            <Sidebar user={sidebarUser} />
            <div className="flex-1 md:ml-[240px]">
                <div className="">
                    <Navbar adminRole={admin.adminRole} />
                </div>
                <div className="pt-[60px]">
                    {children}
                </div>
            </div>
        </div>
    )
}

export default Layout