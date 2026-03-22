'use client';

import { useState } from 'react';
import { Copy, Check, Share2, Gift, Users, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const APP_NAME = 'StoryThread';

export default function ReferralPage() {
  const [copied, setCopied] = useState(false);
  // Mock referral code — in production, fetch from DB
  const referralCode = 'SAVE20-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  const referralLink = `https://${APP_NAME.toLowerCase()}.app/?ref=${referralCode}`;
  const referralStats = { referred: 3, earned: 2, pending: 1 };

  const copy = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const share = async () => {
    if (navigator.share) {
      await navigator.share({ title: `Join ${APP_NAME}`, text: `Get 1 month free with my referral link!`, url: referralLink });
    } else {
      copy();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Refer a Friend</h1>
        <p className="text-muted-foreground mt-1">Earn 1 free month for every friend who subscribes.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Friends Referred', value: referralStats.referred, icon: Users, color: 'text-blue-500' },
          { label: 'Months Earned', value: referralStats.earned, icon: Gift, color: 'text-green-500' },
          { label: 'Pending', value: referralStats.pending, icon: TrendingUp, color: 'text-amber-500' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="rounded-xl border border-border bg-card p-5 text-center">
            <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Referral Link */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold text-foreground">Your Referral Link</h2>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-4 py-3">
          <span className="flex-1 text-sm text-foreground font-mono truncate">{referralLink}</span>
          <button onClick={copy} className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity shrink-0">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <button onClick={share} className="w-full flex items-center justify-center gap-2 rounded-lg border border-border py-2.5 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors">
          <Share2 className="h-4 w-4" />
          Share via...
        </button>
      </div>

      {/* How it works */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-semibold text-foreground mb-4">How It Works</h2>
        <div className="space-y-3">
          {[
            { step: '1', text: 'Share your unique referral link with friends' },
            { step: '2', text: 'Friend signs up and subscribes to any plan' },
            { step: '3', text: 'You both get 1 free month added to your account' },
          ].map(item => (
            <div key={item.step} className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary shrink-0">{item.step}</div>
              <p className="text-sm text-muted-foreground pt-0.5">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
