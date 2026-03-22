'use client';

import { Star, MapPin, GraduationCap, Clock, Phone, Video } from 'lucide-react';

export default function VetDetailPage() {
  return (
    <div className="space-y-6">
      <div className="bg-bg-surface border border-border-default rounded-xl p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-2xl font-bold text-green-600">SC</div>
          <div><h1 className="text-xl font-bold text-text-primary">Dr. Sarah Chen, DVM</h1><p className="text-sm text-text-secondary">Happy Tails Veterinary Clinic</p><div className="flex items-center gap-2 text-sm mt-1"><Star className="h-4 w-4 text-yellow-500 fill-current" /> 4.9 (89 reviews)</div></div>
        </div>
        <div className="flex gap-2"><span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">General Practice</span><span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-medium">Dental</span><span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-medium">Preventive Care</span></div>
      </div>
      <div className="bg-bg-surface border border-border-default rounded-xl p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-3">Credentials</h2>
        <div className="space-y-2 text-sm text-text-secondary"><p><GraduationCap className="h-4 w-4 inline mr-2" />UC Davis School of Veterinary Medicine</p><p><Clock className="h-4 w-4 inline mr-2" />15 years experience</p><p><MapPin className="h-4 w-4 inline mr-2" />0.8 miles away</p></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button className="flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl text-sm font-semibold"><Phone className="h-4 w-4" /> Book In-Person</button>
        <button className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl text-sm font-semibold"><Video className="h-4 w-4" /> Telehealth</button>
      </div>
    </div>
  );
}
