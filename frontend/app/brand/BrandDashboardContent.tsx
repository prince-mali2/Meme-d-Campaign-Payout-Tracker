'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';
import { Campaign } from '@/types';
import { formatCurrency, formatNumber } from '@/lib/utils';

export default function BrandDashboardContent() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.campaigns
      .listMy()
      .then((res) => {
        setCampaigns(res.campaigns);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const totalBudgetAllocated = campaigns.reduce((acc, c) => acc + (c.totalBudget || 0), 0);
  const totalSpent = campaigns.reduce((acc, c) => acc + (c.spentBudget || 0), 0);

  if (loading) {
    return <div className="text-center py-20 text-zinc-500 font-medium">Loading brand command center...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Brand Command Center</h1>
          <p className="text-sm text-zinc-400 mt-1">Monitor active campaigns, budget utilization, and creator payouts</p>
        </div>
        <Link
          href="/brand/campaigns/new"
          className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-500/25 transition transform hover:-translate-y-0.5"
        >
          + Create Campaign
        </Link>
      </div>

      {error && (
        <div className="bg-red-950/50 border border-red-800/80 text-red-300 text-sm p-4 rounded-2xl">
          {error}
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-card p-6 rounded-2xl border border-zinc-800">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Total Campaigns</span>
          <div className="text-3xl font-black text-white mt-2">{campaigns.length}</div>
          <span className="text-xs text-zinc-500 mt-1 block">Active & inactive campaigns</span>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-zinc-800">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Total Budget Allocated</span>
          <div className="text-3xl font-black text-indigo-400 mt-2">{formatCurrency(totalBudgetAllocated)}</div>
          <span className="text-xs text-zinc-500 mt-1 block">Across all campaigns</span>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-zinc-800">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Total Spent Payouts</span>
          <div className="text-3xl font-black text-emerald-400 mt-2">{formatCurrency(totalSpent)}</div>
          <span className="text-xs text-zinc-500 mt-1 block">Claimed by creators</span>
        </div>
      </div>

      {campaigns.length === 0 ? (
        <div className="glass-card rounded-3xl border border-zinc-800 p-16 text-center">
          <div className="h-16 w-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
            📊
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No campaigns launched yet</h3>
          <p className="text-sm text-zinc-400 mb-6 max-w-sm mx-auto">Create your first milestone campaign to start working with top meme & clip creators.</p>
          <Link
            href="/brand/campaigns/new"
            className="inline-block bg-indigo-600 text-white font-medium text-sm px-5 py-2.5 rounded-xl shadow-md hover:bg-indigo-500 transition"
          >
            Create Your First Campaign
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {campaigns.map((c) => {
            const spent = c.spentBudget || 0;
            const total = c.totalBudget || 1;
            const pct = Math.min(100, Math.round((spent / total) * 100));

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
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${c.isActive ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800/80' : 'bg-zinc-900 text-zinc-400 border-zinc-800'}`}>
                      {c.isActive ? '● Live' : 'Inactive'}
                    </span>
                  </div>

                  <div className="my-5 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800/80">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-zinc-400 font-medium">Budget Spent</span>
                      <span className="font-bold text-white">
                        {formatCurrency(spent)} <span className="text-zinc-500 font-normal">/ {formatCurrency(total)}</span>
                      </span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-violet-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[11px] text-zinc-500 mt-2">
                      <span>{pct}% utilized</span>
                      <span className="text-emerald-400 font-medium">Remaining: {formatCurrency(c.budgetRemaining ?? (total - spent))}</span>
                    </div>
                  </div>

                  <div className="text-xs text-zinc-400 mb-6">
                    <span className="font-semibold text-zinc-300 block mb-2">Milestones:</span>
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
                  href={`/brand/campaigns/${c.id}`}
                  className="block text-center bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white text-xs font-semibold py-3 rounded-xl transition border border-zinc-800"
                >
                  View Detailed Submissions & Analytics →
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
