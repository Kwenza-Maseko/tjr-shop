import ClientNavbar from '@/components/ClientNavbar';
import Footer from '@/components/Footer';
import { auth } from '@/userAuth';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react'

const Layout = async ({ children }: { children: ReactNode }) => {

    const session = await auth();
    if (!session) redirect("/sign-in");

    return (
        <div>
            <ClientNavbar session={session} />
            <div className='pt-[40px]'>
                {children}
            </div>
        </div>
    )
}

export default Layout;