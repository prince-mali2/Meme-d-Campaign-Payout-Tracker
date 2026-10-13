'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';
import { Campaign } from '@/types';
import { formatCurrency, formatNumber } from '@/lib/utils';

export default function CreatorCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.campaigns
      .listLive()
      .then((res) => setCampaigns(res.campaigns))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-zinc-500 font-medium">Discovering live campaigns...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Creator Discovery Hub</h1>
          <p className="text-sm text-zinc-400 mt-1">Browse active brand campaigns, check milestone rewards, and submit post links</p>
        </div>
        <Link
          href="/creator/earnings"
          className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 hover:text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-sm flex items-center space-x-2"
        >
          <span>View My Earnings & Submissions →</span>
        </Link>
      </div>

      {error && (
        <div className="bg-red-950/50 border border-red-800/80 text-red-300 text-sm p-4 rounded-2xl">
          {error}
        </div>
      )}

      {campaigns.length === 0 ? (
        <div className="glass-card rounded-3xl border border-zinc-800 p-16 text-center">
          <div className="h-16 w-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
            🎬
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No live campaigns right now</h3>
          <p className="text-sm text-zinc-400 max-w-sm mx-auto">New campaigns are added frequently by verified brands. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {campaigns.map((c) => {
            const spent = c.spentBudget || 0;
            const total = c.totalBudget || 1;
            const remaining = c.budgetRemaining ?? (total - spent);

            return (
              <div key={c.id} className="glass-card rounded-3xl border border-zinc-800 p-6 shadow-xl flex flex-col justify-between hover:border-zinc-700 transition">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[10px] bg-indigo-950/80 border border-indigo-800/80 text-indigo-300 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        {c.platform}
                      </span>
                      <h3 className="text-xl font-bold text-white mt-3">{c.name}</h3>
                    </div>
                    <span className="text-xs bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 px-3 py-1 rounded-full font-semibold">
                      ● Live Campaign
                    </span>
                  </div>

                  <div className="my-5 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800/80 flex justify-between items-center">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-zinc-500 block mb-1">Remaining Budget</span>
                      <span className="text-lg font-black text-emerald-400">{formatCurrency(remaining)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] uppercase tracking-wider text-zinc-500 block mb-1">Total Pool</span>
                      <span className="text-sm font-semibold text-zinc-300">{formatCurrency(total)}</span>
                    </div>
                  </div>

                  <div className="text-xs text-zinc-400 mb-6">
                    <span className="font-semibold text-zinc-300 block mb-2">Milestone Reward Tiers:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {c.milestones.map((m, idx) => (
                        <span key={idx} className="bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-lg text-zinc-300 font-mono text-[11px]">
                          {formatNumber(m.viewThreshold)} views → <span className="text-indigo-400 font-semibold">{formatCurrency(m.payout)}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <Link
                  href={`/creator/submit?campaignId=${c.id}`}
                  className="block text-center bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold py-3 rounded-xl transition shadow-md shadow-indigo-600/20"
                >
                  Submit Post Link →
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
