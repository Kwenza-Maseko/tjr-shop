
import Navbar from '@/components/Navbar';
import { CartProvider } from '@/components/providers/CartProvider';
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

    let admin;
    try {
        const [result] = await db
            .select({ id: userTable.id, role: userTable.role })
            .from(userTable)
            .where(eq(userTable.id, session.user.id))
            .limit(1)
        admin = result
    } catch (error) {
        redirect("/sign-in")
    }

    if (!admin) {
        redirect("/sign-in")
    }

    return (
        <div>
            <CartProvider>
                <Navbar />
                <div className='pt-[40px]'>
                    {children}
                </div>
            </CartProvider>
        </div>
    )
}

export default Layout;