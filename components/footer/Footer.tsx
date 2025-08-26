import React from 'react'
import { CardDescription } from '../ui/card'
import { Button } from '../ui/button'
import Link from 'next/link';

export default function Footer() {
  return (
    <div className='w-full h-16 bg-transparent flex flex-col justify-center items-center poppins'>
      <CardDescription>© 2025 Mateng</CardDescription>
      <div className='flex flex-row gap-4'>
        <Link href={`/about-us`}>
          <Button variant="link" className='p-0 h-6 text-zinc-500 hover:text-green-600'>About Us</Button>
        </Link>
        <Link href={`/contact-us`}>
          <Button variant="link" className='p-0 h-6 text-zinc-500 hover:text-green-600'>Contact Us</Button>
        </Link>
        <Link href="https://cargo4.vercel.app/">
          <Button variant="link" className='p-0 h-6 text-zinc-500 hover:text-green-600'>Cargo Service</Button>
        </Link>
        <Link href={`/terms`}>
          <Button variant="link" className='p-0 h-6 text-zinc-500 hover:text-green-600'>Terms</Button>
        </Link>
        <Link href="https://invoice-one-snowy.vercel.app">
          <Button variant="link" className='p-0 h-6 text-zinc-500 hover:text-green-600'>Invoice Generator</Button>
        </Link>
      </div>
    </div>
  )
}
