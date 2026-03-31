'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import RegistrationForm from './RegistrationForm';

export default function EduFestPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <RegistrationForm />
    </div>
  );
}