
import { getNavProductTypes } from '@/lib/store/product'
import ClientNavbar from './ClientNavbar'

export default async function Navbar() {
  const [productTypes] = await Promise.all([
    getNavProductTypes(),
  ])

  return <ClientNavbar productTypes={productTypes ?? {}} />
}