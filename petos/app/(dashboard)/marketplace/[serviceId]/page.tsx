'use client';

import { useState, useEffect, useTransition } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Star, MapPin, Shield, Award, Clock,
  ChevronLeft, ChevronRight, MessageSquare,
  CheckCircle2, DollarSign, Heart, Send, Users, Loader2, PawPrint,
} from 'lucide-react';
import { createServiceBookingCheckout, getServiceListing } from '@/lib/actions/marketplace';
import { getPets } from '@/lib/actions/pets';

const TIME_SLOTS = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];

function getDayKey(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split('T')[0];
}

function formatDay(offset: number): { day: string; date: string } {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return {
    day: d.toLocaleDateString('en-US', { weekday: 'short' }),
    date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  };
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={13}
          className={i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}
        />
      ))}
    </div>
  );
}

interface ListingData {
  id: string;
  title: string;
  description: string;
  service_type: string;
  price: number;
  price_type: string;
  duration_minutes: number | null;
  service_providers: {
    id: string;
    business_name: string;
    rating: number;
    review_count: number;
    is_verified: boolean;
    photo_url: string | null;
    address: { city?: string } | null;
    bio: string | null;
  };
}

interface Pet {
  id: string;
  name: string;
  species: string;
}

export default function ServiceDetailPage() {
  const params = useParams<{ serviceId: string }>();
  const [listing, setListing] = useState<ListingData | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [booked, setBooked] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState('');
  const [messageSent, setMessageSent] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [bookError, setBookError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [listingData, petsResult] = await Promise.all([
        getServiceListing(params.serviceId),
        getPets(),
      ]);
      if (listingData) {
        setListing(listingData as unknown as ListingData);
      }
      if (petsResult.data) {
        setPets(petsResult.data as Pet[]);
        if (petsResult.data.length > 0) {
          setSelectedPetId(petsResult.data[0].id);
        }
      }
      setLoading(false);
    }
    load();
  }, [params.serviceId]);

  const days = Array.from({ length: 7 }, (_, i) => ({
    offset: weekOffset * 7 + i,
    key: getDayKey(weekOffset * 7 + i),
    ...formatDay(weekOffset * 7 + i),
  }));

  const activeDay = days[selectedDay];

  const handleBook = () => {
    if (!selectedSlot || !listing || !selectedPetId) return;
    setBookError(null);
    const [hour, minutePart] = selectedSlot.split(':');
    const [minute, meridiem] = minutePart.split(' ');
    const scheduled = new Date();
    scheduled.setDate(scheduled.getDate() + (weekOffset * 7 + selectedDay));
    let h = parseInt(hour, 10);
    if (meridiem === 'PM' && h !== 12) h += 12;
    if (meridiem === 'AM' && h === 12) h = 0;
    scheduled.setHours(h, parseInt(minute, 10), 0, 0);
    const duration = listing.duration_minutes ?? 60;
    const scheduledEnd = new Date(scheduled.getTime() + duration * 60 * 1000);

    startTransition(async () => {
      try {
        await createServiceBookingCheckout({
          listingId: params.serviceId,
          scheduledStart: scheduled.toISOString(),
          scheduledEnd: scheduledEnd.toISOString(),
          petId: selectedPetId,
        });
        // If no redirect happened (e.g. in dev mode), show confirmation
        setBooked(true);
      } catch (err) {
        setBookError(err instanceof Error ? err.message : 'Booking failed. Please try again.');
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="text-center py-20">
        <PawPrint size={48} className="text-text-tertiary mx-auto mb-4" />
        <h2 className="text-xl font-bold text-text-primary mb-2">Service Not Found</h2>
        <p className="text-text-secondary text-sm mb-4">This listing may no longer be available.</p>
        <Link href="/marketplace" className="text-primary text-sm font-medium hover:underline">
          &larr; Back to Marketplace
        </Link>
      </div>
    );
  }

  const provider = listing.service_providers;
  const price = Number(listing.price);

  return (
    <div className="space-y-6">
      {/* Back */}
      <div>
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Marketplace
        </Link>
      </div>

      {booked ? (
        <div className="bg-bg-surface border border-border-default rounded-xl p-10 text-center">
          <CheckCircle2 size={48} className="text-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold text-text-primary mb-2">Booking Confirmed!</h2>
          <p className="text-text-secondary text-sm">
            <span className="font-semibold text-text-primary">{listing.title}</span> with {provider.business_name}
          </p>
          <p className="text-text-secondary text-sm mt-0.5">
            {activeDay.date} at {selectedSlot} &mdash; ${price}
          </p>
          <p className="text-text-tertiary text-xs mt-3">You&apos;ll receive a confirmation email with details.</p>
          <button onClick={() => setBooked(false)} className="mt-5 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium">
            Back to Service
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Service Header */}
            <div className="bg-bg-surface border border-border-default rounded-xl p-5">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700">
                      {listing.service_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </span>
                  </div>
                  <h1 className="text-xl font-bold text-text-primary">{listing.title}</h1>
                </div>
                <button
                  onClick={() => setSaved(v => !v)}
                  className={`p-2 rounded-xl border transition-colors shrink-0 ${
                    saved
                      ? 'bg-pink-50 border-pink-200 text-pink-500'
                      : 'border-border-default text-text-tertiary hover:text-pink-500 hover:border-pink-200'
                  }`}
                >
                  <Heart size={16} className={saved ? 'fill-pink-500' : ''} />
                </button>
              </div>

              {/* Provider info */}
              <div className="flex items-start gap-3 mt-4 p-4 bg-bg-elevated rounded-xl">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 bg-primary">
                  {provider.business_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-text-primary">{provider.business_name}</h3>
                    <div className="flex items-center gap-1">
                      <StarRow rating={provider.rating} />
                      <span className="text-sm font-semibold text-text-primary ml-1">{Number(provider.rating).toFixed(1)}</span>
                      <span className="text-sm text-text-secondary">({provider.review_count} reviews)</span>
                    </div>
                  </div>
                  {provider.address?.city && (
                    <div className="flex items-center gap-1.5 mt-1 text-sm text-text-secondary">
                      <MapPin size={12} className="text-primary shrink-0" />
                      {provider.address.city}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {provider.is_verified && (
                      <span className="flex items-center gap-1 text-[11px] text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full font-medium">
                        <Shield size={9} />
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-bg-surface border border-border-default rounded-xl p-5">
              <h2 className="font-semibold text-text-primary mb-3">About This Service</h2>
              <p className="text-sm text-text-secondary leading-relaxed">{listing.description}</p>
              {listing.duration_minutes && (
                <p className="text-sm text-text-tertiary mt-3 flex items-center gap-1.5">
                  <Clock size={13} />
                  Approximately {listing.duration_minutes} minutes per session
                </p>
              )}
            </div>

            {/* Provider bio */}
            {provider.bio && (
              <div className="bg-bg-surface border border-border-default rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Award size={14} className="text-amber-500" />
                  <span className="text-sm font-semibold text-text-primary">About the Provider</span>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">{provider.bio}</p>
              </div>
            )}

            {/* Message provider */}
            <div className="bg-bg-surface border border-border-default rounded-xl p-5">
              <h2 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                <MessageSquare size={15} className="text-text-tertiary" />
                Message {provider.business_name}
              </h2>
              {messageSent ? (
                <div className="text-center py-4">
                  <CheckCircle2 size={28} className="text-primary mx-auto mb-2" />
                  <p className="text-sm text-primary font-medium">Message sent!</p>
                  <p className="text-xs text-text-secondary mt-1">The provider will get back to you soon.</p>
                </div>
              ) : (
                <>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    rows={3}
                    placeholder={`Hi, I'm interested in booking ${listing.title}...`}
                    className="w-full px-3 py-2.5 bg-bg-elevated border border-border-default focus:border-primary/50 rounded-xl text-sm text-text-primary placeholder-text-tertiary outline-none resize-none transition-colors"
                  />
                  <button
                    onClick={() => { if (message.trim()) setMessageSent(true); }}
                    disabled={!message.trim()}
                    className="mt-3 flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-medium rounded-xl text-sm hover:opacity-90 disabled:opacity-40 transition-opacity"
                  >
                    <Send size={13} />
                    Send Message
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Right: booking sidebar */}
          <div className="space-y-4">
            {/* Book Now Card */}
            <div className="bg-bg-surface border border-border-default rounded-xl p-5 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-2xl font-bold text-text-primary">${price}</span>
                  <span className="text-sm text-text-secondary ml-1">
                    / {listing.price_type === 'hourly' ? 'hr' : listing.price_type === 'per_night' ? 'night' : 'session'}
                  </span>
                </div>
              </div>

              {/* Pet selector */}
              {pets.length > 0 ? (
                <div className="mb-4">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 block">Select Pet</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {pets.map(pet => (
                      <button
                        key={pet.id}
                        onClick={() => setSelectedPetId(pet.id)}
                        className={`flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                          selectedPetId === pet.id
                            ? 'bg-primary text-white'
                            : 'bg-bg-elevated text-text-secondary hover:bg-primary/10'
                        }`}
                      >
                        <PawPrint size={12} />
                        {pet.name}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    <Link href="/pets" className="font-semibold underline">Add a pet</Link> to your profile before booking.
                  </p>
                </div>
              )}

              {/* Day selector */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Select Date</label>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setWeekOffset(v => Math.max(0, v - 1)); setSelectedSlot(null); }}
                      disabled={weekOffset === 0}
                      className="p-1 rounded text-text-tertiary hover:text-text-primary disabled:opacity-30 transition-colors"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      onClick={() => { setWeekOffset(v => v + 1); setSelectedSlot(null); }}
                      className="p-1 rounded text-text-tertiary hover:text-text-primary transition-colors"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {days.map((d, i) => (
                    <button
                      key={d.key}
                      onClick={() => { setSelectedDay(i); setSelectedSlot(null); }}
                      className={`flex flex-col items-center py-2 rounded-lg transition-all text-center ${
                        selectedDay === i
                          ? 'bg-primary text-white'
                          : 'bg-bg-elevated text-text-secondary hover:bg-primary/10 hover:text-text-primary'
                      }`}
                    >
                      <span className="text-[9px] font-medium">{d.day}</span>
                      <span className="text-xs font-bold mt-0.5">{d.date.split(' ')[1]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time slots */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 block">Time Slots</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {TIME_SLOTS.map(slot => {
                    const isSelected = selectedSlot === slot;
                    return (
                      <button
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2 rounded-lg text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-primary text-white'
                            : 'bg-bg-elevated text-text-secondary hover:bg-primary/10 hover:text-text-primary'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              {bookError && (
                <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2 mb-2">
                  {bookError}
                </p>
              )}

              <button
                onClick={handleBook}
                disabled={!selectedSlot || !selectedPetId || isPending}
                className="w-full py-3 bg-primary text-white font-semibold rounded-xl text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting to payment&hellip;</>
                ) : selectedSlot ? (
                  `Book for ${activeDay.date} at ${selectedSlot}`
                ) : (
                  'Select a time slot'
                )}
              </button>

              <p className="text-[11px] text-text-tertiary text-center mt-2">
                Secure payment via Stripe &middot; Free cancellation up to 24 hours before
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
