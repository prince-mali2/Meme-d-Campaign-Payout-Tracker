'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/services/api';
import { Campaign } from '@/types';

function SubmitFormContent() {
  const searchParams = useSearchParams();
  const prefilledCampaignId = searchParams.get('campaignId') || '';

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignId, setCampaignId] = useState(prefilledCampaignId);
  const [postLink, setPostLink] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    api.campaigns
      .listLive()
      .then((res) => {
        setCampaigns(res.campaigns);
        if (!campaignId && res.campaigns.length > 0) {
          setCampaignId(res.campaigns[0].id);
        }
      })
      .catch((err) => setError(err.message));
  }, [campaignId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.submissions.create({ campaignId, postLink });
      router.push('/creator/earnings');
    } catch (err: any) {
      setError(err.message || 'Failed to submit post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Link href="/creator" className="text-xs font-semibold uppercase tracking-wider text-indigo-400 hover:text-indigo-300 mb-4 inline-block">
        ← Back to Discover Campaigns
      </Link>

      <div className="glass-card p-8 rounded-3xl shadow-2xl border border-zinc-800">
        <h1 className="text-2xl font-black text-white tracking-tight mb-2">Submit Post Link</h1>
        <p className="text-sm text-zinc-400 mb-8">Link your Instagram or YouTube meme post to start tracking milestone payouts</p>

        {error && (
          <div className="mb-6 bg-red-950/50 border border-red-800/80 text-red-300 text-sm p-3.5 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Select Target Campaign</label>
            <select
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
              required
              className="w-full px-4 py-3 glass-input rounded-xl text-sm transition bg-zinc-900"
            >
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.platform})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Post URL</label>
            <input
              type="url"
              required
              placeholder="https://instagram.com/p/..."
              value={postLink}
              onChange={(e) => setPostLink(e.target.value)}
              className="w-full px-4 py-3 glass-input rounded-xl text-sm transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium py-3.5 rounded-xl shadow-lg shadow-indigo-600/25 transition duration-150 disabled:opacity-50"
          >
            {loading ? 'Submitting Post...' : 'Submit Post Link'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function SubmitPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-zinc-500 font-medium">Loading submission form...</div>}>
      <SubmitFormContent />
    </Suspense>
  );
}
