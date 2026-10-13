'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';
import { Submission } from '@/types';
import { formatCurrency, formatNumber } from '@/lib/utils';

export default function EarningsPage() {
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [testViewsInput, setTestViewsInput] = useState<Record<string, string>>({});

  const fetchEarnings = () => {
    api.submissions
      .myEarnings()
      .then((res) => {
        setTotalEarnings(res.totalEarnings);
        setSubmissions(res.submissions);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  const handleUpdateViews = async (id: string) => {
    const viewsStr = testViewsInput[id];
    if (!viewsStr) return;
    const views = parseInt(viewsStr, 10);
    if (isNaN(views)) return;

    setUpdatingId(id);
    try {
      await api.submissions.updateViews(id, views);
      fetchEarnings();
    } catch (err: any) {
      alert(err.message || 'Failed to update views');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div className="text-center py-20 text-zinc-500 font-medium">Loading your earnings and submissions...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Creator Earnings & Payouts</h1>
          <p className="text-sm text-zinc-400 mt-1">Track live post views, milestone payout claims, and simulator controls</p>
        </div>
        <Link
          href="/creator"
          className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-500/25 transition transform hover:-translate-y-0.5"
        >
          + Submit New Post
        </Link>
      </div>

      {error && (
        <div className="bg-red-950/50 border border-red-800/80 text-red-300 text-sm p-4 rounded-2xl">
          {error}
        </div>
      )}

      {/* Earnings Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900/50 via-zinc-900 to-violet-950/40 border border-indigo-500/20 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>
        <span className="text-xs uppercase tracking-wider text-indigo-400 font-bold">Total Verified Claimed Earnings</span>
        <div className="text-5xl font-black text-white mt-2 tracking-tight">{formatCurrency(totalEarnings)}</div>
        <p className="text-xs text-zinc-400 mt-3">Payouts are calculated automatically based on highest milestone crossed. Use the view simulator on any submission below to test real-time earnings triggers.</p>
      </div>

      <h2 className="text-xl font-bold text-white tracking-tight">Your Submitted Posts</h2>

      {submissions.length === 0 ? (
        <div className="glass-card rounded-3xl border border-zinc-800 p-16 text-center">
          <div className="h-16 w-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
            💸
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No post submissions yet</h3>
          <p className="text-sm text-zinc-400 mb-6 max-w-sm mx-auto">Browse live brand campaigns and submit your post links to start earning.</p>
          <Link href="/creator" className="inline-block bg-indigo-600 text-white font-medium text-sm px-5 py-2.5 rounded-xl shadow-md hover:bg-indigo-500 transition">
            Browse Live Campaigns
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((s) => {
            const campaignObj = typeof s.campaign === 'object' && s.campaign !== null ? s.campaign : null;
            const statusColors: Record<string, string> = {
              paid: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/80',
              pending: 'bg-yellow-950/60 text-yellow-400 border-yellow-800/80',
              insufficient_budget: 'bg-red-950/60 text-red-400 border-red-800/80',
              no_milestone_reached: 'bg-zinc-900 text-zinc-400 border-zinc-800',
            };

            return (
              <div key={s.id} className="glass-card rounded-3xl border border-zinc-800 p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-zinc-700 transition">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] bg-indigo-950/80 border border-indigo-800/80 text-indigo-300 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {campaignObj?.platform || 'Campaign'}
                    </span>
                    <span className={`text-[11px] px-3 py-0.5 rounded-full font-semibold border ${statusColors[s.payoutStatus] || 'bg-zinc-900 text-zinc-300 border-zinc-800'}`}>
                      {s.payoutStatus.replace('_', ' ')}
                    </span>
                    {s.spikeFlag && (
                      <span className="text-[11px] bg-orange-950/60 text-orange-400 border border-orange-800/80 px-2.5 py-0.5 rounded-full font-semibold">
                        ⚡ Spike Detected
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-white text-lg">{campaignObj?.name || 'Campaign'}</h3>

                  <a href={s.postLink} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 block truncate max-w-md font-mono">
                    🔗 {s.postLink}
                  </a>

                  <div className="text-xs text-zinc-400 pt-1 flex items-center space-x-4">
                    <span>Views: <strong className="text-white font-mono">{formatNumber(s.currentViews)}</strong></span>
                    <span>•</span>
                    <span>Claimed Payout: <strong className="text-emerald-400 font-mono">{formatCurrency(s.payoutAmount)}</strong></span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 w-full md:w-auto bg-zinc-900/60 p-3 rounded-2xl border border-zinc-800/80">
                  <input
                    type="number"
                    placeholder="Simulate Views"
                    className="px-3 py-2 glass-input rounded-xl text-xs w-32 font-mono"
                    value={testViewsInput[s.id] || ''}
                    onChange={(e) => setTestViewsInput({ ...testViewsInput, [s.id]: e.target.value })}
                  />
                  <button
                    onClick={() => handleUpdateViews(s.id)}
                    disabled={updatingId === s.id}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition disabled:opacity-50 whitespace-nowrap shadow-md shadow-indigo-600/20"
                  >
                    {updatingId === s.id ? 'Updating...' : 'Test Views'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
