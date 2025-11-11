import React, { useState } from 'react';
import { CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import Link from 'next/link';

export default function Footer() {
  const [open, setOpen] = useState(false);

  return (
    <div className='w-full h-16 bg-transparent flex flex-col justify-center items-center poppins'>
      <CardDescription>© 2025 Mateng</CardDescription>
      <div className='flex flex-row gap-4 relative'>
        {/* Static Footer Links */}
        <Link href={`/about-us`}>
          <Button variant="link" className='p-0 h-6 text-zinc-500 hover:text-green-600'>About Us</Button>
        </Link>
        <Link href={`/contact-us`}>
          <Button variant="link" className='p-0 h-6 text-zinc-500 hover:text-green-600'>Contact Us</Button>
        </Link>
        <Link href={`/terms`}>
          <Button variant="link" className='p-0 h-6 text-zinc-500 hover:text-green-600'>Terms of Use</Button>
        </Link>
        <Link href={`/privacy_policy`}>
          <Button variant="link" className='p-0 h-6 text-zinc-500 hover:text-green-600'>Privacy Policy</Button>
        </Link>

        {/* Dropup Toggle Button */}
        <div className="relative">
          <Button
            variant="link"
            className='p-0 h-6 text-zinc-500 hover:text-green-600'
            onClick={() => setOpen(prev => !prev)}
          >
            Projects ↑
          </Button>

          {/* Dropup Content */}
          {open && (
            <div className="absolute bottom-full mb-2 right-0 bg-white border border-zinc-200 rounded-md shadow-lg py-2 z-50 w-48">
              <Link href="https://invoice-one-snowy.vercel.app">
                <Button variant="link" className='w-full text-left px-4 py-1.5 text-zinc-500 hover:text-green-600'>
                  Invoice Generator
                </Button>
              </Link>
              <Link href="https://textscan.vercel.app/">
                <Button variant="link" className='w-full text-left px-4 py-1.5 text-zinc-500 hover:text-green-600'>
                  Text Converter
                </Button>
              </Link>
              <Link href="/CargoBookingPage">
                <Button variant="link" className='w-full text-left px-4 py-1.5 text-zinc-500 hover:text-green-600'>
                  Cargo Service
                </Button>
              </Link>
            </div>
          )}
        </div> 
      </div>
    </div>
  );
}
