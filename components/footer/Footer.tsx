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
        
      </div>
    </div>
  );
}
