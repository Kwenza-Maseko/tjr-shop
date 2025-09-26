import ClientNavbar from '@/components/ClientNavbar';
import { ReactNode } from 'react'

const Layout = ({ children }: { children: ReactNode }) => {
    return (
        <div>
            <ClientNavbar />
            <div className='p-3 pt-[60px]  md:px-6'>
                {children}
            </div>
        </div>
    )
}

export default Layout;