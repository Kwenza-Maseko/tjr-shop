import ClientNavbar from '@/components/ClientNavbar';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { db } from '@/database/drizzle';
import { userTable } from '@/database/schema';
import { auth } from '@/userAuth';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react'

const Layout = async ({ children }: { children: ReactNode }) => {

    const session = await auth();

    if (!session?.user?.id) {
        redirect("/sign-in")
    }
    const [admin] = await db
        .select()
        .from(userTable)
        .where(eq(userTable.id, session.user.id))
        .limit(1)

    if (!admin) {
        redirect("/sign-in")
    }

    return (
        <div>
            <Navbar />
            <div className='pt-[40px]'>
                {children}
            </div>
        </div>
    )
}

export default Layout;