'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

function NavbarContent() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#09090b]/80 border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition">
              <span className="text-white font-black text-lg">M</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Meme'd<span className="text-indigo-400">.</span>
            </span>
          </Link>

          {user && (
            <div className="hidden md:flex items-center space-x-1 bg-zinc-900/60 p-1.5 rounded-xl border border-zinc-800/80">
              {user.role === 'brand' ? (
                <>
                  <Link
                    href="/brand"
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                      isActive('/brand') ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Campaigns
                  </Link>
                  <Link
                    href="/brand/campaigns/new"
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                      isActive('/brand/campaigns/new') ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    + New Campaign
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/creator"
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                      isActive('/creator') ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Discover Campaigns
                  </Link>
                  <Link
                    href="/creator/earnings"
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                      isActive('/creator/earnings') ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Earnings & Submissions
                  </Link>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-3 bg-zinc-900/80 border border-zinc-800 px-3.5 py-1.5 rounded-xl shadow-inner">
              <div className="flex flex-col text-right">
                <span className="text-sm font-semibold text-zinc-200">{user.name}</span>
                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">{user.role}</span>
              </div>
              <button
                onClick={logout}
                className="ml-2 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-medium px-3 py-1.5 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                href="/login"
                className="text-sm font-medium text-zinc-300 hover:text-white px-4 py-2 transition"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="text-sm font-medium bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-5 py-2 rounded-xl shadow-lg shadow-indigo-500/20 transition transform hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default function Navbar() {
  return (
    <Suspense fallback={<div className="h-18 bg-[#09090b] border-b border-zinc-800" />}>
      <NavbarContent />
    </Suspense>
  );
}
