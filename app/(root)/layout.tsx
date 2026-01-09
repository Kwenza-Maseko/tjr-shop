import ClientNavbar from '@/components/ClientNavbar';
import { auth } from '@/userAuth';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react'

const Layout = async ({ children }: { children: ReactNode }) => {

    const session = await auth();
    if (!session) redirect("/sign-in");

    return (
        <div>
            <ClientNavbar session={session} />
            <div className='pt-[50px]'>
                {children}
            </div>
        </div>
    )
}

export default Layout;