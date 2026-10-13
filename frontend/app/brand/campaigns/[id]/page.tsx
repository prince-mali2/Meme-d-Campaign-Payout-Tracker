'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';
import { Campaign } from '@/types';
import { formatCurrency, formatNumber } from '@/lib/utils';

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.campaigns
      .getDetail(resolvedParams.id)
      .then((res) => setCampaign(res.campaign))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [resolvedParams.id]);

  if (loading) return <div className="text-center py-20 text-zinc-500 font-medium">Loading campaign details...</div>;
  if (error || !campaign) return <div className="text-center py-20 text-red-400 font-medium">{error || 'Campaign not found'}</div>;

  const spent = campaign.spentBudget || 0;
  const total = campaign.totalBudget || 1;
  const pct = Math.min(100, Math.round((spent / total) * 100));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/brand" className="text-xs font-semibold uppercase tracking-wider text-indigo-400 hover:text-indigo-300 inline-block">
        ← Back to Brand Dashboard
      </Link>

      <div className="glass-card rounded-3xl border border-zinc-800 p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <span className="text-[10px] bg-indigo-950/80 border border-indigo-800/80 text-indigo-300 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {campaign.platform}
            </span>
            <h1 className="text-3xl font-black text-white mt-3 tracking-tight">{campaign.name}</h1>
          </div>
          <span className="text-xs bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 font-semibold px-3.5 py-1.5 rounded-full">
            ● Active Campaign
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 my-6 bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800/80">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 block mb-1">Total Budget</span>
            <span className="text-2xl font-black text-white">{formatCurrency(campaign.totalBudget)}</span>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 block mb-1">Spent Payouts</span>
            <span className="text-2xl font-black text-indigo-400">{formatCurrency(campaign.spentBudget)}</span>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 block mb-1">Remaining Budget</span>
            <span className="text-2xl font-black text-emerald-400">
              {formatCurrency(campaign.budgetRemaining ?? (campaign.totalBudget - campaign.spentBudget))}
            </span>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-zinc-400 font-medium">Budget Utilization</span>
            <span className="font-bold text-white">{pct}%</span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-violet-500 h-3 rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4">Milestone Reward Ladder</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {campaign.milestones.map((m, idx) => (
              <div key={idx} className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl shadow-inner">
                <div className="text-[11px] uppercase tracking-wider text-zinc-500 mb-1">Threshold</div>
                <div className="text-lg font-bold text-white mb-3 font-mono">{formatNumber(m.viewThreshold)} views</div>
                <div className="text-[11px] uppercase tracking-wider text-zinc-500 mb-1">Milestone Payout</div>
                <div className="text-base font-black text-indigo-400">{formatCurrency(m.payout)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
