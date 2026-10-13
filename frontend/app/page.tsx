'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const { user, token } = useAuth();

  const getDashboardLink = () => {
    if (!token || !user) return '/login';
    return user.role === 'brand' ? '/brand' : '/creator';
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="glass-card rounded-3xl border border-zinc-800 p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="inline-flex items-center space-x-2 bg-indigo-950/60 border border-indigo-800/80 px-4 py-1.5 rounded-full text-xs font-semibold text-indigo-300 uppercase tracking-widest mb-6">
          <span>🔥 The Creator Economy Marketplace</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight mb-6">
          Campaigns & Payouts <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-500 bg-clip-text text-transparent">
            Automated for Meme Pages
          </span>
        </h1>

        <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto mb-10">
          Meme'd connects top brands with viral Instagram & YouTube meme creators. Run milestone campaigns, track post views in real-time, and guarantee zero budget overruns.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link
            href={getDashboardLink()}
            className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold px-8 py-3.5 rounded-2xl shadow-xl shadow-indigo-600/25 transition transform hover:-translate-y-0.5 text-sm"
          >
            {token && user ? `Go to ${user.role === 'brand' ? 'Brand' : 'Creator'} Dashboard` : 'Get Started Now'}
          </Link>
          {!token && (
            <Link
              href="/login"
              className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-semibold px-8 py-3.5 rounded-2xl border border-zinc-800 transition text-sm"
            >
              Sign In to Account
            </Link>
          )}
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 border-t border-zinc-800/80 text-left">
          <div className="bg-zinc-950/40 p-5 rounded-2xl border border-zinc-800/60">
            <span className="text-2xl mb-2 block">🏢</span>
            <h3 className="text-sm font-bold text-white mb-1">For Brands</h3>
            <p className="text-xs text-zinc-400">Create campaigns with custom view milestone ladders and strict budget caps.</p>
          </div>
          <div className="bg-zinc-950/40 p-5 rounded-2xl border border-zinc-800/60">
            <span className="text-2xl mb-2 block">🎬</span>
            <h3 className="text-sm font-bold text-white mb-1">For Creators</h3>
            <p className="text-xs text-zinc-400">Discover live campaigns, submit post links, and track automated earnings.</p>
          </div>
          <div className="bg-zinc-950/40 p-5 rounded-2xl border border-zinc-800/60">
            <span className="text-2xl mb-2 block">⚡</span>
            <h3 className="text-sm font-bold text-white mb-1">Instant Payouts</h3>
            <p className="text-xs text-zinc-400">Highest milestone crossed logic with zero risk of overspending brand budgets.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
