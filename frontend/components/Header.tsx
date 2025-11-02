'use client';

import Image from 'next/image';

interface HeaderProps {
  accountCount: number;
}

export default function Header({ accountCount }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image 
            src="/icon.png" 
            alt="Stillwater Pulse Logo" 
            width={54} 
            height={54}
            className="rounded-lg"
          />
          <div>
            <h1 className="text-3xl font-bold text-primary-600">Stillwater Pulse</h1>
            <p className="text-sm text-gray-600 mt-1">
              Latest posts from {accountCount} Stillwater Instagram accounts
            </p>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>
    </header>
  );
}