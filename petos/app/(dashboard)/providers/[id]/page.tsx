'use client';

import { Star, MapPin, Clock, Phone, Calendar } from 'lucide-react';

export default function ProviderDetailPage() {
  return (
    <div className="space-y-6">
      <div className="bg-bg-surface border border-border-default rounded-xl p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600">HP</div>
          <div><h1 className="text-xl font-bold text-text-primary">Happy Paws Grooming</h1><div className="flex items-center gap-2 text-sm text-text-secondary"><Star className="h-4 w-4 text-yellow-500 fill-current" /> 4.9 (128 reviews) <MapPin className="h-4 w-4 ml-2" /> 0.5 mi</div></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-bg-base rounded-lg p-3 text-center"><Clock className="h-5 w-5 text-text-secondary mx-auto mb-1" /><p className="text-sm text-text-secondary">9am - 6pm</p></div>
          <div className="bg-bg-base rounded-lg p-3 text-center"><Phone className="h-5 w-5 text-text-secondary mx-auto mb-1" /><p className="text-sm text-text-secondary">(555) 123-4567</p></div>
          <div className="bg-bg-base rounded-lg p-3 text-center"><Calendar className="h-5 w-5 text-text-secondary mx-auto mb-1" /><p className="text-sm text-text-secondary">Next: Tomorrow</p></div>
        </div>
      </div>
      <div className="bg-bg-surface border border-border-default rounded-xl p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Services</h2>
        {[{ name: 'Full Grooming', price: '$55', duration: '90 min' }, { name: 'Bath & Brush', price: '$35', duration: '45 min' }, { name: 'Nail Trim', price: '$15', duration: '15 min' }].map(s => (
          <div key={s.name} className="flex justify-between items-center py-3 border-b last:border-0 border-border-default"><div><p className="font-medium text-text-primary">{s.name}</p><p className="text-sm text-text-secondary">{s.duration}</p></div><span className="font-semibold text-primary">{s.price}</span></div>
        ))}
      </div>
      <button className="w-full bg-primary text-white py-3 rounded-xl text-sm font-semibold">Book Appointment</button>
    </div>
  );
}
