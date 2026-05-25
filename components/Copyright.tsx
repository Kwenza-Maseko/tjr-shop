import Link from 'next/link'
import React from 'react'
const Copyright = () => {
  return (
    <div className='border-t px-6 md:px-8 py-5 mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-zinc-700'>
        <p>2026 TJRStore. All rights reserved</p>
        <Link href={"/terms-of-sale"} className='text-start md:text-end'>Terms of Sales</Link>
    </div>
  )
}

export default Copyright