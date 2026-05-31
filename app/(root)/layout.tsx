
import Navbar from '@/components/Navbar';
import { CartProvider } from '@/components/providers/CartProvider';
import { ReactNode } from 'react'

const Layout = async ({ children }: { children: ReactNode }) => {
    
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