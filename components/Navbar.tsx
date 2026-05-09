// components/Navbar.tsx  (Server Component)
import { getNavProductTypes } from '@/lib/store/product'
import ClientNavbar from './ClientNavbar'
import { auth } from '@/userAuth'

export default async function Navbar() {
  const [session, productTypes] = await Promise.all([
    auth(),
    getNavProductTypes(),
  ])

  return <ClientNavbar session={session} productTypes={productTypes ?? {}} />
}