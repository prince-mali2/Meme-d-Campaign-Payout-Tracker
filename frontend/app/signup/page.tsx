'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Role } from '@/types';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('creator');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.auth.signup({ name, email, password, role });
      login(res.token, res.user);
      router.push(res.user.role === 'brand' ? '/brand' : '/creator');
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 mb-12">
      <div className="glass-card p-8 rounded-3xl shadow-2xl relative overflow-hidden border border-zinc-800">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-violet-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="mb-6">
          <h1 className="text-2xl font-black text-white tracking-tight">Create an Account</h1>
          <p className="text-sm text-zinc-400 mt-1">Join Meme'd as a brand or verified creator</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-950/50 border border-red-800/80 text-red-300 text-sm p-3.5 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Full Name / Brand Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 glass-input rounded-xl text-sm transition"
              placeholder="Acme Inc. or Alex Creator"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 glass-input rounded-xl text-sm transition"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 glass-input rounded-xl text-sm transition"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Select Your Role</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('creator')}
                className={`py-3 px-4 rounded-xl font-medium text-sm border transition flex items-center justify-center space-x-2 ${
                  role === 'creator'
                    ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300 shadow-md'
                    : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <span>🎬</span>
                <span>Creator</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('brand')}
                className={`py-3 px-4 rounded-xl font-medium text-sm border transition flex items-center justify-center space-x-2 ${
                  role === 'brand'
                    ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300 shadow-md'
                    : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <span>🏢</span>
                <span>Brand</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium py-3 rounded-xl shadow-lg shadow-indigo-600/25 transition duration-150 disabled:opacity-50"
          >
            {loading ? 'Setting up account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-zinc-400">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-400 font-semibold hover:text-indigo-300 transition">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
