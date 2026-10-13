'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/services/api';

interface MilestoneInput {
  viewThreshold: string;
  payout: string;
}

export default function NewCampaignPage() {
  const [name, setName] = useState('');
  const [platform, setPlatform] = useState<'Instagram' | 'YouTube'>('Instagram');
  const [totalBudgetRupees, setTotalBudgetRupees] = useState('');
  const [milestones, setMilestones] = useState<MilestoneInput[]>([
    { viewThreshold: '10000', payout: '500' },
    { viewThreshold: '50000', payout: '2000' },
  ]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleMilestoneChange = (index: number, field: 'viewThreshold' | 'payout', value: string) => {
    const updated = [...milestones];
    updated[index][field] = value;
    setMilestones(updated);
  };

  const addMilestoneRow = () => {
    setMilestones([...milestones, { viewThreshold: '', payout: '' }]);
  };

  const removeMilestoneRow = (index: number) => {
    if (milestones.length === 1) return;
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const totalBudget = Math.round(parseFloat(totalBudgetRupees) * 100); // convert INR to paisa/cents
      const formattedMilestones = milestones.map((m) => ({
        viewThreshold: parseInt(m.viewThreshold, 10),
        payout: Math.round(parseFloat(m.payout) * 100),
      }));

      await api.campaigns.create({
        name,
        platform,
        totalBudget,
        milestones: formattedMilestones,
      });

      router.push('/brand');
    } catch (err: any) {
      setError(err.message || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/brand" className="text-xs font-semibold uppercase tracking-wider text-indigo-400 hover:text-indigo-300 mb-4 inline-block">
        ← Back to Brand Dashboard
      </Link>

      <div className="glass-card p-8 rounded-3xl shadow-2xl border border-zinc-800">
        <h1 className="text-2xl font-black text-white tracking-tight mb-2">Create Milestone Campaign</h1>
        <p className="text-sm text-zinc-400 mb-8">Set up your campaign budget and automated creator view milestones</p>

        {error && (
          <div className="mb-6 bg-red-950/50 border border-red-800/80 text-red-300 text-sm p-3.5 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Campaign Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 glass-input rounded-xl text-sm transition"
              placeholder="e.g. Summer Meme Blitz 2026"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as any)}
                className="w-full px-4 py-3 glass-input rounded-xl text-sm transition bg-zinc-900"
              >
                <option value="Instagram">Instagram</option>
                <option value="YouTube">YouTube</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Total Budget (₹)</label>
              <input
                type="number"
                required
                min="1"
                value={totalBudgetRupees}
                onChange={(e) => setTotalBudgetRupees(e.target.value)}
                className="w-full px-4 py-3 glass-input rounded-xl text-sm transition"
                placeholder="e.g. 50000"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Milestone Payout Ladder</label>
              <button
                type="button"
                onClick={addMilestoneRow}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
              >
                + Add Milestone Tier
              </button>
            </div>

            <div className="space-y-3">
              {milestones.map((m, index) => (
                <div key={index} className="flex items-center space-x-3 bg-zinc-900/60 p-3 rounded-2xl border border-zinc-800">
                  <div className="flex-1">
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="Views (e.g. 10000)"
                      value={m.viewThreshold}
                      onChange={(e) => handleMilestoneChange(index, 'viewThreshold', e.target.value)}
                      className="w-full px-3 py-2 glass-input rounded-xl text-xs"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="Payout in ₹ (e.g. 500)"
                      value={m.payout}
                      onChange={(e) => handleMilestoneChange(index, 'payout', e.target.value)}
                      className="w-full px-3 py-2 glass-input rounded-xl text-xs"
                    />
                  </div>
                  {milestones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMilestoneRow(index)}
                      className="text-zinc-500 hover:text-red-400 text-sm p-2 transition"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium py-3.5 rounded-xl shadow-lg shadow-indigo-600/25 transition duration-150 disabled:opacity-50"
          >
            {loading ? 'Publishing Campaign...' : 'Publish Campaign Live'}
          </button>
        </form>
      </div>
    </div>
  );
}
