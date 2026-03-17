'use client';

import { useEffect } from 'react';
import { initializePaddle, type Paddle } from '@paddle/paddle-js';

let _paddle: Paddle | null = null;

async function getPaddle(): Promise<Paddle> {
  if (_paddle) return _paddle;
  _paddle = await initializePaddle({
    environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
    token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
  });
  return _paddle;
}

export default function PaddleCheckout({ priceId, label }: { priceId: string; label: string }) {
  useEffect(() => { getPaddle().catch(console.error); }, []);

  async function handleCheckout() {
    const paddle = await getPaddle();
    await paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      settings: {
        displayMode: 'overlay',
        theme: 'dark',
        locale: 'en',
        successUrl: `${window.location.origin}/dashboard?upgraded=1`,
      },
    });
  }

  return (
    <button
      onClick={handleCheckout}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
    >
      {label}
    </button>
  );
}
